import { __assign, __extends } from "tslib";
import * as React from 'react';
import { warnDeprecations, classNamesFunction, divProperties, getInitials, getNativeProps, getRTL, } from '../../../Utilities';
import { mergeStyles } from '../../../Styling';
import { PersonaPresence } from '../PersonaPresence/index';
import { Icon } from '../../../Icon';
import { Image, ImageFit, ImageLoadState } from '../../../Image';
import { PersonaPresence as PersonaPresenceEnum, PersonaSize, } from '../Persona.types';
import { getPersonaInitialsColor } from '../PersonaInitialsColor';
import { sizeToPixels } from '../PersonaConsts';
var getClassNames = classNamesFunction({
    // There can be many PersonaCoin rendered with different sizes.
    // Therefore setting a larger cache size.
    cacheSize: 100,
});
/**
 * PersonaCoin with no default styles.
 * [Use the `getStyles` API to add your own styles.](https://github.com/microsoft/fluentui/wiki/Styling)
 */
var PersonaCoinBase = /** @class */ (function (_super) {
    __extends(PersonaCoinBase, _super);
    function PersonaCoinBase(props) {
        var _this = _super.call(this, props) || this;
        _this._onRenderCoin = function (props) {
            var _a = _this.props, coinSize = _a.coinSize, styles = _a.styles, imageUrl = _a.imageUrl, imageAlt = _a.imageAlt, imageShouldFadeIn = _a.imageShouldFadeIn, imageShouldStartVisible = _a.imageShouldStartVisible, theme = _a.theme, showUnknownPersonaCoin = _a.showUnknownPersonaCoin;
            // Render the Image component only if an image URL is provided
            if (!imageUrl) {
                return null;
            }
            var size = _this.props.size;
            var classNames = getClassNames(styles, {
                theme: theme,
                size: size,
                showUnknownPersonaCoin: showUnknownPersonaCoin,
            });
            var dimension = coinSize || sizeToPixels[size];
            return (React.createElement(Image, { className: classNames.image, imageFit: ImageFit.cover, src: imageUrl, width: dimension, height: dimension, alt: imageAlt, shouldFadeIn: imageShouldFadeIn, shouldStartVisible: imageShouldStartVisible, onLoadingStateChange: _this._onPhotoLoadingStateChange }));
        };
        _this._onRenderInitials = function (props) {
            var imageInitials = props.imageInitials;
            var allowPhoneInitials = props.allowPhoneInitials, showUnknownPersonaCoin = props.showUnknownPersonaCoin;
            if (showUnknownPersonaCoin) {
                return React.createElement(Icon, { iconName: "Help" });
            }
            var isRTL = getRTL(_this.props.theme);
            imageInitials = imageInitials || getInitials(_this._getText(), isRTL, allowPhoneInitials);
            return imageInitials !== '' ? React.createElement("span", null, imageInitials) : React.createElement(Icon, { iconName: "Contact" });
        };
        _this._onPhotoLoadingStateChange = function (loadState) {
            _this.setState({
                isImageLoaded: loadState === ImageLoadState.loaded,
                isImageError: loadState === ImageLoadState.error,
            });
            _this.props.onPhotoLoadingStateChange && _this.props.onPhotoLoadingStateChange(loadState);
        };
        if (process.env.NODE_ENV !== 'production') {
            warnDeprecations('PersonaCoin', props, { primaryText: 'text' });
        }
        _this.state = {
            isImageLoaded: false,
            isImageError: false,
        };
        return _this;
    }
    PersonaCoinBase.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
        if (nextProps.imageUrl !== this.props.imageUrl) {
            this.setState({
                isImageLoaded: false,
                isImageError: false,
            });
        }
    };
    PersonaCoinBase.prototype.render = function () {
        var _a = this.props, className = _a.className, coinProps = _a.coinProps, showUnknownPersonaCoin = _a.showUnknownPersonaCoin, coinSize = _a.coinSize, styles = _a.styles, imageUrl = _a.imageUrl, isOutOfOffice = _a.isOutOfOffice, 
        /* eslint-disable deprecation/deprecation */
        _b = _a.onRenderCoin, 
        /* eslint-disable deprecation/deprecation */
        onRenderCoin = _b === void 0 ? this._onRenderCoin : _b, _c = _a.onRenderPersonaCoin, onRenderPersonaCoin = _c === void 0 ? onRenderCoin : _c, 
        /* eslint-enable deprecation/deprecation */
        _d = _a.onRenderInitials, 
        /* eslint-enable deprecation/deprecation */
        onRenderInitials = _d === void 0 ? this._onRenderInitials : _d, presence = _a.presence, presenceTitle = _a.presenceTitle, presenceColors = _a.presenceColors, showInitialsUntilImageLoads = _a.showInitialsUntilImageLoads, theme = _a.theme;
        var size = this.props.size;
        var divProps = getNativeProps(this.props, divProperties);
        var divCoinProps = getNativeProps(coinProps || {}, divProperties);
        var coinSizeStyle = coinSize ? { width: coinSize, height: coinSize } : undefined;
        var hideImage = showUnknownPersonaCoin;
        var personaPresenceProps = {
            coinSize: coinSize,
            isOutOfOffice: isOutOfOffice,
            presence: presence,
            presenceTitle: presenceTitle,
            presenceColors: presenceColors,
            size: size,
            theme: theme,
        };
        // Use getStyles from props, or fall back to getStyles from styles file.
        var classNames = getClassNames(styles, {
            theme: theme,
            className: coinProps && coinProps.className ? coinProps.className : className,
            size: size,
            coinSize: coinSize,
            showUnknownPersonaCoin: showUnknownPersonaCoin,
        });
        var shouldRenderInitials = Boolean(!this.state.isImageLoaded &&
            ((showInitialsUntilImageLoads && imageUrl) || !imageUrl || this.state.isImageError || hideImage));
        return (React.createElement("div", __assign({ role: "presentation" }, divProps, { className: classNames.coin }),
            // eslint-disable-next-line deprecation/deprecation
            size !== PersonaSize.size8 && size !== PersonaSize.size10 && size !== PersonaSize.tiny ? (React.createElement("div", __assign({ role: "presentation" }, divCoinProps, { className: classNames.imageArea, style: coinSizeStyle }),
                shouldRenderInitials && (React.createElement("div", { className: mergeStyles(classNames.initials, !showUnknownPersonaCoin && { backgroundColor: getPersonaInitialsColor(this.props) }), style: coinSizeStyle, "aria-hidden": "true" }, onRenderInitials(this.props, this._onRenderInitials))),
                !hideImage && onRenderPersonaCoin(this.props, this._onRenderCoin),
                React.createElement(PersonaPresence, __assign({}, personaPresenceProps)))) : // Otherwise, render just PersonaPresence.
                this.props.presence ? (React.createElement(PersonaPresence, __assign({}, personaPresenceProps))) : (
                // Just render Contact Icon if there isn't a Presence prop.
                React.createElement(Icon, { iconName: "Contact", className: classNames.size10WithoutPresenceIcon })),
            this.props.children));
    };
    /**
     * Deprecation helper for getting text.
     */
    PersonaCoinBase.prototype._getText = function () {
        // eslint-disable-next-line deprecation/deprecation
        return this.props.text || this.props.primaryText || '';
    };
    PersonaCoinBase.defaultProps = {
        size: PersonaSize.size48,
        presence: PersonaPresenceEnum.none,
        imageAlt: '',
    };
    return PersonaCoinBase;
}(React.Component));
export { PersonaCoinBase };
//# sourceMappingURL=PersonaCoin.base.js.map