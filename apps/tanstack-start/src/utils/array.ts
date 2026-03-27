/**
 * 配列の重複を削除する
 * @param array
 * @returns 重複を削除した配列
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)]
}
