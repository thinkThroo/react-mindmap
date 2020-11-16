import { KeyType } from '@blink-mind/core';
import { List, Map, Record } from 'immutable';
declare type ReferenceRecordType = {
    keyList: List<KeyType>;
    dataMap: Map<KeyType, any>;
};
declare const ReferenceRecord_base: Record.Factory<ReferenceRecordType>;
export declare class ReferenceRecord extends ReferenceRecord_base {
    get keyList(): List<KeyType>;
    get dataMap(): Map<KeyType, any>;
}
declare type ExtDataReferenceRecordType = {
    reference: Map<KeyType, ReferenceRecord>;
};
declare const ExtDataReference_base: Record.Factory<ExtDataReferenceRecordType>;
export declare class ExtDataReference extends ExtDataReference_base {
    get reference(): Map<KeyType, ReferenceRecord>;
    getReferenceKeys(topicKey: KeyType): KeyType[];
    getReferencedKeys(topicKey: KeyType): KeyType[];
}
export {};
//# sourceMappingURL=ext-data-reference.d.ts.map