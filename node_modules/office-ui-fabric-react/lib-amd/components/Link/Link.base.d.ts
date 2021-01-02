import * as React from 'react';
import { ILink, ILinkProps } from './Link.types';
export declare class LinkBase extends React.Component<ILinkProps, {}> implements ILink {
    private _link;
    constructor(props: ILinkProps);
    render(): JSX.Element;
    focus(): void;
    private _renderContent;
    private _onClick;
    private _adjustPropsForRootType;
    private _getRootType;
}
