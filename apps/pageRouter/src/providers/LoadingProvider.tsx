import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'

const LoadingContext = createContext<{
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
})

const LoadingProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [isLoading, setLoading] = useState<boolean>(false)

  const startLoading = () => setLoading(true)

  const stopLoading = () => setLoading(false)

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export { LoadingContext, LoadingProvider }

export const useLoadingContext = () => useContext(LoadingContext)
