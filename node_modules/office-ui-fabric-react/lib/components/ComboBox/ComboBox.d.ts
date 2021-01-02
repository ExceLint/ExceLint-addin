import * as React from 'react';
import { IComboBoxOption, IComboBoxProps } from './ComboBox.types';
export interface IComboBoxState {
    /** The open state */
    isOpen?: boolean;
    /** The currently selected indices */
    selectedIndices?: number[];
    /** The focused state of the comboBox */
    focusState?: 'none' | 'focused' | 'focusing';
    /** This value is used for the autocomplete hint value */
    suggestedDisplayValue?: string;
    /** The options currently available for the callout */
    currentOptions: IComboBoxOption[];
    /**
     * When taking input, this will store the index that the options input matches
     * (-1 if no input or match)
     */
    currentPendingValueValidIndex: number;
    /**
     * Stores the hovered over value in the dropdown
     * (used for styling the options without updating the input)
     */
    currentPendingValueValidIndexOnHover: number;
    /** When taking input, this will store the actual text that is being entered */
    currentPendingValue?: string;
}
export declare class ComboBox extends React.Component<IComboBoxProps, IComboBoxState> {
    static defaultProps: IComboBoxProps;
    private _root;
    /** The input aspect of the comboBox */
    private _autofill;
    /** The wrapping div of the input and button */
    private _comboBoxWrapper;
    /** The callout element */
    private _comboBoxMenu;
    /** The menu item element that is currently selected */
    private _selectedElement;
    /** The base id for the ComboBox */
    private _id;
    /**
     * After a character is inserted when autocomplete is true and allowFreeform is false,
     * remember the task that will clear the pending string of characters.
     */
    private _lastReadOnlyAutoCompleteChangeTimeoutId;
    /** Promise used when resolving the comboBox options */
    private _currentPromise;
    /** The current visible value sent to the auto fill on render */
    private _currentVisibleValue;
    private _classNames;
    private _isScrollIdle;
    private _hasPendingValue;
    private _scrollIdleTimeoutId;
    private _processingTouch;
    private _lastTouchTimeoutId;
    /** True if the most recent keydown event was for alt (option) or meta (command). */
    private _lastKeyDownWasAltOrMeta;
    /**
     * Determines if we should be setting focus back to the input when the menu closes.
     * The general rule of thumb is if the menu was launched via the keyboard focus should go back
     * to the input, if it was dropped via the mouse focus should not be forced back to the input.
     */
    private _focusInputAfterClose;
    /** Flag for when we get the first mouseMove */
    private _gotMouseMove;
    private _processingClearPendingInfo;
    private _async;
    private _events;
    constructor(props: IComboBoxProps);
    /**
     * All selected options
     */
    readonly selectedOptions: IComboBoxOption[];
    componentDidMount(): void;
    UNSAFE_componentWillReceiveProps(newProps: IComboBoxProps): void;
    componentDidUpdate(prevProps: IComboBoxProps, prevState: IComboBoxState): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    /**
     * {@inheritdoc}
     */
    focus: (shouldOpenOnFocus?: boolean | undefined, useFocusAsync?: boolean | undefined) => void;
    /**
     * Close menu callout if it is open
     */
    dismissMenu: () => void;
    /**
     * componentWillReceiveProps handler for the auto fill component
     * Checks/updates the iput value to set, if needed
     * @param defaultVisibleValue - the defaultVisibleValue that got passed
     *  in to the auto fill's componentWillReceiveProps
     * @returns - the updated value to set, if needed
     */
    private _onUpdateValueInAutofillWillReceiveProps;
    private _renderComboBoxWrapper;
    /**
     * componentDidUpdate handler for the auto fill component
     *
     * @param defaultVisibleValue - the current defaultVisibleValue in the auto fill's componentDidUpdate
     * @param suggestedDisplayValue - the current suggestedDisplayValue in the auto fill's componentDidUpdate
     * @returns - should the full value of the input be selected?
     * True if the defaultVisibleValue equals the suggestedDisplayValue, false otherwise
     */
    private _onShouldSelectFullInputValueInAutofillComponentDidUpdate;
    /**
     * Get the correct value to pass to the input
     * to show to the user based off of the current props and state
     * @returns the value to pass to the input
     */
    private _getVisibleValue;
    private _getPendingString;
    /**
     * Returns a string that concatenates all of the selected values
     * for multiselect combobox.
     */
    private _getMultiselectDisplayString;
    /**
     * Is the index within the bounds of the array?
     * @param options - options to check if the index is valid for
     * @param index - the index to check
     * @returns - true if the index is valid for the given options, false otherwise
     */
    private _indexWithinBounds;
    /**
     * Handler for typing changes on the input
     * @param updatedValue - the newly changed value
     */
    private _onInputChange;
    /**
     * Process the new input's new value when the comboBox
     * allows freeform entry
     * @param updatedValue - the input's newly changed value
     */
    private _processInputChangeWithFreeform;
    /**
     * Process the new input's new value when the comboBox
     * does not allow freeform entry
     * @param updatedValue - the input's newly changed value
     */
    private _processInputChangeWithoutFreeform;
    private _getFirstSelectedIndex;
    /**
     * Walk along the options starting at the index, stepping by the delta (positive or negative)
     * looking for the next valid selectable index (e.g. skipping headings and dividers)
     * @param index - the index to get the next selectable index from
     * @param delta - optional delta to step by when finding the next index, defaults to 0
     * @returns - the next valid selectable index. If the new index is outside of the bounds,
     * it will snap to the edge of the options array. If delta == 0 and the given index is not selectable
     */
    private _getNextSelectableIndex;
    /**
     * Set the selected index. Note, this is
     * the "real" selected index, not the pending selected index
     * @param index - the index to set (or the index to set from if a search direction is provided)
     * @param searchDirection - the direction to search along the options from the given index
     */
    private _setSelectedIndex;
    /**
     * Focus (and select) the content of the input
     * and set the focused state
     */
    private _onFocus;
    /**
     * Callback issued when the options should be resolved, if they have been updated or
     * if they need to be passed in the first time. This only does work if an onResolveOptions
     * callback was passed in
     */
    private _onResolveOptions;
    /**
     * OnBlur handler. Set the focused state to false
     * and submit any pending value
     */
    private _onBlur;
    /**
     * Submit a pending value if there is one
     */
    private _submitPendingValue;
    private _onRenderContainer;
    private _onCalloutLayerMounted;
    private _onLayerMounted;
    private _onRenderLabel;
    private _onRenderList;
    private _onRenderItem;
    private _onRenderLowerContent;
    private _onRenderUpperContent;
    private _renderSeparator;
    private _renderHeader;
    private _renderOption;
    /**
     * If we are coming from a mouseOut:
     * there is no visible selected option.
     *
     * Else if We are hovering over an item:
     * that gets the selected look.
     *
     * Else:
     * Use the current valid pending index if it exists OR
     * we do not have a valid index and we currently have a pending input value,
     * otherwise use the selected index
     * */
    private _isOptionSelected;
    private _isOptionChecked;
    /**
     * Gets the pending selected index taking into account hover, valueValidIndex, and selectedIndex
     * @param includeCurrentPendingValue - Should we include the currentPendingValue when
     * finding the index
     */
    private _getPendingSelectedIndex;
    /**
     * Mouse clicks to headers, dividers and scrollbar should not make input lose focus
     */
    private _onCalloutMouseDown;
    /**
     * Scroll handler for the callout to make sure the mouse events
     * for updating focus are not interacting during scroll
     */
    private _onScroll;
    /**
     * Scroll the selected element into view
     */
    private _scrollIntoView;
    private _onRenderOptionContent;
    /**
     * Click handler for the menu items
     * to select the item and also close the menu
     * @param index - the index of the item that was clicked
     */
    private _onItemClick;
    /**
     * Handles dismissing (cancelling) the menu
     */
    private _onDismiss;
    /**
     * Get the indices of the options that are marked as selected
     * @param options - the comboBox options
     * @param selectedKeys - the known selected keys to find
     * @returns - an array of the indices of the selected options, empty array if nothing is selected
     */
    private _getSelectedIndices;
    /**
     * Reset the selected index by clearing the
     * input (of any pending text), clearing the pending state,
     * and setting the suggested display value to the last
     * selected state text
     */
    private _resetSelectedIndex;
    /**
     * Clears the pending info state
     */
    private _clearPendingInfo;
    private _onAfterClearPendingInfo;
    /**
     * Set the pending info
     * @param currentPendingValue - new pending value to set
     * @param currentPendingValueValidIndex - new pending value index to set
     * @param suggestedDisplayValue - new suggest display value to set
     */
    private _setPendingInfo;
    /**
     * Set the pending info from the given index
     * @param index - the index to set the pending info from
     */
    private _setPendingInfoFromIndex;
    /**
     * Sets the pending info for the comboBox
     * @param index - the index to search from
     * @param searchDirection - the direction to search
     */
    private _setPendingInfoFromIndexAndDirection;
    private _notifyPendingValueChanged;
    /**
     * Sets the isOpen state and updates focusInputAfterClose
     */
    private _setOpenStateAndFocusOnClose;
    /**
     * Handle keydown on the input
     * @param ev - The keyboard event that was fired
     */
    private _onInputKeyDown;
    /**
     * Returns true if the key for the event is alt (Mac option) or meta (Mac command).
     */
    private _isAltOrMeta;
    /**
     * Handle keyup on the input
     * @param ev - the keyboard event that was fired
     */
    private _onInputKeyUp;
    private _onOptionMouseEnter;
    private _onOptionMouseMove;
    private _onOptionMouseLeave;
    private _shouldIgnoreMouseEvent;
    /**
     * Handle dismissing the menu and
     * eating the required key event when disabled
     * @param ev - the keyboard event that was fired
     */
    private _handleInputWhenDisabled;
    /**
     * Click handler for the button of the comboBox
     * and the input when not allowing freeform. This
     * toggles the expand/collapse state of the comboBox (if enbled)
     */
    private _onComboBoxClick;
    /**
     * Click handler for the autofill.
     */
    private _onAutofillClick;
    private _onTouchStart;
    private _onPointerDown;
    private _handleTouchAndPointerEvent;
    /**
     * Get the styles for the current option.
     * @param item - Item props for the current option
     */
    private _getCaretButtonStyles;
    /**
     * Get the styles for the current option.
     * @param item - Item props for the current option
     */
    private _getCurrentOptionStyles;
    /**
     * Get the aria-activedescendant value for the comboxbox.
     * @returns the id of the current focused combo item, otherwise the id of the currently selected element,
     * null otherwise
     */
    private _getAriaActiveDescendantValue;
    /**
     * Get the aria autocomplete value for the Combobox
     * @returns 'inline' if auto-complete automatically dynamic, 'both' if we have a list of possible values to pick from
     * and can dynamically populate input, and 'none' if auto-complete is not enabled as we can't give user inputs.
     */
    private _getAriaAutoCompleteValue;
    private _isPendingOption;
    /**
     * Given default selected key(s) and selected key(s), return the selected keys(s).
     * When default selected key(s) are available, they take precedence and return them instead of selected key(s).
     *
     * @returns No matter what specific types the input parameters are, always return an array of
     *  either strings or numbers instead of premitive type.  This normlization makes caller's logic easier.
     */
    private _buildDefaultSelectedKeys;
    private _buildSelectedKeys;
    private _getPreviewText;
    private _normalizeToString;
    /**
     * Returns true if the component has some kind of focus. If it's either focusing or if it's focused
     */
    private _hasFocus;
}
