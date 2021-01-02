import * as React from 'react';
/**
 * @deprecated Deprecated due to potential for misuse (see package readme).
 * Use `React.useCallback` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useConstCallback(callback) {
    var ref = React.useRef();
    if (!ref.current) {
        ref.current = callback;
    }
    return ref.current;
}
//# sourceMappingURL=useConstCallback.js.map