import * as React from 'react';
import { ISearchBoxProps } from './SearchBox.types';
export interface ISearchBoxState {
    value?: string;
    hasFocus?: boolean;
}
export declare class SearchBoxBase extends React.Component<ISearchBoxProps, ISearchBoxState> {
    static defaultProps: Pick<ISearchBoxProps, 'disableAnimation' | 'clearButtonProps'>;
    private _rootElement;
    private _inputElement;
    private _latestValue;
    private _fallbackId;
    constructor(props: ISearchBoxProps);
    UNSAFE_componentWillReceiveProps(newProps: ISearchBoxProps): void;
    render(): JSX.Element;
    /**
     * Sets focus to the search box input field
     */
    focus(): void;
    /**
     * Returns whether or not the SearchBox has focus
     */
    hasFocus(): boolean;
    private _onClear;
    private _onClickFocus;
    private _onFocusCapture;
    private _onClearClick;
    private _onKeyDown;
    private _onBlur;
    private _onInputChange;
    private _callOnChange;
}
