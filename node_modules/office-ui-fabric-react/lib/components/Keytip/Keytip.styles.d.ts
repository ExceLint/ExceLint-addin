import { IKeytipStyleProps, IKeytipStyles } from './Keytip.types';
import { ICalloutContentStyleProps, ICalloutContentStyles } from '../../Callout';
import { IStyleFunction, Point } from '../../Utilities';
export declare const getStyles: (props: IKeytipStyleProps) => IKeytipStyles;
export declare const getCalloutStyles: (props: ICalloutContentStyleProps) => ICalloutContentStyles;
export declare const getCalloutOffsetStyles: (offset: Point) => IStyleFunction<ICalloutContentStyleProps, ICalloutContentStyles>;
