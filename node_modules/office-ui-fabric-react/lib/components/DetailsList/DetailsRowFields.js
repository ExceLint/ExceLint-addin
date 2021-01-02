import * as React from 'react';
import { css } from '../../Utilities';
import { DEFAULT_CELL_STYLE_PROPS } from './DetailsRow.styles';
var getCellText = function (item, column) {
    var value = item && column && column.fieldName ? item[column.fieldName] : '';
    if (value === null || value === undefined) {
        value = '';
    }
    if (typeof value === 'boolean') {
        return value.toString();
    }
    return value;
};
/**
 * Component for rendering a row's cells in a `DetailsList`.
 *
 * {@docCategory DetailsList}
 */
export var DetailsRowFields = function (props) {
    var columns = props.columns, columnStartIndex = props.columnStartIndex, rowClassNames = props.rowClassNames, _a = props.cellStyleProps, cellStyleProps = _a === void 0 ? DEFAULT_CELL_STYLE_PROPS : _a, item = props.item, itemIndex = props.itemIndex, onRenderItemColumn = props.onRenderItemColumn, getCellValueKey = props.getCellValueKey, cellsByColumn = props.cellsByColumn, enableUpdateAnimations = props.enableUpdateAnimations;
    var cellValueKeysRef = React.useRef();
    var cellValueKeys = cellValueKeysRef.current || (cellValueKeysRef.current = {});
    return (React.createElement("div", { className: rowClassNames.fields, "data-automationid": "DetailsRowFields", role: "presentation" }, columns.map(function (column, columnIndex) {
        var width = typeof column.calculatedWidth === 'undefined'
            ? 'auto'
            : column.calculatedWidth +
                cellStyleProps.cellLeftPadding +
                cellStyleProps.cellRightPadding +
                (column.isPadded ? cellStyleProps.cellExtraRightPadding : 0);
        var _a = column.onRender, onRender = _a === void 0 ? onRenderItemColumn : _a, _b = column.getValueKey, getValueKey = _b === void 0 ? getCellValueKey : _b;
        var cellContentsRender = cellsByColumn && column.key in cellsByColumn
            ? cellsByColumn[column.key]
            : onRender
                ? onRender(item, itemIndex, column)
                : getCellText(item, column);
        var previousValueKey = cellValueKeys[column.key];
        var cellValueKey = enableUpdateAnimations && getValueKey ? getValueKey(item, itemIndex, column) : undefined;
        var showAnimation = false;
        if (cellValueKey !== undefined && previousValueKey !== undefined && cellValueKey !== previousValueKey) {
            showAnimation = true;
        }
        cellValueKeys[column.key] = cellValueKey;
        // generate a key that auto-dirties when content changes, to force the container to re-render,
        // to trigger animation
        var key = "" + column.key + (cellValueKey !== undefined ? "-" + cellValueKey : '');
        return (React.createElement("div", { key: key, role: column.isRowHeader ? 'rowheader' : 'gridcell', "aria-readonly": true, "aria-colindex": columnIndex + columnStartIndex + 1, className: css(column.className, column.isMultiline && rowClassNames.isMultiline, column.isRowHeader && rowClassNames.isRowHeader, rowClassNames.cell, column.isPadded ? rowClassNames.cellPadded : rowClassNames.cellUnpadded, showAnimation && rowClassNames.cellAnimation), style: { width: width }, "data-automationid": "DetailsRowCell", "data-automation-key": column.key }, cellContentsRender));
    })));
};
//# sourceMappingURL=DetailsRowFields.js.map