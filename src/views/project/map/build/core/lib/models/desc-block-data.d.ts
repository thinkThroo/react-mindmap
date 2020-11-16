import { Record } from 'immutable';
declare type DescBlockDataRecordType = {
    kind: string;
    data: any;
    collapse: boolean;
};
declare const DescBlockData_base: Record.Factory<DescBlockDataRecordType>;
export declare class DescBlockData extends DescBlockData_base {
    get kind(): string;
    get data(): any;
    get collapse(): boolean;
}
export {};
//# sourceMappingURL=desc-block-data.d.ts.map