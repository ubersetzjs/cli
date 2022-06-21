/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Worker } from 'worker_threads'
import path from 'path'

const worker = new Worker(path.join(__dirname, 'JsonWorker.js'))
worker.setMaxListeners(1000)
let id = 0

function exec<T, R>(type: string, data: T, additional?: Record<string, any>): Promise<R> {
  id += 1
  const myId = id
  return new Promise<R>((resolve) => {
    const receivce = (event: any) => {
      if (event.id !== myId) return
      resolve(event.data)
      worker.off('message', receivce)
    }
    worker.on('message', receivce)
    worker.postMessage({
      type,
      id: myId,
      data,
      ...additional,
    })
  })
}

export function stringify(data: Record<string, any>, indent?: number) {
  return exec<Record<string, any>, string>('stringify', data, { indent })
}

export function parse(data: string) {
  return exec<string, Record<string, any>>('parse', data)
}
