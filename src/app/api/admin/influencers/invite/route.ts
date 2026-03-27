import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@yousell.online";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  try {
    await authenticateAdmin(request);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { influencerId, productId } = await request.json();

    if (!influencerId || !productId) {
      return NextResponse.json(
        { error: "influencerId and productId are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch influencer and product in parallel
    const [influencerRes, productRes] = await Promise.all([
      supabase
        .from("influencers")
        .select("id, username, platform, followers, email, niche, tier, engagement_rate")
        .eq("id", influencerId)
        .single(),
      supabase
        .from("products")
        .select("id, title, platform, price, category, trend_stage, final_score, description")
        .eq("id", productId)
        .single(),
    ]);

    if (influencerRes.error || !influencerRes.data) {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
    }
    if (productRes.error || !productRes.data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const influencer = influencerRes.data;
    const product = productRes.data;

    if (!influencer.email) {
      return NextResponse.json(
        { error: "Influencer has no email address on file" },
        { status: 400 }
      );
    }

    // Check for duplicate invite (same influencer + product, sent within last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: existingInvite } = await supabase
      .from("outreach_emails")
      .select("id")
      .eq("influencer_id", influencerId)
      .eq("product_id", productId)
      .gte("created_at", sevenDaysAgo)
      .limit(1);

    if (existingInvite && existingInvite.length > 0) {
      return NextResponse.json(
        { error: "An invite was already sent to this influencer for this product within the last 7 days" },
        { status: 409 }
      );
    }

    // Generate personalized email via Claude Haiku (cost-optimized per v7 spec Rule 12)
    let subject: string;
    let body: string;

    if (ANTHROPIC_API_KEY) {
      const prompt = `Write a personalized influencer outreach email for a brand collaboration opportunity.

Influencer details:
- Username: ${influencer.username}
- Platform: ${influencer.platform}
- Followers: ${influencer.followers?.toLocaleString() || "N/A"}
- Niche: ${influencer.niche || "general"}
- Tier: ${influencer.tier}

Product details:
- Name: ${product.title}
- Category: ${product.category || "general"}
- Price: $${product.price || "N/A"}
- Trend Stage: ${product.trend_stage || "emerging"}

Write the email in a professional but friendly tone. The email should:
1. Compliment their content/audience
2. Introduce the product opportunity
3. Explain why it's a good fit for their audience
4. Include a clear CTA to reply or schedule a call

Format your response as JSON: {"subject": "...", "body": "..."}
The body should be plain text with line breaks (use \\n).`;

      try {
        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 500,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        });

        const aiData = await aiRes.json();
        const text = aiData.content?.[0]?.text || "";
        const parsed = JSON.parse(text);
        subject = parsed.subject;
        body = parsed.body;
      } catch {
        // Fallback to template if AI generation fails
        subject = `Collaboration Opportunity: ${product.title}`;
        body = `Hi ${influencer.username},\n\nWe've been following your content on ${influencer.platform} and love what you're doing in the ${influencer.niche || "lifestyle"} space.\n\nWe have an exciting product opportunity that we think would be a great fit for your audience: ${product.title}.\n\nWould you be interested in discussing a collaboration? We'd love to send you a sample and explore partnership options.\n\nLooking forward to hearing from you!\n\nBest,\nThe YouSell Team`;
      }
    } else {
      // No AI key — use template
      subject = `Collaboration Opportunity: ${product.title}`;
      body = `Hi ${influencer.username},\n\nWe've been following your content on ${influencer.platform} and love what you're doing in the ${influencer.niche || "lifestyle"} space.\n\nWe have an exciting product opportunity that we think would be a great fit for your audience: ${product.title}.\n\nWould you be interested in discussing a collaboration? We'd love to send you a sample and explore partnership options.\n\nLooking forward to hearing from you!\n\nBest,\nThe YouSell Team`;
    }

    // Store in outreach_emails as draft first
    const { data: outreach, error: insertError } = await supabase
      .from("outreach_emails")
      .insert({
        influencer_id: influencerId,
        product_id: productId,
        subject,
        body,
        status: "draft",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Send via Resend if configured
    let sendStatus = "draft";
    let resendId: string | null = null;

    if (RESEND_API_KEY) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: influencer.email,
            subject,
            text: body,
          }),
        });

        const emailData = await emailRes.json();
        if (emailRes.ok && emailData.id) {
          sendStatus = "sent";
          resendId = emailData.id;
        }
      } catch {
        // Email send failed — keep as draft
        console.error("Failed to send outreach email via Resend");
      }
    }

    // Update outreach record with send status
    if (sendStatus === "sent") {
      await supabase
        .from("outreach_emails")
        .update({
          status: sendStatus,
          sent_at: new Date().toISOString(),
          resend_id: resendId,
        })
        .eq("id", outreach.id);

      // Feedback loop: update creator_product_matches status to 'contacted'
      await supabase
        .from("creator_product_matches")
        .update({ status: "contacted" })
        .eq("product_id", productId)
        .eq("influencer_id", influencerId);
    }

    return NextResponse.json({
      outreach: { ...outreach, status: sendStatus, resend_id: resendId },
      emailSent: sendStatus === "sent",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
