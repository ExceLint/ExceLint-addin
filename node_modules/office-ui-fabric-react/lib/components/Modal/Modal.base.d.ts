import * as React from 'react';
import { IModalProps, IModal } from './Modal.types';
export interface IDialogState {
    isOpen?: boolean;
    isVisible?: boolean;
    isVisibleClose?: boolean;
    id?: string;
    hasBeenOpened?: boolean;
    modalRectangleTop?: number;
    isModalMenuOpen?: boolean;
    isInKeyboardMoveMode?: boolean;
    x: number;
    y: number;
}
export declare class ModalBase extends React.Component<IModalProps, IDialogState> implements IModal {
    static defaultProps: IModalProps;
    private _onModalCloseTimer;
    private _focusTrapZone;
    private _scrollableContent;
    private _lastSetX;
    private _lastSetY;
    private _allowTouchBodyScroll;
    private _hasRegisteredKeyUp;
    private _async;
    private _events;
    private _minClampedPosition;
    private _maxClampedPosition;
    constructor(props: IModalProps);
    UNSAFE_componentWillReceiveProps(newProps: IModalProps): void;
    componentDidMount(): void;
    componentDidUpdate(prevProps: IModalProps, prevState: IDialogState): void;
    componentWillUnmount(): void;
    render(): JSX.Element | null;
    focus(): void;
    private _registerInitialModalPosition;
    /**
     * Clamps the position coordinates to the maximum/minimum value specified in props
     */
    private _getClampedPosition;
    private _getClampedPositionY;
    private _getClampedPositionX;
    private _allowScrollOnModal;
    private _onModalContextMenuClose;
    private _onModalClose;
    private _onDragStart;
    private _onDrag;
    private _onDragStop;
    private _onKeyUp;
    private _onKeyDown;
    private _getMoveDelta;
    private _onEnterKeyboardMoveMode;
    private _onExitKeyboardMoveMode;
    private _registerForKeyUp;
}
