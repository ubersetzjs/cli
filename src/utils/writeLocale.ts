import fs from 'fs-extra'

export default function writeLocale(file: string, localePhrases: Record<string, string>) {
  return fs.writeJSON(file, localePhrases, {
    spaces: 2,
  })
}
