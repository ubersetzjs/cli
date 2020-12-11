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
import { Context, Phrase } from './interfaces'

const start = async () => {
  const filePath = process.argv[2] || process.cwd()
  const tasks = new Listr<Context>([{
    title: 'searching files',
    task: ctx => findFiles(filePath, {
      ignoreFiles: ['.gitignore', '.ubersetzignore'],
      pattern: new RegExp(config.getPatternExtensions().map(e => `\\.${e}$`).join('|')),
    }).then((files) => {
      ctx.files = files
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
    title: 'write extractions file',
    task: async (ctx) => {
      const extractsFile = path.join(filePath, 'messages.extracted.json')
      await fs.writeJSON(extractsFile, ctx.extractedPhrases, {
        spaces: 2,
      })
    },
  }])
  await tasks.run()
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
