import { IThemeRules } from './IThemeRules';
export declare enum BaseSlots {
    primaryColor = 0,
    backgroundColor = 1,
    foregroundColor = 2
}
export declare enum FabricSlots {
    themePrimary = 0,
    themeLighterAlt = 1,
    themeLighter = 2,
    themeLight = 3,
    themeTertiary = 4,
    themeSecondary = 5,
    themeDarkAlt = 6,
    themeDark = 7,
    themeDarker = 8,
    neutralLighterAlt = 9,
    neutralLighter = 10,
    neutralLight = 11,
    neutralQuaternaryAlt = 12,
    neutralQuaternary = 13,
    neutralTertiaryAlt = 14,
    neutralTertiary = 15,
    neutralSecondary = 16,
    neutralPrimaryAlt = 17,
    neutralPrimary = 18,
    neutralDark = 19,
    black = 20,
    white = 21
}
export declare enum SemanticColorSlots {
    bodyBackground = 0,
    bodyText = 1,
    disabledBackground = 2,
    disabledText = 3
}
export declare function themeRulesStandardCreator(): IThemeRules;
