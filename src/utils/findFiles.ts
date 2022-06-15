import path from 'path'
import fs from 'fs/promises'
import pFilter from 'p-filter'
import walk from 'ignore-walk'

interface Options {
  pattern?: RegExp,
  ignoreFiles?: string[],
}

export default async function findFiles(dir: string, options: Options) {
  const files = await walk({
    path: dir,
    ignoreFiles: options.ignoreFiles,
  })

  return pFilter(files, async (name) => {
    if (name.startsWith('.git/')) return false
    const stat = await fs.stat(path.join(dir, name))
    if (stat.isDirectory()) return false
    if (options.pattern) return options.pattern.test(name)
    return true
  })
}
