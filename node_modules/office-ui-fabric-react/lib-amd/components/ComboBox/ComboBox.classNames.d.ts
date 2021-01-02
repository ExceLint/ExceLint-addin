import { IComboBoxStyles, IComboBoxOptionStyles, IComboBoxClassNames, IComboBoxOptionClassNames } from './ComboBox.types';
export declare const getClassNames: (styles: Partial<IComboBoxStyles>, className: string, isOpen: boolean, disabled: boolean, required: boolean, focused: boolean, allowFreeForm: boolean, hasErrorMessage: boolean) => IComboBoxClassNames;
export declare const getComboBoxOptionClassNames: (styles: Partial<IComboBoxOptionStyles>) => IComboBoxOptionClassNames;
