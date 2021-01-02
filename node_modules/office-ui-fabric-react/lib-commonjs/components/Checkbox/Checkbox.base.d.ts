import * as React from 'react';
import { ICheckbox, ICheckboxProps } from './Checkbox.types';
export interface ICheckboxState {
    /** Is true when Uncontrolled control is checked. */
    isChecked?: boolean;
    isIndeterminate?: boolean;
}
export declare class CheckboxBase extends React.Component<ICheckboxProps, ICheckboxState> implements ICheckbox {
    static defaultProps: ICheckboxProps;
    private _checkBox;
    private _id;
    private _classNames;
    static getDerivedStateFromProps(nextProps: Readonly<ICheckboxProps>, prevState: Readonly<ICheckboxState>): ICheckboxState | null;
    /**
     * Initialize a new instance of the Checkbox
     * @param props - Props for the component
     * @param context - Context or initial state for the base component.
     */
    constructor(props: ICheckboxProps, context?: any);
    /**
     * Render the Checkbox based on passed props
     */
    render(): JSX.Element;
    readonly indeterminate: boolean;
    readonly checked: boolean;
    focus(): void;
    private _renderContent;
    private _onFocus;
    private _onBlur;
    private _onChange;
    private _onRenderLabel;
}
