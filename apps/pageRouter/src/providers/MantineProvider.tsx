import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import {
  createTheme,
  MantineProvider as MantineNativeProvider,
} from '@mantine/core'
import { Notifications } from '@mantine/notifications'

const theme = createTheme({
  autoContrast: true,
  luminanceThreshold: 0.4,
})

type Props = {
  children: React.ReactNode
}

export const MantineProvider = ({ children }: Props): React.ReactNode => {
  return (
    <MantineNativeProvider theme={theme}>
      <Notifications position="top-center" />
      {children}
    </MantineNativeProvider>
  )
}
