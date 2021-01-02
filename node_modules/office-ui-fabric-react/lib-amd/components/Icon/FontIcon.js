define(["require", "exports", "tslib", "react", "./Icon.styles", "../../Utilities", "../../Styling"], function (require, exports, tslib_1, React, Icon_styles_1, Utilities_1, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIconContent = Utilities_1.memoizeFunction(function (iconName) {
        var _a = Styling_1.getIcon(iconName) || {
            subset: {},
            code: undefined,
        }, code = _a.code, subset = _a.subset;
        if (!code) {
            return null;
        }
        return {
            children: code,
            iconClassName: subset.className,
            fontFamily: subset.fontFace && subset.fontFace.fontFamily,
        };
    }, undefined, true /*ignoreNullOrUndefinedResult */);
    /**
     * Fast icon component which only supports font glyphs (not images) and can't be targeted by customizations.
     * To style the icon, use `className` or reference `ms-Icon` in CSS.
     * {@docCategory Icon}
     */
    exports.FontIcon = function (props) {
        var iconName = props.iconName, className = props.className, _a = props.style, style = _a === void 0 ? {} : _a;
        var iconContent = exports.getIconContent(iconName) || {};
        var iconClassName = iconContent.iconClassName, children = iconContent.children, fontFamily = iconContent.fontFamily;
        var nativeProps = Utilities_1.getNativeProps(props, Utilities_1.htmlElementProperties);
        var containerProps = props['aria-label']
            ? {}
            : {
                role: 'presentation',
                'aria-hidden': true,
            };
        return (React.createElement("i", tslib_1.__assign({ "data-icon-name": iconName }, containerProps, nativeProps, { className: Utilities_1.css(Icon_styles_1.MS_ICON, Icon_styles_1.classNames.root, iconClassName, !iconName && Icon_styles_1.classNames.placeholder, className), 
            // Apply the font family this way to ensure it doesn't get overridden by Fabric Core ms-Icon styles
            // https://github.com/microsoft/fluentui/issues/10449
            style: tslib_1.__assign({ fontFamily: fontFamily }, style) }), children));
    };
    /**
     * Memoized helper for rendering a FontIcon.
     * @param iconName - The name of the icon to use from the icon font.
     * @param className - Class name for styling the icon.
     * @param ariaLabel - Label for the icon for the benefit of screen readers.
     * {@docCategory Icon}
     */
    exports.getFontIcon = Utilities_1.memoizeFunction(function (iconName, className, ariaLabel) {
        return exports.FontIcon({ iconName: iconName, className: className, 'aria-label': ariaLabel });
    });
});
//# sourceMappingURL=FontIcon.js.map