import * as React from 'react';
import { IPopupProps } from './Popup.types';
export interface IPopupState {
    needsVerticalScrollBar?: boolean;
}
/**
 * This adds accessibility to Dialog and Panel controls
 */
export declare class Popup extends React.Component<IPopupProps, IPopupState> {
    static defaultProps: IPopupProps;
    _root: React.RefObject<HTMLDivElement>;
    private _disposables;
    private _originalFocusedElement;
    private _containsFocus;
    private _async;
    constructor(props: IPopupProps);
    UNSAFE_componentWillMount(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    private _onKeyDown;
    private _updateScrollBarAsync;
    private _getScrollBar;
    private _onFocus;
    private _onBlur;
}
