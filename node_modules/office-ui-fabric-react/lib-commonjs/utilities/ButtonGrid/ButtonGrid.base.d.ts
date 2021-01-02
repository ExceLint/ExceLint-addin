import * as React from 'react';
import { IButtonGrid, IButtonGridProps } from './ButtonGrid.types';
export declare class ButtonGridBase extends React.Component<IButtonGridProps, {}> implements IButtonGrid {
    private _id;
    constructor(props: IButtonGridProps);
    render(): JSX.Element;
}
/**
 * @deprecated - use ButtonGridBase instead
 */
export declare const GridBase: typeof ButtonGridBase;
