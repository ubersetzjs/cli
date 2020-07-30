import regexArray from './utils/regexArray'
import { ParseDefinition, Phrase } from './interfaces'

export default function extractPhrases(content: string, definition: ParseDefinition) {
  const results = regexArray(definition.pattern, content)
  return results.map<Phrase>(match => ({
    key: match[2],
    defaultValue: match[4],
  }))
}
