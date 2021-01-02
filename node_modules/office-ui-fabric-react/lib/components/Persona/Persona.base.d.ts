import * as React from 'react';
import { IPersonaProps } from './Persona.types';
/**
 * Persona with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/microsoft/fluentui/wiki/Styling)
 */
export declare class PersonaBase extends React.Component<IPersonaProps, {}> {
    static defaultProps: IPersonaProps;
    constructor(props: IPersonaProps);
    render(): JSX.Element;
    /**
     * Renders various types of Text (primaryText, secondaryText, etc)
     * based on the classNames passed
     * @param classNames - element className
     * @param renderFunction - render function
     * @param defaultRenderFunction - default render function
     */
    private _renderElement;
    /**
     * Deprecation helper for getting text.
     */
    private _getText;
    /**
     * using closure to wrap the default render behavior
     * to make it independent of the type of text passed
     * @param text - text to render
     */
    private _onRenderText;
    private _onRenderPersonaCoin;
}
