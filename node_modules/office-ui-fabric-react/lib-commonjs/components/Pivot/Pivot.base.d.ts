import * as React from 'react';
import { IPivotProps } from './Pivot.types';
export interface IPivotState {
    selectedKey: string | undefined;
}
/**
 *  Usage:
 *
 *     <Pivot>
 *       <PivotItem headerText="Foo">
 *         <Label>Pivot #1</Label>
 *       </PivotItem>
 *       <PivotItem headerText="Bar">
 *         <Label>Pivot #2</Label>
 *       </PivotItem>
 *       <PivotItem headerText="Bas">
 *         <Label>Pivot #3</Label>
 *       </PivotItem>
 *     </Pivot>
 */
export declare class PivotBase extends React.Component<IPivotProps, IPivotState> {
    private _pivotId;
    private _focusZone;
    private _classNames;
    constructor(props: IPivotProps);
    /**
     * Sets focus to the first pivot tab.
     */
    focus(): void;
    render(): JSX.Element;
    private _getSelectedKey;
    /**
     * Renders the set of links to route between pivots
     */
    private _renderPivotLinks;
    private _renderPivotLink;
    private _renderLinkContent;
    /**
     * Renders a Pivot Item
     */
    private _renderPivotItem;
    /**
     * Gets the set of PivotLinks as array of IPivotItemProps
     * The set of Links is determined by child components of type PivotItem
     */
    private _getPivotLinks;
    /**
     * Generates the Id for the tab button.
     */
    private _getTabId;
    /**
     * whether the key exists in the pivot items.
     */
    private _isKeyValid;
    /**
     * Handles the onClick event on PivotLinks
     */
    private _onLinkClick;
    /**
     * Handle the onKeyDown event on the PivotLinks
     */
    private _onKeyDown;
    /**
     * Updates the state with the new selected index
     */
    private _updateSelectedItem;
    private _getClassNames;
}
