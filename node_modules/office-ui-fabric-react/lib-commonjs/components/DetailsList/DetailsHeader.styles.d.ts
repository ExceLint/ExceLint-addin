import { IDetailsHeaderStyleProps, IDetailsHeaderStyles } from './DetailsHeader.types';
import { IStyle, ITheme } from '../../Styling';
import { ICellStyleProps } from './DetailsRow.types';
export declare const HEADER_HEIGHT = 42;
export declare const getCellStyles: (props: {
    theme: ITheme;
    cellStyleProps?: ICellStyleProps | undefined;
}) => IStyle;
export declare const getStyles: (props: IDetailsHeaderStyleProps) => IDetailsHeaderStyles;
