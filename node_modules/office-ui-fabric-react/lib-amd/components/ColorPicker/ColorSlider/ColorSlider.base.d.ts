import * as React from 'react';
import { IColorSliderProps, IColorSlider } from './ColorSlider.types';
export interface IColorSliderState {
    currentValue: number;
}
/**
 * {@docCategory ColorPicker}
 */
export declare class ColorSliderBase extends React.Component<IColorSliderProps, IColorSliderState> implements IColorSlider {
    static defaultProps: Partial<IColorSliderProps>;
    private _disposables;
    private _root;
    constructor(props: IColorSliderProps);
    readonly value: number;
    componentDidUpdate(prevProps: Readonly<IColorSliderProps>, prevState: Readonly<IColorSliderState>): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    private readonly _type;
    private readonly _maxValue;
    private _onKeyDown;
    private _onMouseDown;
    private _onMouseMove;
    private _disposeListeners;
    private _updateValue;
}
