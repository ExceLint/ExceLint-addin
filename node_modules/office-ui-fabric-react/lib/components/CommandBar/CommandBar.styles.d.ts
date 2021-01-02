import { ICommandBarStyleProps, ICommandBarStyles } from './CommandBar.types';
import { IButtonStyles } from '../Button/Button.types';
export declare const getStyles: (props: ICommandBarStyleProps) => ICommandBarStyles;
export declare const getCommandButtonStyles: (customStyles: IButtonStyles | undefined) => IButtonStyles;
