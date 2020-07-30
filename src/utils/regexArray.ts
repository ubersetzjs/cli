import regexCallback from './regexCallback'

export default function regexArray(regExp: RegExp, target: string) {
  const results: RegExpExecArray[] = []
  regexCallback(regExp, target, result => results.push(result))
  return results
}
