import { useState } from 'react';
import { Card, TextInput, Select, SelectItem, NumberInput, Switch } from '@tremor/react';
import Toast from '../components/Toast';
import Avatar from '../components/Avatar';
import { IconButton } from '../components/motion/IconButton';
import { Bell, CreditCard, Save, User } from 'lucide-react';

const NOTIF_META: Record<string, { label: string; desc: string }> = {
  invoiceReminders: { label: 'Invoice reminders', desc: 'Get notified before an invoice is due.' },
  deadlineAlerts: { label: 'Deadline alerts', desc: 'Heads up when a project deadline is close.' },
  weeklySummary: { label: 'Weekly summary email', desc: 'A recap of earnings and activity every Monday.' },
};

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function Settings() {
  const [tab, setTab] = useState<TabId>('profile');
  const [profile, setProfile] = useState({ name: 'Rasya', email: 'rasya@queebo.chat', title: 'Freelance Product Designer' });
  const [payment, setPayment] = useState({ method: 'Bank transfer', rate: 85 });
  const [notifications, setNotifications] = useState({ invoiceReminders: true, deadlineAlerts: true, weeklySummary: false });
  const [toast, setToast] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify({ profile, payment, notifications }));
  const currentSnapshot = JSON.stringify({ profile, payment, notifications });
  const isDirty = currentSnapshot !== savedSnapshot;

  function save() {
    if (!isDirty) return;
    setSavedSnapshot(currentSnapshot);
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-slate-500 mb-6">Manage your profile and preferences.</p>

      <div className="flex flex-col lg:flex-row gap-4 max-w-3xl">
        {/* Vertical tab nav */}
        <Card className="p-2 lg:w-48 shrink-0 h-fit">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible" aria-label="Settings sections">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <IconButton
                  as="button"
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={active ? 'page' : undefined}
                   className={`focus-ring flex items-center gap-2.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    active ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                <><Icon className="w-4 h-4 shrink-0" />{t.label}</>
                </IconButton>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <Card className="flex-1">
          {tab === 'profile' && (
            <div>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-hairline">
                <Avatar name={profile.name} size={14} />
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-sm text-slate-500">{profile.title}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="s-name">
                    Full name
                  </label>
                   <TextInput id="s-name" className="rounded-full" value={profile.name} onValueChange={(v) => setProfile({ ...profile, name: v })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="s-email">
                    Email
                  </label>
                  <TextInput
                    id="s-email"
                    type="email"
                    value={profile.email}
                     onValueChange={(v) => setProfile({ ...profile, email: v })}
                    className="rounded-full"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="s-title">
                    Title
                  </label>
                   <TextInput id="s-title" className="rounded-full" value={profile.title} onValueChange={(v) => setProfile({ ...profile, title: v })} />
                </div>
              </div>
            </div>
          )}

          {tab === 'payment' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="s-pm">
                  Payout method
                </label>
                 <Select id="s-pm" className="rounded-full" value={payment.method} onValueChange={(v) => setPayment({ ...payment, method: v })}>
                  <SelectItem value="Bank transfer">Bank transfer</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Wise">Wise</SelectItem>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="s-rate">
                  Default hourly rate
                </label>
                 <NumberInput id="s-rate" className="rounded-full" min={0} value={payment.rate} onValueChange={(v) => setPayment({ ...payment, rate: v })} />
                <p className="text-xs text-slate-500 mt-1.5">Used to pre-fill new project estimates.</p>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="divide-y divide-hairline">
              {(Object.keys(notifications) as (keyof typeof notifications)[]).map((key) => (
                <div key={key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{NOTIF_META[key].label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{NOTIF_META[key].desc}</p>
                  </div>
                   <Switch className="rounded-full" checked={notifications[key]} onChange={(v) => setNotifications({ ...notifications, [key]: v })} />
                </div>
              ))}
            </div>
          )}

          <IconButton
            as="button"
            onClick={save}
            disabled={!isDirty}
            className="focus-ring mt-6 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
              <>
                <Save className="mr-1.5 inline-block w-4 h-4" />
                {isDirty ? 'Save changes' : 'Saved'}
              </>
          </IconButton>
        </Card>
      </div>

      <Toast show={toast} text="Settings saved" />
    </div>
  );
}
