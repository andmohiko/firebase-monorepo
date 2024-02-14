import { LoadingProvider } from '~/providers/LoadingProvider'
import { MantineProvider } from '~/providers/MantineProvider'

type Props = {
  children: React.ReactNode
}

export const Providers = ({ children }: Props): React.ReactNode => {
  return (
    <MantineProvider>
      <LoadingProvider>{children}</LoadingProvider>
    </MantineProvider>
  )
}
