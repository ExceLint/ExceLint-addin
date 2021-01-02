import * as React from 'react';
import { IColorPickerGridCellProps } from './ColorPickerGridCell.types';
export declare class ColorPickerGridCellBase extends React.PureComponent<IColorPickerGridCellProps, {}> {
    static defaultProps: Partial<IColorPickerGridCellProps>;
    private _classNames;
    render(): JSX.Element;
    /**
     * Render the core of a color cell
     * @returns - Element representing the core of the item
     */
    private _onRenderColorOption;
    /**
     * Validate if the cell's color is white or not to apply whiteCell style
     * @param inputColor - The color of the current cell
     * @returns - Whether the cell's color is white or not.
     */
    private _isWhiteCell;
}
