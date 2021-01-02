/**
 * @deprecated Deprecated due to potential for misuse (see package readme).
 * Use `React.useCallback` instead.
 */
export declare function useConstCallback<T extends (...args: any[]) => any>(callback: T): T;
