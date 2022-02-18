import fs from 'fs-extra'
import PQueue from 'p-queue'
import sortObject from './sortObject'

const queue = new PQueue({ concurrency: 1 })

export default function writeLocale(file: string, localePhrases: Record<string, string>) {
  return queue.add(() => fs.writeJSON(file, sortObject(localePhrases), {
    spaces: 2,
  }))
}
