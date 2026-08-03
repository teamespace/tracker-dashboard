import { useMemo, useState } from 'react';
import { Card, BarChart, DonutChart, Select, SelectItem } from '@tremor/react';
import { Calendar } from 'lucide-react';
import { EARNINGS_BY_MONTH, INVOICES, CLIENTS } from '../data';
import { fmtMoney } from '../lib/format';
import SplitBarStat from '../components/SplitBarStat';

const CLIENT_COLORS = ['emerald', 'cyan', 'lime', 'amber', 'violet', 'blue'];
const CLIENT_BARS = ['bg-emerald-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500', 'bg-violet-500', 'bg-blue-500'];

export default function Earnings() {
  const [range, setRange] = useState('12');
  const [client, setClient] = useState('');

  const ranged = useMemo(() => EARNINGS_BY_MONTH.slice(-parseInt(range, 10)), [range]);

  const totalEarned = ranged.reduce((s, m) => s + m.earnings, 0);
  const totalHours = ranged.reduce((s, m) => s + m.hours, 0);
  const avgPerMonth = ranged.length ? totalEarned / ranged.length : 0;

  const byClient = useMemo(() => {
    const totals: Record<string, number> = {};
    INVOICES.filter((i) => i.status === 'Paid' && (!client || i.client === client)).forEach((i) => {
      totals[i.client] = (totals[i.client] ?? 0) + i.amount;
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, amount]) => ({ name, amount }));
  }, [client]);
  const byClientTotal = byClient.reduce((s, c) => s + c.amount, 0) || 1;

  const paid = useMemo(() => {
    const filtered = INVOICES.filter((i) => !client || i.client === client);
    return {
      paid: filtered.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0),
      outstanding: filtered.filter((i) => i.status === 'Sent' || i.status === 'Overdue').reduce((s, i) => s + i.amount, 0),
    };
  }, [client]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Earnings</h1>
      <p className="text-sm text-slate-500 mb-6">Track income across clients and time.</p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
          <div className="w-44">
            <Select value={range} onValueChange={setRange} enableClear={false}>
              <SelectItem value="12">Last 12 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="3">Last 3 months</SelectItem>
            </Select>
          </div>
        </div>
        <div className="w-48">
          <Select value={client} onValueChange={setClient} placeholder="All clients" enableClear>
            {CLIENTS.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Quick-glance KPIs for the selected range */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total earned</p>
          <p className="text-2xl font-bold mt-1">{fmtMoney(totalEarned)}</p>
          <p className="text-xs text-slate-400 mt-1">Last {range} months</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Avg. per month</p>
          <p className="text-2xl font-bold mt-1">{fmtMoney(avgPerMonth)}</p>
          <p className="text-xs text-slate-400 mt-1">Across {ranged.length} months</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Hours logged</p>
          <p className="text-2xl font-bold mt-1">{totalHours.toLocaleString('en-US')}h</p>
          <p className="text-xs text-slate-400 mt-1">Last {range} months</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <h2 className="text-base font-semibold mb-3">Monthly earnings</h2>
          <BarChart
            className="h-56"
            data={ranged}
            index="month"
            categories={['earnings']}
            colors={['emerald']}
            valueFormatter={fmtMoney}
            showLegend={false}
          />
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Income by client</h2>
          <p className="mt-1 text-sm text-slate-500">Paid invoices, top 6 clients.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <DonutChart
              className="h-40"
              data={byClient}
              category="amount"
              index="name"
              valueFormatter={fmtMoney}
              colors={CLIENT_COLORS}
              showTooltip={false}
            />
            <ul className="space-y-2.5">
              {byClient.map((c, i) => (
                <li key={c.name} className="flex gap-3">
                  <span className={`w-1 shrink-0 rounded ${CLIENT_BARS[i % CLIENT_BARS.length]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-slate-700 truncate">{c.name}</span>
                      <span className="text-sm font-medium text-slate-800 shrink-0">{fmtMoney(c.amount)}</span>
                    </div>
                    <p className="text-xs text-slate-400">{((c.amount / byClientTotal) * 100).toFixed(0)}%</p>
                  </div>
                </li>
              ))}
              {byClient.length === 0 && <li className="text-sm text-slate-400">No paid invoices yet.</li>}
            </ul>
          </div>
        </Card>
      </div>

      <SplitBarStat
        title="Paid vs. outstanding"
        value={fmtMoney(paid.paid + paid.outstanding)}
        segments={[
          { label: 'Paid', sublabel: fmtMoney(paid.paid), amount: paid.paid, bar: 'bg-teal-400', dot: 'bg-teal-400' },
          { label: 'Outstanding', sublabel: fmtMoney(paid.outstanding), amount: paid.outstanding, bar: 'bg-violet-500', dot: 'bg-violet-500' },
        ]}
      />
    </div>
  );
}
