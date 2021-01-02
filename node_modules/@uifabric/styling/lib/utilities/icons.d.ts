import { IRawStyle, IFontFace } from '@uifabric/merge-styles';
export interface IIconSubset {
    fontFace?: IFontFace;
    icons: {
        [key: string]: string | JSX.Element;
    };
    style?: IRawStyle;
}
export interface IIconSubsetRecord extends IIconSubset {
    isRegistered?: boolean;
    className?: string;
}
export interface IIconRecord {
    code: string | undefined;
    subset: IIconSubsetRecord;
}
export interface IIconOptions {
    /**
     * By default, registering the same set of icons will generate a console warning per duplicate icon
     * registered, because this scenario can create unexpected consequences.
     *
     * Some scenarios include:
     *
     * Icon set was previously registered using a different base url.
     * Icon set was previously registered but a different version was provided.
     * Icons in a previous registered set overlap with a new set.
     *
     * To simply ignore previously registered icons, you can specify to disable warnings. This means
     * that if an icon which was previous registered is registered again, it will be silently ignored.
     * However, consider whether the problems listed above will cause issues.
     **/
    disableWarnings: boolean;
    /**
     * @deprecated
     * Use 'disableWarnings' instead.
     */
    warnOnMissingIcons?: boolean;
}
export interface IIconRecords {
    __options: IIconOptions;
    __remapped: {
        [key: string]: string;
    };
    [key: string]: IIconRecord | {};
}
/**
 * Registers a given subset of icons.
 *
 * @param iconSubset - the icon subset definition.
 */
export declare function registerIcons(iconSubset: IIconSubset, options?: Partial<IIconOptions>): void;
/**
 * Unregisters icons by name.
 *
 * @param iconNames - List of icons to unregister.
 */
export declare function unregisterIcons(iconNames: string[]): void;
/**
 * Remaps one icon name to another.
 */
export declare function registerIconAlias(iconName: string, mappedToName: string): void;
/**
 * Gets an icon definition. If an icon is requested but the subset has yet to be registered,
 * it will get registered immediately.
 *
 * @public
 * @param name - Name of icon.
 */
export declare function getIcon(name?: string): IIconRecord | undefined;
/**
 * Sets the icon options.
 *
 * @public
 */
export declare function setIconOptions(options: Partial<IIconOptions>): void;
