import type * as admin from 'firebase-admin'

// TimestampをDateに変換
export function convertDate(
  snapshot: admin.firestore.DocumentData,
  targetKey: Array<string>,
): admin.firestore.DocumentData {
  for (const key of targetKey) {
    const value: admin.firestore.Timestamp = snapshot[key]
    if (value) {
      snapshot[key] = value.toDate()
    }
  }
  return snapshot
}
