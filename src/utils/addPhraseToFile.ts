import fs from 'fs-extra'
import getPhrasesFromFile from './getPhrasesFromFile'

const addPhraseToFile = async (file: string, key: string, text: string) => {
  const localePhrases = await getPhrasesFromFile(file)
  localePhrases[key] = text
  await fs.writeJSON(file, localePhrases, {
    spaces: 2,
  })
}

export default addPhraseToFile
