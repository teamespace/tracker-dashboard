import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { EARNINGS_BY_MONTH } from '../data';

const STEPS = [
  { eyebrow: 'Welcome to Studio', title: 'Your freelance business, at a glance.', body: 'Start with a clear view of projects, deadlines, earnings, and invoices. Everything important lives on the Overview.' },
  { eyebrow: 'Chart insights', title: 'See where your time and money are going.', body: 'Hover the chart for exact values, then switch between earnings and hours to understand the month from both sides.' },
  { eyebrow: 'Needs attention', title: 'Always know what to do next.', body: 'Open a project or client for context, update status inline, and inspect payment progress without losing your place.' },
];

function OverviewPreview({ step }: { step: number }) {
  const max = Math.max(...EARNINGS_BY_MONTH.map((item) => item.earnings));
  return (
    <div className="onboarding-preview">
      {step === 0 && <div className="onboarding-preview-grid"><div className="onboarding-mini-card wide"><span>Monthly earnings</span><strong>$9,100</strong><i /></div><div className="onboarding-mini-card"><span>Active projects</span><strong>15</strong><b>6 in progress</b></div><div className="onboarding-mini-card"><span>Invoices</span><strong>$26.4k</strong><b>Needs review</b></div></div>}
      {step === 1 && <div className="onboarding-chart-preview"><div className="flex items-end justify-between gap-1.5">{EARNINGS_BY_MONTH.map((item) => <i key={item.month} style={{ height: `${Math.max(16, (item.earnings / max) * 100)}%` }} />)}</div><span className="onboarding-chart-tooltip"><small>Aug</small><strong>$9,100</strong><em>+15.2%</em></span></div>}
      {step === 2 && <div className="onboarding-attention-preview"><div><span className="h-2 w-2 rounded-full bg-rose-400" /><strong>Brand identity refresh</strong><em>10 days overdue</em></div><div><span className="h-2 w-2 rounded-full bg-amber-400" /><strong>Product launch page</strong><em>Due tomorrow</em></div><div><span className="h-2 w-2 rounded-full bg-emerald-400" /><strong>Payment milestone</strong><em>$1,500 upcoming</em></div></div>}
    </div>
  );
}

export default function OnboardingModal() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(() => {
    try {
      return window.localStorage.getItem('studio-overview-onboarding-enabled') !== 'false';
    } catch {
      return true;
    }
  });
  const current = STEPS[step];

  function finish() {
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border-2 border-slate-300 bg-white shadow-2xl">
        <button type="button" onClick={finish} aria-label="Skip onboarding" className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-slate-500 shadow-sm hover:bg-white"><X className="h-4 w-4" /></button>
        <OverviewPreview step={step} />
        <div className="px-5 pb-6 pt-5 sm:px-6 sm:pb-7"><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-950">{current.eyebrow}</p><h2 id="onboarding-title" className="mt-2 max-w-lg text-2xl font-bold leading-tight tracking-tight text-slate-950">{current.title}</h2><p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">{current.body}</p></div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6"><div className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>{STEPS.map((item, index) => <span key={item.eyebrow} className={`h-1.5 rounded-full transition-all ${index === step ? 'w-7 bg-slate-950' : 'w-1.5 bg-slate-200'}`} />)}</div><div className="flex items-center gap-2"><button type="button" onClick={finish} className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Skip</button>{step > 0 && <button type="button" onClick={() => setStep((value) => value - 1)} className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Previous</button>}<button type="button" onClick={() => step === STEPS.length - 1 ? finish() : setStep((value) => value + 1)} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">{step === STEPS.length - 1 ? 'Continue' : 'Next'}<ArrowRight className="h-4 w-4" /></button></div></div>
      </div>
    </div>
  );
}
