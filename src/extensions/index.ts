import { ParseDefinition } from '../interfaces'
import js from './js'
import coffee from './coffee'

const extensions: {
  [key: string]: ParseDefinition,
} = {
  js,
  jsx: js,
  ts: js,
  tsx: js,
  coffee,
}

export default extensions
