// eslint-disable-next-line import/named
import type { DocumentData, Timestamp } from 'firebase/firestore'
/**
 * firebaseのtimestamp型をDate型に変換する
 * @param snapshot
 * @param targetKey
 */
export function convertDate(
  snapshot: DocumentData,
  targetKey: Array<string>,
): DocumentData {
  targetKey.forEach((key) => {
    const value: Timestamp = snapshot[key]
    if (value) {
      snapshot[key] = value.toDate()
    }
  })
  return snapshot
}
