/// <reference types="react" />
import { TopicImageData } from './ext-data-images';
export declare function InsertImagesPlugin(): {
    handleTopicPaste(ctx: any, next: any): void;
    customizeDialog(ctx: any, next: any): any;
    customizeTopicContextMenu(ctx: any, next: any): any;
    getOpMap(ctx: any, next: any): any;
    renderTopicNodeRows(ctx: any, next: any): any;
    renderTopicExtImage(ctx: any): JSX.Element;
    getTopicImages(ctx: any): TopicImageData[];
    topicExtDataToJson(ctx: any, next: any): any;
    processTopicExtData(ctx: any, next: any): any;
    customizeAllowUndo(ctx: any, next: any): any;
    deserializeExtDataItem(ctx: any, next: any): any;
    getTotalTopicImageCount(ctx: any): any;
};
//# sourceMappingURL=insert-images-plugin.d.ts.map