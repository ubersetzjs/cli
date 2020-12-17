export interface Locale {
  name: string,
  code: string,
  file: string,
  autotranslate?: boolean,
  informal?: boolean,
}

export interface Config {
  functionName: string,
  extractionFile: string,
  baseLocale: string,
  locales: Locale[],
  patterns: {
    pattern: string,
    extensions: string[],
  }[],
}

export interface Phrase {
  key: string,
  defaultValue: string,
  alreadyExists?: boolean,
  wasChanged?: boolean,
}

export interface Context {
  files: string[],
  phrases: Phrase[],
  extractedPhrases: Record<string, string>,
  deletedPhrases: string[],
  locales: (Locale & {
    phrases: Record<string, string>,
    translated: string[],
    untranslated: string[],
    autotranslated: string[],
  })[],
}

export interface ParseDefinition {
  pattern: RegExp,
}
