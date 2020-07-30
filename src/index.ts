#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Listr from 'listr'
import fs from 'fs-extra'
import findFiles from './utils/findFiles'
import extensions from './extensions'

const start = async () => {
  const path = process.argv[2] || __dirname
  const tasks = new Listr([{
    title: 'searching files',
    task: ctx => findFiles(path, {
      ignoreFiles: ['.gitignore', '.ubersetzignore'],
      pattern: new RegExp(Object.keys(extensions).map(e => `\\.${e}$`).join('|')),
    }).then((files) => {
      console.log(files)
      ctx.files = files
    }),
  }])
  await tasks.run()
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
