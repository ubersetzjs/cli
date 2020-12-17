import regexArray from './utils/regexArray'
import { Phrase } from './types'

export default function extractPhrases(content: string, pattern: RegExp) {
  const results = regexArray(pattern, content)
  return results.map<Phrase>(match => ({
    key: match[2],
    defaultValue: match[4],
  }))
}
