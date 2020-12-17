import { AutotranslationOptions, AutotranslationFunction } from './interfaces'

export default async function getAutotranslationPlugin(
  autotranslationOptions: AutotranslationOptions,
) {
  if (!autotranslationOptions.plugin) throw new Error('autotranslation plugin is undefined')
  try {
    const {
      default: plugin,
    } = (await import(`ubersetz-plugin-${autotranslationOptions.plugin}`) as { default: AutotranslationFunction })

    return plugin
  } catch (ex) {
    throw new Error(`Cannot find autotranslation plugin '${autotranslationOptions.plugin}'`)
  }
}
