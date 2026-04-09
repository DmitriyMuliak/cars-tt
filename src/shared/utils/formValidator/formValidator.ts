/**
 * A Rule is a function that receives a value and returns an error string or null.
 * Custom rules can be passed inline — no special wrapper needed.
 *
 * @example
 * const noNumbers: Rule = (v) => /\d/.test(v) ? 'No digits allowed' : null;
 */
export type Rule<T = string> = (value: T) => string | null;

export const required =
  (message = 'This field is required'): Rule<string> =>
  (value) =>
    value.trim().length === 0 ? message : null;

export const minLength =
  (min: number, message = `Must be at least ${min} characters`): Rule<string> =>
  (value) =>
    value.trim().length < min ? message : null;

export const maxLength =
  (max: number, message = `Must be at most ${max} characters`): Rule<string> =>
  (value) =>
    value.trim().length > max ? message : null;

export const pattern =
  (regex: RegExp, message: string, inverted?: boolean): Rule<string> =>
  (value) => {
    const hasMatch = regex.test(value.trim());
    const hasError = inverted ? hasMatch : !hasMatch;

    return hasError ? message : null;
  };

export const custom =
  <T>(predicate: (value: T) => boolean, message: string): Rule<T> =>
  (value) =>
    predicate(value) ? null : message;

export function validate<T>(value: T, rules: Rule<T>[]): string | null {
  for (const rule of rules) {
    const error = rule(value);
    if (error !== null) return error;
  }
  return null;
}

export function validateForm<T extends Record<string, unknown>>(
  values: T,
  schema: Partial<Record<keyof T, Rule<T[keyof T]>[]>>,
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const key in schema) {
    const rules = schema[key];
    if (!rules) continue;
    const error = validate(values[key], rules as Rule<T[keyof T]>[]);
    if (error !== null) errors[key] = error;
  }
  return errors;
}
