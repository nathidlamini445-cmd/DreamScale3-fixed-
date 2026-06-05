import { BillingScrollUnlock } from '@/components/billing/billing-scroll-unlock'

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BillingScrollUnlock />
      {children}
    </>
  )
}
