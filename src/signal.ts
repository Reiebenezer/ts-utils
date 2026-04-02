/**
 * ### INTERNAL SIGNAL FUNCTION
 *
 * For use with derived's `dispose()` function. Contains an internal function `clearSubscribers()`
 */
function __signal_internal<T>(initialValue: T): __internal_WritableSignalWithClearSubs<T> {
  let _value = initialValue;
  const listeners = new Set<Listener<T>>();

  return {
    get: () => _value,
    set(value) {
      if (Object.is(_value, value)) return _value;

      const prev = _value;
      _value = value;

      [...listeners].forEach((s) => s(_value, prev));
      return _value;
    },

    update(fn) {
      return this.set(fn(_value));
    },

    subscribe(listener) {
      listeners.add(listener);

      // Unsubscribe
      return () => listeners.delete(listener);
    },

    __internal_clear_subscribers() {
      listeners.clear();
    },
  };
}

/**
 * ## Signal API
 *
 * Creates a signal, a reactive version of any value passed into it.
 */
export function signal<T>(initialValue: T): WritableSignal<T>
export function signal<T>(): WritableSignal<T | undefined>;
export function signal<T>(initialValue?: T): WritableSignal<T | undefined> {
  const { get, set, update, subscribe } = __signal_internal(initialValue);

  return {
    get,
    set,
    update,
    subscribe,
  };
}

/**
 * ## Signal API
 *
 * Creates an effect for a signal.
 *
 * @param fn The function that updates whenever any signal inside `deps` changes.
 * @param deps The list of dependencies. You can pass signals here.
 * @param [immediate=true] Determines when `fn` immediately executes once. `true` by default
 */
export function effect(
  fn: () => void | Cleanup,
  deps: Subscribable<unknown>[],
  immediate = true,
): Cleanup {
  // Make sure that each signal is passed exactly once
  const uniqueDeps = [...new Set(deps)];
  let runCleanup: Cleanup | undefined;

  // A function that cleans up previous run via `runCleanup()`,
  // Then re-executes `fn()` and updates the cleanup function
  // This is to prevent deps from previous reruns to affect the next rerun
  const run = () => {
    runCleanup?.();
    runCleanup = undefined;

    const result = fn();

    if (typeof result === 'function') {
      runCleanup = result;
    }
  };

  // A collection of unsubscribe functions for each dependency. Used for cleanup later on
  const unsubscribers = uniqueDeps.map((dep) => dep.subscribe(() => run()));

  // Immediate execution (run once) if `immediate` is true
  if (immediate) run();

  return () => {
    // Clean up
    runCleanup?.();
    runCleanup = undefined;

    unsubscribers.forEach((u) => u());
  };
}

/**
 * ## Signal API
 *
 * Creates a derived, readonly version of a signal.
 * Auto-updates and recomputes its value when the dependencies change
 *
 * @param fn Computes the derived value from its contents
 * @param deps Recalculates value from `fn()` when any of the signals passed here changes
 */
export function derived<T>(
  fn: () => T,
  deps: Subscribable<unknown>[],
): DerivedSignal<T> {
  const { get, set, subscribe, __internal_clear_subscribers } =
    __signal_internal(fn());

  const cleanup = effect(() => void set(fn()), deps, false);

  return {
    get,
    subscribe,
    dispose: () => {
      cleanup();
      __internal_clear_subscribers?.();
    },
  };
}

// ------------------------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------------------------

export interface Subscribable<T> {
  subscribe(listener: Listener<T>): () => void;
}

export interface ReadonlySignal<T> extends Subscribable<T> {
  get(): T;
}

export interface DerivedSignal<T> extends ReadonlySignal<T> {
  dispose(): void;
}

export interface WritableSignal<T> extends ReadonlySignal<T> {
  set(value: T): T;
  update(fn: (prev: T) => T): T;
}

interface __internal_WritableSignalWithClearSubs<T> extends WritableSignal<T> {
  __internal_clear_subscribers?(): void;
}

type Listener<T> = (value: T, prev: T) => void;
export type Cleanup = () => void;
