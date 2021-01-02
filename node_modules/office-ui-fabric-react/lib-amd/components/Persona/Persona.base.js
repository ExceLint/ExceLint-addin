define(["require", "exports", "tslib", "react", "../../Utilities", "../../Tooltip", "./PersonaCoin/PersonaCoin", "./Persona.types"], function (require, exports, tslib_1, React, Utilities_1, Tooltip_1, PersonaCoin_1, Persona_types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    /**
     * Persona with no default styles.
     * [Use the `styles` API to add your own styles.](https://github.com/microsoft/fluentui/wiki/Styling)
     */
    var PersonaBase = /** @class */ (function (_super) {
        tslib_1.__extends(PersonaBase, _super);
        function PersonaBase(props) {
            var _this = _super.call(this, props) || this;
            _this._onRenderPersonaCoin = function (props) {
                return React.createElement(PersonaCoin_1.PersonaCoin, tslib_1.__assign({}, props));
            };
            
            return _this;
        }
        PersonaBase.prototype.render = function () {
            // wrapping default render behavior based on various this.props properties
            var _onRenderPrimaryText = this._onRenderText(this._getText());
            var _onRenderSecondaryText = this._onRenderText(this.props.secondaryText);
            var _onRenderTertiaryText = this._onRenderText(this.props.tertiaryText);
            var _onRenderOptionalText = this._onRenderText(this.props.optionalText);
            var _a = this.props, hidePersonaDetails = _a.hidePersonaDetails, _b = _a.onRenderOptionalText, onRenderOptionalText = _b === void 0 ? _onRenderOptionalText : _b, _c = _a.onRenderPrimaryText, onRenderPrimaryText = _c === void 0 ? _onRenderPrimaryText : _c, _d = _a.onRenderSecondaryText, onRenderSecondaryText = _d === void 0 ? _onRenderSecondaryText : _d, _e = _a.onRenderTertiaryText, onRenderTertiaryText = _e === void 0 ? _onRenderTertiaryText : _e, _f = _a.onRenderPersonaCoin, onRenderPersonaCoin = _f === void 0 ? this._onRenderPersonaCoin : _f;
            var size = this.props.size;
            // These properties are to be explicitly passed into PersonaCoin because they are the only props directly used
            var _g = this.props, allowPhoneInitials = _g.allowPhoneInitials, className = _g.className, coinProps = _g.coinProps, showUnknownPersonaCoin = _g.showUnknownPersonaCoin, coinSize = _g.coinSize, styles = _g.styles, imageAlt = _g.imageAlt, imageInitials = _g.imageInitials, imageShouldFadeIn = _g.imageShouldFadeIn, imageShouldStartVisible = _g.imageShouldStartVisible, imageUrl = _g.imageUrl, initialsColor = _g.initialsColor, isOutOfOffice = _g.isOutOfOffice, onPhotoLoadingStateChange = _g.onPhotoLoadingStateChange, 
            // eslint-disable-next-line deprecation/deprecation
            onRenderCoin = _g.onRenderCoin, onRenderInitials = _g.onRenderInitials, presence = _g.presence, presenceTitle = _g.presenceTitle, presenceColors = _g.presenceColors, showInitialsUntilImageLoads = _g.showInitialsUntilImageLoads, showSecondaryText = _g.showSecondaryText, theme = _g.theme;
            var personaCoinProps = tslib_1.__assign({ allowPhoneInitials: allowPhoneInitials,
                showUnknownPersonaCoin: showUnknownPersonaCoin,
                coinSize: coinSize,
                imageAlt: imageAlt,
                imageInitials: imageInitials,
                imageShouldFadeIn: imageShouldFadeIn,
                imageShouldStartVisible: imageShouldStartVisible,
                imageUrl: imageUrl,
                initialsColor: initialsColor,
                onPhotoLoadingStateChange: onPhotoLoadingStateChange,
                onRenderCoin: onRenderCoin,
                onRenderInitials: onRenderInitials,
                presence: presence,
                presenceTitle: presenceTitle,
                showInitialsUntilImageLoads: showInitialsUntilImageLoads,
                size: size, text: this._getText(), isOutOfOffice: isOutOfOffice,
                presenceColors: presenceColors }, coinProps);
            var classNames = getClassNames(styles, {
                theme: theme,
                className: className,
                showSecondaryText: showSecondaryText,
                presence: presence,
                size: size,
            });
            var divProps = Utilities_1.getNativeProps(this.props, Utilities_1.divProperties);
            var personaDetails = (React.createElement("div", { className: classNames.details },
                this._renderElement(classNames.primaryText, onRenderPrimaryText, _onRenderPrimaryText),
                this._renderElement(classNames.secondaryText, onRenderSecondaryText, _onRenderSecondaryText),
                this._renderElement(classNames.tertiaryText, onRenderTertiaryText, _onRenderTertiaryText),
                this._renderElement(classNames.optionalText, onRenderOptionalText, _onRenderOptionalText),
                this.props.children));
            return (React.createElement("div", tslib_1.__assign({}, divProps, { className: classNames.root, style: coinSize ? { height: coinSize, minWidth: coinSize } : undefined }),
                onRenderPersonaCoin(personaCoinProps, this._onRenderPersonaCoin),
                (!hidePersonaDetails ||
                    size === Persona_types_1.PersonaSize.size8 ||
                    size === Persona_types_1.PersonaSize.size10 ||
                    size === Persona_types_1.PersonaSize.tiny) &&
                    personaDetails
            /* eslint-enable deprecation/deprecation */
            ));
        };
        /**
         * Renders various types of Text (primaryText, secondaryText, etc)
         * based on the classNames passed
         * @param classNames - element className
         * @param renderFunction - render function
         * @param defaultRenderFunction - default render function
         */
        PersonaBase.prototype._renderElement = function (classNames, renderFunction, defaultRenderFunction) {
            return (React.createElement("div", { dir: "auto", className: classNames }, renderFunction && renderFunction(this.props, defaultRenderFunction)));
        };
        /**
         * Deprecation helper for getting text.
         */
        PersonaBase.prototype._getText = function () {
            // eslint-disable-next-line deprecation/deprecation
            return this.props.text || this.props.primaryText || '';
        };
        /**
         * using closure to wrap the default render behavior
         * to make it independent of the type of text passed
         * @param text - text to render
         */
        PersonaBase.prototype._onRenderText = function (text) {
            // return default render behaviour for valid text or undefined
            return text
                ? function () {
                    // default onRender behaviour
                    return (React.createElement(Tooltip_1.TooltipHost, { content: text, overflowMode: Tooltip_1.TooltipOverflowMode.Parent, directionalHint: Tooltip_1.DirectionalHint.topLeftEdge }, text));
                }
                : undefined;
        };
        PersonaBase.defaultProps = {
            size: Persona_types_1.PersonaSize.size48,
            presence: Persona_types_1.PersonaPresence.none,
            imageAlt: '',
        };
        return PersonaBase;
    }(React.Component));
    exports.PersonaBase = PersonaBase;
});
//# sourceMappingURL=Persona.base.js.map