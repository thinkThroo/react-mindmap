import { SheetModel, ThemeType } from '@blink-mind/core';
export declare type ThemeMap = Map<string, ThemeType>;
export declare function ThemeSelectorPlugin(): {
    getAllThemes(props: any): Map<string, ThemeType>;
    getTheme(props: any): any;
    setTheme(ctx: any): void;
    createNewSheetModel(ctx: any, next: any): SheetModel;
};
//# sourceMappingURL=theme-selector-plugin.d.ts.map