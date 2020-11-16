import { KeyType } from '@blink-mind/core';
import { BaseProps } from '@blink-mind/renderer-react';
import * as React from 'react';
export declare type ReferenceTopicThumbnailProps = BaseProps & {
    refKey: KeyType;
    refType: 'reference' | 'referenced' | undefined | null;
    removeHandler?: (event: React.MouseEvent<HTMLElement>) => void;
};
export declare function ReferenceTopicThumbnail(props: ReferenceTopicThumbnailProps): JSX.Element;
//# sourceMappingURL=reference-topic-thumbnail.d.ts.map