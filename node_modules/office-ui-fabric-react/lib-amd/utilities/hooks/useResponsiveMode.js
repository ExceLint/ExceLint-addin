define(["require", "exports", "react", "@uifabric/utilities", "@uifabric/react-hooks", "../decorators/withResponsiveMode"], function (require, exports, React, utilities_1, react_hooks_1, withResponsiveMode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useResponsiveMode = function (elementRef) {
        var _a = React.useState(withResponsiveMode_1.getInitialResponsiveMode), lastResponsiveMode = _a[0], setLastResponsiveMode = _a[1];
        var onResize = React.useCallback(function () {
            // Setting the same value should not cause a re-render.
            var newResponsiveMode = withResponsiveMode_1.getResponsiveMode(utilities_1.getWindow(elementRef.current));
            if (lastResponsiveMode !== newResponsiveMode) {
                setLastResponsiveMode(newResponsiveMode);
            }
        }, [elementRef, lastResponsiveMode]);
        react_hooks_1.useOnEvent(window, 'resize', onResize);
        // Call resize function initially on mount.
        React.useEffect(function () {
            onResize();
            // eslint-disable-next-line react-hooks/exhaustive-deps -- only meant to run on mount
        }, []);
        return lastResponsiveMode;
    };
});
//# sourceMappingURL=useResponsiveMode.js.map