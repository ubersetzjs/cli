import { parentPort } from 'worker_threads'

if (!parentPort) throw new Error('No parent port')
const port = parentPort

interface ParseOptions {
  id: number,
  type: 'parse',
  data: string,
}
interface StringifyOptions {
  id: number,
  type: 'stringify',
  data: Record<string, any>,
  indent?: number,
}
type Options = ParseOptions | StringifyOptions

port.on('message', (options: Options) => {
  switch (options.type) {
    case 'parse': {
      port.postMessage({
        id: options.id,
        data: JSON.parse(options.data) as Record<string, any>,
      })
      break
    }
    case 'stringify': {
      port.postMessage({
        id: options.id,
        data: JSON.stringify(options.data, null, options.indent),
      })
      break
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
    default: throw new Error(`Unknown data type: ${(options as any).type}`)
  }
})
