export interface Locale {
  name: string,
  code: string,
  file: string,
  autotranslate?: boolean,
  informal?: boolean,
}

export interface AutotranslationOptions {
  plugin?: string,
  concurrency?: number,
}

export type BaseAutotranslationFunction = (options: {
  text: string,
  sourceLanguage?: string,
  targetLanguage: string,
  informal?: boolean,
}) => Promise<{ text: string }>

export interface AutotranslationFunction extends BaseAutotranslationFunction {
  kill?: () => void,
}

export interface Config {
  functionName: string,
  extractionFile: string,
  baseLocale: string,
  locales: Locale[],
  autotranslate?: AutotranslationOptions | string,
  patterns: {
    pattern: string,
    extensions: string[],
  }[],
}

export interface Phrase {
  key: string,
  defaultValue: string,
}

export interface Context {
  files: string[],
  phrases: Phrase[],
  extractedPhrases: Record<string, string>,
  deletedPhrases: string[],
  newPhrases: string[],
  changedPhrases: string[],
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
