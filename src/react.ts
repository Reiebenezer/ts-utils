// ------------------------------------------------------------------------------------
// HOOKS
// ------------------------------------------------------------------------------------

import { useEffect, useState } from 'react';

/**
 * ### useAsync
 * An react hook that handles asynchronous operations when `use()`, `<Suspense>` and React Server Components are not available (i.e. React is used solely for frontend).
 *
 * Uses `useEffect` under the hood.
 * @param promise The asynchronous operation to handle
 * @param valueIfError The value passed if the promise catches an error
 * @param destructor The destructor function passed to `useEffect`, if needed
 * @returns the value from the promise, or `undefined` if the promise has not yet resolved
 */
export function useAsync<T>(
  promise: () => Promise<T>,
  valueIfError?: T,
  dependencies: any[] = [],
  destructor?: () => void
) {
  const [val, setVal] = useState<T>();

  useEffect(() => {
    promise()
      .then((val) => setVal(val))
      .catch((err) => {
        console.error(err);
        setVal(valueIfError);
      });

    return destructor;
  }, dependencies);

  return val;
}
