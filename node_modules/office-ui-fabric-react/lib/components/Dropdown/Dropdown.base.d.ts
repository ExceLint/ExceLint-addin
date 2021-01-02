import * as React from 'react';
import { IDropdownOption, IDropdownProps, IDropdown } from './Dropdown.types';
import { RectangleEdge } from '../../utilities/positioning';
import { IWithResponsiveModeState } from '../../utilities/decorators/withResponsiveMode';
/** Internal only props interface to support mixing in responsive mode */
export interface IDropdownInternalProps extends IDropdownProps, IWithResponsiveModeState {
}
export interface IDropdownState {
    isOpen: boolean;
    selectedIndices: number[];
    /** Whether the root dropdown element has focus. */
    hasFocus: boolean;
    calloutRenderEdge?: RectangleEdge;
}
export declare class DropdownBase extends React.Component<IDropdownInternalProps, IDropdownState> implements IDropdown {
    static defaultProps: {
        options: any[];
    };
    private _host;
    private _focusZone;
    private _dropDown;
    private _id;
    private _labelId;
    private _listId;
    private _optionId;
    private _isScrollIdle;
    private readonly _scrollIdleDelay;
    private _scrollIdleTimeoutId;
    /** True if the most recent keydown event was for alt (option) or meta (command). */
    private _lastKeyDownWasAltOrMeta;
    private _sizePosCache;
    private _classNames;
    private _requestAnimationFrame;
    /** Flag for when we get the first mouseMove */
    private _gotMouseMove;
    /** Flag for tracking whether focus is triggered by click (alternatively triggered by keyboard nav) */
    private _isFocusedByClick;
    constructor(props: IDropdownProps);
    /**
     * All selected options
     */
    readonly selectedOptions: IDropdownOption[];
    componentWillUnmount(): void;
    UNSAFE_componentWillReceiveProps(newProps: IDropdownProps): void;
    componentDidUpdate(prevProps: IDropdownProps, prevState: IDropdownState): void;
    render(): JSX.Element;
    focus(shouldOpenOnFocus?: boolean): void;
    setSelectedIndex(event: React.FormEvent<HTMLDivElement>, index: number): void;
    private _onChange;
    /** Get either props.placeholder (new name) or props.placeHolder (old name) */
    private _getPlaceholder;
    private _copyArray;
    /**
     * Finds the next valid Dropdown option and sets the selected index to it.
     * @param stepValue - Value of how many items the function should traverse.  Should be -1 or 1.
     * @param index - Index of where the search should start
     * @param selectedIndex - The selectedIndex Dropdown's state
     * @returns The next valid dropdown option's index
     */
    private _moveIndex;
    /** Get text in dropdown input as a string */
    private _getTitle;
    /** Render text in dropdown input */
    private _onRenderTitle;
    /** Render placeholder text in dropdown input */
    private _onRenderPlaceholder;
    /** Render Callout or Panel container and pass in list */
    private _onRenderContainer;
    /** Render Caret Down Icon */
    private _onRenderCaretDown;
    /** Wrap item list in a FocusZone */
    private _renderFocusableList;
    /** Render List of items */
    private _onRenderList;
    private _onRenderItem;
    private _renderSeparator;
    private _renderHeader;
    private _renderOption;
    /** Render content of item (i.e. text/icon inside of button) */
    private _onRenderOption;
    /** Render custom label for drop down item */
    private _onRenderItemLabel;
    private _onPositioned;
    private _onItemClick;
    /**
     * Scroll handler for the callout to make sure the mouse events
     * for updating focus are not interacting during scroll
     */
    private _onScroll;
    private _onItemMouseEnter;
    private _onItemMouseMove;
    private _onMouseItemLeave;
    private _shouldIgnoreMouseEvent;
    private _onDismiss;
    /** Get all selected indexes for multi-select mode */
    private _getSelectedIndexes;
    private _getAllSelectedIndices;
    private _getSelectedIndex;
    private _onDropdownBlur;
    private _onDropdownKeyDown;
    private _onDropdownKeyUp;
    /**
     * Returns true if the key for the event is alt (Mac option) or meta (Mac command).
     */
    private _isAltOrMeta;
    /**
     * We close the menu on key up only if ALL of the following are true:
     * - Most recent key down was alt or meta (command)
     * - The alt/meta key down was NOT followed by some other key (such as down/up arrow to
     *   expand/collapse the menu)
     * - We're not on a Mac (or iOS)
     *
     * This is because on Windows, pressing alt moves focus to the application menu bar or similar,
     * closing any open context menus. There is not a similar behavior on Macs.
     */
    private _shouldHandleKeyUp;
    private _onZoneKeyDown;
    private _onZoneKeyUp;
    private _onDropdownClick;
    private _onDropdownMouseDown;
    private _onFocus;
    /**
     * Because the isDisabled prop is deprecated, we have had to repeat this logic all over the place.
     * This helper method avoids all the repetition.
     */
    private _isDisabled;
    private _onRenderLabel;
    /**
     * Returns true if dropdown should set to open on focus.
     * Otherwise, isOpen state should be toggled on click
     */
    private _shouldOpenOnFocus;
}
