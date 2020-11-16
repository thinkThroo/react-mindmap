import { List, Record } from 'immutable';
import { KeyType } from '../types';
import { Block } from './block';
import { Relation } from './relation';
declare type TopicRecordType = {
    key: KeyType;
    parentKey?: KeyType;
    collapse?: boolean;
    subKeys?: List<KeyType>;
    blocks?: List<Block>;
    relations?: List<Relation>;
    style?: string;
};
declare type CreateTopicArg = {
    key: KeyType;
    parentKey?: KeyType;
    collapse?: boolean;
    content?: any;
    subKeys?: List<KeyType> | KeyType[];
    style?: string;
};
declare const Topic_base: Record.Factory<TopicRecordType>;
export declare class Topic extends Topic_base {
    get key(): string;
    get parentKey(): string;
    get collapse(): boolean;
    get subKeys(): List<KeyType>;
    get blocks(): List<Block>;
    get relations(): List<Relation>;
    get style(): string;
    getBlock(type: string): {
        index: number;
        block: Block;
    };
    get contentData(): any;
    static fromJSON(obj: any): Topic;
    static create({ key, parentKey, content, subKeys, collapse }: CreateTopicArg): Topic;
}
export {};
//# sourceMappingURL=topic.d.ts.map