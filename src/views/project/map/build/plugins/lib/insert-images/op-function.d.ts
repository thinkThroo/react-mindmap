import { BaseDocModelModifierArg } from '@blink-mind/core';
import { ExtDataImages, ImageRecord } from './ext-data-images';
export declare function addImage({ docModel, topicKey, image }: BaseDocModelModifierArg & {
    image: ImageRecord;
}): import("@blink-mind/core").DocModel;
export declare function deleteTopicImage({ docModel, topicKey, imageKey }: {
    docModel: any;
    topicKey: any;
    imageKey: any;
}): any;
export declare function addTopicImage({ docModel, topicKey, imageKey }: {
    docModel: any;
    topicKey: any;
    imageKey: any;
}): any;
export declare function setTopicImage({ docModel, topicKey, imageKey, imageData }: {
    docModel: any;
    topicKey: any;
    imageKey: any;
    imageData: any;
}): any;
export declare function moveTopicImage({ docModel, topicKey, imageKey, moveDir }: {
    docModel: any;
    topicKey: any;
    imageKey: any;
    moveDir: any;
}): any;
export declare function getUsedImageKeyTopicCount(extData: ExtDataImages, imageKey: KeyType): number;
//# sourceMappingURL=op-function.d.ts.map