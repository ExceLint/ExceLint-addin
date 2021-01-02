import * as PropTypes from 'prop-types';
import * as React from 'react';
import { IScrollablePaneContext } from '../ScrollablePane/ScrollablePane.types';
import { IStickyProps } from './Sticky.types';
export interface IStickyState {
    isStickyTop: boolean;
    isStickyBottom: boolean;
    distanceFromTop?: number;
}
export interface IStickyContext {
    scrollablePane: PropTypes.Requireable<object>;
}
export declare class Sticky extends React.Component<IStickyProps, IStickyState> {
    static defaultProps: IStickyProps;
    static contextType: React.Context<IScrollablePaneContext>;
    private _root;
    private _stickyContentTop;
    private _stickyContentBottom;
    private _nonStickyContent;
    private _placeHolder;
    private _activeElement;
    constructor(props: IStickyProps);
    readonly root: HTMLDivElement | null;
    readonly placeholder: HTMLDivElement | null;
    readonly stickyContentTop: HTMLDivElement | null;
    readonly stickyContentBottom: HTMLDivElement | null;
    readonly nonStickyContent: HTMLDivElement | null;
    readonly canStickyTop: boolean;
    readonly canStickyBottom: boolean;
    syncScroll: (container: HTMLElement) => void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: IStickyProps, prevState: IStickyState): void;
    shouldComponentUpdate(nextProps: IStickyProps, nextState: IStickyState): boolean;
    render(): JSX.Element;
    addSticky(stickyContent: HTMLDivElement): void;
    resetSticky(): void;
    setDistanceFromTop(container: HTMLDivElement): void;
    private _getContext;
    private _getContentStyles;
    private _getStickyPlaceholderHeight;
    private _getNonStickyPlaceholderHeightAndWidth;
    private _onScrollEvent;
    private _getStickyDistanceFromTop;
    private _getStickyDistanceFromTopForFooter;
    private _getNonStickyDistanceFromTop;
    private _getBackground;
}
