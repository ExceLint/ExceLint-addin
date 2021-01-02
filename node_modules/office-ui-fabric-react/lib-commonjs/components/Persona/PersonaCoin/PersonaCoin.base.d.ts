import * as React from 'react';
import { IPersonaCoinProps } from '../Persona.types';
export interface IPersonaState {
    isImageLoaded?: boolean;
    isImageError?: boolean;
}
/**
 * PersonaCoin with no default styles.
 * [Use the `getStyles` API to add your own styles.](https://github.com/microsoft/fluentui/wiki/Styling)
 */
export declare class PersonaCoinBase extends React.Component<IPersonaCoinProps, IPersonaState> {
    static defaultProps: IPersonaCoinProps;
    constructor(props: IPersonaCoinProps);
    UNSAFE_componentWillReceiveProps(nextProps: IPersonaCoinProps): void;
    render(): JSX.Element | null;
    private _onRenderCoin;
    /**
     * Deprecation helper for getting text.
     */
    private _getText;
    private _onRenderInitials;
    private _onPhotoLoadingStateChange;
}
