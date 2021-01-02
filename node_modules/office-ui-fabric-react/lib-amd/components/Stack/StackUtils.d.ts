/**
 * Functions used by Stack components to simplify style-related computations
 */
import { ITheme } from '../../Styling';
/**
 * Takes in a gap size in either a CSS-style format (e.g. 10 or "10px")
 *  or a key of a themed spacing value (e.g. "s1").
 * Returns the separate numerical value of the padding (e.g. 10)
 *  and the CSS unit (e.g. "px").
 */
export declare const parseGap: (gap: string | number | undefined, theme: ITheme) => {
    rowGap: {
        value: number;
        unit: string;
    };
    columnGap: {
        value: number;
        unit: string;
    };
};
/**
 * Takes in a padding in a CSS-style format (e.g. 10, "10px", "10px 10px", etc.)
 *  where the separate padding values can also be the key of a themed spacing value
 *  (e.g. "s1 m", "10px l1 20px l2", etc.).
 * Returns a CSS-style padding.
 */
export declare const parsePadding: (padding: string | number | undefined, theme: ITheme) => string | number | undefined;
