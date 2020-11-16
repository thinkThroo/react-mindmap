/// <reference types="react" />
import { DocModel, IControllerRunContext } from '@blink-mind/core';
export declare function TopicReferencePlugin(): {
    customizeTopicContextMenu(props: any, next: any): any;
    componentAreEqual(ctx: any, next: any): any;
    getOpMap(props: any, next: any): any;
    beforeOpFunction(props: any, next: any): DocModel;
    renderSheetCustomize(props: IControllerRunContext, next: any): any;
    renderTopicNodeLastRowOthers(props: any, next: any): any;
    renderTopicExtReference(props: any, next: any): JSX.Element;
    clearSelectedReferenceKeys(): void;
    getSelectedReferenceKeys(): unknown[];
    deserializeExtDataItem(props: any, next: any): any;
};
//# sourceMappingURL=topic-reference-plugin.d.ts.map