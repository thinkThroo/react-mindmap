import { BaseProps } from '@blink-mind/renderer-react';
import * as React from 'react';
import { Topology } from 'topology-core';
interface State {
    deleteConfirm: boolean;
    canvasData: any;
}
export declare class TopologyDiagramUtils extends React.Component<BaseProps, State> {
    constructor(props: any);
    setCanvasData: (canvasData: any) => void;
    getTopology(): Topology;
    onClickResetZoom: (e: any) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=topology-diagram-utils.d.ts.map