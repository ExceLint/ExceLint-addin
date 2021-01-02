import * as React from 'react';
import { ITeachingBubbleProps } from './TeachingBubble.types';
export interface ITeachingBubbleState {
    isTeachingBubbleVisible?: boolean;
}
export declare class TeachingBubbleBase extends React.Component<ITeachingBubbleProps, ITeachingBubbleState> {
    static defaultProps: {
        /**
         * Default calloutProps is deprecated in favor of private `_defaultCalloutProps`.
         * Remove in next release.
         * @deprecated In favor of private `_defaultCalloutProps`.
         */
        calloutProps: {
            beakWidth: number;
            gapSpace: number;
            setInitialFocus: boolean;
            doNotLayer: boolean;
            directionalHint: 12;
        };
    };
    rootElement: React.RefObject<HTMLDivElement>;
    private _defaultCalloutProps;
    constructor(props: ITeachingBubbleProps);
    focus(): void;
    render(): JSX.Element;
}
