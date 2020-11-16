import { DocModel } from '../models';
export declare type KeyType = string;
export declare type KeyPath = KeyType[];
export declare const TopicDirection: {
    LEFT: string;
    RIGHT: string;
    BOTTOM: string;
    MAIN: string;
};
export declare enum DiagramLayoutType {
    LEFT_TO_RIGHT = 0,
    RIGHT_TO_LEFT = 1,
    LEFT_AND_RIGHT = 2,
    TOP_TO_BOTTOM = 3
}
export declare const ViewModeMindMap = "MindMap";
export declare const TopicVisualLevel: {
    ROOT: number;
    PRIMARY: number;
    NORMAL: number;
};
export declare const BlockType: {
    CONTENT: string;
    DESC: string;
};
export declare const FocusMode: {
    NORMAL: string;
    EDITING_CONTENT: string;
    EDITING_DESC: string;
    SHOW_POPUP: string;
    DRAGGING: string;
};
export declare type ModelChangeCallback = () => void;
export declare type OnChangeFunction = (model: DocModel, callback?: ModelChangeCallback) => void;
export declare const TopicRelationship: {
    ANCESTOR: string;
    DESCENDANT: string;
    SIBLING: string;
    NONE: string;
};
export declare const OpType: {
    ADD_SHEET: string;
    SET_CURRENT_SHEET: string;
    DELETE_SHEET: string;
    DUPLICATE_SHEET: string;
    SET_SHEET_TITLE: string;
    ADD_MULTI_TOPICS: string;
    ADD_MULTI_SIBLING: string;
    ADD_MULTI_CHILD: string;
    ADD_MULTI_CHILD_WITH_EXTDATA: string;
    TOGGLE_COLLAPSE: string;
    COLLAPSE_ALL: string;
    EXPAND_ALL: string;
    EXPAND_TO: string;
    ADD_CHILD: string;
    ADD_SIBLING: string;
    TOPIC_CONTENT_TO_PLAIN_TEXT: string;
    INDENT: string;
    OUTDENT: string;
    DELETE_TOPIC: string;
    FOCUS_TOPIC: string;
    SET_FOCUS_MODE: string;
    SET_STYLE: string;
    CLEAR_ALL_CUSTOM_STYLE: string;
    SET_CONFIG: string;
    SET_THEME: string;
    SET_TOPIC_BLOCK: string;
    DELETE_TOPIC_BLOCK: string;
    SET_TOPIC_BLOCK_CONTENT: string;
    START_EDITING_CONTENT: string;
    START_EDITING_DESC: string;
    DRAG_AND_DROP: string;
    SET_EDITOR_ROOT: string;
    SET_LAYOUT_DIR: string;
    SWAP_UP: string;
    SWAP_DOWN: string;
};
//# sourceMappingURL=index.d.ts.map