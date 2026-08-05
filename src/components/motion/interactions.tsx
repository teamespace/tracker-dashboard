// Real Amicro (amicro.vercel.app) interaction source, pulled directly from their site's
// own "copy code" button on the Settings / Search / Subscribe cards — their advertised
// `npx @subhanhq/amicro@latest add <name>` CLI has no `bin` entry in the published npm
// package (verified by unpacking @subhanhq/amicro@1.0.1: it ships only `dist/index.html`,
// the site's own build, no CLI script), so it can't actually run. Instead we captured the
// exact JSX each "Copy" button puts on your clipboard by hooking navigator.clipboard in
// the live page, then ported it here 1:1 — only the import path (`framer-motion` ->
// `motion/react`, since that's what's installed) and container classNames (their dark
// showcase chrome -> our light card theme) were adapted. The animation logic/values are
// untouched.
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Bell, BellRing } from 'lucide-react';
import { useState } from 'react';

// Note: the Amicro "Settings" rotate-on-hover pattern (spring stiffness 400, damping 25,
// nested motion.div rotate 0->180) is applied directly on the sidebar nav icons in
// Sidebar.tsx rather than duplicated here as a standalone component.

// --- Amicro "Subscribe" block — Ring Interaction (repurposed for the notif bell) --------
// Icon-only version (no button wrapper) so it can be dropped inside a Headless UI
// PopoverButton/MenuButton — see NotificationsMenu.tsx, which drives `isHovered` itself
// since the hover target is the surrounding button, not this element.
export function NotifBellIcon({ hasUnread, isHovered }: { hasUnread: boolean; isHovered: boolean }) {
  return (
    <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
      <AnimatePresence mode="popLayout" initial={false}>
        {!isHovered ? (
          <motion.div
            key="bell"
            initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 15, scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 25 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Bell className="w-5 h-5" aria-hidden />
          </motion.div>
        ) : (
          <motion.div
            key="bell-ring"
            initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 15, scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 25 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <BellRing className="w-5 h-5 text-emerald-600" aria-hidden />
          </motion.div>
        )}
      </AnimatePresence>
      {hasUnread && !isHovered && <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-red-600" />}
    </div>
  );
}

// Original self-contained button (own hover state + click-less). Kept for compatibility;
// the live navbar now uses NotificationsMenu, which wraps NotifBellIcon in a real popover.
export function NotifBell({ hasUnread }: { hasUnread: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.button
      type="button"
      aria-label="Notifications"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className="focus-ring relative flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors"
    >
      <NotifBellIcon hasUnread={hasUnread} isHovered={isHovered} />
    </motion.button>
  );
}

// --- Amicro "Search" block — Morph Interaction (search <-> clear icon swap) -------------
export function SearchMorphInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="popLayout" initial={false}>
          {!isHovered || !value ? (
            <motion.div
              key="search-icon"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center text-slate-400"
            >
              <Search className="w-4 h-4" aria-hidden />
            </motion.div>
          ) : (
            <motion.button
              key="clear-icon"
              type="button"
              onClick={() => onChange('')}
              className="absolute inset-0 flex items-center justify-center text-emerald-600 pointer-events-auto"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 25 }}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" aria-hidden />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
         className="focus-ring w-full pl-9 pr-3 py-2 text-sm rounded-full border border-hairline bg-slate-50 focus:bg-white transition-colors"
      />
    </div>
  );
}
