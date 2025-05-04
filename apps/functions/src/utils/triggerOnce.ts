import * as admin from 'firebase-admin'
import type { FirestoreEvent } from 'firebase-functions/v2/firestore'

import { db, serverTimestamp } from '~/lib/firebase'

const hasAlreadyTriggered = (
  eventId: string,
  suffix: string,
): Promise<boolean> => {
  const id = [eventId, suffix].join('-')
  return db.runTransaction(async (t) => {
    const ref = admin.firestore().collection('triggerEvents').doc(id)
    const doc = await t.get(ref)
    if (doc.exists) {
      return true
    }
    t.set(ref, { createTime: serverTimestamp })
    return false
  })
}

export const triggerOnce =
  <T, P extends Record<string, string>>(
    suffix: string,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    handler: (event: FirestoreEvent<T, P>) => PromiseLike<any> | any,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  ): ((event: FirestoreEvent<T, P>) => PromiseLike<any> | any) =>
  async (event) => {
    if (await hasAlreadyTriggered(event.id, suffix)) {
      return undefined
    }
    return handler(event)
  }
