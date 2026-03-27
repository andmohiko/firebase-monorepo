/**
 * エラーオブジェクトから文字列メッセージを抽出するユーティリティ
 * @param error - エラーオブジェクト
 * @returns エラーメッセージ文字列
 */
export const errorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '不明なエラーが発生しました'
}
