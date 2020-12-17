import fs from 'fs-extra'
import canReadFile from './canReadFile'

export default async function getPhrasesFromFile(file: string): Promise<Record<string, string>> {
  if (await canReadFile(file)) {
    return (await fs.readJSON(file)) as Record<string, string>
  }
  return {}
}
