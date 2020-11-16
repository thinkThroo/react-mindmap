import { Map, Record } from 'immutable';
import { KeyType } from '../types';
import { Config } from './config';
import { Topic } from './topic';
declare type ModelRecordType = {
    id: KeyType;
    title: string;
    topics: Map<KeyType, Topic>;
    config: Config;
    rootTopicKey: KeyType;
    editorRootTopicKey?: KeyType;
    focusKey?: KeyType;
    focusMode?: string;
    selectedKeys?: Array<KeyType>;
    zoomFactor: number;
    formatVersion?: string;
};
declare const SheetModel_base: Record.Factory<ModelRecordType>;
export declare class SheetModel extends SheetModel_base {
    static isModel(obj: any): boolean;
    static create(attrs?: any): SheetModel;
    static createEmpty(arg?: any): SheetModel;
    static fromJSON(object: any): SheetModel;
    toJS(): {
        id: string;
        title: string;
        rootTopicKey: string;
        topics: any[];
        config: Config;
        zoomFactor: number;
    };
    get id(): KeyType;
    get title(): string;
    get topics(): Map<KeyType, Topic>;
    get config(): Config;
    get formatVersion(): string;
    get rootTopicKey(): KeyType;
    get editorRootTopicKey(): KeyType;
    get focusKey(): KeyType;
    get focusMode(): string;
    get editingContentKey(): KeyType;
    get editingDescKey(): KeyType;
    get selectedKeys(): Array<KeyType>;
    get focusOrSelectedKeys(): Array<KeyType>;
    getTopic(key: KeyType): Topic;
    getParentTopic(key: KeyType): Topic;
    getParentKey(key: KeyType): KeyType;
    getPreviousSiblingKey(key: KeyType): KeyType;
    getNextSiblingKey(key: KeyType): KeyType;
    getVisualDepth(key: KeyType): number;
    getDepth(key: KeyType): number;
    get rootTopic(): Topic;
    get currentFocusTopic(): Topic;
    get zoomFactor(): number;
    isEditorRootKey(topicKey: KeyType): boolean;
}
export {};
//# sourceMappingURL=sheet-model.d.ts.map