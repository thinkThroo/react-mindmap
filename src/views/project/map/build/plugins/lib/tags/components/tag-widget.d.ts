import { BaseProps } from '@blink-mind/renderer-react';
import * as React from 'react';
import { TagRecord } from '../ext-data-tags';
export interface TagWidgetProps extends BaseProps {
    isTopicTag?: boolean;
    tag: TagRecord;
    large?: boolean;
    clickToUpdate?: boolean;
    onClick?: (tag: TagRecord) => (e: any) => void;
    onRemove?: (tag: TagRecord) => (e: any) => void;
}
export declare class TagWidget extends React.PureComponent<TagWidgetProps> {
    constructor(props: any);
    renderContextMenu(): JSX.Element;
    onClickUpdateTag: (e: any) => void;
    handleClick: (e: any) => void;
    render(): JSX.Element;
}
export declare function StyledTagWidget(props: any): JSX.Element;
//# sourceMappingURL=tag-widget.d.ts.map