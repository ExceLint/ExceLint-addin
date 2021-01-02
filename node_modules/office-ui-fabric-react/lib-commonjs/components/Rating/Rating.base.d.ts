import * as React from 'react';
import { IRatingProps } from './Rating.types';
export interface IRatingState {
    rating: number | null | undefined;
}
export declare class RatingBase extends React.Component<IRatingProps, IRatingState> {
    static defaultProps: IRatingProps;
    private _id;
    private _min;
    private _labelId;
    private _classNames;
    constructor(props: IRatingProps);
    render(): JSX.Element;
    private _getStarId;
    private _onFocus;
    private _getLabel;
    private _getInitialValue;
    private _getClampedRating;
    private _getRating;
    private _getFillingPercentage;
}
