import { useState } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { motion } from 'motion/react';
import { ACTIVITY } from '../data';
import { NotifBellIcon } from './motion/interactions';

// Informational list, not a set of commands — Popover (not Menu) is the correct
// Headless UI primitive here; see Invoices.tsx's Sort by/Filter for the same pattern.
export default function NotificationsMenu() {
  const [isHovered, setIsHovered] = useState(false);
  const hasUnread = ACTIVITY.length > 0;

  return (
    <Popover className="relative">
      <PopoverButton
        as={motion.button}
        aria-label="Notifications"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="focus-ring relative flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <NotifBellIcon hasUnread={hasUnread} isHovered={isHovered} />
      </PopoverButton>
      <PopoverPanel
        anchor="bottom end"
        className="z-30 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-hairline bg-white shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
          <p className="text-sm font-semibold">Notifications</p>
          <span className="text-xs text-slate-400">{ACTIVITY.length} recent</span>
        </div>
        {ACTIVITY.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-400 text-center">You're all caught up.</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {ACTIVITY.map((item) => (
              <li key={item.id} className="px-4 py-3 text-sm hover:bg-slate-50 transition-colors">
                <p className="text-slate-700">{item.text}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.when}</p>
              </li>
            ))}
          </ul>
        )}
      </PopoverPanel>
    </Popover>
  );
}
