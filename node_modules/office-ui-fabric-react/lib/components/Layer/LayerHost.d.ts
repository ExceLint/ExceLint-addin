import * as React from 'react';
import { ILayerHostProps } from './LayerHost.types';
export declare class LayerHost extends React.Component<ILayerHostProps> {
    shouldComponentUpdate(): boolean;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
