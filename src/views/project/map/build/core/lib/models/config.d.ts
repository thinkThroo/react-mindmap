import { Record } from 'immutable';
import { ThemeType } from '../configs/theme';
import { DiagramLayoutType } from '../types';
export declare type ConfigRecordType = {
    viewMode: string;
    readOnly?: boolean;
    allowUndo?: boolean;
    layoutDir?: DiagramLayoutType;
    theme?: ThemeType;
};
declare const Config_base: Record.Factory<ConfigRecordType>;
export declare class Config extends Config_base {
    get viewMode(): string;
    get layoutDir(): DiagramLayoutType;
    get readOnly(): boolean;
    get allowUndo(): boolean;
    get theme(): ThemeType;
    static fromJSON(obj: any): Config;
}
export {};
//# sourceMappingURL=config.d.ts.map