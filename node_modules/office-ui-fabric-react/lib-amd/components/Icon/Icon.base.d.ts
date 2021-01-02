import * as React from 'react';
import { IIconProps } from './Icon.types';
export interface IIconState {
    imageLoadError: boolean;
}
export declare class IconBase extends React.Component<IIconProps, IIconState> {
    constructor(props: IIconProps);
    render(): JSX.Element;
    private _onImageLoadingStateChange;
}
