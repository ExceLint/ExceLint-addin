import * as React from 'react';
import { IOverflowSet, IOverflowSetProps } from './OverflowSet.types';
export declare class OverflowSetBase extends React.Component<IOverflowSetProps, {}> implements IOverflowSet {
    private _focusZone;
    private _persistedKeytips;
    private _keytipManager;
    private _divContainer;
    private _classNames;
    constructor(props: IOverflowSetProps);
    render(): JSX.Element;
    /**
     * Sets focus to the first tabbable item in the OverflowSet.
     * @param forceIntoFirstElement - If true, focus will be forced into the first element,
     * even if focus is already in theOverflowSet
     * @returns True if focus could be set to an active element, false if no operation was taken.
     */
    focus(forceIntoFirstElement?: boolean): boolean;
    /**
     * Sets focus to a specific child element within the OverflowSet.
     * @param childElement - The child element within the zone to focus.
     * @returns True if focus could be set to an active element, false if no operation was taken.
     */
    focusElement(childElement?: HTMLElement): boolean;
    componentDidMount(): void;
    componentWillUnmount(): void;
    UNSAFE_componentWillUpdate(): void;
    componentDidUpdate(): void;
    private _registerPersistedKeytips;
    private _unregisterPersistedKeytips;
    private _onRenderItems;
    private _onRenderOverflowButtonWrapper;
    /**
     * Gets the subMenu for an overflow item
     * Checks if itemSubMenuProvider has been defined, if not defaults to subMenuProps
     */
    private _getSubMenuForItem;
}
