import * as React from 'react';
import { ITeachingBubbleProps } from './TeachingBubble.types';
import { ITeachingBubbleState } from './TeachingBubble.base';
export declare class TeachingBubbleContentBase extends React.Component<ITeachingBubbleProps, ITeachingBubbleState> {
    rootElement: React.RefObject<HTMLDivElement>;
    constructor(props: ITeachingBubbleProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    focus(): void;
    render(): JSX.Element;
    private _onKeyDown;
}
