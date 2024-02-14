import fs from 'fs'

export const projectId = 'firestore-local-emulator-test'
export const rules = fs.readFileSync('../../firestore.rules', 'utf8')
