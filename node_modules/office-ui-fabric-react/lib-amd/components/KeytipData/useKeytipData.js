define(["require", "exports", "tslib", "react", "@uifabric/react-hooks", "../../Utilities", "../../utilities/keytips/index"], function (require, exports, tslib_1, React, react_hooks_1, Utilities_1, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Hook that creates attributes for components which are enabled with Keytip.
     */
    function useKeytipData(options) {
        var _a, _b;
        var uniqueId = React.useRef();
        var keytipProps = options.keytipProps
            ? tslib_1.__assign({ disabled: options.disabled }, options.keytipProps) : undefined;
        var keytipManager = react_hooks_1.useConst(index_1.KeytipManager.getInstance());
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
        var prevOptions = react_hooks_1.usePrevious(options);
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
    exports.useKeytipData = useKeytipData;
    /**
     * Gets the aria- and data- attributes to attach to the component
     * @param keytipProps - options for Keytip
     * @param describedByPrepend - ariaDescribedBy value to prepend
     */
    function getKeytipData(keytipManager, keytipProps, describedByPrepend) {
        // Add the parent overflow sequence if necessary
        var newKeytipProps = keytipManager.addParentOverflow(keytipProps);
        // Construct aria-describedby and data-ktp-id attributes
        var ariaDescribedBy = Utilities_1.mergeAriaAttributeValues(describedByPrepend, index_1.getAriaDescribedBy(newKeytipProps.keySequences));
        var keySequences = tslib_1.__spreadArrays(newKeytipProps.keySequences);
        if (newKeytipProps.overflowSetSequence) {
            keySequences = index_1.mergeOverflows(keySequences, newKeytipProps.overflowSetSequence);
        }
        var keytipId = index_1.sequencesToID(keySequences);
        return {
            ariaDescribedBy: ariaDescribedBy,
            keytipId: keytipId,
        };
    }
});
//# sourceMappingURL=useKeytipData.js.map