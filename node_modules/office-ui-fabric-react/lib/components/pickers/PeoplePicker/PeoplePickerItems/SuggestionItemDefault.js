import { __assign } from "tslib";
import * as React from 'react';
import { css } from '../../../../Utilities';
import { Persona, PersonaSize, PersonaPresence } from '../../../../Persona';
import * as stylesImport from './SuggestionItemDefault.scss';
var styles = stylesImport;
/**
 * @deprecated Use the exported from the package level 'PeoplePickerItemSuggestion'. Will be removed in Fabric 7.0
 */
export var SuggestionItemNormal = function (personaProps, suggestionItemProps) {
    return (React.createElement("div", { className: css('ms-PeoplePicker-personaContent', styles.peoplePickerPersonaContent) },
        React.createElement(Persona, __assign({ presence: personaProps.presence !== undefined ? personaProps.presence : PersonaPresence.none, size: PersonaSize.size24, className: css('ms-PeoplePicker-Persona', styles.peoplePickerPersona), showSecondaryText: true }, personaProps))));
};
/**
 *  Will be removed in Fabric 7.0
 * @deprecated Use the exported from the package level 'PeoplePickerItemSuggestion' with compact prop set to true.
 */
export var SuggestionItemSmall = function (personaProps, suggestionItemProps) {
    return (React.createElement("div", { className: css('ms-PeoplePicker-personaContent', styles.peoplePickerPersonaContent) },
        React.createElement(Persona, __assign({ presence: personaProps.presence !== undefined ? personaProps.presence : PersonaPresence.none, size: PersonaSize.size24, className: css('ms-PeoplePicker-Persona', styles.peoplePickerPersona) }, personaProps))));
};
//# sourceMappingURL=SuggestionItemDefault.js.map