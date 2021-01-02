import { __assign, __extends } from "tslib";
import * as React from 'react';
import { Customizer, getNativeProps, divProperties, classNamesFunction, getDocument, memoizeFunction, getRTL, FocusRects, } from '../../Utilities';
import { createTheme } from '../../Styling';
var getClassNames = classNamesFunction();
var getFabricTheme = memoizeFunction(function (theme, isRTL) { return createTheme(__assign(__assign({}, theme), { rtl: isRTL })); });
var getDir = function (theme, dir) {
    var contextDir = getRTL(theme) ? 'rtl' : 'ltr';
    var pageDir = getRTL() ? 'rtl' : 'ltr';
    var componentDir = dir ? dir : contextDir;
    return {
        // If Fabric dir !== contextDir
        // Or If contextDir !== pageDir
        // Then we need to set dir of the Fabric root
        rootDir: componentDir !== contextDir || componentDir !== pageDir ? componentDir : dir,
        // If dir !== contextDir || pageDir
        // then set contextual theme around content
        needsTheme: componentDir !== contextDir,
    };
};
var FabricBase = /** @class */ (function (_super) {
    __extends(FabricBase, _super);
    function FabricBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._rootElement = React.createRef();
        _this._removeClassNameFromBody = undefined;
        return _this;
    }
    FabricBase.prototype.render = function () {
        var _a = this.props, _b = _a.as, Root = _b === void 0 ? 'div' : _b, theme = _a.theme, dir = _a.dir;
        var classNames = this._getClassNames();
        var divProps = getNativeProps(this.props, divProperties, ['dir']);
        var _c = getDir(theme, dir), rootDir = _c.rootDir, needsTheme = _c.needsTheme;
        var renderedContent = React.createElement(Root, __assign({ dir: rootDir }, divProps, { className: classNames.root, ref: this._rootElement }));
        if (needsTheme) {
            renderedContent = (React.createElement(Customizer, { settings: { theme: getFabricTheme(theme, dir === 'rtl') } }, renderedContent));
        }
        return (React.createElement(React.Fragment, null,
            renderedContent,
            React.createElement(FocusRects, { rootRef: this._rootElement })));
    };
    FabricBase.prototype.componentDidMount = function () {
        this._addClassNameToBody();
    };
    FabricBase.prototype.componentWillUnmount = function () {
        if (this._removeClassNameFromBody) {
            this._removeClassNameFromBody();
        }
    };
    FabricBase.prototype._getClassNames = function () {
        var _a = this.props, className = _a.className, theme = _a.theme, applyTheme = _a.applyTheme, styles = _a.styles;
        var classNames = getClassNames(styles, {
            theme: theme,
            applyTheme: applyTheme,
            className: className,
        });
        return classNames;
    };
    FabricBase.prototype._addClassNameToBody = function () {
        if (this.props.applyThemeToBody) {
            var classNames_1 = this._getClassNames();
            var currentDoc_1 = getDocument(this._rootElement.current);
            if (currentDoc_1) {
                currentDoc_1.body.classList.add(classNames_1.bodyThemed);
                this._removeClassNameFromBody = function () {
                    currentDoc_1.body.classList.remove(classNames_1.bodyThemed);
                };
            }
        }
    };
    return FabricBase;
}(React.Component));
export { FabricBase };
//# sourceMappingURL=Fabric.base.js.map