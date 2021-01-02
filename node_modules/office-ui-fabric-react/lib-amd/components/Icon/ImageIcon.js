define(["require", "exports", "tslib", "react", "../Image/Image", "../../Utilities", "./Icon.styles"], function (require, exports, tslib_1, React, Image_1, Utilities_1, Icon_styles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Fast icon component which only supports images (not font glyphs) and can't be targeted by customizations.
     * To style the icon, use `className` or reference `ms-Icon` in CSS.
     * {@docCategory Icon}
     */
    exports.ImageIcon = function (props) {
        var className = props.className, imageProps = props.imageProps;
        var nativeProps = Utilities_1.getNativeProps(props, Utilities_1.htmlElementProperties);
        var containerProps = props['aria-label']
            ? {}
            : {
                role: 'presentation',
                'aria-hidden': imageProps.alt || imageProps['aria-labelledby'] ? false : true,
            };
        return (React.createElement("div", tslib_1.__assign({}, containerProps, nativeProps, { className: Utilities_1.css(Icon_styles_1.MS_ICON, Icon_styles_1.classNames.root, Icon_styles_1.classNames.image, className) }),
            React.createElement(Image_1.Image, tslib_1.__assign({}, imageProps))));
    };
});
//# sourceMappingURL=ImageIcon.js.map