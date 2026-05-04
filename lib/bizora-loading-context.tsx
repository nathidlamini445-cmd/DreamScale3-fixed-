'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface BizoraLoadingContextType {
  isOpeningBizora: boolean
  setOpeningBizora: (value: boolean) => void
}

const BizoraLoadingContext = createContext<BizoraLoadingContextType | undefined>(undefined)

export function BizoraLoadingProvider({ children }: { children: ReactNode }) {
  const [isOpeningBizora, setIsOpeningBizora] = useState(false)

  return (
    <BizoraLoadingContext.Provider
      value={{
        isOpeningBizora,
        setOpeningBizora: setIsOpeningBizora,
      }}
    >
      {children}
    </BizoraLoadingContext.Provider>
  )
}

export function useBizoraLoading() {
  const context = useContext(BizoraLoadingContext)
  if (context === undefined) {
    throw new Error('useBizoraLoading must be used within a BizoraLoadingProvider')
  }
  return context
}

