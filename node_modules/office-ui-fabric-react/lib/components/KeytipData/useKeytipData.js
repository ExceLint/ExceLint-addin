import { __assign, __spreadArrays } from "tslib";
import * as React from 'react';
import { useConst, usePrevious } from '@uifabric/react-hooks';
import { mergeAriaAttributeValues } from '../../Utilities';
import { KeytipManager, mergeOverflows, sequencesToID, getAriaDescribedBy } from '../../utilities/keytips/index';
/**
 * Hook that creates attributes for components which are enabled with Keytip.
 */
export function useKeytipData(options) {
    var _a, _b;
    var uniqueId = React.useRef();
    var keytipProps = options.keytipProps
        ? __assign({ disabled: options.disabled }, options.keytipProps) : undefined;
    var keytipManager = useConst(KeytipManager.getInstance());
    React.useEffect(function () {
        // Register Keytip in KeytipManager
        if (keytipProps) {
            uniqueId.current = keytipManager.register(keytipProps);
        }
        return function () {
            // Unregister Keytip in KeytipManager
            keytipProps && keytipManager.unregister(keytipProps, uniqueId.current);
        };
        // this is meant to run only at mount, and updates are handled separately
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var prevOptions = usePrevious(options);
    if (uniqueId.current &&
        keytipProps &&
        (((_a = prevOptions) === null || _a === void 0 ? void 0 : _a.keytipProps) !== options.keytipProps || ((_b = prevOptions) === null || _b === void 0 ? void 0 : _b.disabled) !== options.disabled)) {
        keytipManager.update(keytipProps, uniqueId.current);
    }
    var nativeKeytipProps = {
        ariaDescribedBy: undefined,
        keytipId: undefined,
    };
    if (keytipProps) {
        nativeKeytipProps = getKeytipData(keytipManager, keytipProps, options.ariaDescribedBy);
    }
    return nativeKeytipProps;
}
/**
 * Gets the aria- and data- attributes to attach to the component
 * @param keytipProps - options for Keytip
 * @param describedByPrepend - ariaDescribedBy value to prepend
 */
function getKeytipData(keytipManager, keytipProps, describedByPrepend) {
    // Add the parent overflow sequence if necessary
    var newKeytipProps = keytipManager.addParentOverflow(keytipProps);
    // Construct aria-describedby and data-ktp-id attributes
    var ariaDescribedBy = mergeAriaAttributeValues(describedByPrepend, getAriaDescribedBy(newKeytipProps.keySequences));
    var keySequences = __spreadArrays(newKeytipProps.keySequences);
    if (newKeytipProps.overflowSetSequence) {
        keySequences = mergeOverflows(keySequences, newKeytipProps.overflowSetSequence);
    }
    var keytipId = sequencesToID(keySequences);
    return {
        ariaDescribedBy: ariaDescribedBy,
        keytipId: keytipId,
    };
}
//# sourceMappingURL=useKeytipData.js.map