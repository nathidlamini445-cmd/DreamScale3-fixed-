/** Shared Venture Quest path / learn-shell styles — respects app light/dark preference. */
export const vq = {
  shell: 'bg-white dark:bg-[#0a0f12] text-slate-900 dark:text-white',
  surface: 'bg-white dark:bg-[#0a0f12]',
  surfaceMuted: 'bg-gray-50 dark:bg-white/[0.03]',
  border: 'border-gray-200 dark:border-white/[0.06]',
  muted: 'text-slate-500 dark:text-white/45',
  mutedFaint: 'text-slate-400 dark:text-white/35',
  body: 'text-slate-700 dark:text-white/90',
  heading: 'text-slate-900 dark:text-white',
  track: 'bg-gray-200 dark:bg-white/[0.06]',
  navInactive: 'text-slate-500 dark:text-white/45 hover:text-slate-700 dark:hover:text-white/70',
  navActive: 'bg-gray-100 font-medium text-slate-900 dark:bg-white/[0.06] dark:text-white',
  chipBtn:
    'border-gray-200 bg-gray-50 text-slate-700 hover:border-[#39d2c0]/40 hover:bg-gray-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/[0.05] dark:hover:text-white',
  accentBtn: 'bg-[#39d2c0] text-slate-900 hover:bg-[#39d2c0]/90',
  dropdown:
    'border-gray-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#0f1419] dark:text-white',
  modal:
    'border-gray-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#0f1419] dark:text-white',
  ring: 'ring-white dark:ring-[#0a0f12]',
} as const
