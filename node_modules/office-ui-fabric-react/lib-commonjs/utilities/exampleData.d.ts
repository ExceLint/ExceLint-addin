import { IGroup } from '../DetailsList';
/** @deprecated Use the version from `@uifabric/example-data` instead. */
export interface IExampleItem {
    thumbnail: string;
    key: string;
    name: string;
    description: string;
    color: string;
    shape: string;
    location: string;
    width: number;
    height: number;
}
/** @deprecated Use the version from `@uifabric/example-data` instead. */
export declare function createListItems(count: number, startIndex?: number): IExampleItem[];
/** @deprecated Use the version from `@uifabric/example-data` instead. */
export declare function createGroups(groupCount: number, groupDepth: number, startIndex: number, itemsPerGroup: number, level?: number, key?: string, isCollapsed?: boolean): IGroup[];
/** @deprecated Use the version from `@uifabric/example-data` instead. */
export declare function lorem(wordCount: number): string;
export declare function isGroupable(key: string): boolean;
