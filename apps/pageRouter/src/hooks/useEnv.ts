export const useEnv = (): {
  isProd: boolean
} => {
  const env = process.env.NEXT_PUBLIC_ENV
  const isProd = env === 'production'

  return {
    isProd,
  }
}
