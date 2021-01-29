import pMap from 'p-map'
import { Observable } from 'rxjs'
import { AutotranslationFunction, Context } from './types'
import addPhraseToFile from './utils/addPhraseToFile'

const autotranslatePhrases = ({
  locale,
  phrases,
  autotranslate,
}: {
  locale: Context['locales'][0],
  phrases: Record<string, string>,
  autotranslate: AutotranslationFunction,
}) => new Observable((observer) => {
  const { untranslated } = locale
  let count = 0
  const update = () => observer.next(`${count}/${untranslated.length} translated`)
  update()

  const promise = async () => {
    await pMap(untranslated, async (key) => {
      const phrase = phrases[key]
      if (!phrase) throw new Error(`Cannot find phrase for key '${key}'`)
      const { text } = await autotranslate({
        text: phrase,
        targetLanguage: locale.code,
      })
      // eslint-disable-next-line no-param-reassign
      locale.untranslated = locale.untranslated.filter(i => i !== key)
      locale.translated.push(key)
      count += 1
      update()
      await addPhraseToFile(locale.file, key, text)
    }, { concurrency: 10 })
  }
  promise()
    .then(() => observer.complete())
    .catch(err => observer.error(err))
})

export default autotranslatePhrases
