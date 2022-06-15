import fs from 'fs/promises'
import canReadFile from './canReadFile'

export default async function getPhrasesFromFile(file: string): Promise<Record<string, string>> {
  if (await canReadFile(file)) {
    const content = await fs.readFile(file, 'utf8')
    const parsed = JSON.parse(content) as Record<string, string>
    return parsed
  }
  return {}
}
