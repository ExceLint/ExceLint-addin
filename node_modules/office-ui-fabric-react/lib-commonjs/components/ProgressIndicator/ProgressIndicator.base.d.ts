import * as React from 'react';
import { IProgressIndicatorProps } from './ProgressIndicator.types';
/**
 * ProgressIndicator with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/microsoft/fluentui/wiki/Styling)
 */
export declare class ProgressIndicatorBase extends React.Component<IProgressIndicatorProps, {}> {
    static defaultProps: {
        label: string;
        description: string;
        width: number;
    };
    render(): JSX.Element;
    private _onRenderProgress;
}
