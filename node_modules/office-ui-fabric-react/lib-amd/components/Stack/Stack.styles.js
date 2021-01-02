define(["require", "exports", "tslib", "./StackUtils", "../../Styling"], function (require, exports, tslib_1, StackUtils_1, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var nameMap = {
        start: 'flex-start',
        end: 'flex-end',
    };
    var GlobalClassNames = {
        root: 'ms-Stack',
        inner: 'ms-Stack-inner',
    };
    exports.styles = function (props, theme, tokens) {
        var _a, _b, _c, _d, _e, _f, _g;
        var verticalFill = props.verticalFill, horizontal = props.horizontal, reversed = props.reversed, grow = props.grow, wrap = props.wrap, horizontalAlign = props.horizontalAlign, verticalAlign = props.verticalAlign, disableShrink = props.disableShrink, className = props.className;
        var classNames = Styling_1.getGlobalClassNames(GlobalClassNames, theme);
        /* eslint-disable deprecation/deprecation */
        var childrenGap = tokens && tokens.childrenGap ? tokens.childrenGap : props.gap;
        var maxHeight = tokens && tokens.maxHeight ? tokens.maxHeight : props.maxHeight;
        var maxWidth = tokens && tokens.maxWidth ? tokens.maxWidth : props.maxWidth;
        var padding = tokens && tokens.padding ? tokens.padding : props.padding;
        /* eslint-enable deprecation/deprecation */
        var _h = StackUtils_1.parseGap(childrenGap, theme), rowGap = _h.rowGap, columnGap = _h.columnGap;
        var horizontalMargin = "" + -0.5 * columnGap.value + columnGap.unit;
        var verticalMargin = "" + -0.5 * rowGap.value + rowGap.unit;
        // styles to be applied to all direct children regardless of wrap or direction
        var childStyles = {
            textOverflow: 'ellipsis',
        };
        // selectors to be applied regardless of wrap or direction
        var commonSelectors = {
            // flexShrink styles are applied by the StackItem
            '> *:not(.ms-StackItem)': {
                flexShrink: disableShrink ? 0 : 1,
            },
        };
        if (wrap) {
            return {
                root: [
                    classNames.root,
                    {
                        flexWrap: 'wrap',
                        maxWidth: maxWidth,
                        maxHeight: maxHeight,
                        width: 'auto',
                        overflow: 'visible',
                        height: '100%',
                    },
                    horizontalAlign && (_a = {},
                        _a[horizontal ? 'justifyContent' : 'alignItems'] = nameMap[horizontalAlign] || horizontalAlign,
                        _a),
                    verticalAlign && (_b = {},
                        _b[horizontal ? 'alignItems' : 'justifyContent'] = nameMap[verticalAlign] || verticalAlign,
                        _b),
                    className,
                    {
                        // not allowed to be overridden by className
                        // since this is necessary in order to prevent collapsing margins
                        display: 'flex',
                    },
                    horizontal && {
                        height: verticalFill ? '100%' : 'auto',
                    },
                ],
                inner: [
                    classNames.inner,
                    {
                        display: 'flex',
                        flexWrap: 'wrap',
                        marginLeft: horizontalMargin,
                        marginRight: horizontalMargin,
                        marginTop: verticalMargin,
                        marginBottom: verticalMargin,
                        overflow: 'visible',
                        boxSizing: 'border-box',
                        padding: StackUtils_1.parsePadding(padding, theme),
                        // avoid unnecessary calc() calls if horizontal gap is 0
                        width: columnGap.value === 0 ? '100%' : "calc(100% + " + columnGap.value + columnGap.unit + ")",
                        maxWidth: '100vw',
                        selectors: tslib_1.__assign({ '> *': tslib_1.__assign({ margin: "" + 0.5 * rowGap.value + rowGap.unit + " " + 0.5 * columnGap.value + columnGap.unit }, childStyles) }, commonSelectors),
                    },
                    horizontalAlign && (_c = {},
                        _c[horizontal ? 'justifyContent' : 'alignItems'] = nameMap[horizontalAlign] || horizontalAlign,
                        _c),
                    verticalAlign && (_d = {},
                        _d[horizontal ? 'alignItems' : 'justifyContent'] = nameMap[verticalAlign] || verticalAlign,
                        _d),
                    horizontal && {
                        flexDirection: reversed ? 'row-reverse' : 'row',
                        // avoid unnecessary calc() calls if vertical gap is 0
                        height: rowGap.value === 0 ? '100%' : "calc(100% + " + rowGap.value + rowGap.unit + ")",
                        selectors: {
                            '> *': {
                                maxWidth: columnGap.value === 0 ? '100%' : "calc(100% - " + columnGap.value + columnGap.unit + ")",
                            },
                        },
                    },
                    !horizontal && {
                        flexDirection: reversed ? 'column-reverse' : 'column',
                        height: "calc(100% + " + rowGap.value + rowGap.unit + ")",
                        selectors: {
                            '> *': {
                                maxHeight: rowGap.value === 0 ? '100%' : "calc(100% - " + rowGap.value + rowGap.unit + ")",
                            },
                        },
                    },
                ],
            };
        }
        return {
            root: [
                classNames.root,
                {
                    display: 'flex',
                    flexDirection: horizontal ? (reversed ? 'row-reverse' : 'row') : reversed ? 'column-reverse' : 'column',
                    flexWrap: 'nowrap',
                    width: 'auto',
                    height: verticalFill ? '100%' : 'auto',
                    maxWidth: maxWidth,
                    maxHeight: maxHeight,
                    padding: StackUtils_1.parsePadding(padding, theme),
                    boxSizing: 'border-box',
                    selectors: tslib_1.__assign((_e = { '> *': childStyles }, _e[reversed ? '> *:not(:last-child)' : '> *:not(:first-child)'] = [
                        horizontal && {
                            marginLeft: "" + columnGap.value + columnGap.unit,
                        },
                        !horizontal && {
                            marginTop: "" + rowGap.value + rowGap.unit,
                        },
                    ], _e), commonSelectors),
                },
                grow && {
                    flexGrow: grow === true ? 1 : grow,
                },
                horizontalAlign && (_f = {},
                    _f[horizontal ? 'justifyContent' : 'alignItems'] = nameMap[horizontalAlign] || horizontalAlign,
                    _f),
                verticalAlign && (_g = {},
                    _g[horizontal ? 'alignItems' : 'justifyContent'] = nameMap[verticalAlign] || verticalAlign,
                    _g),
                className,
            ],
        };
    };
});
//# sourceMappingURL=Stack.styles.js.map