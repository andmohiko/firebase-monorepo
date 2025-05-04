import type { AppProps } from 'next/app'

import { PageHead } from '~/components/Base/PageHead'
import { Providers } from '~/providers'
import '~/styles/globals.css'
import '~/styles/reset.css'
import '~/styles/variables.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <PageHead />
      <Component {...pageProps} />
    </Providers>
  )
}

export default MyApp
