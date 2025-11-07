import { isEqual } from 'lodash';
import { useMemo, useRef } from 'react';

/*
    This hook does a deep comparison of the dependencies array and only re-runs the memoized function
    if the dependencies have changed. This is useful when you have complex objects in the dependencies
    array and you want to avoid re-running the memoized function if the object reference hasn't changed.
*/
export function useDeepMemo<T>(fn: () => T, deps: unknown[]): T {
    // @ts-expect-error - this works
    const prevDepsRef = useRef<unknown[]>();

    if (!isEqual(deps, prevDepsRef.current)) {
        prevDepsRef.current = deps;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(fn, prevDepsRef.current || deps);
}
