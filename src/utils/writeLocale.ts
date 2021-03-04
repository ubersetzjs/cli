import fs from 'fs-extra'
import PQueue from 'p-queue'

const queue = new PQueue({ concurrency: 1 })

export default function writeLocale(file: string, localePhrases: Record<string, string>) {
  return queue.add(() => fs.writeJSON(file, localePhrases, {
    spaces: 2,
  }))
}
