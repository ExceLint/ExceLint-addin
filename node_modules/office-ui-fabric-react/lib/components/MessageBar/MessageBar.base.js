import { __assign, __extends } from "tslib";
import * as React from 'react';
import { DelayedRender, getId, classNamesFunction, getNativeProps, htmlElementProperties, css, initializeComponentRef, } from '../../Utilities';
import { IconButton } from '../../Button';
import { Icon } from '../../Icon';
import { MessageBarType } from './MessageBar.types';
var getClassNames = classNamesFunction();
var MessageBarBase = /** @class */ (function (_super) {
    __extends(MessageBarBase, _super);
    function MessageBarBase(props) {
        var _a;
        var _this = _super.call(this, props) || this;
        _this.ICON_MAP = (_a = {},
            _a[MessageBarType.info] = 'Info',
            _a[MessageBarType.warning] = 'Info',
            _a[MessageBarType.error] = 'ErrorBadge',
            _a[MessageBarType.blocked] = 'Blocked2',
            _a[MessageBarType.severeWarning] = 'Warning',
            _a[MessageBarType.success] = 'Completed',
            _a);
        _this._getRegionProps = function () {
            var hasActions = !!_this._getActionsDiv() || !!_this._getDismissDiv();
            var regionProps = {
                'aria-describedby': _this.state.labelId,
                role: 'region',
            };
            return hasActions ? regionProps : {};
        };
        _this._onClick = function (ev) {
            _this.setState({ expandSingleLine: !_this.state.expandSingleLine });
        };
        initializeComponentRef(_this);
        _this.state = {
            labelId: getId('MessageBar'),
            // eslint-disable-next-line react/no-unused-state
            showContent: false,
            expandSingleLine: false,
        };
        return _this;
    }
    MessageBarBase.prototype.render = function () {
        var isMultiline = this.props.isMultiline;
        this._classNames = this._getClassNames();
        return isMultiline ? this._renderMultiLine() : this._renderSingleLine();
    };
    MessageBarBase.prototype._getActionsDiv = function () {
        if (this.props.actions) {
            return React.createElement("div", { className: this._classNames.actions }, this.props.actions);
        }
        return null;
    };
    MessageBarBase.prototype._getDismissDiv = function () {
        var _a = this.props, onDismiss = _a.onDismiss, dismissIconProps = _a.dismissIconProps;
        if (onDismiss) {
            return (React.createElement(IconButton, { disabled: false, className: this._classNames.dismissal, onClick: onDismiss, iconProps: dismissIconProps ? dismissIconProps : { iconName: 'Clear' }, title: this.props.dismissButtonAriaLabel, ariaLabel: this.props.dismissButtonAriaLabel }));
        }
        return null;
    };
    MessageBarBase.prototype._getDismissSingleLine = function () {
        if (this.props.onDismiss) {
            return React.createElement("div", { className: this._classNames.dismissSingleLine }, this._getDismissDiv());
        }
        return null;
    };
    MessageBarBase.prototype._getExpandSingleLine = function () {
        if (!this.props.actions && this.props.truncated) {
            return (React.createElement("div", { className: this._classNames.expandSingleLine },
                React.createElement(IconButton, { disabled: false, className: this._classNames.expand, onClick: this._onClick, iconProps: { iconName: this.state.expandSingleLine ? 'DoubleChevronUp' : 'DoubleChevronDown' }, ariaLabel: this.props.overflowButtonAriaLabel, "aria-expanded": this.state.expandSingleLine })));
        }
        return null;
    };
    MessageBarBase.prototype._getIconSpan = function () {
        var messageBarIconProps = this.props.messageBarIconProps;
        return (React.createElement("div", { className: this._classNames.iconContainer, "aria-hidden": true }, messageBarIconProps ? (React.createElement(Icon, __assign({}, messageBarIconProps, { className: css(this._classNames.icon, messageBarIconProps.className) }))) : (React.createElement(Icon, { iconName: this.ICON_MAP[this.props.messageBarType], className: this._classNames.icon }))));
    };
    MessageBarBase.prototype._renderMultiLine = function () {
        return (React.createElement("div", __assign({ className: this._classNames.root }, this._getRegionProps()),
            React.createElement("div", { className: this._classNames.content },
                this._getIconSpan(),
                this._renderInnerText(),
                this._getDismissDiv()),
            this._getActionsDiv()));
    };
    MessageBarBase.prototype._renderSingleLine = function () {
        return (React.createElement("div", __assign({ className: this._classNames.root }, this._getRegionProps()),
            React.createElement("div", { className: this._classNames.content },
                this._getIconSpan(),
                this._renderInnerText(),
                this._getExpandSingleLine(),
                this._getActionsDiv(),
                this._getDismissSingleLine())));
    };
    MessageBarBase.prototype._renderInnerText = function () {
        var nativeProps = getNativeProps(this.props, htmlElementProperties, [
            'className',
        ]);
        return (React.createElement("div", { className: this._classNames.text, id: this.state.labelId, role: "status", "aria-live": this._getAnnouncementPriority() },
            React.createElement("span", __assign({ className: this._classNames.innerText }, nativeProps),
                React.createElement(DelayedRender, null,
                    React.createElement("span", null, this.props.children)))));
    };
    MessageBarBase.prototype._getClassNames = function () {
        var _a = this.props, theme = _a.theme, className = _a.className, messageBarType = _a.messageBarType, onDismiss = _a.onDismiss, actions = _a.actions, truncated = _a.truncated, isMultiline = _a.isMultiline;
        var expandSingleLine = this.state.expandSingleLine;
        return getClassNames(this.props.styles, {
            theme: theme,
            messageBarType: messageBarType || MessageBarType.info,
            onDismiss: onDismiss !== undefined,
            actions: actions !== undefined,
            truncated: truncated,
            isMultiline: isMultiline,
            expandSingleLine: expandSingleLine,
            className: className,
        });
    };
    MessageBarBase.prototype._getAnnouncementPriority = function () {
        switch (this.props.messageBarType) {
            case MessageBarType.blocked:
            case MessageBarType.error:
            case MessageBarType.severeWarning:
                return 'assertive';
        }
        return 'polite';
    };
    MessageBarBase.defaultProps = {
        messageBarType: MessageBarType.info,
        onDismiss: undefined,
        isMultiline: true,
    };
    return MessageBarBase;
}(React.Component));
export { MessageBarBase };
//# sourceMappingURL=MessageBar.base.js.map