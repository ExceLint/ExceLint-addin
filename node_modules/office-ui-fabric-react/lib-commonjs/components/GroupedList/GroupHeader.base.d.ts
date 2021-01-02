import * as React from 'react';
import { IGroupHeaderProps } from './GroupHeader.types';
export interface IGroupHeaderState {
    isCollapsed: boolean;
    isLoadingVisible: boolean;
}
export declare class GroupHeaderBase extends React.Component<IGroupHeaderProps, IGroupHeaderState> {
    static defaultProps: IGroupHeaderProps;
    private _classNames;
    static getDerivedStateFromProps(nextProps: IGroupHeaderProps, previousState: IGroupHeaderState): IGroupHeaderState;
    constructor(props: IGroupHeaderProps);
    render(): JSX.Element | null;
    private _toggleCollapse;
    private _onKeyUp;
    private _onToggleClick;
    private _onToggleSelectGroupClick;
    private _onHeaderClick;
    private _defaultCheckboxRender;
    private _fastDefaultCheckboxRender;
    private _onRenderTitle;
}
