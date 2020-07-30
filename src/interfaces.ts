export interface Context {
  files: string[],
  phrases: Phrase[],
}

export interface Phrase {
  key: string,
  defaultValue: string,
}

export interface ParseDefinition {
  pattern: RegExp,
}
