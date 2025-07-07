import type { ReactElement, ReactNode } from 'react'

import styles from './style.module.css'

import { LoadingOverlay } from '~/components/Base/Loading'
import { useLoadingContext } from '~/providers/LoadingProvider'

type Props = {
  children?: ReactNode
}

export const SimpleLayout = ({ children }: Props): ReactElement => {
  const { isLoading } = useLoadingContext()

  return (
    <div className={styles.base}>
      <div className={styles.pageLayout}>
        {isLoading && <LoadingOverlay />}
        {children}
      </div>
    </div>
  )
}
