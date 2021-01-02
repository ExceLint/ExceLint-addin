import { __assign } from "tslib";
import * as React from 'react';
import { Image } from '../Image/Image';
import { css, getNativeProps, htmlElementProperties } from '../../Utilities';
import { classNames, MS_ICON } from './Icon.styles';
/**
 * Fast icon component which only supports images (not font glyphs) and can't be targeted by customizations.
 * To style the icon, use `className` or reference `ms-Icon` in CSS.
 * {@docCategory Icon}
 */
export var ImageIcon = function (props) {
    var className = props.className, imageProps = props.imageProps;
    var nativeProps = getNativeProps(props, htmlElementProperties);
    var containerProps = props['aria-label']
        ? {}
        : {
            role: 'presentation',
            'aria-hidden': imageProps.alt || imageProps['aria-labelledby'] ? false : true,
        };
    return (React.createElement("div", __assign({}, containerProps, nativeProps, { className: css(MS_ICON, classNames.root, classNames.image, className) }),
        React.createElement(Image, __assign({}, imageProps))));
};
//# sourceMappingURL=ImageIcon.js.map