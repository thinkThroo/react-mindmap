/// <reference types="react" />
import { IControllerRunContext } from '@blink-mind/core';
import { BaseProps } from '@blink-mind/renderer-react';
import { TagRecord } from './ext-data-tags';
export declare function TagsPlugin(): {
    componentAreEqual(ctx: {
        prevProps: BaseProps;
        nextProps: BaseProps;
    }, next: any): any;
    renderRightTopPanelTabs(props: any, next: any): any;
    getOpMap(props: any, next: any): any;
    topicExtDataToJson(ctx: any, next: any): any;
    processTopicExtData(ctx: any, next: any): any;
    renderTopicNodeLastRowOthers(props: any, next: any): any;
    renderTopicExtTag(props: any): JSX.Element[];
    deserializeExtDataItem(props: any, next: any): any;
    getTopicTags(props: IControllerRunContext): TagRecord[];
    getTopicTagsCanBeAdded(props: IControllerRunContext): any[];
};
//# sourceMappingURL=tags-plugin.d.ts.map