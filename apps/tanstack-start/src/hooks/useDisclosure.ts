import { useCallback, useState } from 'react'

type UseDisclosureReturn = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useDisclosure = (initialState = false): UseDisclosureReturn => {
  const [isOpen, setIsOpen] = useState(initialState)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])
  return { isOpen, open, close, toggle }
}
