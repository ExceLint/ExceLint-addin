define(["require", "exports", "tslib", "../../../Styling", "../../../Utilities"], function (require, exports, tslib_1, Styling_1, Utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getStyles = Utilities_1.memoizeFunction(function (theme, customStyles) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        var effects = theme.effects, palette = theme.palette, semanticColors = theme.semanticColors;
        var buttonHighContrastFocus = {
            left: -2,
            top: -2,
            bottom: -2,
            right: -2,
            border: 'none',
        };
        var splitButtonDividerBaseStyles = {
            position: 'absolute',
            width: 1,
            right: 31,
            top: 8,
            bottom: 8,
        };
        var splitButtonStyles = {
            splitButtonContainer: [
                Styling_1.getFocusStyle(theme, { highContrastStyle: buttonHighContrastFocus, inset: 2 }),
                {
                    display: 'inline-flex',
                    selectors: {
                        '.ms-Button--default': {
                            borderTopRightRadius: '0',
                            borderBottomRightRadius: '0',
                            borderRight: 'none',
                        },
                        '.ms-Button--primary': {
                            borderTopRightRadius: '0',
                            borderBottomRightRadius: '0',
                            border: 'none',
                            selectors: (_a = {},
                                _a[Styling_1.HighContrastSelector] = {
                                    color: 'WindowText',
                                    backgroundColor: 'Window',
                                    border: '1px solid WindowText',
                                    borderRightWidth: '0',
                                    MsHighContrastAdjust: 'none',
                                },
                                _a),
                        },
                        '.ms-Button--primary + .ms-Button': {
                            border: 'none',
                            selectors: (_b = {},
                                _b[Styling_1.HighContrastSelector] = {
                                    border: '1px solid WindowText',
                                    borderLeftWidth: '0',
                                },
                                _b),
                        },
                    },
                },
            ],
            splitButtonContainerHovered: {
                selectors: {
                    '.ms-Button--primary': {
                        selectors: (_c = {},
                            _c[Styling_1.HighContrastSelector] = {
                                color: 'Window',
                                backgroundColor: 'Highlight',
                            },
                            _c),
                    },
                    '.ms-Button.is-disabled': {
                        color: semanticColors.buttonTextDisabled,
                        selectors: (_d = {},
                            _d[Styling_1.HighContrastSelector] = {
                                color: 'GrayText',
                                borderColor: 'GrayText',
                                backgroundColor: 'Window',
                            },
                            _d),
                    },
                },
            },
            splitButtonContainerChecked: {
                selectors: {
                    '.ms-Button--primary': {
                        selectors: (_e = {},
                            _e[Styling_1.HighContrastSelector] = {
                                color: 'Window',
                                backgroundColor: 'WindowText',
                                MsHighContrastAdjust: 'none',
                            },
                            _e),
                    },
                },
            },
            splitButtonContainerCheckedHovered: {
                selectors: {
                    '.ms-Button--primary': {
                        selectors: (_f = {},
                            _f[Styling_1.HighContrastSelector] = {
                                color: 'Window',
                                backgroundColor: 'WindowText',
                                MsHighContrastAdjust: 'none',
                            },
                            _f),
                    },
                },
            },
            splitButtonContainerFocused: {
                outline: 'none!important',
            },
            splitButtonMenuButton: {
                padding: 6,
                height: 'auto',
                boxSizing: 'border-box',
                borderRadius: 0,
                borderTopRightRadius: effects.roundedCorner2,
                borderBottomRightRadius: effects.roundedCorner2,
                border: "1px solid " + palette.neutralSecondaryAlt,
                borderLeft: 'none',
                outline: 'transparent',
                userSelect: 'none',
                display: 'inline-block',
                textDecoration: 'none',
                textAlign: 'center',
                cursor: 'pointer',
                verticalAlign: 'top',
                width: 32,
                marginLeft: -1,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,
            },
            splitButtonDivider: tslib_1.__assign(tslib_1.__assign({}, splitButtonDividerBaseStyles), { selectors: (_g = {},
                    _g[Styling_1.HighContrastSelector] = {
                        backgroundColor: 'WindowText',
                    },
                    _g) }),
            splitButtonDividerDisabled: tslib_1.__assign(tslib_1.__assign({}, splitButtonDividerBaseStyles), { selectors: (_h = {},
                    _h[Styling_1.HighContrastSelector] = {
                        backgroundColor: 'GrayText',
                    },
                    _h) }),
            splitButtonMenuButtonDisabled: {
                pointerEvents: 'none',
                border: 'none',
                selectors: (_j = {
                        ':hover': {
                            cursor: 'default',
                        },
                        '.ms-Button--primary': {
                            selectors: (_k = {},
                                _k[Styling_1.HighContrastSelector] = {
                                    color: 'GrayText',
                                    borderColor: 'GrayText',
                                    backgroundColor: 'Window',
                                },
                                _k),
                        },
                        '.ms-Button-menuIcon': {
                            selectors: (_l = {},
                                _l[Styling_1.HighContrastSelector] = {
                                    color: 'GrayText',
                                },
                                _l),
                        }
                    },
                    _j[Styling_1.HighContrastSelector] = {
                        color: 'GrayText',
                        border: '1px solid GrayText',
                        backgroundColor: 'Window',
                    },
                    _j),
            },
            splitButtonFlexContainer: {
                display: 'flex',
                height: '100%',
                flexWrap: 'nowrap',
                justifyContent: 'center',
                alignItems: 'center',
            },
            splitButtonContainerDisabled: {
                outline: 'none',
                border: 'none',
                selectors: tslib_1.__assign((_m = {}, _m[Styling_1.HighContrastSelector] = {
                    color: 'GrayText',
                    borderColor: 'GrayText',
                    backgroundColor: 'Window',
                }, _m), Styling_1.getEdgeChromiumNoHighContrastAdjustSelector()),
            },
        };
        return Styling_1.concatStyleSets(splitButtonStyles, customStyles);
    });
});
//# sourceMappingURL=SplitButton.styles.js.map