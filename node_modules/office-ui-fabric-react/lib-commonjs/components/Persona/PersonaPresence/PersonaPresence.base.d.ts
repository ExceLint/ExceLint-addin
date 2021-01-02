import * as React from 'react';
import { IPersonaPresenceProps } from '../Persona.types';
/**
 * PersonaPresence with no default styles.
 * [Use the `getStyles` API to add your own styles.](https://github.com/microsoft/fluentui/wiki/Styling)
 */
export declare class PersonaPresenceBase extends React.Component<IPersonaPresenceProps, {}> {
    constructor(props: IPersonaPresenceProps);
    render(): JSX.Element | null;
    private _onRenderIcon;
}
