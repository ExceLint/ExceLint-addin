import * as React from 'react';
import { IPositioningContainerProps } from './PositioningContainer.types';
import { IPositionedData } from '../../../utilities/positioning';
export interface IPositioningContainerState {
    /**
     * Current set of calcualted positions for the outermost parent container.
     */
    positions?: IPositionedData;
    /**
     * Tracks the current height offset and updates during
     * the height animation when props.finalHeight is specified.
     */
    heightOffset?: number;
}
export declare class PositioningContainer extends React.Component<IPositioningContainerProps, IPositioningContainerState> implements PositioningContainer {
    static defaultProps: IPositioningContainerProps;
    private _didSetInitialFocus;
    /**
     * The primary positioned div.
     */
    private _positionedHost;
    private _contentHost;
    /**
     * Stores an instance of Window, used to check
     * for server side rendering and if focus was lost.
     */
    private _targetWindow;
    /**
     * The bounds used when determing if and where the
     * PositioningContainer should be placed.
     */
    private _positioningBounds;
    /**
     * The maximum height the PositioningContainer can grow to
     * without going being the window or target bounds
     */
    private _maxHeight;
    private _positionAttempts;
    private _target;
    private _setHeightOffsetTimer;
    private _async;
    private _events;
    constructor(props: IPositioningContainerProps);
    UNSAFE_componentWillMount(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    UNSAFE_componentWillUpdate(newProps: IPositioningContainerProps): void;
    componentWillUnmount(): void;
    render(): JSX.Element | null;
    /**
     * Deprecated, use `onResize` instead.
     * @deprecated Use `onResize` instead.
     */
    dismiss: (ev?: Event | React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => void;
    onResize: (ev?: Event | React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => void;
    protected _dismissOnScroll(ev: Event): void;
    protected _dismissOnLostFocus(ev: Event): void;
    protected _setInitialFocus: () => void;
    protected _onComponentDidMount: () => void;
    private _updateAsyncPosition;
    private _updatePosition;
    private _getBounds;
    /**
     * Return the maximum height the container can grow to
     * without going out of the specified bounds
     */
    private _getMaxHeight;
    private _arePositionsEqual;
    private _comparePositions;
    private _setTargetWindowAndElement;
    /**
     * Animates the height if finalHeight was given.
     */
    private _setHeightOffsetEveryFrame;
    private _getTarget;
}
