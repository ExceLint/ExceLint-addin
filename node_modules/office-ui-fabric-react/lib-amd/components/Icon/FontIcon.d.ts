import * as React from 'react';
import { IFontIconProps } from './Icon.types';
export interface IIconContent {
    children?: string;
    iconClassName?: string;
    fontFamily?: string;
}
export declare const getIconContent: (iconName?: string | undefined) => IIconContent | null;
/**
 * Fast icon component which only supports font glyphs (not images) and can't be targeted by customizations.
 * To style the icon, use `className` or reference `ms-Icon` in CSS.
 * {@docCategory Icon}
 */
export declare const FontIcon: React.FunctionComponent<IFontIconProps>;
/**
 * Memoized helper for rendering a FontIcon.
 * @param iconName - The name of the icon to use from the icon font.
 * @param className - Class name for styling the icon.
 * @param ariaLabel - Label for the icon for the benefit of screen readers.
 * {@docCategory Icon}
 */
export declare const getFontIcon: (iconName: string, className?: string | undefined, ariaLabel?: string | undefined) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
