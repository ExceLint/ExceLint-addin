/** @jsx withSlots */
import * as React from 'react';
import { IStackProps } from './Stack.types';
import { IStackItemProps } from './StackItem/StackItem.types';
export declare const Stack: React.FunctionComponent<IStackProps> & {
    Item: React.FunctionComponent<IStackItemProps>;
};
export default Stack;
