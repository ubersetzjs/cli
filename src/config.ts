import loadRc from 'rc'
import { Config as ConfigType } from './interfaces'

class Config {
  private config: ConfigType

  constructor(conf: ConfigType) {
    this.config = conf
  }

  public getPatternExtensions() {
    return this.config.patterns.reduce<string[]>((memo, pattern) => [
      ...memo,
      ...pattern.extensions,
    ], [])
  }

  public getPatternRegExp(extension: string) {
    const pattern = this.config.patterns.find(p => p.extensions.includes(extension))
    if (!pattern) throw new Error(`Cannot find pattern for extension ${extension}`)
    return new RegExp(pattern.pattern.replace(/{{fn}}/g, this.config.functionName), 'g')
  }

  public getLocales() {
    return this.config.locales.map(l => ({
      ...l,
      base: l.code === this.config.baseLocale,
    }))
  }

  public getExtractionFilePath() {
    return this.config.extractionFile
  }
}

const defaultConfig: ConfigType = {
  functionName: 'u',
  baseLocale: 'en',
  extractionFile: 'locales/extracted.json',
  locales: [{
    name: 'English (US)',
    code: 'en-us',
    file: 'locales/en.locales.json',
  }],
  patterns: [{
    pattern: '{{fn}}\\s*\\(\\s*([\'"])(.*?)\\1\\s*,\\s*.*?\\s*,?\\s*([\'"])(.*?)\\3,?.*?\\)',
    extensions: ['js', 'jsx', 'ts', 'tsx'],
  }, {
    pattern: '{{fn}}\\s*\\(\\s*([\'"])(.*?)\\1\\s*,\\s*.*?\\s*,\\s*([\'"])(.*?)\\3,?.*?\\)',
    extensions: ['coffee'],
  }],
}

export default new Config(loadRc('ubersetz', defaultConfig) as ConfigType)
