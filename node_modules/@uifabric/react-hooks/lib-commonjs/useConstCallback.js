"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
/**
 * @deprecated Deprecated due to potential for misuse (see package readme).
 * Use `React.useCallback` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useConstCallback(callback) {
    var ref = React.useRef();
    if (!ref.current) {
        ref.current = callback;
    }
    return ref.current;
}
exports.useConstCallback = useConstCallback;
//# sourceMappingURL=useConstCallback.js.map