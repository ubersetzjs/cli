#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import path from 'path'
import Listr, { ListrTask } from 'listr'
import fs from 'fs-extra'
import pMap from 'p-map'
import sortBy from 'lodash.sortby'
import findFiles from './utils/findFiles'
import config from './config'
import extractPhrase from './extractPhrase'
import { Context, Phrase } from './types'
import canReadFile from './utils/canReadFile'
import getPhrasesFromFile from './utils/getPhrasesFromFile'
import getCountryFlag from './utils/getCountryFlag'
import getAutotranslationPlugin from './getAutotranslationPlugin'
import autotranslatePhrases from './autotranslatePhrases'
import writeLocale from './utils/writeLocale'

const start = async () => {
  const filePath = process.argv[2] || process.cwd()
  const tasks = new Listr<Context>([{
    title: 'searching files',
    task: ctx => findFiles(filePath, {
      ignoreFiles: ['.gitignore', '.ubersetzignore'],
      pattern: new RegExp(config.getPatternExtensions().map(e => `\\.${e}$`).join('|')),
    }).then((files) => {
      ctx.files = files
      ctx.phrases = []
      ctx.extractedPhrases = {}
      ctx.deletedPhrases = []
      ctx.newPhrases = []
      ctx.changedPhrases = []
    }),
  }, {
    title: 'extracting phrases from files',
    task: ctx => new Listr(config.getPatternExtensions().map<ListrTask<Context>>(ext => ({
      title: ext,
      task: async () => {
        const phrases: Phrase[] = []
        await pMap(ctx.files, async (name) => {
          if (!new RegExp(`\\.${ext}$`).test(name)) return
          const fileContent = await fs.readFile(path.join(filePath, name), 'utf8')
          extractPhrase(fileContent, config.getPatternRegExp(ext))
            .forEach(phrase => phrases.push(phrase))
        })
        ctx.phrases = sortBy([...ctx.phrases || [], ...phrases], p => p.key.toLowerCase())
      },
    })), { concurrent: true }),
  }, {
    title: 'check phrases',
    skip: ctx => ctx.phrases.length <= 0,
    task: (ctx) => {
      ctx.extractedPhrases = ctx.phrases.reduce<Record<string, string>>((memo, phrase) => {
        if (memo[phrase.key] != null && memo[phrase.key] !== phrase.defaultValue) {
          throw new Error(`duplicate key '${phrase.key}', current: '${memo[phrase.key]}', new: '${phrase.defaultValue}'`)
        }

        return {
          ...memo,
          [phrase.key]: phrase.defaultValue,
        }
      }, {})
    },
  }, {
    title: 'apply plurals',
    skip: ctx => Object.keys(ctx.extractedPhrases).length <= 0,
    task: (ctx) => {
      ctx.extractedPhrases = Object.keys(ctx.extractedPhrases)
        .reduce<Record<string, string>>((memo, key) => {
          // eslint-disable-next-line max-len
          const result = /(.*){\s*(.*)\s*,\s*plural\s*,\s*one\s*{\s*(.*)\s*}\s*other\s*{\s*(.*)\s*}\s*}(.*)/igm.exec(ctx.extractedPhrases[key])
          if (result) {
            const plural = result[4].replace('#', `{${result[2]}}`)
            const singular = result[3].replace('#', `{${result[2]}}`)
            return {
              ...memo,
              [key]: result[1] + singular + result[5],
              [`${key}_plural`]: result[1] + plural + result[5],
            }
          }
          return {
            ...memo,
            [key]: ctx.extractedPhrases[key],
          }
        }, {})
    },
  }, {
    title: 'write extractions file',
    task: async (ctx) => {
      const extractsFile = path.join(filePath, config.getExtractionFilePath())
      if (await canReadFile(extractsFile)) {
        const currentPhrases = await getPhrasesFromFile(extractsFile)
        ctx.deletedPhrases = Object.keys(currentPhrases).filter(key =>
          ctx.extractedPhrases[key] == null)
        ctx.newPhrases = Object.keys(ctx.extractedPhrases).filter(key =>
          currentPhrases[key] == null)
        ctx.changedPhrases = Object.keys(ctx.extractedPhrases).filter(key =>
          currentPhrases[key] !== ctx.extractedPhrases[key])
      }
      await fs.writeJSON(extractsFile, ctx.extractedPhrases, {
        spaces: 2,
      })
    },
  }, {
    title: 'deleting old phrases',
    skip: () => config.getLocales().length <= 0,
    task: async (ctx) => {
      await pMap(config.getLocales(), async (locale) => {
        const phrases = await getPhrasesFromFile(locale.file)
        await writeLocale(locale.file, Object.keys(ctx.extractedPhrases).reduce((memo, key) => {
          if (!phrases[key]) return memo
          return {
            ...memo,
            [key]: phrases[key],
          }
        }, {}))
      })
    },
  }, {
    title: 'copying new phrases to base locale',
    skip: ctx => !config.getLocales().find(i => i.base) || ctx.newPhrases.length <= 0,
    task: async (ctx) => {
      const baseLocale = config.getLocales().find(i => i.base)
      if (!baseLocale) return
      const phrases = await getPhrasesFromFile(baseLocale.file)
      await writeLocale(baseLocale.file, Object.keys(ctx.extractedPhrases).reduce((memo, key) => ({
        ...memo,
        [key]: phrases[key] || ctx.extractedPhrases[key],
      }), {}))
    },
  }, {
    title: 'checking existing phrases',
    skip: () => config.getLocales().length <= 0,
    task: async (ctx) => {
      ctx.locales = await pMap(config.getLocales(), async (locale) => {
        const phrases = await getPhrasesFromFile(locale.file)
        const translated: string[] = []
        const untranslated: string[] = []
        Object.keys(ctx.extractedPhrases).forEach((key) => {
          if (Object.keys(phrases).includes(key)) {
            translated.push(key)
          } else {
            untranslated.push(key)
          }
        })
        return { ...locale, phrases, translated, untranslated, autotranslated: [] }
      })
    },
  }, {
    title: 'automatically translate new phrases',
    skip: (ctx) => {
      const autotranslationOptions = config.getAutotranslationOptions()
      if (!autotranslationOptions.plugin) return true
      return !ctx.locales.find(l => l.autotranslate && l.untranslated.length > 0)
    },
    task: async (ctx) => {
      const autotranslationOptions = config.getAutotranslationOptions()
      const autotranslateLocales = ctx.locales.filter(l => l.autotranslate)
      const autotranslate = await getAutotranslationPlugin(autotranslationOptions)

      return new Listr([{
        title: 'autotranslating',
        task: () => new Listr(autotranslateLocales.map(locale => ({
          title: `${getCountryFlag(locale.code)}   ${locale.name}`,
          task: () => autotranslatePhrases({
            locale,
            phrases: ctx.extractedPhrases,
            autotranslate,
          }),
        })), { concurrent: true }),
      }, {
        title: 'cleaning up',
        task: () => {
          if (autotranslate.kill) {
            return autotranslate.kill()
          }
          return undefined
        },
      }])
    },
  }])
  const result = await tasks.run()
  const { newPhrases, changedPhrases } = result
  console.log()
  console.log(`🆕  ${newPhrases.length} new phrases`)
  console.log(`✏️   ${changedPhrases.length} changed phrases`)
  console.log(`❌  ${result.deletedPhrases.length} deleted phrases`)
  result.locales.forEach((locale) => {
    console.log()
    console.log(`${getCountryFlag(locale.code)}   ${locale.name}`)
    if (locale.untranslated.length > 0) console.log(`\t🏳️   ${locale.untranslated.length} untranslated`)
    if (locale.autotranslated.length > 0) console.log(`\t🤖   ${locale.autotranslated.length} automatically translated`)
    if (locale.translated.length > 0) console.log(`\t🏴   ${locale.translated.length} already translated`)
  })
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
