import type { NextPage } from 'next'

import { SimpleLayout } from '~/components/Layouts/SimpleLayout'

const IndexPage: NextPage = () => {
  return (
    <SimpleLayout>
      <h1>テンプレート</h1>
      <p>だんらく</p>
      <span>すぱん</span>
      <span>すぱーん</span>
    </SimpleLayout>
  )
}

export default IndexPage
