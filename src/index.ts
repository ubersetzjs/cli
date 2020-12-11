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
  }, ...config.getPatternExtensions().map<ListrTask<Context>>(ext => ({
    title: `extracting phrases from ${ext} files`,
    task: async (ctx) => {
      const phrases: Phrase[] = []
      await pMap(ctx.files, async (name) => {
        if (!new RegExp(`\\.${ext}$`).test(name)) return
        const fileContent = await fs.readFile(path.join(filePath, name), 'utf8')
        extractPhrase(fileContent, config.getPatternRegExp(ext))
          .forEach(phrase => phrases.push(phrase))
      })
      ctx.phrases = [...ctx.phrases || [], ...phrases]
    },
  })), {
    title: 'write extractions file',
    task: async (ctx) => {
      const extractsFile = path.join(filePath, 'messages.extracted.json')
      const sortedPhrases = sortBy(ctx.phrases, p => p.key.toLowerCase())
      await fs.writeJSON(extractsFile, sortedPhrases.reduce((memo, phrase) => ({
        ...memo,
        [phrase.key]: phrase.defaultValue,
      }), {}), {
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
