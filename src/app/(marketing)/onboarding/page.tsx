'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, SkipForward } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 6;

const businessTypes = [
  'Dropshipper',
  'Amazon FBA Seller',
  'Reseller / Arbitrage',
  'DTC Brand Owner',
  'Ecommerce Agency',
  'Wholesaler',
  'Affiliate Marketer',
  'Other',
];

const productCategories = [
  'Fashion & Apparel',
  'Beauty & Skincare',
  'Home & Living',
  'Electronics',
  'Health & Wellness',
  'Kitchen & Dining',
  'Toys & Games',
  'Pet Supplies',
  'Sports & Outdoors',
  'Automotive',
  'Baby & Kids',
  'Jewellery & Accessories',
];

const platformOptions = [
  { id: 'shopify', label: 'Shopify', icon: '🟢' },
  { id: 'amazon', label: 'Amazon', icon: '📦' },
  { id: 'tiktok', label: 'TikTok Shop', icon: '🎵' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);

  const progress = (step / TOTAL_STEPS) * 100;

  const toggleBusinessType = useCallback((type: string) => {
    setSelectedBusinessTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const runScan = useCallback(() => {
    setScanProgress(0);
    setScanComplete(false);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanComplete(true);
          return 100;
        }
        return prev + 2;
      });
    }, 80);
  }, []);

  const next = () => {
    if (step === 5 && !scanComplete) {
      runScan();
      return;
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
    else window.location.href = '/dashboard';
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const skip = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-100">
        <div
          className="h-full bg-rose-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="mx-auto w-full max-w-2xl px-6 pt-8">
        <span className="text-xs font-medium text-gray-400">
          Step {step} of {TOTAL_STEPS}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 pt-8 pb-24">
        <div className="w-full max-w-2xl">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome to yousell</h1>
              <p className="mt-3 text-gray-600">Let&apos;s get you set up in under 2 minutes.</p>
              <div className="mt-8 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Type */}
          {step === 2 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900">What describes your business?</h1>
              <p className="mt-3 text-gray-600">Select all that apply. This helps us customise your dashboard.</p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {businessTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleBusinessType(type)}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium text-left transition-colors ${
                      selectedBusinessTypes.includes(type)
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {selectedBusinessTypes.includes(type) && (
                      <Check className="inline h-4 w-4 mr-2" />
                    )}
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Product Categories */}
          {step === 3 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900">What do you sell?</h1>
              <p className="mt-3 text-gray-600">Pick the categories you&apos;re interested in.</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {productCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategories.includes(cat)
                        ? 'bg-rose-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Connect Platform */}
          {step === 4 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Connect a platform</h1>
              <p className="mt-3 text-gray-600">
                Link your store to unlock real-time product intelligence. You can skip this and connect later.
              </p>
              <div className="mt-8 space-y-3">
                {platformOptions.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`w-full flex items-center gap-4 rounded-xl border px-6 py-4 text-left transition-colors ${
                      selectedPlatform === platform.id
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{platform.label}</span>
                      <span className="block text-xs text-gray-500">Connect your {platform.label} store</span>
                    </div>
                    {selectedPlatform === platform.id && (
                      <Check className="ml-auto h-5 w-5 text-rose-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Run First Scan */}
          {step === 5 && (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Running your first scan</h1>
              <p className="mt-3 text-gray-600">
                We&apos;re analysing trending products across your selected categories.
              </p>
              <div className="mt-12">
                {scanProgress > 0 ? (
                  <div className="mx-auto max-w-md">
                    <div className="relative h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-rose-600 transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                      {scanComplete ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-600 font-medium">Scan complete! Found 247 trending products.</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Scanning... {scanProgress}%</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={runScan}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-8 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                  >
                    Start Scan <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Dashboard Tour */}
          {step === 6 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900">You&apos;re all set!</h1>
              <p className="mt-3 text-gray-600">Here&apos;s a quick tour of what you&apos;ll find in your dashboard.</p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    title: 'Product Discovery',
                    description: 'AI-curated trending products with scores, velocity, and supplier matches.',
                    beacon: '🔍',
                  },
                  {
                    title: 'Analytics Dashboard',
                    description: 'Real-time sales, profit, and competitor pricing across all your platforms.',
                    beacon: '📊',
                  },
                  {
                    title: 'Creative Studio',
                    description: 'Generate product titles, descriptions, and ad copy with AI.',
                    beacon: '✨',
                  },
                  {
                    title: 'Supplier Finder',
                    description: 'Match products to verified suppliers with pricing and lead times.',
                    beacon: '🏭',
                  },
                  {
                    title: 'Alerts & Notifications',
                    description: 'Get notified when products trend, competitors change prices, or stock runs low.',
                    beacon: '🔔',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl">{item.beacon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <button
            onClick={back}
            disabled={step === 1}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            {step < TOTAL_STEPS && (
              <button
                onClick={skip}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip <SkipForward className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={next}
              disabled={step === 5 && scanProgress > 0 && !scanComplete}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {step === TOTAL_STEPS ? 'Complete' : step === 5 && !scanComplete ? 'Run Scan' : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
