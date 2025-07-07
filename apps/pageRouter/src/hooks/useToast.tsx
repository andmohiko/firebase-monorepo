import { showNotification } from '@mantine/notifications'
import { useCallback } from 'react'
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { BiErrorCircle } from 'react-icons/bi'

export const useToast = () => {
  const showSuccessToast = useCallback((title: string, message?: string) => {
    if (typeof window === 'undefined') {
      return
    }
    showNotification({
      title,
      message: message ?? '',
      icon: <AiOutlineCheckCircle />,
      withCloseButton: true,
      autoClose: 4000,
      color: 'green',
    })
  }, [])

  const showErrorToast = useCallback((title: string, message?: string) => {
    if (typeof window === 'undefined') {
      return
    }
    showNotification({
      title,
      message: message ?? '',
      icon: <BiErrorCircle />,
      withCloseButton: true,
      autoClose: 8000,
      color: 'red',
    })
  }, [])

  return {
    showSuccessToast,
    showErrorToast,
  }
}
