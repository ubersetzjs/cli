import fs from 'fs/promises'
import PQueue from 'p-queue'
import sortObject from './sortObject'

const queues: Record<string, PQueue> = {}

export default function writeLocale(file: string, localePhrases: Record<string, string>) {
  queues[file] = queues[file] || new PQueue({ concurrency: 1 })
  return queues[file].add(() =>
    fs.writeFile(file, JSON.stringify(sortObject(localePhrases), null, 2)))
}
