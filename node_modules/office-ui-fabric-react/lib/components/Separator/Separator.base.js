import * as React from 'react';
import { classNamesFunction } from '../../Utilities';
var getClassNames = classNamesFunction();
export var SeparatorBase = function (props) {
    var styles = props.styles, theme = props.theme, className = props.className, vertical = props.vertical, alignContent = props.alignContent;
    var _classNames = getClassNames(styles, {
        theme: theme,
        className: className,
        alignContent: alignContent,
        vertical: vertical,
    });
    return (React.createElement("div", { className: _classNames.root },
        React.createElement("div", { className: _classNames.content, role: "separator", "aria-orientation": vertical ? 'vertical' : 'horizontal' }, props.children)));
};
//# sourceMappingURL=Separator.base.js.map