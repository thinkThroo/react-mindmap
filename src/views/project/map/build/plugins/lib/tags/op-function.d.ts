import { BaseDocModelModifierArg } from '@blink-mind/core';
import { TagRecord } from './ext-data-tags';
export declare function addNewTag({ docModel, tag }: BaseDocModelModifierArg & {
    tag: TagRecord;
}): import("@blink-mind/core").DocModel;
export declare function deleteTag({ docModel, tagName }: BaseDocModelModifierArg & {
    tagName: string;
}): import("@blink-mind/core").DocModel;
export declare function updateTag({ docModel, oldTagName, newTag }: BaseDocModelModifierArg & {
    oldTagName: string;
    newTag: TagRecord;
}): import("@blink-mind/core").DocModel;
export declare function addTopicTag({ docModel, topicKey, tagName }: BaseDocModelModifierArg & {
    tagName: string;
}): import("@blink-mind/core").DocModel;
export declare function removeTopicTag({ docModel, topicKey, tagName }: BaseDocModelModifierArg & {
    tagName: string;
}): import("@blink-mind/core").DocModel;
export declare function getTopicTagNames({ docModel, topicKey }: {
    docModel: any;
    topicKey: any;
}): string[];
//# sourceMappingURL=op-function.d.ts.map