import fs from 'fs-extra'

export default function canReadFile(file: string) {
  return fs.access(file, fs.constants.R_OK).then(() => true).catch(() => false)
}
