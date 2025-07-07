export const range = (start: number, end: number): Array<number> => {
  const arr: Array<number> = []
  for (let i = start; i < end; i++) {
    arr.push(i)
  }
  return arr
}
