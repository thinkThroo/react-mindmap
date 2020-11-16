import { ExtData, IControllerRunContext } from '@blink-mind/core';
export declare function JsonSerializerPlugin(): {
    migrateDocModel(ctx: any, next: any): any;
    serializeDocModel(ctx: IControllerRunContext, next: any): {
        sheetModels: any[];
        extData: any;
        currentSheetIndex: number;
        formatVersion: string;
    };
    deserializeDocModel(ctx: any, next: any): any;
    serializeExtData(ctx: IControllerRunContext & {
        extData: ExtData;
    }, next: any): any;
    deserializeExtData(ctx: any, next: any): any;
    serializeExtDataItem(ctx: any, next: any): any;
    deserializeExtDataItem(ctx: any, next: any): any;
    serializeSheetModel(ctx: IControllerRunContext, next: any): any;
    deserializeSheetModel(ctx: any, next: any): any;
    serializeConfig(ctx: any, next: any): any;
    deserializeConfig(ctx: any, next: any): any;
    serializeTopic(ctx: any, next: any): any;
    serializeBlocks(ctx: any, next: any): any;
    deserializeTopic(ctx: any, next: any): any;
    deserializeTopics(ctx: any, next: any): any;
    serializeBlock(ctx: any, next: any): any;
    serializeBlockData(ctx: any, next: any): any;
    deserializeBlock(ctx: any, next: any): any;
    deserializeBlockData(ctx: any, next: any): any;
    deserializeBlocks(ctx: any, next: any): any;
};
//# sourceMappingURL=json-serializer-plugin.d.ts.map