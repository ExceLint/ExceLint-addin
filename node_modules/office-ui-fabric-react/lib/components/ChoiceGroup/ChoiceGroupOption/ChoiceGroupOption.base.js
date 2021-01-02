import { __assign, __extends, __rest } from "tslib";
import * as React from 'react';
import { Image } from '../../../Image';
import { Icon } from '../../../Icon';
import { classNamesFunction, getNativeProps, inputProperties, css, initializeComponentRef } from '../../../Utilities';
import { composeRenderFunction } from '@uifabric/utilities';
var getClassNames = classNamesFunction();
var LARGE_IMAGE_SIZE = 71;
/**
 * {@docCategory ChoiceGroup}
 */
var ChoiceGroupOptionBase = /** @class */ (function (_super) {
    __extends(ChoiceGroupOptionBase, _super);
    function ChoiceGroupOptionBase(props) {
        var _this = _super.call(this, props) || this;
        _this._onChange = function (evt) {
            var onChange = _this.props.onChange;
            if (onChange) {
                onChange(evt, _this.props);
            }
        };
        _this._onBlur = function (evt) {
            var onBlur = _this.props.onBlur;
            if (onBlur) {
                onBlur(evt, _this.props);
            }
        };
        _this._onFocus = function (evt) {
            var onFocus = _this.props.onFocus;
            if (onFocus) {
                onFocus(evt, _this.props);
            }
        };
        _this._onRenderField = function (props) {
            var id = props.id, imageSrc = props.imageSrc, _a = props.imageAlt, imageAlt = _a === void 0 ? '' : _a, selectedImageSrc = props.selectedImageSrc, iconProps = props.iconProps;
            var imageSize = props.imageSize ? props.imageSize : { width: 32, height: 32 };
            var onRenderLabel = props.onRenderLabel
                ? composeRenderFunction(props.onRenderLabel, _this._onRenderLabel)
                : _this._onRenderLabel;
            var label = onRenderLabel(props);
            return (React.createElement("label", { htmlFor: id, className: _this._classNames.field },
                imageSrc && (React.createElement("div", { className: _this._classNames.innerField },
                    React.createElement("div", { className: _this._classNames.imageWrapper },
                        React.createElement(Image, { src: imageSrc, alt: imageAlt, width: imageSize.width, height: imageSize.height })),
                    React.createElement("div", { className: _this._classNames.selectedImageWrapper },
                        React.createElement(Image, { src: selectedImageSrc, alt: imageAlt, width: imageSize.width, height: imageSize.height })))),
                iconProps && (React.createElement("div", { className: _this._classNames.innerField },
                    React.createElement("div", { className: _this._classNames.iconWrapper },
                        React.createElement(Icon, __assign({}, iconProps))))),
                imageSrc || iconProps ? React.createElement("div", { className: _this._classNames.labelWrapper }, label) : label));
        };
        _this._onRenderLabel = function (props) {
            return (React.createElement("span", { id: props.labelId, className: "ms-ChoiceFieldLabel" }, props.text));
        };
        initializeComponentRef(_this);
        return _this;
    }
    ChoiceGroupOptionBase.prototype.render = function () {
        var _a = this.props, ariaLabel = _a.ariaLabel, focused = _a.focused, required = _a.required, theme = _a.theme, iconProps = _a.iconProps, imageSrc = _a.imageSrc, imageSize = _a.imageSize, disabled = _a.disabled, 
        // eslint-disable-next-line deprecation/deprecation
        checked = _a.checked, id = _a.id, styles = _a.styles, name = _a.name, _b = _a.onRenderField, onRenderField = _b === void 0 ? this._onRenderField : _b, rest = __rest(_a, ["ariaLabel", "focused", "required", "theme", "iconProps", "imageSrc", "imageSize", "disabled", "checked", "id", "styles", "name", "onRenderField"]);
        this._classNames = getClassNames(styles, {
            theme: theme,
            hasIcon: !!iconProps,
            hasImage: !!imageSrc,
            checked: checked,
            disabled: disabled,
            imageIsLarge: !!imageSrc && (imageSize.width > LARGE_IMAGE_SIZE || imageSize.height > LARGE_IMAGE_SIZE),
            imageSize: imageSize,
            focused: focused,
        });
        var _c = getNativeProps(rest, inputProperties), className = _c.className, nativeProps = __rest(_c, ["className"]);
        return (React.createElement("div", { className: this._classNames.root },
            React.createElement("div", { className: this._classNames.choiceFieldWrapper },
                React.createElement("input", __assign({ "aria-label": ariaLabel, id: id, className: css(this._classNames.input, className), type: "radio", name: name, disabled: disabled, checked: checked, required: required }, nativeProps, { onChange: this._onChange, onFocus: this._onFocus, onBlur: this._onBlur })),
                onRenderField(this.props, this._onRenderField))));
    };
    ChoiceGroupOptionBase.defaultProps = {
        // This ensures default imageSize value doesn't mutate. Mutation can cause style re-calcuation.
        imageSize: { width: 32, height: 32 },
    };
    return ChoiceGroupOptionBase;
}(React.Component));
export { ChoiceGroupOptionBase };
//# sourceMappingURL=ChoiceGroupOption.base.js.map