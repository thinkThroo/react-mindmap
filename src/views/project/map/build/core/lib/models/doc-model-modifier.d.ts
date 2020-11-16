import { KeyType } from '../types';
import { DocModel } from './doc-model';
import { SheetModel } from './sheet-model';
export declare type BaseDocModelModifierArg = {
    docModel: DocModel;
    sheetModel: SheetModel;
    model?: SheetModel;
    topicKey?: KeyType;
};
export declare function setCurrentSheetModel(docModel: DocModel, sheetModel: SheetModel): DocModel;
export declare function toDocModelModifierFunc(sheetModelModifierFunc: any): (arg: any) => DocModel;
declare const DocModelModifier: any;
export { DocModelModifier };
//# sourceMappingURL=doc-model-modifier.d.ts.map