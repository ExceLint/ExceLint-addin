import * as React from 'react';
import { Selection } from '../../Selection';
import { IBaseSelectedItemsList, IBaseSelectedItemsListProps } from './BaseSelectedItemsList.types';
export interface IBaseSelectedItemsListState<T = any> {
    items: T[];
}
export declare class BaseSelectedItemsList<T, P extends IBaseSelectedItemsListProps<T>> extends React.Component<P, IBaseSelectedItemsListState<T>> implements IBaseSelectedItemsList<T> {
    protected root: HTMLElement;
    protected selection: Selection;
    constructor(basePickerProps: P);
    readonly items: T[];
    addItems: (items: T[]) => void;
    removeItemAt: (index: number) => void;
    removeItem: (item: T) => void;
    replaceItem: (itemToReplace: T, itemsToReplaceWith: T[]) => void;
    removeItems: (itemsToRemove: any[]) => void;
    removeSelectedItems(): void;
    /**
     * Controls what happens whenever there is an action that impacts the selected items.
     * If selectedItems is provided, this will act as a controlled component and will not update its own state.
     */
    updateItems(items: T[], focusIndex?: number): void;
    onCopy: (ev: React.ClipboardEvent<HTMLElement>) => void;
    hasSelectedItems(): boolean;
    unselectAll(): void;
    highlightedItems(): T[];
    UNSAFE_componentWillUpdate(newProps: P, newState: IBaseSelectedItemsListState): void;
    componentDidMount(): void;
    UNSAFE_componentWillReceiveProps(newProps: P): void;
    render(): any;
    protected renderItems: () => JSX.Element[];
    protected onSelectionChanged: () => void;
    protected onChange(items?: T[]): void;
    protected onItemChange: (changedItem: T, index: number) => void;
    protected copyItems(items: T[]): void;
    private _onSelectedItemsUpdated;
    private _canRemoveItem;
}
