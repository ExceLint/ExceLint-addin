import * as React from 'react';
import { IChoiceGroup, IChoiceGroupOption, IChoiceGroupProps } from './ChoiceGroup.types';
export interface IChoiceGroupState {
    /**
     * Current selected option, for **internal use only**.
     * External users should access `IChoiceGroup.checkedOption` instead.
     */
    keyChecked?: string | number;
    /** Is set when the control has focus. */
    keyFocused?: string | number;
}
/**
 * {@docCategory ChoiceGroup}
 */
export declare class ChoiceGroupBase extends React.Component<IChoiceGroupProps, IChoiceGroupState> implements IChoiceGroup {
    private _id;
    private _labelId;
    private _focusCallbacks;
    private _changeCallbacks;
    constructor(props: IChoiceGroupProps);
    /**
     * Gets the current checked option.
     */
    readonly checkedOption: IChoiceGroupOption | undefined;
    componentDidUpdate(prevProps: IChoiceGroupProps, prevState: IChoiceGroupState): void;
    render(): JSX.Element;
    focus(): void;
    private _onFocus;
    private _onBlur;
    private _onChange;
    /**
     * Returns `selectedKey` if provided, or the key of the first option with the `checked` prop set.
     */
    private _getKeyChecked;
    private _getOptionId;
    private _getOptionLabelId;
}
