import * as React from 'react';
import { IFabricProps } from './Fabric.types';
export declare class FabricBase extends React.Component<IFabricProps> {
    private _rootElement;
    private _removeClassNameFromBody?;
    render(): JSX.Element;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private _getClassNames;
    private _addClassNameToBody;
}
