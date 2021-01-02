define(["require", "exports", "../../Styling"], function (require, exports, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.animationDuration = Styling_1.AnimationVariables.durationValue2;
    var globalClassNames = {
        root: 'ms-Modal',
        main: 'ms-Dialog-main',
        scrollableContent: 'ms-Modal-scrollableContent',
        isOpen: 'is-open',
        layer: 'ms-Modal-Layer',
    };
    exports.getStyles = function (props) {
        var _a;
        var className = props.className, containerClassName = props.containerClassName, scrollableContentClassName = props.scrollableContentClassName, isOpen = props.isOpen, isVisible = props.isVisible, hasBeenOpened = props.hasBeenOpened, modalRectangleTop = props.modalRectangleTop, theme = props.theme, topOffsetFixed = props.topOffsetFixed, isModeless = props.isModeless, layerClassName = props.layerClassName, isDefaultDragHandle = props.isDefaultDragHandle;
        var palette = theme.palette, effects = theme.effects, fonts = theme.fonts;
        var classNames = Styling_1.getGlobalClassNames(globalClassNames, theme);
        return {
            root: [
                classNames.root,
                fonts.medium,
                {
                    backgroundColor: 'transparent',
                    position: isModeless ? 'absolute' : 'fixed',
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: "opacity " + exports.animationDuration,
                },
                topOffsetFixed &&
                    hasBeenOpened && {
                    alignItems: 'flex-start',
                },
                isOpen && classNames.isOpen,
                isVisible && {
                    opacity: 1,
                    pointerEvents: 'auto',
                },
                className,
            ],
            main: [
                classNames.main,
                {
                    boxShadow: effects.elevation64,
                    borderRadius: effects.roundedCorner2,
                    backgroundColor: palette.white,
                    boxSizing: 'border-box',
                    position: 'relative',
                    textAlign: 'left',
                    outline: '3px solid transparent',
                    maxHeight: 'calc(100% - 32px)',
                    maxWidth: 'calc(100% - 32px)',
                    minHeight: '176px',
                    minWidth: '288px',
                    overflowY: 'auto',
                    zIndex: isModeless ? Styling_1.ZIndexes.Layer : undefined,
                },
                topOffsetFixed &&
                    hasBeenOpened && {
                    top: modalRectangleTop,
                },
                isDefaultDragHandle && {
                    cursor: 'move',
                },
                containerClassName,
            ],
            scrollableContent: [
                classNames.scrollableContent,
                {
                    overflowY: 'auto',
                    flexGrow: 1,
                    maxHeight: '100vh',
                    selectors: (_a = {},
                        _a['@supports (-webkit-overflow-scrolling: touch)'] = {
                            maxHeight: window.innerHeight,
                        },
                        _a),
                },
                scrollableContentClassName,
            ],
            layer: isModeless && [
                layerClassName,
                classNames.layer,
                {
                    position: 'static',
                    width: 'unset',
                    height: 'unset',
                },
            ],
            keyboardMoveIconContainer: {
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                padding: '3px 0px',
            },
            keyboardMoveIcon: {
                // eslint-disable-next-line deprecation/deprecation
                fontSize: fonts.xLargePlus.fontSize,
                width: '24px',
            },
        };
    };
});
//# sourceMappingURL=Modal.styles.js.map