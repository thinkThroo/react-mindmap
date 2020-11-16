import { KeyPath, KeyType } from '../../types';
import { SheetModel } from '../sheet-model';
export declare function getAllSubTopicKeys(model: SheetModel, topicKey: KeyType): KeyType[];
export declare function getKeyPath(model: SheetModel, topicKey: KeyType, reverse?: boolean): KeyPath;
export declare function getRelationship(model: SheetModel, srcKey: KeyType, dstKey: KeyType): string;
export declare function getPrevTopicKey(model: SheetModel, topicKey: KeyType): string;
export declare function getNextTopicKey(model: SheetModel, topicKey: KeyType): void;
export declare function isFisrtChild(model: SheetModel, topicKey: KeyType): boolean;
export declare function isSibling(model: SheetModel, key1: KeyType, key2: KeyType): boolean;
/**
 * 根据当前元素的Key,获取depth=depth的祖先的key
 * @param model
 * @param key
 * @param depth
 */
export declare function getAncestorKeyByDepth(model: SheetModel, key: KeyType, depth: number): string;
/**
 * 找到他们互为sibling的祖先的Key,返回一个数组里面有两个祖先的key
 * @param model
 * @param key1
 * @param key2
 */
export declare function getSiblingAncestorKeys(model: SheetModel, key1: KeyType, key2: KeyType): Array<KeyType>;
/**
 * 获取从subKey1到subKey2之间的subKeys,前提是 subKey1和subKey2的父亲相同
 * @param model
 * @param subKey1
 * @param subKey2
 */
export declare function getRangeSubKeys(model: SheetModel, subKey1: KeyType, subKey2: KeyType): Array<KeyType>;
/**
 * 获取最底层最下面的后代的Key, 如果该项没有子元素，则返回自己的key
 * @param model
 * @param key
 */
export declare function getBottomDescendantKey(model: SheetModel, key: KeyType): KeyType;
/**
 * 获取最底层最下面的后代的Key, 需要考虑折叠, 如果该项没有子元素，则返回自己的key
 * @param model
 * @param key
 */
export declare function getVisualBottomDescendantKey(model: SheetModel, key: KeyType): KeyType;
/**
 * 是否都是Sibiling
 * @param model
 * @param keys
 */
export declare function isAllSibiling(model: SheetModel, keys: Array<KeyType>): boolean;
//# sourceMappingURL=index.d.ts.map