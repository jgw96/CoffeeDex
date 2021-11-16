

export function sayHello() {
  return Math.random() < 0.5 ? 'Hello' : 'Hola';
}

export async function maybeInstantiateStreaming(path, ...opts) {
  // Start the download asap.
  const f = fetch(path);
  try {
    // This will throw either if `instantiateStreaming` is
    // undefined or the `Content-Type` header is wrong.
    return WebAssembly.instantiateStreaming(
      f,
      ...opts
    );
  } catch (_e) {
    // If it fails for any reason, fall back to downloading
    // the entire module as an ArrayBuffer.
    return WebAssembly.instantiate(
      await f.then(f => f.arrayBuffer()),
      ...opts
    );
  }
}

type GetIdentifier<T> = (value: T) => any;

const defaultGetIdentifier: GetIdentifier<any> = (val) => val;

export function removeDuplicates<T>(
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

export const appCheckToken = '6Lf2eDUdAAAAAI4K1QdiX2d_PGvfOG-SWpl_wK9F';