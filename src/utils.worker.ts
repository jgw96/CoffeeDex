type GetIdentifier<T> = (value: T) => any;

const defaultGetIdentifier: GetIdentifier<any> = (val) => val;

export async function removeDuplicates<T>(
  collection: T[],
  getIdentifier: GetIdentifier < T > = defaultGetIdentifier,
) {
  const identifierState: { [identifier: string]: boolean } = {};

  return collection.filter((value) => {
    const identifier = String(getIdentifier(value));

    if (identifierState[identifier]) {
      return false;
    }

    identifierState[identifier] = true;

    return true;
  });
}