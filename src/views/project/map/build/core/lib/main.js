'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var immutable = require('immutable');
var debug = _interopDefault(require('debug'));
var htmlToText = _interopDefault(require('html-to-text'));
var isPlainObject = _interopDefault(require('is-plain-object'));
var memoizeOne = _interopDefault(require('memoize-one'));
var warning = _interopDefault(require('tiny-warning'));

const TopicDirection = {
    LEFT: 'L',
    RIGHT: 'R',
    BOTTOM: 'B',
    MAIN: 'M' // root
};
(function (DiagramLayoutType) {
    DiagramLayoutType[DiagramLayoutType["LEFT_TO_RIGHT"] = 0] = "LEFT_TO_RIGHT";
    DiagramLayoutType[DiagramLayoutType["RIGHT_TO_LEFT"] = 1] = "RIGHT_TO_LEFT";
    DiagramLayoutType[DiagramLayoutType["LEFT_AND_RIGHT"] = 2] = "LEFT_AND_RIGHT";
    DiagramLayoutType[DiagramLayoutType["TOP_TO_BOTTOM"] = 3] = "TOP_TO_BOTTOM";
})(exports.DiagramLayoutType || (exports.DiagramLayoutType = {}));
const ViewModeMindMap = 'MindMap';
const TopicVisualLevel = {
    ROOT: 0,
    PRIMARY: 1,
    NORMAL: 2
};
const BlockType = {
    CONTENT: 'CONTENT',
    DESC: 'DESC'
};
const FocusMode = {
    NORMAL: 'NORMAL',
    EDITING_CONTENT: 'EDITING_CONTENT',
    EDITING_DESC: 'EDITING_DESC',
    SHOW_POPUP: 'SHOW_POPUP',
    DRAGGING: 'DRAGGING'
};
const TopicRelationship = {
    ANCESTOR: 'ANCESTOR',
    DESCENDANT: 'DESCENDANT',
    SIBLING: 'SIBLING',
    NONE: 'NONE'
};
const OpType = {
    ADD_SHEET: 'ADD_SHEET',
    SET_CURRENT_SHEET: 'SET_CURRENT_SHEET',
    DELETE_SHEET: 'DELETE_SHEET',
    DUPLICATE_SHEET: 'DUPLICATE_SHEET',
    SET_SHEET_TITLE: 'SET_SHEET_TITLE',
    ADD_MULTI_TOPICS: 'ADD_MULTI_TOPICS',
    ADD_MULTI_SIBLING: 'ADD_MULTI_SIBLING',
    ADD_MULTI_CHILD: 'ADD_MULTI_CHILD',
    ADD_MULTI_CHILD_WITH_EXTDATA: 'ADD_MULTI_CHILD_WITH_EXTDATA',
    TOGGLE_COLLAPSE: 'TOGGLE_COLLAPSE',
    COLLAPSE_ALL: 'COLLAPSE_ALL',
    EXPAND_ALL: 'EXPAND_ALL',
    EXPAND_TO: 'EXPAND_TO',
    ADD_CHILD: 'ADD_CHILD',
    ADD_SIBLING: 'ADD_SIBLING',
    TOPIC_CONTENT_TO_PLAIN_TEXT: 'TOPIC_CONTENT_TO_PLAIN_TEXT',
    INDENT: 'INDENT',
    OUTDENT: 'OUTDENT',
    DELETE_TOPIC: 'DELETE_TOPIC',
    FOCUS_TOPIC: 'FOCUS_TOPIC',
    SET_FOCUS_MODE: 'SET_FOCUS_MODE',
    SET_STYLE: 'SET_STYLE',
    CLEAR_ALL_CUSTOM_STYLE: 'CLEAR_ALL_CUSTOM_STYLE',
    SET_CONFIG: 'SET_CONFIG',
    SET_THEME: 'SET_THEME',
    SET_TOPIC_BLOCK: 'SET_TOPIC_BLOCK',
    DELETE_TOPIC_BLOCK: 'DELETE_TOPIC_BLOCK',
    // 节流函数使用，使用时不可以undo
    SET_TOPIC_BLOCK_CONTENT: 'SET_TOPIC_BLOCK_CONTENT',
    // SET_TOPIC_BLOCK_DESC: 'SET_TOPIC_BLOCK_DESC',
    // DELETE_TOPIC_BLOCK_DESC: 'DELETE_TOPIC_BLOCK_DESC',
    // SET_TOPIC_CONTENT: 'SET_TOPIC_CONTENT',
    // SET_TOPIC_DESC: 'SET_TOPIC_DESC',
    START_EDITING_CONTENT: 'START_EDITING_CONTENT',
    START_EDITING_DESC: 'START_EDITING_DESC',
    DRAG_AND_DROP: 'DRAG_AND_DROP',
    SET_EDITOR_ROOT: 'SET_EDITOR_ROOT',
    SET_LAYOUT_DIR: 'SET_LAYOUT_DIR',
    SWAP_UP: 'SWAP_UP',
    SWAP_DOWN: 'SWAP_DOWN'
};

const defaultBlockRecord = {
    type: null,
    key: null,
    data: null
};
class Block extends immutable.Record(defaultBlockRecord) {
    get data() {
        return this.get('data');
    }
    get type() {
        return this.get('type');
    }
    static create(obj) {
        return new Block(obj);
    }
    static createList(obj) {
        if (immutable.List.isList(obj) || Array.isArray(obj)) {
            // @ts-ignore
            return immutable.List(obj.map(Block.create));
        }
        throw new Error(`Block.createList only accepts Array or List, but you passed it: ${obj}`);
    }
}

function isThemeType(obj) {
    return (obj.name != null && obj.background != null && obj.highlightColor != null);
}

const defaultTheme = {
    name: 'defaultTheme',
    randomColor: false,
    background: '#DDDDDD',
    highlightColor: '#C31004',
    marginH: 50,
    marginV: 5,
    contentStyle: {
        lineHeight: '1'
    },
    linkStyle: {
        lineRadius: 5,
        lineWidth: '2px',
        lineColor: '#595959',
        lineType: 'curve'
    },
    rootTopic: {
        contentStyle: {
            background: '#C31004',
            color: '#fff',
            fontSize: '34px',
            borderRadius: '5px',
            padding: '16px 18px 16px 18px'
        },
        subLinkStyle: {
            lineType: 'curve'
        }
    },
    primaryTopic: {
        contentStyle: {
            background: '#333',
            borderRadius: '5px',
            color: '#fff',
            fontSize: '14px',
            padding: '6px 10px 5px 10px'
        },
        subLinkStyle: {
            hasUnderline: true,
            lineType: 'round'
        }
    },
    normalTopic: {
        contentStyle: {
            borderRadius: '5px',
            background: '#fff0',
            color: '#383833',
            fontSize: '13px',
            padding: '1px'
        },
        subLinkStyle: {
            hasUnderline: true,
            lineType: 'round'
        }
    }
};

const defaultConfigRecord = {
    viewMode: ViewModeMindMap,
    readOnly: false,
    allowUndo: true,
    layoutDir: exports.DiagramLayoutType.LEFT_TO_RIGHT,
    theme: defaultTheme
};
class Config extends immutable.Record(defaultConfigRecord) {
    get viewMode() {
        return this.get('viewMode');
    }
    get layoutDir() {
        return this.get('layoutDir');
    }
    get readOnly() {
        return this.get('readOnly');
    }
    get allowUndo() {
        return this.get('allowUndo');
    }
    get theme() {
        return this.get('theme');
    }
    static fromJSON(obj) {
        return new Config(obj);
    }
}

const defaultTopicRecord = {
    key: null,
    parentKey: null,
    collapse: false,
    subKeys: null,
    blocks: null,
    relations: null,
    style: null
};
class Topic extends immutable.Record(defaultTopicRecord) {
    get key() {
        return this.get('key');
    }
    get parentKey() {
        return this.get('parentKey');
    }
    get collapse() {
        return this.get('collapse');
    }
    get subKeys() {
        return this.get('subKeys');
    }
    get blocks() {
        return this.get('blocks');
    }
    get relations() {
        return this.get('relations');
    }
    get style() {
        return this.get('style');
    }
    getBlock(type) {
        const index = this.blocks.findIndex(b => b.type === type);
        if (index === -1)
            return { index, block: null };
        return { index, block: this.blocks.get(index) };
    }
    get contentData() {
        return this.getBlock(BlockType.CONTENT).block.data;
    }
    static fromJSON(obj) {
        const { key, parentKey = null, blocks, subKeys = [], collapse = false } = obj;
        return new Topic({
            key,
            parentKey,
            collapse,
            subKeys: immutable.List(subKeys),
            blocks: Block.createList(blocks)
        });
    }
    static create({ key, parentKey = null, content = '', subKeys = [], collapse = false }) {
        const block = Block.create({
            type: BlockType.CONTENT,
            data: content,
            key: null
        });
        const blocks = immutable.List([block]);
        return new Topic({
            key,
            parentKey,
            blocks,
            subKeys: immutable.List(subKeys),
            collapse
        });
    }
}

const defaultDescBlockDataRecord = {
    kind: null,
    data: null,
    collapse: false
};
class DescBlockData extends immutable.Record(defaultDescBlockDataRecord) {
    get kind() {
        return this.get('kind');
    }
    get data() {
        return this.get('data');
    }
    get collapse() {
        return this.get('collapse');
    }
}

function getAllSubTopicKeys(model, topicKey) {
    const item = model.getTopic(topicKey);
    let res = [];
    if (item.subKeys.size > 0) {
        const subKeys = item.subKeys.toArray();
        res.push(...subKeys);
        res = subKeys.reduce((acc, key) => {
            acc.push(...getAllSubTopicKeys(model, key));
            return acc;
        }, res);
    }
    return res;
}
function getKeyPath(model, topicKey, reverse = false) {
    const res = [topicKey];
    let item = model.getTopic(topicKey);
    while (item.parentKey) {
        reverse ? res.push(item.parentKey) : res.unshift(item.parentKey);
        item = model.getParentTopic(item.key);
    }
    return res;
}
function getRelationship(model, srcKey, dstKey) {
    const srcTopic = model.getTopic(srcKey);
    const dstTopic = model.getTopic(dstKey);
    if (srcTopic && dstTopic) {
        if (srcTopic.parentKey == dstTopic.parentKey)
            return TopicRelationship.SIBLING;
        let pTopic = srcTopic;
        while (pTopic.parentKey) {
            if (pTopic.parentKey === dstTopic.key)
                return TopicRelationship.DESCENDANT;
            pTopic = model.getParentTopic(pTopic.key);
        }
        pTopic = dstTopic;
        while (pTopic.parentKey) {
            if (pTopic.parentKey === srcTopic.key)
                return TopicRelationship.ANCESTOR;
            pTopic = model.getParentTopic(pTopic.key);
        }
    }
    return TopicRelationship.NONE;
}
function getPrevTopicKey(model, topicKey) {
    const parentTopic = model.getParentTopic(topicKey);
    if (parentTopic) {
        const index = parentTopic.subKeys.indexOf(topicKey);
        if (index === 0) {
            return parentTopic.key;
        }
        return parentTopic.subKeys.get(index - 1);
    }
    return null;
}
function getNextTopicKey(model, topicKey) { }
// 判断该topic是否为其父亲的第一个孩子
function isFisrtChild(model, topicKey) {
    const parentTopic = model.getParentTopic(topicKey);
    if (parentTopic) {
        const index = parentTopic.subKeys.indexOf(topicKey);
        if (index === 0) {
            return true;
        }
    }
    return false;
}
function isSibling(model, key1, key2) {
    return model.getParentTopic(key1) === model.getParentTopic(key2);
}
/**
 * 根据当前元素的Key,获取depth=depth的祖先的key
 * @param model
 * @param key
 * @param depth
 */
function getAncestorKeyByDepth(model, key, depth) {
    let curDepth = model.getDepth(key);
    if (curDepth === depth)
        return key;
    if (curDepth < depth)
        return null;
    while (curDepth > depth) {
        key = model.getParentKey(key);
        curDepth--;
    }
    return key;
}
/**
 * 找到他们互为sibling的祖先的Key,返回一个数组里面有两个祖先的key
 * @param model
 * @param key1
 * @param key2
 */
function getSiblingAncestorKeys(model, key1, key2) {
    const d1 = model.getDepth(key1);
    const d2 = model.getDepth(key2);
    if (d1 === d2) {
        if (isSibling(model, key1, key2))
            return [key1, key2];
        return getSiblingAncestorKeys(model, model.getParentKey(key1), model.getParentKey(key2));
    }
    return d1 > d2
        ? getSiblingAncestorKeys(model, getAncestorKeyByDepth(model, key1, d2), key2)
        : getSiblingAncestorKeys(model, key1, getAncestorKeyByDepth(model, key2, d1));
}
/**
 * 获取从subKey1到subKey2之间的subKeys,前提是 subKey1和subKey2的父亲相同
 * @param model
 * @param subKey1
 * @param subKey2
 */
function getRangeSubKeys(model, subKey1, subKey2) {
    const topic = model.getParentTopic(subKey1);
    const subKeys = topic.subKeys;
    const i1 = subKeys.indexOf(subKey1);
    const i2 = subKeys.indexOf(subKey2);
    if (i1 < 0 || i2 < 0)
        throw new Error(`The parent of subKey1 ${subKey1} and subKey2 ${subKey2} is not same`);
    return (i1 < i2
        ? subKeys.slice(i1, i2 + 1)
        : subKeys.slice(i2, i1 + 1)).toArray();
}
/**
 * 获取最底层最下面的后代的Key, 如果该项没有子元素，则返回自己的key
 * @param model
 * @param key
 */
function getBottomDescendantKey(model, key) {
    const topic = model.getTopic(key);
    return topic.subKeys.size === 0
        ? key
        : //@ts-ignore
            getBottomDescendantKey(model, topic.subKeys.last());
}
/**
 * 获取最底层最下面的后代的Key, 需要考虑折叠, 如果该项没有子元素，则返回自己的key
 * @param model
 * @param key
 */
function getVisualBottomDescendantKey(model, key) {
    const topic = model.getTopic(key);
    return topic.subKeys.size === 0 || topic.collapse
        ? key
        : //@ts-ignore
            getVisualBottomDescendantKey(model, topic.subKeys.last());
}
/**
 * 是否都是Sibiling
 * @param model
 * @param keys
 */
function isAllSibiling(model, keys) {
    if (keys && keys.length > 0) {
        const parentKey = model.getParentKey(keys[0]);
        for (const key of keys) {
            if (model.getParentKey(key) !== parentKey)
                return false;
        }
        return true;
    }
    return false;
}

function createKey() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

const log = debug('modifier');
function toggleCollapse({ model, topicKey }) {
    let topic = model.getTopic(topicKey);
    if (topic && topic.subKeys.size !== 0) {
        topic = topic.merge({
            collapse: !topic.collapse
        });
        model = model.updateIn(['topics', topic.key, 'collapse'], collapse => !collapse);
    }
    model = focusTopic({ model, topicKey, focusMode: FocusMode.NORMAL });
    return model;
}
function collapseAll({ model }) {
    const topicKeys = getAllSubTopicKeys(model, model.editorRootTopicKey);
    log(model);
    model = model.withMutations(m => {
        topicKeys.forEach(topicKey => {
            m.setIn(['topics', topicKey, 'collapse'], true);
        });
    });
    model = focusTopic({
        model,
        topicKey: model.editorRootTopicKey,
        focusMode: FocusMode.NORMAL
    });
    return model;
}
function expandAll({ model }) {
    const topicKeys = getAllSubTopicKeys(model, model.editorRootTopicKey);
    log(model);
    model = model.withMutations(m => {
        topicKeys.forEach(topicKey => {
            m.setIn(['topics', topicKey, 'collapse'], false);
        });
    });
    log(model);
    return model;
}
function expandTo({ model, topicKey }) {
    const keys = getKeyPath(model, topicKey).filter(t => t !== topicKey);
    model = model.withMutations(m => {
        keys.forEach(topicKey => {
            m.setIn(['topics', topicKey, 'collapse'], false);
        });
    });
    // 要让这个节点在视口中可见
    if (getRelationship(model, topicKey, model.editorRootTopicKey) !==
        TopicRelationship.DESCENDANT) {
        model = model.set('editorRootTopicKey', model.rootTopicKey);
    }
    return model;
}
function focusTopic({ model, topicKey, focusMode = FocusMode.NORMAL }) {
    log('focus topic', focusMode);
    if (!model.topics.has(topicKey)) {
        throw new Error(`focus key ${topicKey} is not in model`);
    }
    if (topicKey !== model.focusKey)
        model = model.set('focusKey', topicKey);
    // if (focusMode !== model.focusMode) model = model.set('focusMode', focusMode);
    model = model.set('focusMode', focusMode);
    if (model.selectedKeys != null)
        model = model.set('selectedKeys', null);
    return model;
}
function setFocusMode({ model, focusMode }) {
    log('setFocusMode');
    // SHOW_POPUP一定要重新设置, 因为可能dialogType 改变了
    if (focusMode !== model.focusMode || focusMode === FocusMode.SHOW_POPUP)
        model = model.set('focusMode', focusMode);
    return model;
}
function addChild({ model, topicKey, addAtFront = false }) {
    log('addChild:', topicKey);
    let topic = model.getTopic(topicKey);
    if (topic) {
        const child = Topic.create({ key: createKey(), parentKey: topic.key });
        topic = topic
            .set('collapse', false)
            .update('subKeys', subKeys => addAtFront ? subKeys.unshift(child.key) : subKeys.push(child.key));
        model = model.update('topics', topics => topics.set(topicKey, topic).set(child.key, child));
        return focusTopic({
            model,
            topicKey: child.key,
            focusMode: FocusMode.EDITING_CONTENT
        });
    }
    return model;
}
function addSibling({ model, topicKey, content }) {
    if (topicKey === model.rootTopicKey)
        return model;
    const topic = model.getTopic(topicKey);
    if (topic) {
        const pItem = model.getTopic(topic.parentKey);
        const idx = pItem.subKeys.indexOf(topicKey);
        const sibling = Topic.create({
            key: createKey(),
            parentKey: pItem.key,
            content
        });
        model = model
            .update('topics', topics => topics.set(sibling.key, sibling))
            .updateIn(['topics', pItem.key, 'subKeys'], subKeys => subKeys.insert(idx + 1, sibling.key));
        return focusTopic({
            model,
            topicKey: sibling.key,
            focusMode: FocusMode.EDITING_CONTENT
        });
    }
    return model;
}
function topicContentToPlainText({ model, topicKey }) {
    const content = model.getTopic(topicKey).getBlock(BlockType.CONTENT).block
        .data;
    const data = htmlToText.fromString(content, { preserveNewlines: true });
    return setTopicBlockContentData({ model, topicKey, data });
}
function deleteTopic({ model, topicKey }) {
    if (topicKey === model.editorRootTopicKey)
        return model;
    const item = model.getTopic(topicKey);
    if (item) {
        model = model.withMutations(m => {
            m.update('topics', topics => {
                topics = topics.delete(topicKey);
                const deleteKeys = getAllSubTopicKeys(model, topicKey);
                topics = topics.withMutations(t => {
                    deleteKeys.forEach(dKey => {
                        t.delete(dKey);
                    });
                });
                return topics;
            });
            m.updateIn(['topics', item.parentKey, 'subKeys'], subKeys => subKeys.delete(subKeys.indexOf(topicKey)));
            if (m.focusKey === topicKey)
                m.set('focusKey', getPrevTopicKey(model, topicKey)).set('focusMode', FocusMode.EDITING_CONTENT);
        });
    }
    return model;
}
function deleteTopics({ model, topicKeys }) {
    if (topicKeys == null)
        topicKeys = model.focusOrSelectedKeys;
    topicKeys.forEach(topicKey => {
        model = deleteTopic({ model, topicKey });
    });
    return model;
}
/**
 * setTopicBlockData of one topic
 * @param model
 * @param topicKey
 * @param blockType
 * @param focusMode
 * @param data
 */
function setTopicBlockData({ model, topicKey, blockType, focusMode, data }) {
    const topic = model.getTopic(topicKey);
    if (topic) {
        const { index, block } = topic.getBlock(blockType);
        if (index === -1) {
            model = model.updateIn(['topics', topicKey, 'blocks'], blocks => blocks.push(Block.create({
                type: blockType,
                data: data
            })));
        }
        else {
            if (block.data !== data) {
                model = model.updateIn(['topics', topicKey, 'blocks', index, 'data'], dt => data);
            }
        }
        if (focusMode) {
            model = focusTopic({
                model,
                topicKey,
                focusMode
            });
        }
    }
    return model;
}
function setTopicBlockContentData({ model, topicKey, focusMode = null, data }) {
    return setTopicBlockData({
        model,
        topicKey,
        focusMode,
        data,
        blockType: BlockType.CONTENT
    });
}
function deleteTopicBlock({ model, topicKey, blockType }) {
    const topic = model.getTopic(topicKey);
    if (topic) {
        const { index } = topic.getBlock(blockType);
        if (index !== -1) {
            model = model.updateIn(['topics', topicKey, 'blocks'], blocks => blocks.delete(index));
        }
        model = setFocusMode({
            model,
            focusMode: FocusMode.NORMAL
        });
    }
    return model;
}
function setStyle({ model, topicKey, style }) {
    const topic = model.getTopic(topicKey);
    if (topic) {
        if (style !== topic.style) {
            model = model.updateIn(['topics', topicKey, 'style'], s => style);
        }
    }
    return model;
}
function clearAllCustomStyle({ model }) {
    model = model.withMutations(model => {
        model.topics.keySeq().forEach(key => {
            model.setIn(['topics', key, 'style'], null);
        });
    });
    return model;
}
function setTheme({ model, theme }) {
    model = model.setIn(['config', 'theme'], theme);
    return model;
}
function setLayoutDir({ model, layoutDir }) {
    if (model.config.layoutDir === layoutDir)
        return model;
    model = model.setIn(['config', 'layoutDir'], layoutDir);
    return model;
}
function setConfig({ model, config }) {
    return model.set('config', model.config.merge(config));
}
function setEditorRootTopicKey({ model, topicKey }) {
    if (model.editorRootTopicKey !== topicKey)
        model = model.set('editorRootTopicKey', topicKey);
    if (model.getTopic(topicKey).collapse)
        model = model.setIn(['topics', topicKey, 'collapse'], false);
    return model;
}
function setZoomFactor({ model, zoomFactor }) {
    if (model.zoomFactor !== zoomFactor)
        model = model.set('zoomFactor', zoomFactor);
    return model;
}
function startEditingContent({ model, topicKey }) {
    return focusTopic({
        model,
        topicKey,
        focusMode: FocusMode.EDITING_CONTENT
    });
}
function startEditingDesc({ model, topicKey }) {
    const topic = model.getTopic(topicKey);
    const desc = topic.getBlock(BlockType.DESC);
    if (desc.block == null || desc.block.data == null) {
        model = SheetModelModifier.setTopicBlockData({
            model,
            topicKey,
            blockType: BlockType.DESC,
            data: new DescBlockData({ kind: 'html', data: '', collapse: false })
        });
    }
    model = SheetModelModifier.focusTopic({
        model,
        topicKey,
        focusMode: FocusMode.EDITING_DESC
    });
    return model;
}
function dragAndDrop({ model, srcKey, dstKey, dropDir }) {
    const srcTopic = model.getTopic(srcKey);
    const dstTopic = model.getTopic(dstKey);
    const srcParentKey = srcTopic.parentKey;
    const srcParentTopic = model.getTopic(srcParentKey);
    let srcParentSubKeys = srcParentTopic.subKeys;
    const srcIndex = srcParentSubKeys.indexOf(srcKey);
    srcParentSubKeys = srcParentSubKeys.delete(srcIndex);
    if (dropDir === 'in') {
        let dstSubKeys = dstTopic.subKeys;
        dstSubKeys = dstSubKeys.push(srcKey);
        model = model.withMutations(m => {
            m.setIn(['topics', srcParentKey, 'subKeys'], srcParentSubKeys)
                .setIn(['topics', srcKey, 'parentKey'], dstKey)
                .setIn(['topics', dstKey, 'subKeys'], dstSubKeys)
                .setIn(['topics', dstKey, 'collapse'], false);
        });
    }
    else {
        const dstParentKey = dstTopic.parentKey;
        const dstParentItem = model.getTopic(dstParentKey);
        let dstParentSubKeys = dstParentItem.subKeys;
        const dstIndex = dstParentSubKeys.indexOf(dstKey);
        //src 和 dst 的父亲相同，这种情况要做特殊处理
        if (srcParentKey === dstParentKey) {
            let newDstParentSubKeys = immutable.List();
            dstParentSubKeys.forEach(key => {
                if (key !== srcKey) {
                    if (key === dstKey) {
                        if (dropDir === 'prev') {
                            newDstParentSubKeys = newDstParentSubKeys.push(srcKey).push(key);
                        }
                        else {
                            newDstParentSubKeys = newDstParentSubKeys.push(key).push(srcKey);
                        }
                    }
                    else {
                        newDstParentSubKeys = newDstParentSubKeys.push(key);
                    }
                }
            });
            model = model.withMutations(m => {
                m.setIn(['topics', dstParentKey, 'subKeys'], newDstParentSubKeys);
            });
        }
        else {
            if (dropDir === 'prev') {
                dstParentSubKeys = dstParentSubKeys.insert(dstIndex, srcKey);
            }
            else if (dropDir === 'next') {
                dstParentSubKeys = dstParentSubKeys.insert(dstIndex + 1, srcKey);
            }
            model = model.withMutations(m => {
                m.setIn(['topics', srcParentKey, 'subKeys'], srcParentSubKeys)
                    .setIn(['topics', srcKey, 'parentKey'], dstParentKey)
                    .setIn(['topics', dstParentKey, 'subKeys'], dstParentSubKeys)
                    .setIn(['topics', dstParentKey, 'collapse'], false);
            });
        }
    }
    return model;
}
function swapUp({ model, topicKeys }) {
    if (topicKeys == null)
        topicKeys = model.focusOrSelectedKeys;
    const firstKey = topicKeys[0];
    const parent = model.getParentTopic(firstKey);
    const idxArray = [];
    for (const itemKey of topicKeys) {
        const idx = parent.subKeys.indexOf(itemKey);
        // 如果topicKeys不是sibling 关系
        if (idx === -1)
            return model;
        idxArray.push(idx);
    }
    // 对序号进行排序
    idxArray.sort((a, b) => a - b);
    const firstIdx = idxArray[0];
    if (firstIdx === 0) {
        return model;
    }
    else {
        const sortedItemKeys = idxArray.map(idx => parent.subKeys.get(idx));
        model = model.updateIn(['topics', parent.key, 'subKeys'], subKeys => subKeys
            .splice(idxArray[0], idxArray.length)
            .splice(idxArray[0] - 1, 0, ...sortedItemKeys));
    }
    return model;
}
function swapDown({ model, topicKeys }) {
    if (topicKeys == null)
        topicKeys = model.focusOrSelectedKeys;
    const firstKey = topicKeys[0];
    const parent = model.getParentTopic(firstKey);
    const idxArray = [];
    for (const itemKey of topicKeys) {
        const idx = parent.subKeys.indexOf(itemKey);
        if (idx === -1)
            return model;
        idxArray.push(idx);
    }
    idxArray.sort((a, b) => a - b);
    const lastIdx = idxArray[idxArray.length - 1];
    if (lastIdx === parent.subKeys.size - 1) {
        return model;
    }
    else {
        const sortedItemKeys = idxArray.map(idx => parent.subKeys.get(idx));
        model = model.updateIn(['topics', parent.key, 'subKeys'], subKeys => subKeys
            .splice(idxArray[0], idxArray.length)
            .splice(idxArray[0] + 1, 0, ...sortedItemKeys));
    }
    return model;
}
function addMultiSibling({ model, topicKey, contentArray, topicArray }) {
    const topic = model.getTopic(topicKey);
    const parentKey = topic.parentKey;
    const parentTopic = model.getTopic(parentKey);
    const idx = parentTopic.subKeys.indexOf(topicKey);
    if (contentArray) {
        const siblings = contentArray.map(content => Topic.create({
            key: createKey(),
            parentKey,
            content
        }));
        const siblingsKeys = siblings.map(s => s.key);
        model = model.withMutations(model => {
            siblings.forEach(sibling => {
                model.update('topics', topics => topics.set(sibling.key, sibling));
            });
            model.updateIn(['topics', parentKey, 'subKeys'], subKeys => subKeys.splice(idx + 1, 0, ...siblingsKeys));
        });
        model = focusTopic({
            model,
            topicKey: siblingsKeys[siblingsKeys.length - 1],
            focusMode: FocusMode.EDITING_CONTENT
        });
    }
    return model;
}
function addMultiChild({ model, topicKey, addAtFront = false, contentArray, topicArray }) {
    if (contentArray) {
        topicArray = contentArray.map(content => Topic.create({
            key: createKey(),
            parentKey: topicKey,
            content
        }));
    }
    const childKeys = topicArray
        .filter(s => s.parentKey === topicKey)
        .map(s => s.key);
    model = model.withMutations(model => {
        topicArray.forEach(topic => {
            model.update('topics', topics_ => topics_.set(topic.key, topic));
        });
        model.updateIn(['topics', topicKey, 'subKeys'], subKeys => addAtFront ? subKeys.unshift(...childKeys) : subKeys.push(...childKeys));
    });
    model = focusTopic({
        model,
        topicKey: childKeys[childKeys.length - 1],
        focusMode: FocusMode.EDITING_CONTENT
    });
    return model;
}
function addMultiTopics({ model, topics }) {
    model = model.withMutations(model => {
        topics.forEach(topic => {
            model.update('topics', topics_ => topics_.set(topic.key, topic));
        });
    });
    return model;
}
const SheetModelModifier = {
    addChild,
    addSibling,
    addMultiTopics,
    addMultiChild,
    addMultiSibling,
    toggleCollapse,
    collapseAll,
    expandAll,
    expandTo,
    focusTopic,
    topicContentToPlainText,
    setFocusMode,
    deleteTopic,
    deleteTopics,
    setTopicBlockData,
    setTopicBlockContentData,
    deleteTopicBlock,
    setStyle,
    clearAllCustomStyle,
    setConfig,
    setTheme,
    setLayoutDir,
    setEditorRootTopicKey,
    setZoomFactor,
    startEditingContent,
    startEditingDesc,
    dragAndDrop,
    swapUp,
    swapDown
};

const log$1 = debug('modifier');
function setCurrentSheetModel(docModel, sheetModel) {
    if (docModel.currentSheetModel !== sheetModel) {
        docModel = docModel.updateIn(['sheetModels', docModel.currentSheetIndex], m => sheetModel);
    }
    return docModel;
}
function toDocModelModifierFunc(sheetModelModifierFunc) {
    return arg => {
        const { docModel, ...rest } = arg;
        return setCurrentSheetModel(docModel, sheetModelModifierFunc({ ...rest, model: docModel.currentSheetModel }));
    };
}
function addSheet({ docModel, sheetModel }) {
    docModel = docModel.update('sheetModels', sheetModels => sheetModels.push(sheetModel));
    docModel = docModel.set('currentSheetIndex', docModel.sheetModels.size - 1);
    return docModel;
}
function setCurrentSheet({ docModel, sheetIndex = null, sheetModel = null, sheetId = null }) {
    if (sheetIndex != null && sheetModel != null) {
        throw new Error('index and sheetModel both not null');
    }
    if (sheetIndex != null && docModel.currentSheetIndex !== sheetIndex) {
        if (sheetIndex >= 0 && sheetIndex < docModel.sheetModels.size) {
            docModel = docModel.set('currentSheetIndex', sheetIndex);
        }
    }
    else if (sheetModel != null) {
        const idx = docModel.sheetModels.indexOf(sheetModel);
        if (idx === -1) {
            throw new Error('sheetModel is not in docModel');
        }
        docModel = docModel.set('currentSheetIndex', idx);
    }
    else if (sheetId) {
        const idx = docModel.getSheetIndex(sheetId);
        if (idx === -1) {
            throw new Error('sheetModel is not in docModel');
        }
        docModel = docModel.set('currentSheetIndex', idx);
    }
    return docModel;
}
function duplicateSheet({ docModel, sheetModel, title }) {
    const idx = docModel.sheetModels.indexOf(sheetModel);
    if (idx === -1) {
        throw new Error('sheetModel is not in docModel');
    }
    docModel = docModel
        .update('sheetModels', sheetModels => sheetModels.insert(idx + 1, sheetModel.set('title', title)))
        .set('currentSheetIndex', idx + 1);
    return docModel;
}
function deleteSheet({ docModel, sheetModel }) {
    const idx = docModel.sheetModels.indexOf(sheetModel);
    if (idx === -1) {
        throw new Error('sheetModel is not in docModel');
    }
    docModel = docModel
        .update('sheetModels', sheetModels => sheetModels.delete(idx))
        .set('currentSheetIndex', 0);
    return docModel;
}
function setSheetTitle({ docModel, title }) {
    docModel = docModel.updateIn(['sheetModels', docModel.currentSheetIndex], sheetModel => sheetModel.set('title', title));
    return docModel;
}
function addMultiChildWithExtData({ docModel, topicKey, addAtFront = false, contentArray, topicArray, extData }) {
    docModel = setCurrentSheetModel(docModel, SheetModelModifier.addMultiChild({
        model: docModel.currentSheetModel,
        topicKey,
        addAtFront,
        contentArray,
        topicArray
    }));
    if (extData)
        docModel = docModel.set('extData', extData);
    return docModel;
}
const DocModelModifier = {
    addSheet,
    setCurrentSheet,
    duplicateSheet,
    deleteSheet,
    setSheetTitle,
    addMultiChildWithExtData
};
Object.keys(SheetModelModifier).forEach(k => {
    DocModelModifier[k] = toDocModelModifierFunc(SheetModelModifier[k]);
});

const defaultModelRecord = {
    id: null,
    title: null,
    topics: immutable.Map(),
    config: new Config(),
    rootTopicKey: null,
    editorRootTopicKey: null,
    focusKey: null,
    focusMode: null,
    zoomFactor: 1,
    selectedKeys: null,
    formatVersion: null
};
class SheetModel extends immutable.Record(defaultModelRecord) {
    static isModel(obj) {
        return obj instanceof SheetModel;
    }
    static create(attrs = null) {
        if (attrs == null)
            return SheetModel.createEmpty();
        let res;
        if (SheetModel.isModel(attrs)) {
            res = attrs;
        }
        if (isPlainObject(attrs)) {
            res = SheetModel.fromJSON(attrs);
        }
        if (res) {
            if (res.focusKey == null) {
                res = res.set('focusKey', res.rootTopicKey);
            }
            if (res.focusMode == null) {
                res = res.set('focusMode', FocusMode.NORMAL);
            }
            return res;
        }
        throw new Error(`\`Value.create\` only accepts objects or values, but you passed it: ${attrs}`);
    }
    static createEmpty(arg) {
        const model = new SheetModel();
        const rootTopic = Topic.create({ key: createKey(), content: 'RootTopic' });
        return model
            .set('id', createKey())
            .update('topics', topics => topics.set(rootTopic.key, rootTopic))
            .set('rootTopicKey', rootTopic.key)
            .set('editorRootTopicKey', rootTopic.key)
            .set('focusKey', rootTopic.key)
            .set('focusMode', FocusMode.NORMAL)
            .merge(arg);
    }
    static fromJSON(object) {
        let model = new SheetModel();
        const { topics = [], config = {}, rootTopicKey } = object;
        let { editorRootTopicKey } = object;
        if (editorRootTopicKey === undefined)
            editorRootTopicKey = rootTopicKey;
        model = model.merge({
            rootTopicKey,
            editorRootTopicKey
        });
        model = model.withMutations(model => {
            topics.forEach(topic => {
                model.update('topics', topics => topics.set(topic.key, Topic.fromJSON(topic)));
            });
            model.set('config', Config.fromJSON(config));
        });
        return model;
    }
    toJS() {
        return {
            id: this.id,
            title: this.title,
            rootTopicKey: this.rootTopicKey,
            topics: Object.values(this.topics.toJS()),
            config: this.config,
            zoomFactor: this.zoomFactor
        };
    }
    get id() {
        return this.get('id');
    }
    get title() {
        return this.get('title');
    }
    get topics() {
        return this.get('topics');
    }
    get config() {
        return this.get('config');
    }
    get formatVersion() {
        return this.get('formatVersion');
    }
    get rootTopicKey() {
        return this.get('rootTopicKey');
    }
    get editorRootTopicKey() {
        return this.get('editorRootTopicKey');
    }
    get focusKey() {
        return this.get('focusKey');
    }
    get focusMode() {
        return this.get('focusMode');
    }
    get editingContentKey() {
        return [FocusMode.EDITING_CONTENT, FocusMode.SHOW_POPUP].includes(this.focusMode)
            ? this.focusKey
            : null;
    }
    get editingDescKey() {
        return this.focusMode === FocusMode.EDITING_DESC ? this.focusKey : null;
    }
    get selectedKeys() {
        return this.get('selectedKeys');
    }
    get focusOrSelectedKeys() {
        return this.selectedKeys || [this.focusKey];
    }
    getTopic(key) {
        return this.topics.get(key);
    }
    getParentTopic(key) {
        const topic = this.getTopic(key);
        return topic.parentKey ? this.getTopic(topic.parentKey) : null;
    }
    getParentKey(key) {
        return this.getTopic(key).parentKey;
    }
    getPreviousSiblingKey(key) {
        const p = this.getParentTopic(key);
        const index = p.subKeys.indexOf(key);
        if (index === 0)
            return null;
        return p.subKeys.get(index - 1);
    }
    getNextSiblingKey(key) {
        const p = this.getParentTopic(key);
        const index = p.subKeys.indexOf(key);
        if (index === p.subKeys.size - 1)
            return null;
        return p.subKeys.get(index + 1);
    }
    getVisualDepth(key) {
        let topic = this.getTopic(key);
        let depth = 0;
        while (topic && topic.key !== this.editorRootTopicKey) {
            depth++;
            topic = this.getParentTopic(topic.key);
        }
        return depth;
    }
    getDepth(key) {
        let topic = this.getTopic(key);
        let depth = 0;
        while (topic && topic.key !== this.rootTopicKey) {
            depth++;
            topic = this.getParentTopic(topic.key);
        }
        return depth;
    }
    get rootTopic() {
        return this.getTopic(this.rootTopicKey);
    }
    get currentFocusTopic() {
        return this.getTopic(this.focusKey);
    }
    // 暂时没有用到
    get zoomFactor() {
        return this.get('zoomFactor');
    }
    isEditorRootKey(topicKey) {
        return topicKey === this.editorRootTopicKey;
    }
}

const defaultDocRecord = {
    sheetModels: immutable.List(),
    extData: immutable.Map(),
    currentSheetIndex: -1,
    formatVersion: '0.1'
};
class DocModel extends immutable.Record(defaultDocRecord) {
    get sheetModels() {
        return this.get('sheetModels');
    }
    get currentSheetIndex() {
        return this.get('currentSheetIndex');
    }
    get formatVersion() {
        return this.get('formatVersion');
    }
    static createEmpty() {
        return new DocModel({
            sheetModels: immutable.List([SheetModel.createEmpty()]),
            currentSheetIndex: 0
        });
    }
    get currentSheetModel() {
        return this.sheetModels.get(this.currentSheetIndex);
    }
    get extData() {
        return this.get('extData');
    }
    getSheetModel(sheetId) {
        return this.sheetModels.find(s => s.id === sheetId);
    }
    getSheetIndex(sheetModel) {
        return sheetModel instanceof SheetModel
            ? this.sheetModels.indexOf(sheetModel)
            : this.sheetModels.findIndex(s => s.id === sheetModel);
    }
    getExtDataItem(key, c) {
        return this.extData.get(key) || new c();
    }
    getSheetIdThatContainsTopic(topicKey) {
        const sheet = this.sheetModels.find(s => s.topics.has(topicKey));
        return sheet ? sheet.id : null;
    }
}

function CorePlugin(options = {}) {
    const { plugins = [] } = options;
    return [...plugins];
}

const log$2 = debug('core:controller');
function registerPlugin(controller, plugin) {
    if (Array.isArray(plugin)) {
        plugin.forEach(p => registerPlugin(controller, p));
        return;
    }
    if (plugin == null) {
        return;
    }
    for (const key in plugin) {
        const fn = plugin[key];
        controller.middleware[key] = controller.middleware[key] || [];
        controller.middleware[key].push(fn);
    }
}
// modified from koa-compose
function compose(middleware) {
    if (!Array.isArray(middleware))
        throw new TypeError('Middleware stack must be an array!');
    for (const fn of middleware) {
        if (typeof fn !== 'function')
            throw new TypeError('Middleware must be composed of functions!');
    }
    return function (context, next) {
        // last called middleware #
        let index = -1;
        return dispatch(0);
        function dispatch(i) {
            if (i <= index)
                throw new Error('next() called multiple times');
            index = i;
            let fn = middleware[i];
            if (i === middleware.length)
                fn = next;
            if (!fn)
                return null;
            try {
                return fn(context, dispatch.bind(null, i + 1));
            }
            catch (err) {
                throw err;
            }
        }
    };
}
class Controller {
    constructor(options = {}) {
        const { plugins = [], onChange, readOnly } = options;
        this.readOnly = readOnly;
        this.onChange = onChange;
        this.middleware = new Map();
        const corePlugin = CorePlugin({ plugins });
        registerPlugin(this, corePlugin);
    }
    get model() {
        return this.docModel.currentSheetModel;
    }
    run(key, arg) {
        try {
            const { middleware } = this;
            const fns = middleware[key] || [];
            warning(fns.length !== 0, `the middleware function ${key} is not found!`);
            const composedFn = memoizeOne(compose)(fns);
            // @ts-ignore
            return composedFn(arg);
        }
        catch (e) {
            this.run('captureError', { error: e });
        }
    }
    getValue(propKey, arg) {
        return this.run('getValue', { ...arg, propKey });
    }
    change(model, callback) {
        log$2('change', model, model.currentSheetModel);
        this.docModel = model;
        this.onChange(model, callback);
    }
}

exports.Block = Block;
exports.BlockType = BlockType;
exports.Config = Config;
exports.Controller = Controller;
exports.DescBlockData = DescBlockData;
exports.DocModel = DocModel;
exports.DocModelModifier = DocModelModifier;
exports.FocusMode = FocusMode;
exports.OpType = OpType;
exports.SheetModel = SheetModel;
exports.SheetModelModifier = SheetModelModifier;
exports.Topic = Topic;
exports.TopicDirection = TopicDirection;
exports.TopicRelationship = TopicRelationship;
exports.TopicVisualLevel = TopicVisualLevel;
exports.ViewModeMindMap = ViewModeMindMap;
exports.createKey = createKey;
exports.defaultTheme = defaultTheme;
exports.getAllSubTopicKeys = getAllSubTopicKeys;
exports.getAncestorKeyByDepth = getAncestorKeyByDepth;
exports.getBottomDescendantKey = getBottomDescendantKey;
exports.getKeyPath = getKeyPath;
exports.getNextTopicKey = getNextTopicKey;
exports.getPrevTopicKey = getPrevTopicKey;
exports.getRangeSubKeys = getRangeSubKeys;
exports.getRelationship = getRelationship;
exports.getSiblingAncestorKeys = getSiblingAncestorKeys;
exports.getVisualBottomDescendantKey = getVisualBottomDescendantKey;
exports.isAllSibiling = isAllSibiling;
exports.isFisrtChild = isFisrtChild;
exports.isSibling = isSibling;
exports.isThemeType = isThemeType;
exports.setCurrentSheetModel = setCurrentSheetModel;
exports.toDocModelModifierFunc = toDocModelModifierFunc;
//# sourceMappingURL=main.js.map
