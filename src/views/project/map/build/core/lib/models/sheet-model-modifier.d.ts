import { ThemeType } from '../configs/theme';
import { DiagramLayoutType, KeyType } from '../types';
import { ConfigRecordType } from './config';
import { SheetModel } from './sheet-model';
import { Topic } from './topic';
export declare type BaseSheetModelModifierArg = {
    model: SheetModel;
    topicKey?: KeyType;
    topicKeys?: Array<KeyType>;
};
declare type setTopicBlockDataArg = BaseSheetModelModifierArg & {
    blockType: string;
    data: any;
    focusMode?: string;
};
declare type DeleteTopicBlockArg = BaseSheetModelModifierArg & {
    blockType: string;
};
declare type SetFocusModeArg = BaseSheetModelModifierArg & {
    focusMode: string;
};
declare type SetTopicStyleArg = BaseSheetModelModifierArg & {
    style: string;
};
declare type SetZoomFactorArg = BaseSheetModelModifierArg & {
    zoomFactor: number;
};
declare type SetThemeArg = BaseSheetModelModifierArg & {
    theme: ThemeType;
};
declare type SetLayoutDirArg = BaseSheetModelModifierArg & {
    layoutDir: DiagramLayoutType;
};
declare type SetConfigArg = BaseSheetModelModifierArg & {
    config: Partial<ConfigRecordType>;
};
export declare type SheetModelModifierResult = SheetModel;
declare function toggleCollapse({ model, topicKey }: BaseSheetModelModifierArg): SheetModelModifierResult;
declare function collapseAll({ model }: BaseSheetModelModifierArg): SheetModelModifierResult;
declare function expandAll({ model }: BaseSheetModelModifierArg): SheetModelModifierResult;
declare function expandTo({ model, topicKey }: BaseSheetModelModifierArg): SheetModelModifierResult;
declare function focusTopic({ model, topicKey, focusMode }: SetFocusModeArg): SheetModelModifierResult;
declare function setFocusMode({ model, focusMode }: SetFocusModeArg): SheetModelModifierResult;
declare function addChild({ model, topicKey, addAtFront }: BaseSheetModelModifierArg & {
    addAtFront: boolean;
}): SheetModelModifierResult;
declare function addSibling({ model, topicKey, content }: BaseSheetModelModifierArg & {
    content?: string;
}): SheetModelModifierResult;
declare function topicContentToPlainText({ model, topicKey }: BaseSheetModelModifierArg): SheetModelModifierResult;
declare function deleteTopic({ model, topicKey }: BaseSheetModelModifierArg): SheetModelModifierResult;
declare function deleteTopics({ model, topicKeys }: {
    model: any;
    topicKeys: any;
}): SheetModelModifierResult;
/**
 * setTopicBlockData of one topic
 * @param model
 * @param topicKey
 * @param blockType
 * @param focusMode
 * @param data
 */
declare function setTopicBlockData({ model, topicKey, blockType, focusMode, data }: setTopicBlockDataArg): SheetModelModifierResult;
declare function setTopicBlockContentData({ model, topicKey, focusMode, data }: {
    model: any;
    topicKey: any;
    focusMode?: any;
    data: any;
}): SheetModelModifierResult;
declare function deleteTopicBlock({ model, topicKey, blockType }: DeleteTopicBlockArg): SheetModel;
declare function setStyle({ model, topicKey, style }: SetTopicStyleArg): SheetModelModifierResult;
declare function clearAllCustomStyle({ model }: BaseSheetModelModifierArg): SheetModelModifierResult;
declare function setTheme({ model, theme }: SetThemeArg): SheetModelModifierResult;
declare function setLayoutDir({ model, layoutDir }: SetLayoutDirArg): SheetModelModifierResult;
declare function setConfig({ model, config }: SetConfigArg): SheetModel;
declare function setEditorRootTopicKey({ model, topicKey }: BaseSheetModelModifierArg): SheetModelModifierResult;
declare function setZoomFactor({ model, zoomFactor }: SetZoomFactorArg): SheetModelModifierResult;
declare function startEditingContent({ model, topicKey }: BaseSheetModelModifierArg): SheetModel;
declare function startEditingDesc({ model, topicKey }: BaseSheetModelModifierArg): SheetModel;
declare function dragAndDrop({ model, srcKey, dstKey, dropDir }: {
    model: any;
    srcKey: any;
    dstKey: any;
    dropDir: any;
}): any;
declare function swapUp({ model, topicKeys }: BaseSheetModelModifierArg): SheetModelModifierResult;
declare function swapDown({ model, topicKeys }: BaseSheetModelModifierArg): SheetModelModifierResult;
declare function addMultiSibling({ model, topicKey, contentArray, topicArray }: BaseSheetModelModifierArg & {
    contentArray?: string[];
    topicArray?: Array<Topic>;
}): SheetModel;
declare function addMultiChild({ model, topicKey, addAtFront, contentArray, topicArray }: BaseSheetModelModifierArg & {
    addAtFront?: boolean;
    contentArray?: string[];
    topicArray?: Array<Topic>;
}): SheetModel;
declare function addMultiTopics({ model, topics }: {
    model: any;
    topics: any;
}): any;
export declare const SheetModelModifier: {
    addChild: typeof addChild;
    addSibling: typeof addSibling;
    addMultiTopics: typeof addMultiTopics;
    addMultiChild: typeof addMultiChild;
    addMultiSibling: typeof addMultiSibling;
    toggleCollapse: typeof toggleCollapse;
    collapseAll: typeof collapseAll;
    expandAll: typeof expandAll;
    expandTo: typeof expandTo;
    focusTopic: typeof focusTopic;
    topicContentToPlainText: typeof topicContentToPlainText;
    setFocusMode: typeof setFocusMode;
    deleteTopic: typeof deleteTopic;
    deleteTopics: typeof deleteTopics;
    setTopicBlockData: typeof setTopicBlockData;
    setTopicBlockContentData: typeof setTopicBlockContentData;
    deleteTopicBlock: typeof deleteTopicBlock;
    setStyle: typeof setStyle;
    clearAllCustomStyle: typeof clearAllCustomStyle;
    setConfig: typeof setConfig;
    setTheme: typeof setTheme;
    setLayoutDir: typeof setLayoutDir;
    setEditorRootTopicKey: typeof setEditorRootTopicKey;
    setZoomFactor: typeof setZoomFactor;
    startEditingContent: typeof startEditingContent;
    startEditingDesc: typeof startEditingDesc;
    dragAndDrop: typeof dragAndDrop;
    swapUp: typeof swapUp;
    swapDown: typeof swapDown;
};
export {};
//# sourceMappingURL=sheet-model-modifier.d.ts.map