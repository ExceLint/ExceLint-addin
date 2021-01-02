import * as React from 'react';
import { IDocumentCardPreviewProps } from './DocumentCardPreview.types';
/**
 * {@docCategory DocumentCard}
 */
export declare class DocumentCardPreviewBase extends React.Component<IDocumentCardPreviewProps, any> {
    private _classNames;
    constructor(props: IDocumentCardPreviewProps);
    render(): JSX.Element;
    private _renderPreviewImage;
    private _renderPreviewList;
}
