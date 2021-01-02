import { __assign, __extends } from "tslib";
import * as React from 'react';
import { IconType } from './Icon.types';
import { Image } from '../Image/Image';
import { ImageLoadState } from '../Image/Image.types';
import { getNativeProps, htmlElementProperties, classNamesFunction } from '../../Utilities';
import { getIconContent } from './FontIcon';
var getClassNames = classNamesFunction({
    // Icon is used a lot by other components.
    // It's likely to see expected cases which pass different className to the Icon.
    // Therefore setting a larger cache size.
    cacheSize: 100,
});
var IconBase = /** @class */ (function (_super) {
    __extends(IconBase, _super);
    function IconBase(props) {
        var _this = _super.call(this, props) || this;
        _this._onImageLoadingStateChange = function (state) {
            if (_this.props.imageProps && _this.props.imageProps.onLoadingStateChange) {
                _this.props.imageProps.onLoadingStateChange(state);
            }
            if (state === ImageLoadState.error) {
                _this.setState({ imageLoadError: true });
            }
        };
        _this.state = {
            imageLoadError: false,
        };
        return _this;
    }
    IconBase.prototype.render = function () {
        var _a = this.props, children = _a.children, className = _a.className, styles = _a.styles, iconName = _a.iconName, imageErrorAs = _a.imageErrorAs, theme = _a.theme;
        var isPlaceholder = typeof iconName === 'string' && iconName.length === 0;
        var isImage = 
        // eslint-disable-next-line deprecation/deprecation
        !!this.props.imageProps || this.props.iconType === IconType.image || this.props.iconType === IconType.Image;
        var iconContent = getIconContent(iconName) || {};
        var iconClassName = iconContent.iconClassName, iconContentChildren = iconContent.children;
        var classNames = getClassNames(styles, {
            theme: theme,
            className: className,
            iconClassName: iconClassName,
            isImage: isImage,
            isPlaceholder: isPlaceholder,
        });
        var RootType = isImage ? 'span' : 'i';
        var nativeProps = getNativeProps(this.props, htmlElementProperties, [
            'aria-label',
        ]);
        var imageLoadError = this.state.imageLoadError;
        var imageProps = __assign(__assign({}, this.props.imageProps), { onLoadingStateChange: this._onImageLoadingStateChange });
        var ImageType = (imageLoadError && imageErrorAs) || Image;
        // eslint-disable-next-line deprecation/deprecation
        var ariaLabel = this.props['aria-label'] || this.props.ariaLabel;
        var containerProps = ariaLabel
            ? {
                'aria-label': ariaLabel,
            }
            : {
                'aria-hidden': this.props['aria-labelledby'] || imageProps['aria-labelledby'] ? false : true,
            };
        return (React.createElement(RootType, __assign({ "data-icon-name": iconName }, containerProps, nativeProps, { className: classNames.root }), isImage ? React.createElement(ImageType, __assign({}, imageProps)) : children || iconContentChildren));
    };
    return IconBase;
}(React.Component));
export { IconBase };
//# sourceMappingURL=Icon.base.js.map