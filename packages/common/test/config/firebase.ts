import type {
  RulesTestEnvironment,
  TokenOptions,
} from '@firebase/rules-unit-testing'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { serverTimestamp as getServertimestamp } from 'firebase/firestore'

import { projectId, rules } from './setup'

export const getTestEnv = async (): Promise<RulesTestEnvironment> => {
  return await initializeTestEnvironment({
    projectId,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080,
    },
    database: {
      host: '127.0.0.1',
      port: 8080,
    },
    hub: {
      host: '127.0.0.1',
      port: 4400,
    },
  })
}

export const authedApp = async (auth?: string, tokenOptions?: TokenOptions) => {
  const testEnv = await getTestEnv()
  if (!auth) {
    const unauthenticatedContext = testEnv.unauthenticatedContext()
    return unauthenticatedContext.firestore()
  }
  const authenticatedContext = testEnv.authenticatedContext(auth, tokenOptions)
  return authenticatedContext.firestore()
}

export const clientTimestampFromDate = () => {
  return getServertimestamp()
}

export const adminTimestampFromDate = () => {
  return getServertimestamp()
}
