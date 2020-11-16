import { KeyType } from '@blink-mind/core';
import { List, Map, Record } from 'immutable';
declare type ImageRecordType = {
    key: KeyType;
    url: string;
    width: number;
    height: number;
};
declare const ImageRecord_base: Record.Factory<ImageRecordType>;
export declare class ImageRecord extends ImageRecord_base {
    get key(): KeyType;
    get url(): string;
    get width(): number;
    get height(): number;
}
declare type TopicImageRecordType = {
    key: KeyType;
    width: number;
    height: number;
};
declare const TopicImageRecord_base: Record.Factory<TopicImageRecordType>;
export declare class TopicImageRecord extends TopicImageRecord_base {
    get key(): string;
    get width(): number;
    get height(): number;
}
declare type ExtDataImagesRecordType = {
    images: Map<KeyType, ImageRecord>;
    topics: Map<KeyType, List<TopicImageRecord>>;
};
declare const ExtDataImages_base: Record.Factory<ExtDataImagesRecordType>;
export declare class ExtDataImages extends ExtDataImages_base {
    get images(): Map<KeyType, ImageRecord>;
    get topics(): Map<KeyType, List<TopicImageRecord>>;
}
export declare type TopicImageData = {
    key: KeyType;
    imageRecord: ImageRecord;
    width: number;
    height: number;
};
export {};
//# sourceMappingURL=ext-data-images.d.ts.map