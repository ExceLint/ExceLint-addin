import { __assign, __extends } from "tslib";
import * as React from 'react';
import { initializeComponentRef, classNamesFunction, KeyCodes } from '../../Utilities';
import { PrimaryButton, DefaultButton, IconButton } from '../../Button';
import { Image } from '../../Image';
import { Stack } from '../../Stack';
import { FocusTrapZone } from '../../FocusTrapZone';
var getClassNames = classNamesFunction();
var TeachingBubbleContentBase = /** @class */ (function (_super) {
    __extends(TeachingBubbleContentBase, _super);
    function TeachingBubbleContentBase(props) {
        var _this = _super.call(this, props) || this;
        _this.rootElement = React.createRef();
        _this._onKeyDown = function (e) {
            if (_this.props.onDismiss) {
                if (e.which === KeyCodes.escape) {
                    _this.props.onDismiss();
                }
            }
        };
        initializeComponentRef(_this);
        _this.state = {};
        return _this;
    }
    TeachingBubbleContentBase.prototype.componentDidMount = function () {
        if (this.props.onDismiss) {
            document.addEventListener('keydown', this._onKeyDown, false);
        }
    };
    TeachingBubbleContentBase.prototype.componentWillUnmount = function () {
        if (this.props.onDismiss) {
            document.removeEventListener('keydown', this._onKeyDown);
        }
    };
    TeachingBubbleContentBase.prototype.focus = function () {
        if (this.rootElement.current) {
            this.rootElement.current.focus();
        }
    };
    TeachingBubbleContentBase.prototype.render = function () {
        var _a = this.props, children = _a.children, illustrationImage = _a.illustrationImage, primaryButtonProps = _a.primaryButtonProps, secondaryButtonProps = _a.secondaryButtonProps, headline = _a.headline, hasCondensedHeadline = _a.hasCondensedHeadline, 
        // eslint-disable-next-line deprecation/deprecation
        _b = _a.hasCloseButton, 
        // eslint-disable-next-line deprecation/deprecation
        hasCloseButton = _b === void 0 ? this.props.hasCloseIcon : _b, onDismiss = _a.onDismiss, closeButtonAriaLabel = _a.closeButtonAriaLabel, hasSmallHeadline = _a.hasSmallHeadline, isWide = _a.isWide, styles = _a.styles, theme = _a.theme, ariaDescribedBy = _a.ariaDescribedBy, ariaLabelledBy = _a.ariaLabelledBy, customFooterContent = _a.footerContent, focusTrapZoneProps = _a.focusTrapZoneProps;
        var imageContent;
        var headerContent;
        var bodyContent;
        var footerContent;
        var closeButton;
        var classNames = getClassNames(styles, {
            theme: theme,
            hasCondensedHeadline: hasCondensedHeadline,
            hasSmallHeadline: hasSmallHeadline,
            hasCloseButton: hasCloseButton,
            hasHeadline: !!headline,
            isWide: isWide,
            primaryButtonClassName: primaryButtonProps ? primaryButtonProps.className : undefined,
            secondaryButtonClassName: secondaryButtonProps ? secondaryButtonProps.className : undefined,
        });
        if (illustrationImage && illustrationImage.src) {
            imageContent = (React.createElement("div", { className: classNames.imageContent },
                React.createElement(Image, __assign({}, illustrationImage))));
        }
        if (headline) {
            var HeaderWrapperAs = typeof headline === 'string' ? 'p' : 'div';
            headerContent = (React.createElement("div", { className: classNames.header },
                React.createElement(HeaderWrapperAs, { role: "heading", className: classNames.headline, id: ariaLabelledBy }, headline)));
        }
        if (children) {
            var BodyContentWrapperAs = typeof children === 'string' ? 'p' : 'div';
            bodyContent = (React.createElement("div", { className: classNames.body },
                React.createElement(BodyContentWrapperAs, { className: classNames.subText, id: ariaDescribedBy }, children)));
        }
        if (primaryButtonProps || secondaryButtonProps || customFooterContent) {
            footerContent = (React.createElement(Stack, { className: classNames.footer, horizontal: true, horizontalAlign: customFooterContent ? 'space-between' : 'end' },
                React.createElement(Stack.Item, { align: "center" }, React.createElement("span", null, customFooterContent)),
                React.createElement(Stack.Item, null,
                    secondaryButtonProps && React.createElement(DefaultButton, __assign({}, secondaryButtonProps, { className: classNames.secondaryButton })),
                    primaryButtonProps && React.createElement(PrimaryButton, __assign({}, primaryButtonProps, { className: classNames.primaryButton })))));
        }
        if (hasCloseButton) {
            closeButton = (React.createElement(IconButton, { className: classNames.closeButton, iconProps: { iconName: 'Cancel' }, title: closeButtonAriaLabel, ariaLabel: closeButtonAriaLabel, onClick: onDismiss }));
        }
        return (React.createElement("div", { className: classNames.content, ref: this.rootElement, role: 'dialog', tabIndex: -1, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, "data-is-focusable": true },
            imageContent,
            React.createElement(FocusTrapZone, __assign({ isClickableOutsideFocusTrap: true }, focusTrapZoneProps),
                React.createElement("div", { className: classNames.bodyContent },
                    headerContent,
                    bodyContent,
                    footerContent,
                    closeButton))));
    };
    return TeachingBubbleContentBase;
}(React.Component));
export { TeachingBubbleContentBase };
//# sourceMappingURL=TeachingBubbleContent.base.js.map