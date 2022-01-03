import PQueue from 'p-queue'
import getPhrasesFromFile from './getPhrasesFromFile'
import sortObject from './sortObject'
import writeLocale from './writeLocale'

const queue = new PQueue({ concurrency: 1 })

const addPhraseToFile = async (file: string, key: string, text: string) => {
  await queue.add(async () => {
    const localePhrases = await getPhrasesFromFile(file)
    localePhrases[key] = text
    await writeLocale(file, sortObject(localePhrases))
  })
}

export default addPhraseToFile
