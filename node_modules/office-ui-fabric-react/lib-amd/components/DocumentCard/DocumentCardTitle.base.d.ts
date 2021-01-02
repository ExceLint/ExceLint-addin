import * as React from 'react';
import { IDocumentCardTitleProps } from './DocumentCardTitle.types';
export interface IDocumentCardTitleState {
    truncatedTitleFirstPiece?: string;
    truncatedTitleSecondPiece?: string;
    clientWidth?: number;
    previousTitle: string;
    /**
     * In measuring, it will render a same style text with whiteSpace: 'nowrap', to get overflow rate.
     * So that the logic can predict truncated text well.
     */
    needMeasurement: boolean;
}
/**
 * {@docCategory DocumentCard}
 */
export declare class DocumentCardTitleBase extends React.Component<IDocumentCardTitleProps, IDocumentCardTitleState> {
    private _titleElement;
    private _measureTitleElement;
    private _titleTruncationTimer;
    private _classNames;
    private _async;
    private _events;
    constructor(props: IDocumentCardTitleProps);
    componentDidUpdate(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    private _truncateTitle;
    private _truncateWhenInAnimation;
    private _shrinkTitle;
    private _updateTruncation;
}
