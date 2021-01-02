import { BaseFloatingPicker } from '../BaseFloatingPicker';
import { IBaseFloatingPickerProps } from '../BaseFloatingPicker.types';
import { IPersonaProps } from '../../../Persona';
import './PeoplePicker.scss';
import { ISuggestionModel } from '../../../Pickers';
/**
 * {@docCategory FloatingPeoplePicker}
 */
export interface IPeopleFloatingPickerProps extends IBaseFloatingPickerProps<IPersonaProps> {
}
/**
 * {@docCategory FloatingPeoplePicker}
 */
export declare class BaseFloatingPeoplePicker extends BaseFloatingPicker<IPersonaProps, IPeopleFloatingPickerProps> {
}
export declare class FloatingPeoplePicker extends BaseFloatingPeoplePicker {
    static defaultProps: any;
}
export declare function createItem(name: string, isValid: boolean): ISuggestionModel<IPersonaProps>;
