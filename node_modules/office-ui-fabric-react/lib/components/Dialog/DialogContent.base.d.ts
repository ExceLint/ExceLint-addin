import * as React from 'react';
import { IDialogContentProps } from './DialogContent.types';
export declare class DialogContentBase extends React.Component<IDialogContentProps, {}> {
    static defaultProps: IDialogContentProps;
    constructor(props: IDialogContentProps);
    render(): JSX.Element;
    private _groupChildren;
}
