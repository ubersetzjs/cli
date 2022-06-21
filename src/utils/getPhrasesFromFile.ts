import fs from 'fs/promises'
import { parse } from './json'
import canReadFile from './canReadFile'

export default async function getPhrasesFromFile(file: string): Promise<Record<string, string>> {
  if (await canReadFile(file)) {
    const content = await fs.readFile(file, 'utf8')
    const parsed = await parse(content) as Record<string, string>
    return parsed
  }
  return {}
}
