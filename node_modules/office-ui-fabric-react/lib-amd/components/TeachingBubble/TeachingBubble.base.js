define(["require", "exports", "tslib", "react", "../../Utilities", "./TeachingBubbleContent", "../../Callout", "../../common/DirectionalHint"], function (require, exports, tslib_1, React, Utilities_1, TeachingBubbleContent_1, Callout_1, DirectionalHint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    var TeachingBubbleBase = /** @class */ (function (_super) {
        tslib_1.__extends(TeachingBubbleBase, _super);
        // Constructor
        function TeachingBubbleBase(props) {
            var _this = _super.call(this, props) || this;
            _this.rootElement = React.createRef();
            Utilities_1.initializeComponentRef(_this);
            _this.state = {};
            _this._defaultCalloutProps = {
                beakWidth: 16,
                gapSpace: 0,
                setInitialFocus: true,
                doNotLayer: false,
                directionalHint: DirectionalHint_1.DirectionalHint.rightCenter,
            };
            return _this;
        }
        TeachingBubbleBase.prototype.focus = function () {
            if (this.rootElement.current) {
                this.rootElement.current.focus();
            }
        };
        TeachingBubbleBase.prototype.render = function () {
            var _a = this.props, setCalloutProps = _a.calloutProps, 
            // eslint-disable-next-line deprecation/deprecation
            targetElement = _a.targetElement, onDismiss = _a.onDismiss, 
            // Default to deprecated value if provided.
            // eslint-disable-next-line deprecation/deprecation
            _b = _a.hasCloseButton, 
            // Default to deprecated value if provided.
            // eslint-disable-next-line deprecation/deprecation
            hasCloseButton = _b === void 0 ? this.props.hasCloseIcon : _b, isWide = _a.isWide, styles = _a.styles, theme = _a.theme, target = _a.target;
            var calloutProps = tslib_1.__assign(tslib_1.__assign({}, this._defaultCalloutProps), setCalloutProps);
            var stylesProps = {
                theme: theme,
                isWide: isWide,
                calloutProps: tslib_1.__assign(tslib_1.__assign({}, calloutProps), { theme: calloutProps.theme }),
                hasCloseButton: hasCloseButton,
            };
            var classNames = getClassNames(styles, stylesProps);
            var calloutStyles = classNames.subComponentStyles
                ? classNames.subComponentStyles.callout
                : undefined;
            return (React.createElement(Callout_1.Callout, tslib_1.__assign({ target: target || targetElement, onDismiss: onDismiss }, calloutProps, { className: classNames.root, styles: calloutStyles, hideOverflow: true }),
                React.createElement("div", { ref: this.rootElement },
                    React.createElement(TeachingBubbleContent_1.TeachingBubbleContent, tslib_1.__assign({}, this.props)))));
        };
        TeachingBubbleBase.defaultProps = {
            /**
             * Default calloutProps is deprecated in favor of private `_defaultCalloutProps`.
             * Remove in next release.
             * @deprecated In favor of private `_defaultCalloutProps`.
             */
            // eslint-disable-next-line deprecation/deprecation
            calloutProps: {
                beakWidth: 16,
                gapSpace: 0,
                setInitialFocus: true,
                doNotLayer: false,
                directionalHint: DirectionalHint_1.DirectionalHint.rightCenter,
            },
        };
        return TeachingBubbleBase;
    }(React.Component));
    exports.TeachingBubbleBase = TeachingBubbleBase;
});
//# sourceMappingURL=TeachingBubble.base.js.map