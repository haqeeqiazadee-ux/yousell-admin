'use client';

import { useEffect } from 'react';

const homepageCSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

/* ═══════════════════════════════════════════════════
   YOUSELL.ONLINE — DESIGN SYSTEM
   Aesthetic: Dark luxury SaaS / editorial precision
   Inspired by: Linear, Vercel, Stripe, Raycast
═══════════════════════════════════════════════════ */

:root {
  --red: #e94560;
  --red-dark: #c73652;
  --red-glow: rgba(233,69,96,0.25);
  --dark: #0d0d14;
  --dark-2: #13131f;
  --dark-3: #1a1a2e;
  --dark-4: #1e1e35;
  --dark-5: #252540;
  --accent: #0f3460;
  --success: #00c896;
  --success-dim: rgba(0,200,150,0.12);
  --white: #ffffff;
  --text: #e8e8f2;
  --text-dim: #9898b8;
  --text-muted: #55556a;
  --border: rgba(255,255,255,0.07);
  --border-bright: rgba(255,255,255,0.12);
  --card-bg: rgba(255,255,255,0.03);
  --card-hover: rgba(255,255,255,0.055);

  --font-display: 'Outfit', sans-serif;
  --font-body: 'DM Sans', sans-serif;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; font-size: 16px; }

body {
  background: var(--dark);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ── Noise texture overlay ── */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--dark); }
::-webkit-scrollbar-thumb { background: var(--dark-5); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* ── Container ── */
.container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 32px;
}
@media (max-width: 768px) { .container { padding: 0 20px; } }

/* ════════════════════════════════════════
   ANNOUNCEMENT BAR
════════════════════════════════════════ */
.announce-bar {
  position: relative;
  z-index: 100;
  background: linear-gradient(90deg, #1a0a10, var(--dark-3), #1a0a10);
  border-bottom: 1px solid rgba(233,69,96,0.2);
  padding: 10px 20px;
  text-align: center;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-dim);
  overflow: hidden;
}
.announce-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(233,69,96,0.06), transparent);
  animation: shimmer 3s ease infinite;
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.announce-bar strong { color: var(--red); }
.announce-bar a {
  color: var(--white);
  font-weight: 600;
  text-decoration: none;
  margin-left: 8px;
  padding: 2px 10px;
  background: rgba(233,69,96,0.15);
  border: 1px solid rgba(233,69,96,0.3);
  border-radius: 100px;
  font-size: 12px;
  transition: all 0.2s;
}
.announce-bar a:hover { background: var(--red); color: #fff; }
.announce-close {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 4px;
  transition: color 0.2s;
}
.announce-close:hover { color: var(--white); }

/* ════════════════════════════════════════
   NAVBAR
════════════════════════════════════════ */
.nav {
  position: sticky;
  top: 0;
  z-index: 99;
  height: 68px;
  display: flex;
  align-items: center;
  background: rgba(13,13,20,0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border);
  transition: all 0.3s;
}
.nav.scrolled {
  background: rgba(13,13,20,0.95);
  border-bottom-color: var(--border-bright);
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 32px;
}
.nav-logo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 20px;
  color: var(--white);
  text-decoration: none;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 2px;
}
.nav-logo .logo-you { color: var(--red); }
.nav-logo .logo-sell { color: var(--white); }
.nav-logo .logo-dot { color: var(--text-muted); font-weight: 300; }
.nav-logo .logo-online { color: var(--text-dim); font-weight: 500; font-size: 18px; }

.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  list-style: none;
}
.nav-links > li { position: relative; }
.nav-links a {
  display: block;
  padding: 8px 14px;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 14px;
  font-weight: 450;
  border-radius: 8px;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: var(--font-body);
}
.nav-links a:hover { color: var(--white); background: rgba(255,255,255,0.06); }

/* Dropdown */
.nav-dropdown { position: relative; }
.nav-dropdown > a {
  display: flex;
  align-items: center;
  gap: 5px;
}
.nav-dropdown > a::after {
  content: '';
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239898b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.nav-dropdown:hover > a::after { transform: rotate(180deg); }
.dropdown-panel {
  display: none;
  position: absolute;
  top: calc(100% + 10px);
  left: -10px;
  background: var(--dark-2);
  border: 1px solid var(--border-bright);
  border-radius: 14px;
  padding: 8px;
  min-width: 240px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
  animation: dropIn 0.2s var(--ease-out) both;
}
@keyframes dropIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.nav-dropdown:hover .dropdown-panel { display: block; }
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s;
  color: var(--text-dim) !important;
  font-size: 13px !important;
}
.dropdown-item:hover {
  background: rgba(233,69,96,0.08) !important;
  color: var(--white) !important;
}
.dropdown-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.di-amz { background: rgba(255,153,0,0.1); }
.di-ttk { background: rgba(255,0,80,0.1); }
.di-shp { background: rgba(0,200,100,0.1); }
.di-ai  { background: rgba(233,69,96,0.1); }
.dropdown-item-text strong {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
  font-family: var(--font-body);
}
.dropdown-item-text span {
  font-size: 11px;
  color: var(--text-muted);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-btn-ghost {
  padding: 8px 16px;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: var(--font-body);
}
.nav-btn-ghost:hover { color: var(--white); background: rgba(255,255,255,0.06); }
.nav-btn-primary {
  padding: 9px 20px;
  background: var(--red);
  color: var(--white) !important;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: var(--font-body);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}
.nav-btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}
.nav-btn-primary:hover { background: var(--red-dark); transform: translateY(-1px); box-shadow: 0 8px 24px var(--red-glow); }
.nav-btn-primary:hover::before { opacity: 1; }

/* Hamburger */
.nav-hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 8px;
}
.nav-hamburger span {
  display: block;
  width: 22px;
  height: 1.5px;
  background: var(--text);
  border-radius: 2px;
  transition: all 0.3s;
}

/* Mobile menu */
.mobile-menu {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--dark);
  z-index: 200;
  padding: 24px;
  flex-direction: column;
  overflow-y: auto;
}
.mobile-menu.open { display: flex; }
.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.mobile-close {
  background: rgba(255,255,255,0.08);
  border: 1px solid var(--border);
  color: var(--white);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mobile-menu a {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  text-decoration: none;
  font-size: 17px;
  font-weight: 500;
  font-family: var(--font-body);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: color 0.2s;
}
.mobile-menu a:hover { color: var(--red); }
.mobile-menu-cta {
  margin-top: 24px;
  background: var(--red) !important;
  color: var(--white) !important;
  border-radius: 10px;
  padding: 16px 24px !important;
  text-align: center;
  font-weight: 700 !important;
  border: none !important;
  font-size: 16px !important;
  justify-content: center !important;
}

@media (max-width: 900px) {
  .nav-links { display: none; }
  .nav-btn-ghost { display: none; }
  .nav-btn-primary { display: none; }
  .nav-hamburger { display: flex; }
  .nav-inner { padding: 0 20px; }
}

/* ════════════════════════════════════════
   HERO SECTION
════════════════════════════════════════ */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 100px 0 80px;
  overflow: hidden;
}

/* Radial glow backgrounds */
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.hero-glow-1 {
  position: absolute;
  width: 800px;
  height: 800px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(233,69,96,0.12) 0%, transparent 70%);
  top: -200px;
  right: -100px;
  animation: glow-pulse 6s ease-in-out infinite;
}
.hero-glow-2 {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(15,52,96,0.3) 0%, transparent 70%);
  bottom: -100px;
  left: -150px;
  animation: glow-pulse 8s ease-in-out infinite reverse;
}
.hero-glow-3 {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(233,69,96,0.06) 0%, transparent 70%);
  top: 40%;
  left: 30%;
}
@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
}

/* Grid pattern */
.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  padding: 0 32px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(233,69,96,0.08);
  border: 1px solid rgba(233,69,96,0.2);
  border-radius: 100px;
  padding: 6px 16px 6px 8px;
  margin-bottom: 32px;
  animation: fadeUp 0.8s var(--ease-out) both;
}
.hero-badge-dot {
  width: 6px;
  height: 6px;
  background: var(--red);
  border-radius: 50%;
  animation: blink 2s ease infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.hero-badge span {
  font-size: 12px;
  font-weight: 600;
  color: var(--red);
  letter-spacing: 1px;
  text-transform: uppercase;
  font-family: var(--font-body);
}

.hero-h1 {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(44px, 7vw, 84px);
  line-height: 1.02;
  letter-spacing: -3px;
  color: var(--white);
  margin-bottom: 24px;
  animation: fadeUp 0.8s 0.1s var(--ease-out) both;
}
.hero-h1 .accent { color: var(--red); }
.hero-h1 .dim { color: var(--text-dim); }

.hero-sub {
  font-size: clamp(16px, 2vw, 19px);
  color: var(--text-dim);
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.65;
  font-weight: 350;
  animation: fadeUp 0.8s 0.2s var(--ease-out) both;
}

.hero-ctas {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 48px;
  flex-wrap: wrap;
  animation: fadeUp 0.8s 0.3s var(--ease-out) both;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--red);
  color: var(--white);
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.25s var(--ease-out);
  font-family: var(--font-body);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 0 0 var(--red-glow);
  animation: hero-pulse 3s ease-in-out infinite;
}
@keyframes hero-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(233,69,96,0.4); }
  50% { box-shadow: 0 0 0 12px rgba(233,69,96,0); }
}
.btn-primary::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
}
.btn-primary:hover { background: var(--red-dark); transform: translateY(-2px); box-shadow: 0 16px 40px rgba(233,69,96,0.35); }
.btn-primary .btn-arrow { transition: transform 0.2s; }
.btn-primary:hover .btn-arrow { transform: translateX(3px); }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: rgba(255,255,255,0.05);
  color: var(--text);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  border: 1px solid var(--border-bright);
  transition: all 0.25s;
  font-family: var(--font-body);
}
.btn-secondary:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); color: var(--white); }

/* Social proof strip */
.hero-proof {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  animation: fadeUp 0.8s 0.4s var(--ease-out) both;
}
.proof-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-body);
}
.proof-item strong { color: var(--text-dim); font-weight: 600; }
.proof-divider { width: 4px; height: 4px; border-radius: 50%; background: var(--dark-5); flex-shrink: 0; }

/* Floating platform cards */
.hero-visual {
  position: relative;
  z-index: 1;
  margin-top: 80px;
  padding: 0 32px;
  animation: fadeUp 0.8s 0.5s var(--ease-out) both;
}
.platform-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
.platform-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  text-decoration: none;
}
.platform-card:hover {
  background: var(--card-hover);
  border-color: var(--border-bright);
  transform: translateY(-2px);
}
.platform-logo { font-size: clamp(22px, 2vw, 28px); }
.platform-info strong {
  display: block;
  font-size: clamp(13px, 1.2vw, 16px);
  font-weight: 600;
  color: var(--text);
  font-family: var(--font-display);
}
.platform-info span {
  font-size: clamp(11px, 0.9vw, 13px);
  color: var(--text-muted);
  font-family: var(--font-body);
}
.platform-stat {
  margin-left: 8px;
  font-size: clamp(12px, 1vw, 14px);
  font-weight: 700;
  color: var(--success);
  background: var(--success-dim);
  padding: 3px 8px;
  border-radius: 100px;
  font-family: var(--font-body);
}

/* Trust logos */
.trust-logos {
  margin-top: 56px;
  text-align: center;
  animation: fadeUp 0.8s 0.6s var(--ease-out) both;
}
.trust-logos-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 20px;
  font-family: var(--font-body);
}
.trust-logos-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}
.trust-logo-item {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  font-family: var(--font-display);
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.trust-logo-item:hover { color: var(--text-dim); }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ════════════════════════════════════════
   STATS BAR
════════════════════════════════════════ */
.stats-bar {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,0.015);
  padding: 40px 0;
  overflow: hidden;
}
.stats-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--dark), transparent 20%, transparent 80%, var(--dark));
  pointer-events: none;
  z-index: 2;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}
.stat-item {
  padding: 12px 32px;
  text-align: center;
  border-right: 1px solid var(--border);
}
.stat-item:last-child { border-right: none; }
.stat-number {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(28px, 3vw, 40px);
  color: var(--white);
  letter-spacing: -1px;
  line-height: 1;
  display: block;
}
.stat-number .stat-accent { color: var(--red); }
.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 6px;
  font-weight: 500;
  font-family: var(--font-body);
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .stat-item:nth-child(2) { border-right: none; }
  .stat-item:nth-child(3) { border-right: 1px solid var(--border); border-top: 1px solid var(--border); }
  .stat-item:nth-child(4) { border-right: none; border-top: 1px solid var(--border); }
}

/* ════════════════════════════════════════
   SECTION COMMONS
════════════════════════════════════════ */
section { position: relative; z-index: 1; }
.section-pad { padding: 100px 0; }
.section-pad-sm { padding: 72px 0; }

.section-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--red);
  margin-bottom: 16px;
  font-family: var(--font-body);
}
.section-h2 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(28px, 4vw, 48px);
  letter-spacing: -1.5px;
  color: var(--white);
  line-height: 1.1;
  margin-bottom: 16px;
}
.section-sub {
  font-size: 17px;
  color: var(--text-dim);
  max-width: 560px;
  line-height: 1.65;
  font-weight: 350;
}
.section-center { text-align: center; }
.section-center .section-sub { margin: 0 auto; }

/* ════════════════════════════════════════
   PROBLEM SECTION
════════════════════════════════════════ */
.problem-section { background: var(--dark-2); }

.problem-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 56px;
}
.problem-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.problem-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(233,69,96,0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.problem-card:hover { border-color: rgba(233,69,96,0.2); background: rgba(233,69,96,0.03); }
.problem-card:hover::before { opacity: 1; }
.problem-icon {
  font-size: 28px;
  margin-bottom: 16px;
  display: block;
}
.problem-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  color: var(--white);
  margin-bottom: 10px;
  letter-spacing: -0.3px;
}
.problem-body {
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.65;
}

@media (max-width: 768px) { .problem-grid { grid-template-columns: 1fr; } }

/* ════════════════════════════════════════
   HOW IT WORKS
════════════════════════════════════════ */
.hiw-section { background: var(--dark); }

.hiw-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  margin-top: 64px;
  position: relative;
}
.hiw-steps::before {
  content: '';
  position: absolute;
  top: 52px;
  left: calc(16.66% + 24px);
  right: calc(16.66% + 24px);
  height: 1px;
  background: linear-gradient(90deg, var(--red), rgba(233,69,96,0.2), var(--red));
  z-index: 0;
}
.hiw-step {
  padding: 32px;
  text-align: center;
  position: relative;
  z-index: 1;
}
.hiw-step-num {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--dark-2);
  border: 1px solid var(--border-bright);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 20px;
  color: var(--red);
  position: relative;
  transition: all 0.3s;
}
.hiw-step-num::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(233,69,96,0.15);
}
.hiw-step:hover .hiw-step-num {
  background: var(--red);
  color: var(--white);
  border-color: var(--red);
  box-shadow: 0 0 32px var(--red-glow);
}
.hiw-emoji { font-size: 22px; }
.hiw-step-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
  color: var(--white);
  margin-bottom: 12px;
  letter-spacing: -0.3px;
}
.hiw-step-body {
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.65;
}
@media (max-width: 768px) {
  .hiw-steps { grid-template-columns: 1fr; }
  .hiw-steps::before { display: none; }
}

/* ════════════════════════════════════════
   SERVICES SECTION
════════════════════════════════════════ */
.services-section { background: var(--dark-2); }

.services-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 56px;
}
.service-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 36px;
  transition: all 0.35s var(--ease-out);
  text-decoration: none;
  display: block;
  position: relative;
  overflow: hidden;
  group: true;
}
.service-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(233,69,96,0.04), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.service-card:hover {
  border-color: rgba(233,69,96,0.25);
  transform: translateY(-4px);
  box-shadow: 0 24px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(233,69,96,0.1);
}
.service-card:hover::after { opacity: 1; }
.service-card-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
}
.sc-amz { background: rgba(255,153,0,0.1); border: 1px solid rgba(255,153,0,0.15); }
.sc-ttk { background: rgba(255,0,80,0.08); border: 1px solid rgba(255,0,80,0.15); }
.sc-shp { background: rgba(0,200,100,0.08); border: 1px solid rgba(0,200,100,0.15); }
.sc-ai  { background: rgba(233,69,96,0.08); border: 1px solid rgba(233,69,96,0.15); }
.service-card-tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--red);
  margin-bottom: 8px;
  font-family: var(--font-body);
}
.service-card-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  color: var(--white);
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}
.service-card-body {
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.65;
  margin-bottom: 20px;
}
.service-card-price {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 800;
  color: var(--white);
  letter-spacing: -0.5px;
}
.service-card-price span {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 400;
  font-family: var(--font-body);
}
.service-card-arrow {
  position: absolute;
  top: 32px;
  right: 32px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 14px;
  transition: all 0.25s;
}
.service-card:hover .service-card-arrow {
  background: var(--red);
  border-color: var(--red);
  color: var(--white);
  transform: translate(2px, -2px);
}
.services-cta {
  text-align: center;
  margin-top: 40px;
}
@media (max-width: 768px) { .services-grid { grid-template-columns: 1fr; } }

/* ════════════════════════════════════════
   TESTIMONIALS
════════════════════════════════════════ */
.testimonials-section { background: var(--dark); }

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 56px;
}
.testimonial-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.testimonial-card::before {
  content: '"';
  position: absolute;
  top: -10px;
  right: 24px;
  font-family: var(--font-display);
  font-size: 120px;
  font-weight: 900;
  color: rgba(233,69,96,0.06);
  line-height: 1;
  pointer-events: none;
}
.testimonial-card:hover {
  border-color: var(--border-bright);
  transform: translateY(-3px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
}
.testimonial-stars {
  display: flex;
  gap: 3px;
  margin-bottom: 16px;
}
.star { color: #f59e0b; font-size: 14px; }
.testimonial-quote {
  font-size: 15px;
  color: var(--text);
  line-height: 1.7;
  margin-bottom: 24px;
  font-style: italic;
  font-weight: 350;
}
.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.testimonial-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 15px;
  color: var(--white);
  flex-shrink: 0;
}
.av-1 { background: linear-gradient(135deg, #e94560, #c73652); }
.av-2 { background: linear-gradient(135deg, #0f3460, #1a6494); }
.av-3 { background: linear-gradient(135deg, #00c896, #00875a); }
.testimonial-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--white);
  font-family: var(--font-body);
}
.testimonial-location {
  font-size: 12px;
  color: var(--text-muted);
}
.testimonial-result {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  background: var(--success-dim);
  border: 1px solid rgba(0,200,150,0.2);
  border-radius: 100px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--success);
  font-family: var(--font-body);
}

@media (max-width: 768px) { .testimonials-grid { grid-template-columns: 1fr; } }

/* ════════════════════════════════════════
   PRICING PREVIEW
════════════════════════════════════════ */
.pricing-section { background: var(--dark-2); }

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 56px;
}
.pricing-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px 24px;
  transition: all 0.3s;
  position: relative;
}
.pricing-card.featured {
  border-color: rgba(233,69,96,0.4);
  background: rgba(233,69,96,0.04);
  transform: scale(1.02);
}
.pricing-card:hover:not(.featured) {
  border-color: var(--border-bright);
  transform: translateY(-3px);
}
.pricing-card.featured:hover { transform: scale(1.02) translateY(-3px); }
.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--red);
  color: var(--white);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 14px;
  border-radius: 100px;
  white-space: nowrap;
  font-family: var(--font-body);
}
.pricing-service {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--red);
  margin-bottom: 6px;
  font-family: var(--font-body);
}
.pricing-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 17px;
  color: var(--white);
  margin-bottom: 16px;
  letter-spacing: -0.3px;
}
.pricing-amount {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 36px;
  color: var(--white);
  letter-spacing: -2px;
  line-height: 1;
  margin-bottom: 4px;
}
.pricing-amount sup {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0;
  vertical-align: super;
  margin-right: 2px;
}
.pricing-freq {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 20px;
  font-family: var(--font-body);
}
.pricing-features {
  list-style: none;
  margin-bottom: 24px;
}
.pricing-features li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--text-dim);
  padding: 4px 0;
  font-family: var(--font-body);
}
.pricing-features li::before {
  content: '✓';
  color: var(--success);
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
}
.pricing-btn {
  display: block;
  text-align: center;
  padding: 11px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  font-family: var(--font-body);
}
.pricing-btn-outline {
  border: 1px solid var(--border-bright);
  color: var(--text);
}
.pricing-btn-outline:hover { background: rgba(255,255,255,0.06); color: var(--white); }
.pricing-btn-solid {
  background: var(--red);
  color: var(--white);
  border: 1px solid transparent;
}
.pricing-btn-solid:hover { background: var(--red-dark); box-shadow: 0 8px 24px var(--red-glow); }
.pricing-cta { text-align: center; margin-top: 40px; }

@media (max-width: 960px) { .pricing-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .pricing-grid { grid-template-columns: 1fr; } .pricing-card.featured { transform: none; } }

/* ════════════════════════════════════════
   FAQ SECTION
════════════════════════════════════════ */
.faq-section { background: var(--dark); }

.faq-list {
  max-width: 720px;
  margin: 56px auto 0;
}
.faq-item {
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}
.faq-q {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 0;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
  transition: color 0.2s;
  gap: 16px;
  font-family: var(--font-body);
  user-select: none;
}
.faq-q:hover { color: var(--white); }
.faq-q.open { color: var(--white); }
.faq-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  transition: all 0.3s;
  color: var(--text-muted);
}
.faq-q.open .faq-icon {
  background: rgba(233,69,96,0.1);
  border-color: rgba(233,69,96,0.3);
  color: var(--red);
  transform: rotate(45deg);
}
.faq-a {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s var(--ease-out), padding 0.3s;
  font-size: 15px;
  color: var(--text-dim);
  line-height: 1.7;
  font-family: var(--font-body);
}
.faq-a.open {
  max-height: 200px;
  padding-bottom: 20px;
}
.faq-cta { text-align: center; margin-top: 40px; }

/* ════════════════════════════════════════
   FINAL CTA SECTION
════════════════════════════════════════ */
.final-cta {
  position: relative;
  padding: 120px 0;
  overflow: hidden;
  background: var(--dark-2);
}
.final-cta-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 80% at 50% 100%, rgba(233,69,96,0.12), transparent),
    radial-gradient(ellipse 40% 60% at 20% 50%, rgba(15,52,96,0.2), transparent);
}
.final-cta-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 40px 40px;
}
.final-cta-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
  padding: 0 32px;
}
.final-cta-title {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(32px, 5vw, 60px);
  letter-spacing: -2px;
  color: var(--white);
  line-height: 1.05;
  margin-bottom: 20px;
}
.final-cta-sub {
  font-size: 18px;
  color: var(--text-dim);
  margin-bottom: 40px;
  line-height: 1.6;
  font-weight: 350;
}
.final-cta-note {
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}
.final-cta-note span { display: flex; align-items: center; gap: 6px; }

/* ════════════════════════════════════════
   FOOTER
════════════════════════════════════════ */
footer {
  background: var(--dark);
  border-top: 1px solid var(--border);
  padding: 72px 0 40px;
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 56px;
}
.footer-brand p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.65;
  margin: 12px 0 24px;
  max-width: 260px;
}
.footer-logo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 20px;
  color: var(--white);
  text-decoration: none;
  letter-spacing: -0.5px;
}
.footer-logo .fl-you { color: var(--red); }
.footer-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
}
.footer-stars { color: #f59e0b; }
.footer-col-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  color: var(--white);
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 1.5px;
}
.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.footer-links a {
  font-size: 14px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
  font-family: var(--font-body);
}
.footer-links a:hover { color: var(--text); }
.footer-bottom {
  border-top: 1px solid var(--border);
  padding-top: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.footer-copy {
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-body);
}
.footer-contact {
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-body);
}
.footer-contact a { color: var(--text-dim); text-decoration: none; }
.footer-contact a:hover { color: var(--white); }

@media (max-width: 960px) {
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .footer-brand { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
}

/* ════════════════════════════════════════
   SCROLL ANIMATIONS
════════════════════════════════════════ */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out);
}
.reveal.visible { opacity: 1; transform: translateY(0); }
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }

/* ════════════════════════════════════════
   UTILITY
════════════════════════════════════════ */
.text-red { color: var(--red); }
.text-white { color: var(--white); }
.mt-8 { margin-top: 8px; }
.mt-16 { margin-top: 16px; }
.mt-24 { margin-top: 24px; }
.mt-40 { margin-top: 40px; }
.mb-0 { margin-bottom: 0; }

@media (max-width: 640px) {
  .hero { padding: 72px 0 60px; min-height: auto; }
  .section-pad { padding: 72px 0; }
  .hero-ctas { gap: 10px; }
  .btn-primary, .btn-secondary { padding: 12px 22px; font-size: 14px; width: 100%; justify-content: center; }
  .hero-proof { gap: 16px; }
  .proof-divider { display: none; }
}
`;

const homepageHTML = `

<!-- ── ANNOUNCEMENT BAR ── -->
<div class="announce-bar" id="announce-bar">
  <span>🚀 <strong>Limited Launch Pricing</strong> — Save up to $2,997. Ends in <strong id="countdown-timer">calculating...</strong></span>
  <a href="https://yousell.online/pricing/">Claim Your Spot →</a>
  <button type="button" class="announce-close" data-close-bar="true" aria-label="Close">×</button>
</div>
<script>
(function(){
  // Check if user already closed the bar
  if(localStorage.getItem('ys_bar_closed')==='1'){
    document.getElementById('announce-bar').style.display='none';
    return;
  }
  // Deadline: 30 days from first visit, stored in localStorage
  var key = 'ys_offer_deadline';
  var deadline = localStorage.getItem(key);
  if(!deadline){
    deadline = Date.now() + 30*24*60*60*1000;
    localStorage.setItem(key, deadline);
  }
  deadline = parseInt(deadline);
  function tick(){
    var diff = deadline - Date.now();
    if(diff <= 0){
      document.getElementById('countdown-timer').textContent = 'EXPIRED';
      return;
    }
    var d = Math.floor(diff/86400000);
    var h = Math.floor((diff%86400000)/3600000);
    var m = Math.floor((diff%3600000)/60000);
    var s = Math.floor((diff%60000)/1000);
    var pad = function(n){return n<10?'0'+n:n;};
    document.getElementById('countdown-timer').textContent =
      (d > 0 ? d+'d ' : '') + pad(h)+'h '+pad(m)+'m '+pad(s)+'s';
  }
  tick();
  setInterval(tick, 1000);
})();
</script>

<!-- ── NAVBAR ── -->
<nav class="nav" id="main-nav">
  <div class="nav-inner">
    <a href="https://yousell.online/" class="nav-logo">
      <span class="logo-you">You</span><span class="logo-sell">Sell</span><span class="logo-dot">.</span><span class="logo-online">Online</span>
    </a>

    <ul class="nav-links">
      <li class="nav-dropdown">
        <a href="#">Solutions</a>
        <div class="dropdown-panel">
          <a href="https://yousell.online/amazon-services" class="dropdown-item">
            <div class="dropdown-icon di-amz">📦</div>
            <div class="dropdown-item-text">
              <strong>Amazon Services</strong>
              <span>Launch & manage your FBA store</span>
            </div>
          </a>
          <a href="https://yousell.online/tiktok-shop" class="dropdown-item">
            <div class="dropdown-icon di-ttk">🎵</div>
            <div class="dropdown-item-text">
              <strong>TikTok Shop</strong>
              <span>Live in 14 days, creator network</span>
            </div>
          </a>
          <a href="https://yousell.online/shopify-launch" class="dropdown-item">
            <div class="dropdown-icon di-shp">🛍️</div>
            <div class="dropdown-item-text">
              <strong>Shopify Launch</strong>
              <span>Store built & live in 21 days</span>
            </div>
          </a>
          <a href="https://yousell.online/ai-bundle" class="dropdown-item">
            <div class="dropdown-icon di-ai">🤖</div>
            <div class="dropdown-item-text">
              <strong>AI Ecommerce Bundle</strong>
              <span>All 3 platforms, one team</span>
            </div>
          </a>
        </div>
      </li>
      <li><a href="https://yousell.online/pricing">Pricing</a></li>
      <li><a href="https://yousell.online/case-studies">Results</a></li>
      <li><a href="https://yousell.online/blog">Resources</a></li>
      <li><a href="https://yousell.online/enterprise">Enterprise</a></li>
    </ul>

    <div class="nav-right">
      <a href="https://yousell.online/login" class="nav-btn-ghost">Client Login</a>
      <a href="https://yousell.online/pricing" class="nav-btn-primary">Get Started →</a>
      <button type="button" class="nav-hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>

<!-- ── MOBILE MENU ── -->
<div class="mobile-menu" id="mobile-menu">
  <div class="mobile-menu-header">
    <a href="https://yousell.online/" class="nav-logo">
      <span class="logo-you">You</span><span class="logo-sell">Sell</span><span class="logo-dot">.</span><span class="logo-online">Online</span>
    </a>
    <button type="button" class="mobile-close" id="mobile-close" aria-label="Close">×</button>
  </div>
  <a href="https://yousell.online/amazon-services">📦 Amazon Services</a>
  <a href="https://yousell.online/tiktok-shop">🎵 TikTok Shop Launch</a>
  <a href="https://yousell.online/shopify-launch">🛍️ Shopify Store Launch</a>
  <a href="https://yousell.online/ai-bundle">🤖 AI Ecommerce Bundle</a>
  <a href="https://yousell.online/pricing">Pricing</a>
  <a href="https://yousell.online/case-studies">Results</a>
  <a href="https://yousell.online/blog">Resources</a>
  <a href="https://yousell.online/enterprise">Enterprise</a>
  <a href="https://yousell.online/pricing" class="mobile-menu-cta">Get Started Today →</a>
</div>

<!-- ════════════════════════════════════════
     HERO
════════════════════════════════════════ -->
<section class="hero">
  <div class="hero-bg">
    <div class="hero-glow-1"></div>
    <div class="hero-glow-2"></div>
    <div class="hero-glow-3"></div>
    <div class="hero-grid"></div>
  </div>

  <div class="hero-content">
    <div class="hero-badge">
      <div class="hero-badge-dot"></div>
      <span>AI-Powered Ecommerce Services</span>
    </div>

    <h1 class="hero-h1">
      Launch. Sell.<br>
      <span class="accent">Scale.</span><br>
      <span class="dim">Your Empire Starts Here.</span>
    </h1>

    <p class="hero-sub">
      Amazon. TikTok Shop. Shopify. All three channels — built, managed, and grown for you by AI-powered experts. No sales calls. No profit share. Guaranteed results.
    </p>

    <div class="hero-ctas">
      <a href="https://yousell.online/pricing" class="btn-primary">
        Get Started Today <span class="btn-arrow">→</span>
      </a>
      <a href="#how-it-works" class="btn-secondary">
        See How It Works ↓
      </a>
    </div>

    <div class="hero-proof">
      <div class="proof-item"><strong>500+</strong> Stores Launched</div>
      <div class="proof-divider"></div>
      <div class="proof-item"><strong>$12M+</strong> Revenue Generated</div>
      <div class="proof-divider"></div>
      <div class="proof-item"><strong>4.9★</strong> Average Rating</div>
      <div class="proof-divider"></div>
      <div class="proof-item"><strong>30-Day</strong> Money-Back Guarantee</div>
    </div>
  </div>

  <div class="hero-visual container">
    <div class="platform-strip">
      <div class="platform-card">
        <div class="platform-logo">📦</div>
        <div class="platform-info">
          <strong>Amazon FBA</strong>
          <span>From $997/mo</span>
        </div>
        <div class="platform-stat">↑ $41K/mo</div>
      </div>
      <div class="platform-card">
        <div class="platform-logo">🎵</div>
        <div class="platform-info">
          <strong>TikTok Shop</strong>
          <span>From $997</span>
        </div>
        <div class="platform-stat">↑ $28K/mo</div>
      </div>
      <div class="platform-card">
        <div class="platform-logo">🛍️</div>
        <div class="platform-info">
          <strong>Shopify Store</strong>
          <span>From $1,497</span>
        </div>
        <div class="platform-stat">↑ $22K/mo</div>
      </div>
      <div class="platform-card">
        <div class="platform-logo">🤖</div>
        <div class="platform-info">
          <strong>AI Bundle</strong>
          <span>From $2,997</span>
        </div>
        <div class="platform-stat">↑ $10K/90d</div>
      </div>
    </div>

    <div class="trust-logos">
      <div class="trust-logos-label">Platforms We Master</div>
      <div class="trust-logos-row">
        <div class="trust-logo-item">⚡ Amazon</div>
        <div class="trust-logo-item">🎵 TikTok Shop</div>
        <div class="trust-logo-item">🛍️ Shopify</div>
        <div class="trust-logo-item">📘 Meta Ads</div>
        <div class="trust-logo-item">🔍 Google Shopping</div>
      </div>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════
     STATS BAR
════════════════════════════════════════ -->
<div class="stats-bar">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-number" data-count="500">0<span class="stat-accent">+</span></span>
        <div class="stat-label">Stores Launched</div>
      </div>
      <div class="stat-item">
        <span class="stat-number"><span class="stat-accent">$</span><span data-count="12">0</span>M<span class="stat-accent">+</span></span>
        <div class="stat-label">Revenue Generated</div>
      </div>
      <div class="stat-item">
        <span class="stat-number" data-count="4.9">0<span class="stat-accent">★</span></span>
        <div class="stat-label">Average Rating</div>
      </div>
      <div class="stat-item">
        <span class="stat-number"><span data-count="97">0</span><span class="stat-accent">%</span></span>
        <div class="stat-label">Client Retention</div>
      </div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     PROBLEM SECTION
════════════════════════════════════════ -->
<section class="problem-section section-pad">
  <div class="container">
    <div class="section-center reveal">
      <div class="section-tag">Why Most Sellers Fail</div>
      <h2 class="section-h2">Still waiting for your first sale?</h2>
      <p class="section-sub">Every day, thousands of Americans launch ecommerce stores with big dreams — and 90% fail within 12 months. Not because they weren't motivated. Because they tried to do it all alone.</p>
    </div>

    <div class="problem-grid">
      <div class="problem-card reveal reveal-delay-1">
        <span class="problem-icon">❌</span>
        <div class="problem-title">Wasted Money on Dead Inventory</div>
        <p class="problem-body">Wrong product research = dead inventory. Most sellers lose $2,000–$10,000 in their first year picking the wrong items with no data to back the decision.</p>
      </div>
      <div class="problem-card reveal reveal-delay-2">
        <span class="problem-icon">❌</span>
        <div class="problem-title">Zero Traffic After Launch</div>
        <p class="problem-body">A beautiful store with no visitors. Most Shopify stores generate under $500 in their first 60 days because of no marketing strategy and no audience.</p>
      </div>
      <div class="problem-card reveal reveal-delay-3">
        <span class="problem-icon">❌</span>
        <div class="problem-title">Agencies That Overpromise</div>
        <p class="problem-body">You paid $5,000. They disappeared after onboarding. Sound familiar? The ecommerce agency world is broken — and we're here to fix it permanently.</p>
      </div>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════
     HOW IT WORKS
════════════════════════════════════════ -->
<section class="hiw-section section-pad" id="how-it-works">
  <div class="container">
    <div class="section-center reveal">
      <div class="section-tag">The YouSell Difference</div>
      <h2 class="section-h2">We Do the Hard Work.<br>You Keep the Profits.</h2>
      <p class="section-sub">Our AI-powered platform + human experts handle everything — so you focus on the big picture while we build your revenue engine.</p>
    </div>

    <div class="hiw-steps">
      <div class="hiw-step reveal reveal-delay-1">
        <div class="hiw-step-num"><span class="hiw-emoji">🎯</span></div>
        <div class="hiw-step-title">Choose Your Platform</div>
        <p class="hiw-step-body">Pick Amazon, TikTok Shop, Shopify — or all three with our AI Bundle. Select your package and complete onboarding online in under 10 minutes.</p>
      </div>
      <div class="hiw-step reveal reveal-delay-2">
        <div class="hiw-step-num"><span class="hiw-emoji">🤖</span></div>
        <div class="hiw-step-title">We Build & Launch</div>
        <p class="hiw-step-body">Our AI system + specialist team builds your store, researches products, optimises listings, and launches your first campaigns within your guaranteed timeline.</p>
      </div>
      <div class="hiw-step reveal reveal-delay-3">
        <div class="hiw-step-num"><span class="hiw-emoji">📈</span></div>
        <div class="hiw-step-title">Watch Revenue Grow</div>
        <p class="hiw-step-body">Real-time dashboard. Weekly reports. Dedicated account manager. You see everything, approve strategies, and scale as fast as you want.</p>
      </div>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════
     SERVICES
════════════════════════════════════════ -->
<section class="services-section section-pad">
  <div class="container">
    <div class="section-center reveal">
      <h2 class="section-h2">Everything You Need to<br>Dominate Ecommerce in 2025</h2>
    </div>

    <div class="services-grid">
      <a href="https://yousell.online/amazon-services" class="service-card reveal reveal-delay-1">
        <div class="service-card-arrow">→</div>
        <div class="service-card-icon sc-amz">📦</div>
        <div class="service-card-tag">Amazon FBA</div>
        <div class="service-card-title">Full Amazon Store Management</div>
        <p class="service-card-body">Product research, listings, PPC, inventory management, and growth — all handled by AI-powered specialists. No profit share. Ever.</p>
        <div class="service-card-price">From $997<span>/mo</span></div>
      </a>
      <a href="https://yousell.online/tiktok-shop" class="service-card reveal reveal-delay-2">
        <div class="service-card-arrow">→</div>
        <div class="service-card-icon sc-ttk">🎵</div>
        <div class="service-card-tag">TikTok Shop</div>
        <div class="service-card-title">Live & Selling in 14 Days</div>
        <p class="service-card-body">Creator outreach, shoppable videos, live commerce, and paid ads. We build your TikTok revenue engine from day one.</p>
        <div class="service-card-price">From $997<span> one-time</span></div>
      </a>
      <a href="https://yousell.online/shopify-launch" class="service-card reveal reveal-delay-3">
        <div class="service-card-arrow">→</div>
        <div class="service-card-icon sc-shp">🛍️</div>
        <div class="service-card-tag">Shopify Store</div>
        <div class="service-card-title">Conversion-Optimised in 21 Days</div>
        <p class="service-card-body">Premium store build with your first traffic strategy included free. Google Shopping, Meta Pixel, and welcome email sequence ready to go.</p>
        <div class="service-card-price">From $1,497<span> one-time</span></div>
      </a>
      <a href="https://yousell.online/ai-bundle" class="service-card reveal reveal-delay-4">
        <div class="service-card-arrow">→</div>
        <div class="service-card-icon sc-ai">🤖</div>
        <div class="service-card-tag">AI Bundle</div>
        <div class="service-card-title">All Three Channels. One Team.</div>
        <p class="service-card-body">Amazon + TikTok + Shopify launched simultaneously. AI-powered from day one. The fastest path to your first $10K month.</p>
        <div class="service-card-price">From $2,997<span> one-time</span></div>
      </a>
    </div>

    <div class="services-cta reveal">
      <a href="https://yousell.online/pricing" class="btn-secondary">See Full Pricing — No Sales Call Required →</a>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════
     TESTIMONIALS
════════════════════════════════════════ -->
<section class="testimonials-section section-pad">
  <div class="container">
    <div class="section-center reveal">
      <div class="section-tag">Client Results</div>
      <h2 class="section-h2">Real People. Real Results.</h2>
    </div>

    <div class="testimonials-grid">
      <div class="testimonial-card reveal reveal-delay-1">
        <div class="testimonial-stars">
          <span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span>
        </div>
        <p class="testimonial-quote">"I went from zero to $8,400 in my first month on Amazon. The team handled everything — product research, listing, PPC. I just approved decisions."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar av-1">MT</div>
          <div>
            <div class="testimonial-name">Marcus T.</div>
            <div class="testimonial-location">Texas, USA · Amazon FBA</div>
          </div>
        </div>
        <div class="testimonial-result">✓ $8,400 in Month 1</div>
      </div>

      <div class="testimonial-card reveal reveal-delay-2">
        <div class="testimonial-stars">
          <span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span>
        </div>
        <p class="testimonial-quote">"TikTok Shop felt overwhelming. YouSell had my store live in 12 days and connected me with 18 creators in week one. First sale came within 48 hours."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar av-2">PS</div>
          <div>
            <div class="testimonial-name">Priya S.</div>
            <div class="testimonial-location">California, USA · TikTok Shop</div>
          </div>
        </div>
        <div class="testimonial-result">✓ Live in 12 Days</div>
      </div>

      <div class="testimonial-card reveal reveal-delay-3">
        <div class="testimonial-stars">
          <span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span>
        </div>
        <p class="testimonial-quote">"My Shopify store was dead for 6 months. After YouSell rebuilt it with AI-optimised structure, I hit $14,000 in month three. Worth every dollar."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar av-3">DL</div>
          <div>
            <div class="testimonial-name">David L.</div>
            <div class="testimonial-location">New York, USA · Shopify</div>
          </div>
        </div>
        <div class="testimonial-result">✓ $14,000 in Month 3</div>
      </div>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════
     PRICING PREVIEW
════════════════════════════════════════ -->
<section class="pricing-section section-pad">
  <div class="container">
    <div class="section-center reveal">
      <div class="section-tag">Transparent Pricing</div>
      <h2 class="section-h2">No Surprises. No Sales Calls.</h2>
      <p class="section-sub">Unlike every other ecommerce agency, we show you exactly what you get and exactly what you pay.</p>
    </div>

    <div class="pricing-grid">
      <div class="pricing-card reveal reveal-delay-1">
        <div class="pricing-service">Amazon</div>
        <div class="pricing-name">Starter Launch</div>
        <div class="pricing-amount"><sup>$</sup>997</div>
        <div class="pricing-freq">one-time setup</div>
        <ul class="pricing-features">
          <li>Amazon account setup</li>
          <li>10 optimised listings</li>
          <li>PPC campaign launch</li>
          <li>30-day support</li>
        </ul>
        <a href="https://yousell.online/pricing" class="pricing-btn pricing-btn-outline">Get Started</a>
      </div>

      <div class="pricing-card reveal reveal-delay-2">
        <div class="pricing-service">TikTok Shop</div>
        <div class="pricing-name">Quick Launch</div>
        <div class="pricing-amount"><sup>$</sup>997</div>
        <div class="pricing-freq">one-time setup</div>
        <ul class="pricing-features">
          <li>TikTok Shop setup</li>
          <li>10 products listed</li>
          <li>10 creator outreach</li>
          <li>Basic analytics</li>
        </ul>
        <a href="https://yousell.online/pricing" class="pricing-btn pricing-btn-outline">Get Started</a>
      </div>

      <div class="pricing-card reveal reveal-delay-3">
        <div class="pricing-service">Shopify</div>
        <div class="pricing-name">Launch Store</div>
        <div class="pricing-amount"><sup>$</sup>1,497</div>
        <div class="pricing-freq">one-time setup</div>
        <ul class="pricing-features">
          <li>Full store build</li>
          <li>25 products loaded</li>
          <li>Mobile optimised</li>
          <li>Payment gateway</li>
        </ul>
        <a href="https://yousell.online/pricing" class="pricing-btn pricing-btn-outline">Get Started</a>
      </div>

      <div class="pricing-card featured reveal reveal-delay-4">
        <div class="popular-badge">Most Popular</div>
        <div class="pricing-service">AI Bundle</div>
        <div class="pricing-name">Starter Bundle</div>
        <div class="pricing-amount"><sup>$</sup>2,997</div>
        <div class="pricing-freq">one-time — all 3 platforms</div>
        <ul class="pricing-features">
          <li>All 3 platforms launched</li>
          <li>AI-powered strategy</li>
          <li>Dedicated account manager</li>
          <li>30-day money-back guarantee</li>
        </ul>
        <a href="https://yousell.online/pricing" class="pricing-btn pricing-btn-solid">Get Started →</a>
      </div>
    </div>

    <div class="pricing-cta reveal">
      <a href="https://yousell.online/pricing" class="btn-secondary">Compare All Plans →</a>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════
     FAQ
════════════════════════════════════════ -->
<section class="faq-section section-pad">
  <div class="container">
    <div class="section-center reveal">
      <div class="section-tag">Common Questions</div>
      <h2 class="section-h2">Everything You Need to Know</h2>
    </div>

    <div class="faq-list">
      <div class="faq-item reveal">
        <div class="faq-q" data-faq-toggle="true">
          Do I need any ecommerce experience?
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-a">Zero. We handle everything from store setup to scaling. You approve major decisions through your dashboard. Our system is designed for complete beginners and seasoned sellers alike.</div>
      </div>
      <div class="faq-item reveal reveal-delay-1">
        <div class="faq-q" data-faq-toggle="true">
          What if I don't get results?
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-a">We offer a 30-day money-back guarantee on every service. If we don't hit your agreed launch targets, you get a full refund. No questions asked. No forms to fill. Just one email to admin@yousell.online.</div>
      </div>
      <div class="faq-item reveal reveal-delay-2">
        <div class="faq-q" data-faq-toggle="true">
          How is this different from other agencies?
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-a">Three ways. One — our pricing is visible on the website. Two — we never take a profit share. Three — AI powers every part of our delivery so we move faster and cost less than traditional agencies.</div>
      </div>
    </div>

    <div class="faq-cta reveal">
      <a href="https://yousell.online/faq" class="btn-secondary">See All FAQs →</a>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════
     FINAL CTA
════════════════════════════════════════ -->
<section class="final-cta">
  <div class="final-cta-bg"></div>
  <div class="final-cta-grid"></div>
  <div class="final-cta-content reveal">
    <div class="section-tag">Ready to Start?</div>
    <h2 class="final-cta-title">Build Your Ecommerce Empire Today.</h2>
    <p class="final-cta-sub">Join 500+ entrepreneurs already selling on Amazon, TikTok Shop, and Shopify. No sales call. No contract. Just results.</p>
    <a href="https://yousell.online/pricing" class="btn-primary" style="font-size:16px; padding:16px 36px;">
      Get Started Today <span class="btn-arrow">→</span>
    </a>
    <div class="final-cta-note">
      <span>✓ 30-Day Money-Back Guarantee</span>
      <span>✓ No Sales Call Required</span>
      <span>✓ Cancel Anytime</span>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════
     FOOTER
════════════════════════════════════════ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="https://yousell.online/" class="footer-logo"><span class="fl-you">You</span>Sell.Online</a>
        <p>AI-powered ecommerce services for Amazon, TikTok Shop, and Shopify. Transparent pricing. Guaranteed results. No profit share.</p>
        <div class="footer-rating">
          <span class="footer-stars">★★★★★</span>
          <span>4.9/5 from 200+ reviews</span>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Solutions</div>
        <ul class="footer-links">
          <li><a href="https://yousell.online/amazon-services">Amazon Services</a></li>
          <li><a href="https://yousell.online/tiktok-shop">TikTok Shop</a></li>
          <li><a href="https://yousell.online/shopify-launch">Shopify Launch</a></li>
          <li><a href="https://yousell.online/ai-bundle">AI Bundle</a></li>
          <li><a href="https://yousell.online/pricing">Pricing</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title">Company</div>
        <ul class="footer-links">
          <li><a href="https://yousell.online/about">About Us</a></li>
          <li><a href="https://yousell.online/case-studies">Case Studies</a></li>
          <li><a href="https://yousell.online/blog">Blog</a></li>
          <li><a href="https://yousell.online/affiliate">Affiliate</a></li>
          <li><a href="https://yousell.online/enterprise">Enterprise</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title">Resources</div>
        <ul class="footer-links">
          <li><a href="https://yousell.online/free-guide">Free Guide</a></li>
          <li><a href="https://yousell.online/free-tools">Free Tools</a></li>
          <li><a href="https://yousell.online/community">Community</a></li>
          <li><a href="https://yousell.online/faq">FAQ</a></li>
          <li><a href="https://yousell.online/contact">Contact</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title">Legal</div>
        <ul class="footer-links">
          <li><a href="https://yousell.online/privacy-policy">Privacy Policy</a></li>
          <li><a href="https://yousell.online/terms-of-service">Terms of Service</a></li>
          <li><a href="https://yousell.online/privacy-policy">Cookie Policy</a></li>
          <li><a href="https://yousell.online/privacy-policy">GDPR</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-copy">© 2025 YouSell Online LLC. All rights reserved.</div>
      <div class="footer-contact">
        <a href="mailto:admin@yousell.online">admin@yousell.online</a> ·
        <a href="tel:+13068005166">+1 (306) 800-5166</a> ·
        254 Chapman Rd STE 208, Newark, DE 19702
      </div>
    </div>
  </div>
</footer>

<script>
// ── Navbar scroll effect ──
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile menu ──
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.add('open');
  document.body.style.overflow = 'hidden';
});
document.getElementById('mobile-close').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.remove('open');
  document.body.style.overflow = '';
});

// ── FAQ accordion ──
function toggleFaq(el) {
  const answer = el.nextElementSibling;
  const icon = el.querySelector('.faq-icon');
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-q.open').forEach(q => {
    q.classList.remove('open');
    q.nextElementSibling.classList.remove('open');
  });
  if (!isOpen) {
    el.classList.add('open');
    answer.classList.add('open');
  }
}

// ── Scroll reveal ──
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => observer.observe(el));

// ── Counter animation ──
function animateCount(el, target, duration, isDecimal) {
  const start = performance.now();
  const update = (time) => {
    const elapsed = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    const value = isDecimal
      ? (eased * target).toFixed(1)
      : Math.floor(eased * target);
    el.textContent = value;
    if (elapsed < 1) requestAnimationFrame(update);
    else el.textContent = isDecimal ? target.toFixed(1) : target;
  };
  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const isDecimal = String(target).includes('.');
      animateCount(el, target, 1800, isDecimal);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => statObserver.observe(el));
</script>
<script src="cookies.js"></script>
`;

export default function Homepage() {
  useEffect(() => {
    // Navbar scroll effect
    const nav = document.getElementById('main-nav');
    const handleScroll = () => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mobile menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileClose = document.getElementById('mobile-close');
    hamburger?.addEventListener('click', () => {
      mobileMenu?.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    mobileClose?.addEventListener('click', () => {
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    });

    // FAQ accordion
    document.querySelectorAll('[data-faq-toggle]').forEach((el) => {
      el.addEventListener('click', () => {
        const answer = el.nextElementSibling as HTMLElement;
        const isOpen = el.classList.contains('open');
        document.querySelectorAll('.faq-q.open').forEach((q) => {
          q.classList.remove('open');
          q.nextElementSibling?.classList.remove('open');
        });
        if (!isOpen) {
          el.classList.add('open');
          answer?.classList.add('open');
        }
      });
    });

    // Scroll reveal
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));

    // Counter animation
    function animateCount(el: HTMLElement, target: number, duration: number, isDecimal: boolean) {
      const start = performance.now();
      const update = (time: number) => {
        const elapsed = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        const value = isDecimal ? (eased * target).toFixed(1) : Math.floor(eased * target).toString();
        el.textContent = value;
        if (elapsed < 1) requestAnimationFrame(update);
        else el.textContent = isDecimal ? target.toFixed(1) : target.toString();
      };
      requestAnimationFrame(update);
    }

    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = parseFloat(el.dataset.count || '0');
            const isDecimal = String(target).includes('.');
            animateCount(el, target, 1800, isDecimal);
            statObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('[data-count]').forEach((el) => statObserver.observe(el));

    // Announcement bar countdown
    const announceBar = document.getElementById('announce-bar');
    if (announceBar && localStorage.getItem('ys_bar_closed') === '1') {
      announceBar.style.display = 'none';
    } else {
      const key = 'ys_offer_deadline';
      let deadline = localStorage.getItem(key);
      if (!deadline) {
        deadline = String(Date.now() + 30 * 24 * 60 * 60 * 1000);
        localStorage.setItem(key, deadline);
      }
      const deadlineMs = parseInt(deadline);
      const tick = () => {
        const diff = deadlineMs - Date.now();
        const timerEl = document.getElementById('countdown-timer');
        if (!timerEl) return;
        if (diff <= 0) {
          timerEl.textContent = 'EXPIRED';
          return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const pad = (n: number) => (n < 10 ? '0' + n : n);
        timerEl.textContent = (d > 0 ? d + 'd ' : '') + pad(h) + 'h ' + pad(m) + 'm ' + pad(s) + 's';
      };
      tick();
      const interval = setInterval(tick, 1000);

      // Close button
      const closeBtn = announceBar?.querySelector('[data-close-bar]');
      closeBtn?.addEventListener('click', () => {
        if (announceBar) announceBar.style.display = 'none';
        localStorage.setItem('ys_bar_closed', '1');
      });

      return () => {
        clearInterval(interval);
        window.removeEventListener('scroll', handleScroll);
      };
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: homepageCSS }} />
      <div dangerouslySetInnerHTML={{ __html: homepageHTML }} />
    </>
  );
}
