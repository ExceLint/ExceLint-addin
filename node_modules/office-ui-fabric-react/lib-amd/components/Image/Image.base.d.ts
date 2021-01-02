import * as React from 'react';
import { IImageProps, ImageLoadState } from './Image.types';
export interface IImageState {
    loadState?: ImageLoadState;
}
export declare class ImageBase extends React.Component<IImageProps, IImageState> {
    static defaultProps: {
        shouldFadeIn: boolean;
    };
    private static _svgRegex;
    private _coverStyle;
    private _imageElement;
    private _frameElement;
    constructor(props: IImageProps);
    UNSAFE_componentWillReceiveProps(nextProps: IImageProps): void;
    componentDidUpdate(prevProps: IImageProps, prevState: IImageState): void;
    render(): JSX.Element;
    private _onImageLoaded;
    private _checkImageLoaded;
    private _computeCoverStyle;
    private _onImageError;
}
