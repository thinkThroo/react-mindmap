import { Record } from 'immutable';
import { KeyType } from '../types';
declare type RelationRecordType = {
    key: KeyType;
    type: string;
    data: any;
};
declare const Relation_base: Record.Factory<RelationRecordType>;
export declare class Relation extends Relation_base {
}
export {};
//# sourceMappingURL=relation.d.ts.map