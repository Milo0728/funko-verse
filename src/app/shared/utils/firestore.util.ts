/**
 * Firestore rechaza cualquier campo con valor `undefined` lanzando
 * "Unsupported field value: undefined". Este helper recorre superficialmente
 * (y arrays/objetos anidados) eliminando esos campos antes de enviar a la DB.
 *
 * Uso:
 *   await updateDoc(ref, stripUndefined(patch));
 *   await addDoc(col, stripUndefined(newDoc));
 */
export function stripUndefined<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) {
    return input.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (typeof input !== 'object') return input;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (value === undefined) continue;
    result[key] = stripUndefined(value);
  }
  return result as T;
}
