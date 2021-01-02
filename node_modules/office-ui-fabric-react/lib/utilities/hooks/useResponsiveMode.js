import * as React from 'react';
import { getWindow } from '@uifabric/utilities';
import { useOnEvent } from '@uifabric/react-hooks';
import { getResponsiveMode, getInitialResponsiveMode } from '../decorators/withResponsiveMode';
export var useResponsiveMode = function (elementRef) {
    var _a = React.useState(getInitialResponsiveMode), lastResponsiveMode = _a[0], setLastResponsiveMode = _a[1];
    var onResize = React.useCallback(function () {
        // Setting the same value should not cause a re-render.
        var newResponsiveMode = getResponsiveMode(getWindow(elementRef.current));
        if (lastResponsiveMode !== newResponsiveMode) {
            setLastResponsiveMode(newResponsiveMode);
        }
    }, [elementRef, lastResponsiveMode]);
    useOnEvent(window, 'resize', onResize);
    // Call resize function initially on mount.
    React.useEffect(function () {
        onResize();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only meant to run on mount
    }, []);
    return lastResponsiveMode;
};
//# sourceMappingURL=useResponsiveMode.js.map