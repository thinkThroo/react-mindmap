import { List, Record } from 'immutable';
import { KeyType } from '../types';
declare type BlockRecordType = {
    type: string;
    key?: KeyType;
    data: any;
};
declare const Block_base: Record.Factory<BlockRecordType>;
export declare class Block extends Block_base {
    get data(): any;
    get type(): string;
    static create(obj: BlockRecordType): Block;
    static createList(obj: any): List<Block>;
}
export {};
//# sourceMappingURL=block.d.ts.map