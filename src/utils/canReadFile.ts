import fs from 'fs/promises'
import { constants } from 'fs'

export default function canReadFile(file: string) {
  return fs.access(file, constants.R_OK).then(() => true).catch(() => false)
}
