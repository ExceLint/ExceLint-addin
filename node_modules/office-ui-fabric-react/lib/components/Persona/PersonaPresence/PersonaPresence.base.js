import { __extends } from "tslib";
import * as React from 'react';
import { classNamesFunction } from '../../../Utilities';
import { Icon } from '../../../Icon';
import { PersonaPresence as PersonaPresenceEnum, } from '../Persona.types';
import { sizeBoolean } from '../PersonaConsts';
var coinSizeFontScaleFactor = 6;
var coinSizePresenceScaleFactor = 3;
var presenceMaxSize = 40;
var presenceFontMaxSize = 20;
var getClassNames = classNamesFunction({
    // There can be many PersonaPresence rendered with different sizes.
    // Therefore setting a larger cache size.
    cacheSize: 100,
});
/**
 * PersonaPresence with no default styles.
 * [Use the `getStyles` API to add your own styles.](https://github.com/microsoft/fluentui/wiki/Styling)
 */
var PersonaPresenceBase = /** @class */ (function (_super) {
    __extends(PersonaPresenceBase, _super);
    function PersonaPresenceBase(props) {
        var _this = _super.call(this, props) || this;
        _this._onRenderIcon = function (className, style) { return (React.createElement(Icon, { className: className, iconName: determineIcon(_this.props.presence, _this.props.isOutOfOffice), style: style })); };
        return _this;
    }
    PersonaPresenceBase.prototype.render = function () {
        var _a = this.props, coinSize = _a.coinSize, isOutOfOffice = _a.isOutOfOffice, styles = _a.styles, // Use getStyles from props.
        presence = _a.presence, theme = _a.theme, presenceTitle = _a.presenceTitle, presenceColors = _a.presenceColors;
        var size = sizeBoolean(this.props.size);
        // Render Presence Icon if Persona is above size 32.
        var renderIcon = !(size.isSize8 || size.isSize10 || size.isSize16 || size.isSize24 || size.isSize28 || size.isSize32) &&
            (coinSize ? coinSize > 32 : true);
        var presenceHeightWidth = coinSize
            ? coinSize / coinSizePresenceScaleFactor < presenceMaxSize
                ? coinSize / coinSizePresenceScaleFactor + 'px'
                : presenceMaxSize + 'px'
            : '';
        var presenceFontSize = coinSize
            ? coinSize / coinSizeFontScaleFactor < presenceFontMaxSize
                ? coinSize / coinSizeFontScaleFactor + 'px'
                : presenceFontMaxSize + 'px'
            : '';
        var coinSizeWithPresenceIconStyle = coinSize
            ? { fontSize: presenceFontSize, lineHeight: presenceHeightWidth }
            : undefined;
        var coinSizeWithPresenceStyle = coinSize
            ? { width: presenceHeightWidth, height: presenceHeightWidth }
            : undefined;
        // Use getStyles from props, or fall back to getStyles from styles file.
        var classNames = getClassNames(styles, {
            theme: theme,
            presence: presence,
            size: this.props.size,
            isOutOfOffice: isOutOfOffice,
            presenceColors: presenceColors,
        });
        if (presence === PersonaPresenceEnum.none) {
            return null;
        }
        return (React.createElement("div", { role: "presentation", className: classNames.presence, style: coinSizeWithPresenceStyle, title: presenceTitle }, renderIcon && this._onRenderIcon(classNames.presenceIcon, coinSizeWithPresenceIconStyle)));
    };
    return PersonaPresenceBase;
}(React.Component));
export { PersonaPresenceBase };
function determineIcon(presence, isOutOfOffice) {
    if (!presence) {
        return undefined;
    }
    var oofIcon = 'SkypeArrow';
    switch (PersonaPresenceEnum[presence]) {
        case 'online':
            return 'SkypeCheck';
        case 'away':
            return isOutOfOffice ? oofIcon : 'SkypeClock';
        case 'dnd':
            return 'SkypeMinus';
        case 'offline':
            return isOutOfOffice ? oofIcon : '';
    }
    return '';
}
//# sourceMappingURL=PersonaPresence.base.js.map