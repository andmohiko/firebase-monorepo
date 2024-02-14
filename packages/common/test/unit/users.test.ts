import { test, describe, beforeAll, beforeEach, afterEach } from 'vitest'
import * as firebase from '@firebase/rules-unit-testing'
import { doc, getDoc } from 'firebase/firestore'

import { getTestEnv, authedApp } from '../config/firebase'

const userCollection = 'users'
let testEnv: firebase.RulesTestEnvironment

describe('firestore rules users collection unittest', () => {
  beforeAll(async () => {
    testEnv = await getTestEnv()
  })

  beforeEach(async () => {
    await testEnv.clearFirestore()
  })

  afterEach(async () => {
    await testEnv.clearFirestore()
  })

  describe('users collectionのテスト', () => {
    describe('read', () => {
      test('認証済みのユーザはユーザ情報を閲覧できる', async () => {
        const userId = 'user1'
        const user = doc(
          await authedApp(userId, {
            role: 1,
          }),
          userCollection,
          userId,
        )

        await firebase.assertSucceeds(getDoc(user))
      })
    })
  })
})
