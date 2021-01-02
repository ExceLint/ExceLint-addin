import * as React from 'react';
import { IToggleProps, IToggle } from './Toggle.types';
export interface IToggleState {
    checked: boolean;
}
export declare class ToggleBase extends React.Component<IToggleProps, IToggleState> implements IToggle {
    private _id;
    private _toggleButton;
    static getDerivedStateFromProps(nextProps: Readonly<IToggleProps>, prevState: Readonly<IToggleState>): Partial<IToggleState> | null;
    constructor(props: IToggleProps);
    /**
     * Gets the current checked state of the toggle.
     */
    readonly checked: boolean;
    render(): JSX.Element;
    focus(): void;
    private _onClick;
    private _noop;
}
