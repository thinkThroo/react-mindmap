import { Record } from 'immutable';
declare type SheetRecordType = {
    type: string;
    data: any;
};
declare const Sheet_base: Record.Factory<SheetRecordType>;
export declare class Sheet extends Sheet_base {
    get type(): string;
    get data(): any;
}
export {};
//# sourceMappingURL=sheet.d.ts.map