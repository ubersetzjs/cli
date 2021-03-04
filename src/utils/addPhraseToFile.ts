import getPhrasesFromFile from './getPhrasesFromFile'
import sortObject from './sortObject'
import writeLocale from './writeLocale'

const addPhraseToFile = async (file: string, key: string, text: string) => {
  const localePhrases = await getPhrasesFromFile(file)
  localePhrases[key] = text
  await writeLocale(file, sortObject(localePhrases))
}

export default addPhraseToFile
