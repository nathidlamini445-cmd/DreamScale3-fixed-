import { GuestAppShell } from '@/components/guest/guest-app-shell'

export default function GuestShellLayout({ children }: { children: React.ReactNode }) {
  return <GuestAppShell>{children}</GuestAppShell>
}
