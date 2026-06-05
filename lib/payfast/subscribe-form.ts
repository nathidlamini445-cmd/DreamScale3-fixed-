import {
  getPayfastBillingUrls,
  getPayfastProcessUrl,
  getPayfastReceiver,
  getPayfastSubscriptionFields,
} from '@/lib/payfast/config'

export type PayfastSubscribeFormConfig = {
  action: string
  receiver: string
  returnUrl: string
  cancelUrl: string
  notifyUrl: string
  amount: string
  itemName: string
  itemDescription: string
  subscriptionType: string
  recurringAmount: string
  cycles: string
  frequency: string
}

export function getPayfastSubscribeFormConfig(): PayfastSubscribeFormConfig | null {
  const receiver = getPayfastReceiver()
  if (!receiver) return null

  const urls = getPayfastBillingUrls()
  const sub = getPayfastSubscriptionFields()

  return {
    action: getPayfastProcessUrl(),
    receiver,
    returnUrl: urls.returnUrl,
    cancelUrl: urls.cancelUrl,
    notifyUrl: urls.notifyUrl,
    amount: sub.amount,
    itemName: sub.itemName,
    itemDescription: sub.itemDescription,
    subscriptionType: sub.subscriptionType,
    recurringAmount: sub.recurringAmount,
    cycles: sub.cycles,
    frequency: sub.frequency,
  }
}
