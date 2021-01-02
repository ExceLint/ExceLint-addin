import * as React from 'react';
import { IFocusZone } from '../../FocusZone';
import { Selection } from '../../utilities/selection/index';
import { Suggestions } from './Suggestions/Suggestions';
import { ISuggestions, ISuggestionsProps } from './Suggestions/Suggestions.types';
import { SuggestionsController } from './Suggestions/SuggestionsController';
import { IBasePicker, IBasePickerProps } from './BasePicker.types';
import { IAutofill, Autofill } from '../Autofill/index';
import { IPickerItemProps } from './PickerItem.types';
export interface IBasePickerState {
    items?: any;
    suggestedDisplayValue?: string;
    moreSuggestionsAvailable?: boolean;
    isFocused?: boolean;
    isSearching?: boolean;
    isMostRecentlyUsedVisible?: boolean;
    suggestionsVisible?: boolean;
    suggestionsLoading?: boolean;
    isResultsFooterVisible?: boolean;
    selectedIndices?: number[];
}
/**
 * Aria id's for internal picker components
 * {@docCategory Pickers}
 */
export declare type IPickerAriaIds = {
    /**
     * Aria id for selected suggestion alert component
     */
    selectedSuggestionAlert: string;
    /**
     * Aria id for selected items container component
     */
    selectedItems: string;
    /**
     * Aria id for suggestions list component
     */
    suggestionList: string;
    /**
     * Aria id for the component that has role=combobox
     */
    combobox: string;
};
/**
 * {@docCategory Pickers}
 */
export declare class BasePicker<T, P extends IBasePickerProps<T>> extends React.Component<P, IBasePickerState> implements IBasePicker<T> {
    protected root: React.RefObject<HTMLDivElement>;
    protected input: React.RefObject<IAutofill>;
    protected focusZone: React.RefObject<IFocusZone>;
    protected suggestionElement: React.RefObject<ISuggestions<T>>;
    protected selection: Selection;
    protected suggestionStore: SuggestionsController<T>;
    /**
     * @deprecated this is no longer necessary as typescript now supports generic elements
     */
    protected SuggestionOfProperType: new (props: ISuggestionsProps<T>) => Suggestions<T>;
    protected currentPromise: PromiseLike<any> | undefined;
    protected _ariaMap: IPickerAriaIds;
    private _styledSuggestions;
    private _id;
    private _async;
    static getDerivedStateFromProps(newProps: IBasePickerProps<any>): {
        items: any[];
    } | null;
    constructor(basePickerProps: P);
    readonly items: T[];
    componentDidMount(): void;
    componentDidUpdate(oldProps: P, oldState: IBasePickerState): void;
    componentWillUnmount(): void;
    focus(): void;
    focusInput(): void;
    dismissSuggestions: (ev?: any) => void;
    completeSuggestion(forceComplete?: boolean): void;
    refocusSuggestions: (keyCode: number) => void;
    render(): JSX.Element;
    protected canAddItems(): boolean;
    protected renderSuggestions(): JSX.Element | null;
    protected renderItems(): JSX.Element[];
    protected resetFocus(index?: number): void;
    protected onSuggestionSelect(): void;
    protected onSelectionChange(): void;
    protected updateSuggestions(suggestions: any[]): void;
    /**
     * Only to be called when there is nothing in the input. Checks to see if the consumer has
     * provided a function to resolve suggestions
     */
    protected onEmptyInputFocus(): void;
    protected updateValue(updatedValue: string): void;
    protected updateSuggestionsList(suggestions: T[] | PromiseLike<T[]>, updatedValue?: string): void;
    protected resolveNewValue(updatedValue: string, suggestions: T[]): void;
    protected onChange(items?: T[]): void;
    protected onInputChange: (value: string) => void;
    protected onSuggestionClick: (ev: React.MouseEvent<HTMLElement, MouseEvent>, item: any, index: number) => void;
    protected onSuggestionRemove: (ev: React.MouseEvent<HTMLElement, MouseEvent>, item: T, index: number) => void;
    protected onInputFocus: (ev: React.FocusEvent<HTMLInputElement | Autofill>) => void;
    protected onInputBlur: (ev: React.FocusEvent<HTMLInputElement | Autofill>) => void;
    protected onBlur: (ev: React.FocusEvent<HTMLElement | Autofill>) => void;
    /**
     * Reveals suggestions any time the user clicks on the input element
     * without shifting focus.
     */
    protected onClick: (ev: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
    protected onKeyDown: (ev: React.KeyboardEvent<HTMLElement>) => void;
    protected onItemChange: (changedItem: T, index: number) => void;
    protected onGetMoreResults: () => void;
    protected completeSelection: (item: T) => void;
    protected addItemByIndex: (index: number) => void;
    protected addItem: (item: T) => void;
    protected removeItem: (item: IPickerItemProps<T>, focusNextItem?: boolean | undefined) => void;
    protected removeItems: (itemsToRemove: any[]) => void;
    protected onBackspace(ev: React.KeyboardEvent<HTMLElement>): void;
    protected _shouldFocusZoneEnterInnerZone: (ev: React.KeyboardEvent<HTMLElement>) => boolean;
    protected getActiveDescendant(): string | undefined;
    protected getSuggestionsAlert(suggestionAlertClassName?: string): JSX.Element | undefined;
    /**
     * Takes in the current updated value and either resolves it with the new suggestions
     * or if updated value is undefined then it clears out currently suggested items
     */
    private _updateAndResolveValue;
    /**
     * Controls what happens whenever there is an action that impacts the selected items.
     * If `selectedItems` is provided, this will act as a controlled component and it will not update its own state.
     */
    private _updateSelectedItems;
    private _onSelectedItemsUpdated;
    /**
     * Suggestions are normally shown after the user updates text and the text
     * is non-empty, but also when the user clicks on the input element.
     * @returns True if suggestions should be shown.
     */
    private _getShowSuggestions;
    private _onResolveSuggestions;
    private _completeGenericSuggestion;
    private _getTextFromItem;
    /**
     * This should be called when the user does something other than use text entry to trigger suggestions.
     *
     */
    private _userTriggeredSuggestions;
}
export declare class BasePickerListBelow<T, P extends IBasePickerProps<T>> extends BasePicker<T, P> {
    render(): JSX.Element;
    protected onBackspace(ev: React.KeyboardEvent<HTMLElement>): void;
}
