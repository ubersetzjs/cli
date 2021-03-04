export default function sortObject<T extends Record<any, any>>(objectToSort: T) {
  return Object.keys(objectToSort)
    .sort()
    .reduce((obj, key) => ({
      ...obj,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [key]: objectToSort[key],
    }), {}) as T
}
