export module Util {
  /**
   * Convert an Excel A1 column string into a number.
   * @param col A1 column string.
   * @returns Number.
   */
  export function columnToInt(col: string): number {
    function cti(idx: number): number {
      // get ASCII code and then subtract 64 to get Excel column #
      const code = col.charCodeAt(idx) - 64;
      // the value depends on the position; a column is a base-26 number
      const num = Math.pow(26, col.length - idx - 1) * code;
      if (idx === 0) {
        // base case
        return num;
      } else {
        // add this letter to number and recurse
        return num + cti(idx - 1);
      }
    }
    return cti(col.length - 1);
  }
}
