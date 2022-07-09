export declare function filterDefault(obj: any): boolean;
export declare function objectToString(object: any, { maxLevel, maxValueSize, maxFuncSize, maxProperties, maxListSize, maxResultSize, filter, }?: {
    maxLevel: number;
    maxValueSize: number;
    maxFuncSize: number;
    maxProperties: number;
    maxListSize: number;
    maxResultSize: number;
    filter: (object: any) => boolean;
}): string;
