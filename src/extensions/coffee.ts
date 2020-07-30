import { ParseDefinition } from '../interfaces'

export default {
  pattern: /mf\s*\(\s*(['"])(.*?)\1\s*,\s*.*?\s*,\s*(['"])(.*?)\3,?.*?\)/g,
} as ParseDefinition
