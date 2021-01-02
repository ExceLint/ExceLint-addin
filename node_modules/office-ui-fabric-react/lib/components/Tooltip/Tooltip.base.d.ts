import * as React from 'react';
import { ITooltipProps } from './Tooltip.types';
export declare class TooltipBase extends React.Component<ITooltipProps, any> {
    static defaultProps: Partial<ITooltipProps>;
    private _classNames;
    render(): JSX.Element;
    private _onRenderContent;
}
