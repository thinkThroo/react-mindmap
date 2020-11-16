import { BaseProps, BaseWidget } from '@blink-mind/renderer-react';
import * as React from 'react';
import { Topology } from 'topology-core';
import { Options } from 'topology-core/options';
import '@blink-mind/icons/iconfont/topology';
interface IState {
    id: string;
    data: any;
    toolsConfig: any[];
}
export declare class TopologyDiagram extends BaseWidget<BaseProps, IState> {
    state: IState;
    iconfont: {
        fontSize: '0.24rem';
    };
    topology: Topology;
    canvasOptions: Options;
    canvasRegister(): void;
    handleContextMenu: (e: any) => void;
    onMessage: (event: any, data: any) => void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    openData(): void;
    onDrag(event: React.DragEvent<HTMLAnchorElement>, node: any): void;
    renderTools(): JSX.Element;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=topology-diagram.d.ts.map