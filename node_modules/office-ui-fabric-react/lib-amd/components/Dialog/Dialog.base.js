define(["require", "exports", "tslib", "react", "../../Utilities", "./DialogContent.types", "../../Modal", "../../utilities/decorators/withResponsiveMode", "./DialogContent"], function (require, exports, tslib_1, React, Utilities_1, DialogContent_types_1, Modal_1, withResponsiveMode_1, DialogContent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    var DefaultModalProps = {
        isDarkOverlay: false,
        isBlocking: false,
        className: '',
        containerClassName: '',
        topOffsetFixed: false,
    };
    var DefaultDialogContentProps = {
        type: DialogContent_types_1.DialogType.normal,
        className: '',
        topButtonsProps: [],
    };
    var DialogBase = /** @class */ (function (_super) {
        tslib_1.__extends(DialogBase, _super);
        function DialogBase(props) {
            var _this = _super.call(this, props) || this;
            _this._getSubTextId = function () {
                // eslint-disable-next-line deprecation/deprecation
                var _a = _this.props, ariaDescribedById = _a.ariaDescribedById, modalProps = _a.modalProps, dialogContentProps = _a.dialogContentProps, subText = _a.subText;
                var id = (modalProps && modalProps.subtitleAriaId) || ariaDescribedById;
                if (!id) {
                    id = ((dialogContentProps && dialogContentProps.subText) || subText) && _this._defaultSubTextId;
                }
                return id;
            };
            _this._getTitleTextId = function () {
                // eslint-disable-next-line deprecation/deprecation
                var _a = _this.props, ariaLabelledById = _a.ariaLabelledById, modalProps = _a.modalProps, dialogContentProps = _a.dialogContentProps, title = _a.title;
                var id = (modalProps && modalProps.titleAriaId) || ariaLabelledById;
                if (!id) {
                    id = ((dialogContentProps && dialogContentProps.title) || title) && _this._defaultTitleTextId;
                }
                return id;
            };
            _this._id = Utilities_1.getId('Dialog');
            _this._defaultTitleTextId = _this._id + '-title';
            _this._defaultSubTextId = _this._id + '-subText';
            
            return _this;
        }
        DialogBase.prototype.render = function () {
            var _a, _b;
            var _c = this.props, 
            /* eslint-disable deprecation/deprecation */
            className = _c.className, containerClassName = _c.containerClassName, contentClassName = _c.contentClassName, elementToFocusOnDismiss = _c.elementToFocusOnDismiss, firstFocusableSelector = _c.firstFocusableSelector, forceFocusInsideTrap = _c.forceFocusInsideTrap, styles = _c.styles, hidden = _c.hidden, ignoreExternalFocusing = _c.ignoreExternalFocusing, isBlocking = _c.isBlocking, isClickableOutsideFocusTrap = _c.isClickableOutsideFocusTrap, isDarkOverlay = _c.isDarkOverlay, isOpen = _c.isOpen, onDismiss = _c.onDismiss, onDismissed = _c.onDismissed, onLayerDidMount = _c.onLayerDidMount, responsiveMode = _c.responsiveMode, subText = _c.subText, theme = _c.theme, title = _c.title, topButtonsProps = _c.topButtonsProps, type = _c.type, 
            /* eslint-enable deprecation/deprecation */
            minWidth = _c.minWidth, maxWidth = _c.maxWidth, modalProps = _c.modalProps;
            var mergedLayerProps = tslib_1.__assign({}, (modalProps ? modalProps.layerProps : { onLayerDidMount: onLayerDidMount }));
            if (onLayerDidMount && !mergedLayerProps.onLayerDidMount) {
                mergedLayerProps.onLayerDidMount = onLayerDidMount;
            }
            var dialogDraggableClassName;
            var dragOptions;
            // if we are draggable, make sure we are using the correct
            // draggable classname and selectors
            if (modalProps && modalProps.dragOptions && !modalProps.dragOptions.dragHandleSelector) {
                dialogDraggableClassName = 'ms-Dialog-draggable-header';
                dragOptions = tslib_1.__assign(tslib_1.__assign({}, modalProps.dragOptions), { dragHandleSelector: "." + dialogDraggableClassName });
            }
            else {
                dragOptions = modalProps && modalProps.dragOptions;
            }
            var mergedModalProps = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, DefaultModalProps), { className: className,
                containerClassName: containerClassName,
                isBlocking: isBlocking,
                isDarkOverlay: isDarkOverlay,
                onDismissed: onDismissed }), modalProps), { layerProps: mergedLayerProps, dragOptions: dragOptions });
            var dialogContentProps = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({ className: contentClassName, subText: subText,
                title: title,
                topButtonsProps: topButtonsProps,
                type: type }, DefaultDialogContentProps), this.props.dialogContentProps), { draggableHeaderClassName: dialogDraggableClassName, titleProps: tslib_1.__assign({ 
                    // eslint-disable-next-line deprecation/deprecation
                    id: ((_a = this.props.dialogContentProps) === null || _a === void 0 ? void 0 : _a.titleId) || this._defaultTitleTextId }, (_b = this.props.dialogContentProps) === null || _b === void 0 ? void 0 : _b.titleProps) });
            var classNames = getClassNames(styles, {
                theme: theme,
                className: mergedModalProps.className,
                containerClassName: mergedModalProps.containerClassName,
                hidden: hidden,
                dialogDefaultMinWidth: minWidth,
                dialogDefaultMaxWidth: maxWidth,
            });
            return (React.createElement(Modal_1.Modal, tslib_1.__assign({ elementToFocusOnDismiss: elementToFocusOnDismiss, firstFocusableSelector: firstFocusableSelector, forceFocusInsideTrap: forceFocusInsideTrap, ignoreExternalFocusing: ignoreExternalFocusing, isClickableOutsideFocusTrap: isClickableOutsideFocusTrap, onDismissed: mergedModalProps.onDismissed, responsiveMode: responsiveMode }, mergedModalProps, { isDarkOverlay: mergedModalProps.isDarkOverlay, isBlocking: mergedModalProps.isBlocking, isOpen: isOpen !== undefined ? isOpen : !hidden, className: classNames.root, containerClassName: classNames.main, onDismiss: onDismiss ? onDismiss : mergedModalProps.onDismiss, subtitleAriaId: this._getSubTextId(), titleAriaId: this._getTitleTextId() }),
                React.createElement(DialogContent_1.DialogContent, tslib_1.__assign({ subTextId: this._defaultSubTextId, title: dialogContentProps.title, subText: dialogContentProps.subText, showCloseButton: mergedModalProps.isBlocking, topButtonsProps: dialogContentProps.topButtonsProps, type: dialogContentProps.type, onDismiss: onDismiss ? onDismiss : dialogContentProps.onDismiss, className: dialogContentProps.className }, dialogContentProps), this.props.children)));
        };
        DialogBase.defaultProps = {
            hidden: true,
        };
        DialogBase = tslib_1.__decorate([
            withResponsiveMode_1.withResponsiveMode
        ], DialogBase);
        return DialogBase;
    }(React.Component));
    exports.DialogBase = DialogBase;
});
//# sourceMappingURL=Dialog.base.js.map