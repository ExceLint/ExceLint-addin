import * as React from 'react';
import { IButtonGridCellProps } from './ButtonGridCell.types';
export declare class ButtonGridCell<T, P extends IButtonGridCellProps<T>> extends React.Component<P, {}> {
    static defaultProps: {
        disabled: boolean;
    };
    render(): JSX.Element;
    private _onClick;
    private _onMouseEnter;
    private _onMouseMove;
    private _onMouseLeave;
    private _onFocus;
}
/**
 * @deprecated - use ButtonGridCell instead
 */
export declare const GridCell: typeof ButtonGridCell;
