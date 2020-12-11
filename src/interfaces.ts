export interface Phrase {
  key: string,
  defaultValue: string,
}

export interface Context {
  files: string[],
  phrases: Phrase[],
  extractedPhrases: Record<string, string>,
}

export interface ParseDefinition {
  pattern: RegExp,
}
