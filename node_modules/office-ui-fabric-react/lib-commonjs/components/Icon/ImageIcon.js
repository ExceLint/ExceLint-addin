"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Image_1 = require("../Image/Image");
var Utilities_1 = require("../../Utilities");
var Icon_styles_1 = require("./Icon.styles");
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
//# sourceMappingURL=ImageIcon.js.map