import { List, Map, Record } from 'immutable';
declare type TagRecordType = {
    name: string;
    style: string;
    topicKeys: List<KeyType>;
};
declare const TagRecord_base: Record.Factory<TagRecordType>;
export declare class TagRecord extends TagRecord_base {
    get name(): string;
    get style(): string;
    get topicKeys(): List<KeyType>;
}
declare type ExtDataTagsRecordType = {
    tags: Map<string, TagRecord>;
};
declare const ExtDataTags_base: Record.Factory<ExtDataTagsRecordType>;
export declare class ExtDataTags extends ExtDataTags_base {
    get tags(): Map<string, TagRecord>;
    getTopicTags(topicKey: any): Array<TagRecord>;
}
export {};
//# sourceMappingURL=ext-data-tags.d.ts.map