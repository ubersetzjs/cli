export default function regexCallback(
  regExp: RegExp,
  target: string,
  callback: (result: RegExpExecArray) => void,
) {
  let result: RegExpExecArray | null
  const regex = new RegExp(regExp)
  // eslint-disable-next-line no-cond-assign
  while (result = regex.exec(target)) {
    callback(result)
  }
}
