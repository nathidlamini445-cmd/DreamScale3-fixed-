import { currentUser } from '@clerk/nextjs/server'

import { getProfileSubscriptionForUser } from '@/lib/billing/get-profile-subscription'

import { getPayfastSubscribeFormConfig } from '@/lib/payfast/subscribe-form'

import { BillingPageClient } from '@/components/billing/billing-page-client'



export const metadata = {

  title: 'Plans — DreamScale',

  description: 'Compare Free and DreamScale Pro plans',

}



export default async function BillingPage() {

  const config = getPayfastSubscribeFormConfig()

  const clerkUser = await currentUser()

  const userId = clerkUser?.id ?? null

  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? undefined



  let alreadyPro = false

  if (userId) {

    const { alreadyPro: pro } = await getProfileSubscriptionForUser(userId)

    alreadyPro = pro

  }



  return (

    <BillingPageClient

      isPro={alreadyPro}

      config={config}

      userId={userId}

      userEmail={userEmail}

    />

  )

}

