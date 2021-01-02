import * as React from 'react';
import { ILayerProps } from './Layer.types';
export declare type ILayerBaseState = {
    hostId?: string;
    layerElement?: HTMLElement;
};
export declare class LayerBase extends React.Component<ILayerProps, ILayerBaseState> {
    static defaultProps: ILayerProps;
    private _rootRef;
    constructor(props: ILayerProps);
    componentDidMount(): void;
    render(): React.ReactNode;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    private _createLayerElement;
    private _removeLayerElement;
    private _getClassNames;
    private _getHost;
}
