import * as React from 'react';
import { IShimmerProps } from './Shimmer.types';
export interface IShimmerState {
    /**
     * Flag for knowing when to remove the shimmerWrapper from the DOM.
     */
    contentLoaded?: boolean;
}
/**
 * {@docCategory Shimmer}
 */
export declare class ShimmerBase extends React.Component<IShimmerProps, IShimmerState> {
    static defaultProps: IShimmerProps;
    private _classNames;
    private _lastTimeoutId;
    private _async;
    constructor(props: IShimmerProps);
    componentDidUpdate(prevProps: IShimmerProps): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
