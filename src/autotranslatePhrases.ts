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
  let count = 0
  const update = () => observer.next(`${count}/${locale.untranslated.length} translated`)
  update()

  const promise = async () => {
    await pMap(locale.untranslated, async (key) => {
      const phrase = phrases[key]
      if (!phrase) throw new Error(`Cannot find phrase for key '${key}'`)
      const { text } = await autotranslate({
        text: phrase,
        targetLanguage: locale.code,
      })
      count += 1
      update()
      await addPhraseToFile(locale.file, key, text)
    }, { concurrency: 10 })
  }
  promise()
    .then(() => observer.complete())
    .catch(err => observer.error(err))
    .finally(() => {
      if (autotranslate.kill) autotranslate.kill()
    })
})

export default autotranslatePhrases
