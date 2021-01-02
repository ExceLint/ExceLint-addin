import * as React from 'react';
export interface IWithResponsiveModeState {
    responsiveMode?: ResponsiveMode;
}
export declare enum ResponsiveMode {
    small = 0,
    medium = 1,
    large = 2,
    xLarge = 3,
    xxLarge = 4,
    xxxLarge = 5,
    unknown = 999
}
/**
 * Allows a server rendered scenario to provide a default responsive mode.
 */
export declare function setResponsiveMode(responsiveMode: ResponsiveMode | undefined): void;
/**
 * Initializes the responsive mode to the current window size. This can be used to avoid
 * a re-render during first component mount since the window would otherwise not be measured
 * until after mounting.
 */
export declare function initializeResponsiveMode(element?: HTMLElement): void;
export declare function getInitialResponsiveMode(): ResponsiveMode;
export declare function withResponsiveMode<TProps extends {
    responsiveMode?: ResponsiveMode;
}, TState>(ComposedComponent: new (props: TProps, ...args: any[]) => React.Component<TProps, TState>): any;
export declare function getResponsiveMode(currentWindow: Window | undefined): ResponsiveMode;
