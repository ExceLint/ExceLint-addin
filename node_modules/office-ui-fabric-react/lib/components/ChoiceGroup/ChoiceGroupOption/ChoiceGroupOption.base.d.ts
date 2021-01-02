import * as React from 'react';
import { IChoiceGroupOptionProps } from './ChoiceGroupOption.types';
/**
 * {@docCategory ChoiceGroup}
 */
export declare class ChoiceGroupOptionBase extends React.Component<IChoiceGroupOptionProps, {}> {
    static defaultProps: Partial<IChoiceGroupOptionProps>;
    private _classNames;
    constructor(props: IChoiceGroupOptionProps);
    render(): JSX.Element;
    private _onChange;
    private _onBlur;
    private _onFocus;
    private _onRenderField;
    private _onRenderLabel;
}
