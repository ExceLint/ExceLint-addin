import * as React from 'react';
import { ISuggestionItemProps } from './SuggestionsItem.types';
/**
 * {@docCategory Pickers}
 */
export declare class SuggestionsItem<T> extends React.Component<ISuggestionItemProps<T>, {}> {
    constructor(props: ISuggestionItemProps<T>);
    render(): JSX.Element;
}
