import { DocModel, SheetModel } from './models';
import { ModelChangeCallback, OnChangeFunction } from './types';
export interface IControllerOption {
    plugins?: Array<any>;
    docModel?: DocModel;
    readOnly?: boolean;
    onChange?: OnChangeFunction;
}
export interface IControllerRunContext {
    controller: Controller;
    docModel?: DocModel;
    model?: SheetModel;
    topicKey?: KeyType;
    getRef?: Function;
}
export interface IDiagram {
    getDiagramProps(): IDiagramProps;
    openNewDocModel(newModel: DocModel): any;
}
export interface IDiagramProps {
    docModel: DocModel;
    controller: Controller;
}
export declare class Controller {
    middleware: Map<string, Function[]>;
    private readonly onChange;
    readOnly: boolean;
    docModel: DocModel;
    get model(): SheetModel;
    constructor(options?: IControllerOption);
    run(key: string, arg?: any): any;
    getValue(propKey: string, arg?: any): any;
    change(model: DocModel, callback?: ModelChangeCallback): void;
}
//# sourceMappingURL=controller.d.ts.map