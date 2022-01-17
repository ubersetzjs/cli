// eslint-disable-next-line max-len
const pluralRegex = /(.*){\s*(.*)\s*,\s*plural\s*,\s*one\s*{\s*(.*)\s*}\s*other\s*{\s*(.*)\s*}\s*}(.*)/igm

interface ReturnValue { singular: string, plural: string }
function extractFromText(text: string): ReturnValue {
  const result = new RegExp(pluralRegex).exec(text)
  if (!result) return { singular: text, plural: '' }

  const plural = result[4].replace('#', `{${result[2]}}`)
  const singular = result[3].replace('#', `{${result[2]}}`)

  return {
    singular: result[1] + singular + result[5],
    plural: result[1] + plural + result[5],
  }
}

function extractSingle(values: ReturnValue): ReturnValue {
  if (!new RegExp(pluralRegex).test(values.singular)) return values
  const { singular, plural } = !values.plural ? extractFromText(values.singular) : values

  const extractedPlural = extractFromText(plural)
  return extractSingle({
    singular: extractFromText(singular).singular,
    plural: extractedPlural.plural || extractedPlural.singular,
  })
}

export default function extractPlural(key: string, content: string): Record<string, string> {
  const { singular, plural } = extractSingle({ singular: content, plural: '' })
  if (key === 'settings_plots_new_mergable_plots_description') console.log({key, singular, plural})
  return {
    [key]: singular,
    ...plural ? { [`${key}_plural`]: plural } : {},
  }
}
