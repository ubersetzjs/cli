import Module from 'module'
import path from 'path'
import { AutotranslationOptions, AutotranslationFunction } from './types'

const importModule = (pkg: string) => {
  const relativeToPath = path.join(process.cwd(), '__placeholder__.js')
  const module = Module.createRequire(relativeToPath).resolve(pkg)
  return import(module)
}

export default async function getAutotranslationPlugin(
  autotranslationOptions: AutotranslationOptions,
) {
  if (!autotranslationOptions.plugin) throw new Error('autotranslation plugin is undefined')
  try {
    const {
      default: plugin,
    } = (await importModule(`ubersetz-plugin-${autotranslationOptions.plugin}`) as { default: AutotranslationFunction })

    return plugin
  } catch (ex) {
    throw new Error(`Cannot find autotranslation plugin '${autotranslationOptions.plugin}'`)
  }
}
