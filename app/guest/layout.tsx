import { GuestWorkspaceProvider } from '@/lib/workspace/guest-context'

export default function GuestRootLayout({ children }: { children: React.ReactNode }) {
  return <GuestWorkspaceProvider>{children}</GuestWorkspaceProvider>
}
