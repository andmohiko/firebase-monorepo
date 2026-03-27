import type { DocumentData } from 'firebase/firestore'

/**
 * FirestoreのTimestamp型をDate型に変換するユーティリティ
 * @param snapshot - Firestoreから取得したデータ
 * @param targetKey - 変換対象のカラム名配列
 * @returns 変換後のデータ
 */
export function convertDate(
  snapshot: DocumentData,
  targetKey: Array<string>,
): DocumentData {
  for (const key of targetKey) {
    const value = snapshot[key]
    if (value) {
      // すでにDate型の場合はそのまま
      if (value instanceof Date) {
        snapshot[key] = value
      }
      // toDateメソッドを持つオブジェクト（Timestamp型）の場合は変換
      else if (
        typeof value === 'object' &&
        'toDate' in value &&
        typeof value.toDate === 'function'
      ) {
        snapshot[key] = value.toDate()
      }
    }
  }
  return snapshot
}
