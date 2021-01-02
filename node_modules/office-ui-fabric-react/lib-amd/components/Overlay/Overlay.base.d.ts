import * as React from 'react';
import { IOverlayProps } from './Overlay.types';
export declare class OverlayBase extends React.Component<IOverlayProps, {}> {
    private _allowTouchBodyScroll;
    constructor(props: IOverlayProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
