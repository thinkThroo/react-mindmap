import { List, Map, Record } from 'immutable';
import { KeyType } from '../types';
import { SheetModel } from './sheet-model';
export declare type ExtData = Map<string, any>;
declare type DocRecordType = {
    sheetModels: List<SheetModel>;
    extData: ExtData;
    currentSheetIndex: number;
    formatVersion: string;
};
declare const DocModel_base: Record.Factory<DocRecordType>;
export declare class DocModel extends DocModel_base {
    get sheetModels(): List<SheetModel>;
    get currentSheetIndex(): number;
    get formatVersion(): string;
    static createEmpty(): DocModel;
    get currentSheetModel(): SheetModel;
    get extData(): ExtData;
    getSheetModel(sheetId: string): SheetModel;
    getSheetIndex(sheetModel: SheetModel | KeyType): number;
    getExtDataItem<T>(key: string, c: new () => T): T;
    getSheetIdThatContainsTopic(topicKey: KeyType): string;
}
export {};
//# sourceMappingURL=doc-model.d.ts.map