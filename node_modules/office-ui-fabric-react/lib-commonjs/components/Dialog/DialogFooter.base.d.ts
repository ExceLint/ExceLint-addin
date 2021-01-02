import * as React from 'react';
import { IDialogFooterProps } from './DialogFooter.types';
export declare class DialogFooterBase extends React.Component<IDialogFooterProps, {}> {
    private _classNames;
    constructor(props: IDialogFooterProps);
    render(): JSX.Element;
    private _renderChildrenAsActions;
}
