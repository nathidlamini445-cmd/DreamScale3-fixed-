'use client'

import type { PayfastSubscribeFormConfig } from '@/lib/payfast/subscribe-form'
import { formatProChargeSummary } from '@/lib/billing/pro-price'

const SUBSCRIBE_BUTTON_SRC =
  'https://my.payfast.io/images/buttons/Subscribe/Light-Large-Subscribe.png'

type Props = {
  config: PayfastSubscribeFormConfig
  userId?: string | null
  userEmail?: string | null
}

function paymentReferenceForUser(userId: string): string {
  const slug = userId.replace(/^user_/, '').slice(0, 12)
  return `DS-${slug}-${Date.now()}`
}

function isLocalBillingHost(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1'
}

export function PayFastSubscribeForm({ config, userId, userEmail }: Props) {
  const mPaymentId = userId ? paymentReferenceForUser(userId) : `DS-guest-${Date.now()}`
  const blockLiveCheckout =
    process.env.NODE_ENV === 'development' && isLocalBillingHost()

  return (
    <div className="space-y-4">
      {!userId && (
        <p className="text-sm text-muted-foreground">
          Sign in before subscribing so we can link your payment to your DreamScale account.
        </p>
      )}

      {blockLiveCheckout && (
        <p className="text-xs text-amber-700 dark:text-amber-300 text-center max-w-sm mx-auto">
          Live PayFast checkout is disabled on localhost (403 from PayFast). Use{' '}
          <strong>Activate Pro locally</strong> above, or test on a public HTTPS URL.
        </p>
      )}

      <form
        name="PayFastPayNowForm"
        action={config.action}
        method="post"
        className="inline-block"
        onSubmit={(e) => {
          if (blockLiveCheckout) {
            e.preventDefault()
            window.alert(
              'PayFast cannot process payments when return/notify URLs are localhost (403 Forbidden). Use "Activate Pro locally" on this page for dev testing.'
            )
          }
        }}
      >
        <input type="hidden" name="cmd" value="_paynow" required readOnly />
        <input type="hidden" name="receiver" value={config.receiver} required readOnly />
        <input type="hidden" name="return_url" value={config.returnUrl} readOnly />
        <input type="hidden" name="cancel_url" value={config.cancelUrl} readOnly />
        <input type="hidden" name="notify_url" value={config.notifyUrl} readOnly />
        <input type="hidden" name="amount" value={config.amount} required readOnly />
        <input
          type="hidden"
          name="item_name"
          value={config.itemName}
          maxLength={255}
          required
          readOnly
        />
        <input
          type="hidden"
          name="item_description"
          value={config.itemDescription}
          maxLength={255}
          readOnly
        />
        <input
          type="hidden"
          name="subscription_type"
          value={config.subscriptionType}
          required
          readOnly
        />
        <input type="hidden" name="recurring_amount" value={config.recurringAmount} readOnly />
        <input type="hidden" name="cycles" value={config.cycles} required readOnly />
        <input type="hidden" name="frequency" value={config.frequency} required readOnly />
        <input type="hidden" name="m_payment_id" value={mPaymentId} readOnly />
        {userId && (
          <>
            {userEmail && (
              <input type="hidden" name="email_address" value={userEmail} readOnly />
            )}
            <input type="hidden" name="custom_str1" value={userId} readOnly />
            <input type="hidden" name="custom_str2" value={userEmail ?? ''} readOnly />
          </>
        )}
        <button type="submit" className="inline-block border-0 bg-transparent p-0 cursor-pointer">
          <img
            src={SUBSCRIBE_BUTTON_SRC}
            alt="Subscribe with PayFast"
            title="Subscribe with PayFast"
            width={200}
            height={50}
          />
        </button>
      </form>

      <p className="text-xs text-muted-foreground text-center max-w-xs mx-auto">
        {formatProChargeSummary(config.recurringAmount)}. Managed by PayFast.
      </p>
    </div>
  )
}
