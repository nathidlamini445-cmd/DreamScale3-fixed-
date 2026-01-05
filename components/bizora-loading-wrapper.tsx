'use client'

import { useBizoraLoading } from '@/lib/bizora-loading-context'
import { BizoraLoadingOverlay } from './bizora-loading-overlay'

export function BizoraLoadingOverlayWrapper() {
  const { isOpeningBizora } = useBizoraLoading()
  return <BizoraLoadingOverlay isVisible={isOpeningBizora} />
}

