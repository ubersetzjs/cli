import { EventEmitter } from 'events'

class LocaleManager extends EventEmitter {
  private locale: string | undefined

  private phraseCache: Record<string, Record<string, string>> = {}

  public getLocale() {
    return this.locale
  }

  public setLocale(locale: string): Promise<void> // eslint-disable-next-line lines-between-class-members
  public setLocale(locale: string, file: string): Promise<void> // eslint-disable-next-line lines-between-class-members
  public setLocale(locale: string, phrases: Record<string, string>): Promise<void> // eslint-disable-next-line lines-between-class-members
  public async setLocale(
    locale: string,
    fileOrMessages?: string | Record<string, string>,
  ): Promise<void> {
    if (!this.phraseCache[locale]) {
      await this.loadLocale(locale, fileOrMessages)
    }
    this.locale = locale
    this.emit('setLocale', locale)
  }

  public async loadLocale(locale: string, fileOrMessages?: string | Record<string, string>) {
    if (!fileOrMessages) {
      throw new Error(`Cannot load locale '${locale}' without filename or phrases provided`)
    }
    this.phraseCache[locale] = typeof fileOrMessages === 'string'
      ? (await import(fileOrMessages)) as Record<string, string>
      : fileOrMessages
  }

  public translate(key: string, params: Record<string, any>, defaultValue: string) {
    const locale = this.getLocale()
    if (!locale || !this.phraseCache[locale]) throw new Error('Locale not loaded')
    const phrases = this.phraseCache[locale]

    let id = key
    if (params && params.count != null && params.count !== 1) {
      id = `${key}_plural`
      if (!phrases[id]) id = key
    }

    let value = phrases[id]
    if (!value) {
      value = defaultValue || key
    }

    Object.keys(params || {}).forEach((param) => {
      value = value.replace(new RegExp(`{${param}}`, 'g'), params[param] == null ? '' : params[param])
    })
    return value
  }
}

const manager = new LocaleManager()

const ubersetz = manager.translate.bind(manager)
export default ubersetz

export const getLocale = manager.getLocale.bind(manager)
export const setLocale = manager.setLocale.bind(manager)
export const loadLocale = manager.loadLocale.bind(manager)
export const onLocaleChange = manager.on.bind(manager, 'setLocale')
