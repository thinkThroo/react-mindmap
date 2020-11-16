/// <reference types="react" />
import { BaseProps } from '@blink-mind/renderer-react';
import { TopicImageData } from '../ext-data-images';
interface Props extends BaseProps {
    image: TopicImageData;
    index: number;
    totalCount: number;
}
export declare function ImageWidget(props: Props): JSX.Element;
export {};
//# sourceMappingURL=image-widget.d.ts.map