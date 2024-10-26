/* eslint-disable @typescript-eslint/no-explicit-any */
import * as admin from 'firebase-admin'
import type { EventContext } from 'firebase-functions/v1'

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
      // eslint-disable-next-line no-console
      console.log(`EventID: ${id} has already triggered.`)
      return true
    } else {
      t.set(ref, { createTime: serverTimestamp })
      return false
    }
  })
}

export const triggerOnce =
  <T>(
    suffix: string,
    handler: (data: T, context: EventContext) => PromiseLike<any> | any,
  ): ((data: T, context: EventContext) => PromiseLike<any> | any) =>
  async (data, context) => {
    if (await hasAlreadyTriggered(context.eventId, suffix)) {
      return undefined
    }
    return handler(data, context)
  }
