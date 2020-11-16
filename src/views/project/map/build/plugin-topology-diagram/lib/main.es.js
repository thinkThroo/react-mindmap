import { OpType, FocusMode, toDocModelModifierFunc, SheetModelModifier } from '@blink-mind/core';
import { iconClassName, TopicBlockIcon, BaseWidget, ZIndex, Btn, getI18nText, I18nKey, Icon, IconName, stopPropagation } from '@blink-mind/renderer-react';
import { Alert, Tooltip, Position, Classes, Drawer, MenuDivider, MenuItem } from '@blueprintjs/core';
import { createElement, Component, Fragment } from 'react';
import { Topology } from 'topology-core';
import { registerNode } from 'topology-core/middles';
import { flowData, flowDataAnchors, flowDataIconRect, flowDataTextRect, flowSubprocess, flowSubprocessIconRect, flowSubprocessTextRect, flowDb, flowDbIconRect, flowDbTextRect, flowDocument, flowDocumentAnchors, flowDocumentIconRect, flowDocumentTextRect, flowInternalStorage, flowInternalStorageIconRect, flowInternalStorageTextRect, flowExternStorage, flowExternStorageAnchors, flowExternStorageIconRect, flowExternStorageTextRect, flowQueue, flowQueueIconRect, flowQueueTextRect, flowManually, flowManuallyAnchors, flowManuallyIconRect, flowManuallyTextRect, flowDisplay, flowDisplayAnchors, flowDisplayIconRect, flowDisplayTextRect, flowParallel, flowParallelAnchors, flowComment, flowCommentAnchors } from 'topology-flow-diagram';
import '@blink-mind/icons/iconfont/topology';
import styled from 'styled-components';
import { activityFinal, activityFinalIconRect, activityFinalTextRect, swimlaneV, swimlaneVIconRect, swimlaneVTextRect, swimlaneH, swimlaneHIconRect, swimlaneHTextRect, fork, forkHAnchors, forkIconRect, forkTextRect, forkVAnchors } from 'topology-activity-diagram';
import { simpleClass, simpleClassIconRect, simpleClassTextRect, interfaceClass, interfaceClassIconRect, interfaceClassTextRect } from 'topology-class-diagram';
import { lifeline, lifelineAnchors, lifelineIconRect, lifelineTextRect, sequenceFocus, sequenceFocusAnchors, sequenceFocusIconRect, sequenceFocusTextRect } from 'topology-sequence-diagram';

const FOCUS_MODE_EDITING_TOPOLOGY = 'FOCUS_MODE_EDITING_TOPOLOGY';
const OP_TYPE_START_EDITING_TOPOLOGY = 'OP_TYPE_START_EDITING_TOPOLOGY';
const BLOCK_TYPE_TOPOLOGY = 'TOPOLOGY';
const REF_KEY_TOPOLOGY_DIAGRAM = 'TOPOLOGY_DIAGRAM';
const REF_KEY_TOPOLOGY_DIAGRAM_UTIL = 'TOPOLOGY_DIAGRAM_UTIL';

function TopicBlockTopology(props) {
    const { controller, model, topicKey } = props;
    const onClick = e => {
        e.stopPropagation();
        controller.run('operation', {
            ...props,
            opType: OP_TYPE_START_EDITING_TOPOLOGY
        });
    };
    const isEditing = model.focusKey === topicKey &&
        model.focusMode === FOCUS_MODE_EDITING_TOPOLOGY;
    const { block } = model.getTopic(topicKey).getBlock(BLOCK_TYPE_TOPOLOGY);
    if (!isEditing && !block)
        return null;
    const iconProps = {
        className: iconClassName('topology'),
        onClick,
        tabIndex: -1
    };
    return createElement(TopicBlockIcon, Object.assign({}, iconProps));
}

const ToolsConfig = [
    {
        group: 'Basic',
        children: [
            {
                name: 'rectangle',
                icon: 'icon-rect',
                data: {
                    text: 'Topology',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 10,
                    paddingBottom: 10,
                    name: 'rectangle',
                    icon: '\ue64d',
                    iconFamily: 'topology',
                    iconColor: '#2f54eb'
                }
            },
            {
                name: 'rectangle',
                icon: 'icon-rectangle',
                data: {
                    text: 'rectangle',
                    rect: {
                        width: 200,
                        height: 50
                    },
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderRadius: 0.1,
                    name: 'rectangle'
                }
            },
            {
                name: 'circle',
                icon: 'icon-circle',
                data: {
                    text: 'circle',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    name: 'circle',
                    textMaxLine: 1
                }
            },
            {
                name: 'triangle',
                icon: 'icon-triangle',
                data: {
                    text: 'triangle',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    name: 'triangle'
                }
            },
            {
                name: 'diamond',
                icon: 'icon-diamond',
                data: {
                    text: 'diamond',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    name: 'diamond'
                }
            },
            {
                name: 'pentagon',
                icon: 'icon-pentagon',
                data: {
                    text: 'pentagon',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    name: 'pentagon'
                }
            },
            {
                name: 'hexagon',
                icon: 'icon-hexagon',
                data: {
                    text: 'hexagon',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    paddingTop: 10,
                    paddingBottom: 10,
                    name: 'hexagon'
                }
            },
            {
                name: 'pentagram',
                icon: 'icon-pentagram',
                data: {
                    text: 'pentagram',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    name: 'pentagram'
                }
            },
            {
                name: 'left arrow',
                icon: 'icon-arrow-left',
                data: {
                    text: '',
                    rect: {
                        width: 200,
                        height: 100
                    },
                    name: 'leftArrow'
                }
            },
            {
                name: 'right arrow',
                icon: 'icon-arrow-right',
                data: {
                    text: '',
                    rect: {
                        width: 200,
                        height: 100
                    },
                    name: 'rightArrow'
                }
            },
            {
                name: 'bidirectional arrow',
                icon: 'icon-twoway-arrow',
                data: {
                    text: '',
                    rect: {
                        width: 200,
                        height: 100
                    },
                    name: 'twowayArrow'
                }
            },
            {
                name: 'line',
                icon: 'icon-line',
                data: {
                    text: 'line',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    name: 'line'
                }
            },
            {
                name: 'cloud',
                icon: 'icon-cloud',
                data: {
                    text: 'cloud',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    name: 'cloud'
                }
            },
            {
                name: 'message',
                icon: 'icon-msg',
                data: {
                    text: 'message',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 10,
                    paddingBottom: 10,
                    name: 'message'
                }
            },
            {
                name: 'file',
                icon: 'icon-file',
                data: {
                    text: 'file',
                    rect: {
                        width: 80,
                        height: 100
                    },
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 10,
                    paddingBottom: 10,
                    name: 'file'
                }
            },
            {
                name: 'text',
                icon: 'icon-text',
                data: {
                    text: 'text',
                    rect: {
                        width: 160,
                        height: 30
                    },
                    name: 'text'
                }
            },
            {
                name: 'image',
                icon: 'icon-image',
                data: {
                    text: '',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    name: 'image',
                    image: '/assets/img/logo.png'
                }
            },
            {
                name: 'cube',
                icon: 'icon-cube',
                data: {
                    rect: {
                        width: 50,
                        height: 70
                    },
                    is3D: true,
                    z: 10,
                    zRotate: 15,
                    fillStyle: '#ddd',
                    name: 'cube',
                    icon: '\ue63c',
                    iconFamily: 'topology',
                    iconColor: '#777',
                    iconSize: 30
                }
            },
            {
                name: 'people',
                icon: 'icon-people',
                data: {
                    rect: {
                        width: 70,
                        height: 100
                    },
                    name: 'people'
                }
            },
            {
                name: 'multi media',
                icon: 'icon-pc',
                data: {
                    text: 'multi media',
                    rect: {
                        width: 200,
                        height: 200
                    },
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 10,
                    paddingBottom: 10,
                    // strokeStyle: 'transparent',
                    name: 'div'
                }
            }
        ]
    },
    {
        group: 'Flow Graph',
        children: [
            {
                name: 'start/end',
                icon: 'icon-flow-start',
                data: {
                    text: 'start',
                    rect: {
                        width: 120,
                        height: 40
                    },
                    borderRadius: 0.5,
                    name: 'rectangle'
                }
            },
            {
                name: 'flow',
                icon: 'icon-rectangle',
                data: {
                    text: 'flow',
                    rect: {
                        width: 120,
                        height: 40
                    },
                    name: 'rectangle'
                }
            },
            {
                name: 'judgement',
                icon: 'icon-diamond',
                data: {
                    text: 'judgement',
                    rect: {
                        width: 120,
                        height: 60
                    },
                    name: 'diamond'
                }
            },
            {
                name: 'data',
                icon: 'icon-flow-data',
                data: {
                    text: 'data',
                    rect: {
                        width: 120,
                        height: 50
                    },
                    name: 'flowData'
                }
            },
            {
                name: 'prepare',
                icon: 'icon-flow-ready',
                data: {
                    text: 'prepare',
                    rect: {
                        width: 120,
                        height: 50
                    },
                    name: 'hexagon'
                }
            },
            {
                name: 'sub flow',
                icon: 'icon-flow-subprocess',
                data: {
                    text: 'sub flow',
                    rect: {
                        width: 120,
                        height: 50
                    },
                    name: 'flowSubprocess'
                }
            },
            {
                name: 'database',
                icon: 'icon-db',
                data: {
                    text: 'database',
                    rect: {
                        width: 80,
                        height: 120
                    },
                    name: 'flowDb'
                }
            },
            {
                name: 'document',
                icon: 'icon-flow-document',
                data: {
                    text: 'document',
                    rect: {
                        width: 120,
                        height: 100
                    },
                    name: 'flowDocument'
                }
            },
            {
                name: 'internal storage',
                icon: 'icon-internal-storage',
                data: {
                    text: 'internal storage',
                    rect: {
                        width: 120,
                        height: 80
                    },
                    name: 'flowInternalStorage'
                }
            },
            {
                name: 'external storage',
                icon: 'icon-extern-storage',
                data: {
                    text: 'external storage',
                    rect: {
                        width: 120,
                        height: 80
                    },
                    name: 'flowExternStorage'
                }
            },
            {
                name: 'queue',
                icon: 'icon-flow-queue',
                data: {
                    text: 'queue',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    name: 'flowQueue'
                }
            },
            {
                name: 'input manually',
                icon: 'icon-flow-manually',
                data: {
                    text: 'input manually',
                    rect: {
                        width: 120,
                        height: 80
                    },
                    name: 'flowManually'
                }
            },
            {
                name: 'display',
                icon: 'icon-flow-display',
                data: {
                    text: 'display',
                    rect: {
                        width: 120,
                        height: 80
                    },
                    name: 'flowDisplay'
                }
            },
            {
                name: 'parallel',
                icon: 'icon-flow-parallel',
                data: {
                    text: 'parallel',
                    rect: {
                        width: 120,
                        height: 50
                    },
                    name: 'flowParallel'
                }
            },
            {
                name: 'comment',
                icon: 'icon-flow-comment',
                data: {
                    text: 'comment',
                    rect: {
                        width: 100,
                        height: 100
                    },
                    name: 'flowComment'
                }
            }
        ]
    },
    {
        group: 'Activity Diagram',
        children: [
            {
                name: 'start',
                icon: 'icon-inital',
                data: {
                    text: '',
                    rect: {
                        width: 30,
                        height: 30
                    },
                    name: 'circle',
                    fillStyle: '#555',
                    strokeStyle: 'transparent'
                }
            },
            {
                name: 'end',
                icon: 'icon-final',
                data: {
                    text: '',
                    rect: {
                        width: 30,
                        height: 30
                    },
                    name: 'activityFinal'
                }
            },
            {
                name: 'action',
                icon: 'icon-action',
                data: {
                    text: 'action',
                    rect: {
                        width: 120,
                        height: 50
                    },
                    borderRadius: 0.25,
                    name: 'rectangle'
                }
            },
            {
                name: 'decision/merge',
                icon: 'icon-diamond',
                data: {
                    text: '决策',
                    rect: {
                        width: 120,
                        height: 50
                    },
                    name: 'diamond'
                }
            },
            {
                name: 'vertical swimming lane',
                icon: 'icon-swimlane-v',
                data: {
                    text: 'vertical swimming lane',
                    rect: {
                        width: 200,
                        height: 500
                    },
                    name: 'swimlaneV'
                }
            },
            {
                name: 'horizontal swimming lane',
                icon: 'icon-swimlane-h',
                data: {
                    text: 'horizontal swimming lane',
                    rect: {
                        width: 500,
                        height: 200
                    },
                    name: 'swimlaneH'
                }
            },
            {
                name: 'vertical fork/merge',
                icon: 'icon-fork-v',
                data: {
                    text: '',
                    rect: {
                        width: 10,
                        height: 150
                    },
                    name: 'forkV',
                    fillStyle: '#555',
                    strokeStyle: 'transparent'
                }
            },
            {
                name: 'horizontal fork/merge',
                icon: 'icon-fork',
                data: {
                    text: '',
                    rect: {
                        width: 150,
                        height: 10
                    },
                    name: 'forkH',
                    fillStyle: '#555',
                    strokeStyle: 'transparent'
                }
            }
        ]
    },
    {
        group: 'Sequence Diagram && Class Diagram',
        children: [
            {
                name: 'lifeline',
                icon: 'icon-lifeline',
                data: {
                    text: 'lifeline',
                    rect: {
                        width: 150,
                        height: 400
                    },
                    name: 'lifeline'
                }
            },
            {
                name: 'activation',
                icon: 'icon-focus',
                data: {
                    text: '',
                    rect: {
                        width: 12,
                        height: 200
                    },
                    name: 'sequenceFocus'
                }
            },
            {
                name: 'simple class',
                icon: 'icon-simple-class',
                data: {
                    text: 'Topolgoy',
                    rect: {
                        width: 270,
                        height: 200
                    },
                    paddingTop: 40,
                    font: {
                        fontFamily: 'Arial',
                        color: '#222',
                        fontWeight: 'bold'
                    },
                    fillStyle: '#ffffba',
                    strokeStyle: '#7e1212',
                    name: 'simpleClass',
                    children: [
                        {
                            text: '- name: string\n+ setName(name: string): void',
                            name: 'text',
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: 10,
                            paddingBottom: 10,
                            rectInParent: {
                                x: 0,
                                y: 0,
                                width: '100%',
                                height: '100%',
                                rotate: 0
                            },
                            font: {
                                fontFamily: 'Arial',
                                color: '#222',
                                textAlign: 'left',
                                textBaseline: 'top'
                            }
                        }
                    ]
                }
            },
            {
                name: 'class',
                icon: 'icon-class',
                data: {
                    text: 'Topolgoy',
                    rect: {
                        width: 270,
                        height: 200
                    },
                    paddingTop: 40,
                    font: {
                        fontFamily: 'Arial',
                        color: '#222',
                        fontWeight: 'bold'
                    },
                    fillStyle: '#ffffba',
                    strokeStyle: '#7e1212',
                    name: 'interfaceClass',
                    children: [
                        {
                            text: '- name: string',
                            name: 'text',
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: 10,
                            paddingBottom: 10,
                            rectInParent: {
                                x: 0,
                                y: 0,
                                width: '100%',
                                height: '50%',
                                rotate: 0
                            },
                            font: {
                                fontFamily: 'Arial',
                                color: '#222',
                                textAlign: 'left',
                                textBaseline: 'top'
                            }
                        },
                        {
                            text: '+ setName(name: string): void',
                            name: 'text',
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: 10,
                            paddingBottom: 10,
                            rectInParent: {
                                x: 0,
                                y: '50%',
                                width: '100%',
                                height: '50%',
                                rotate: 0
                            },
                            font: {
                                fontFamily: 'Arial',
                                color: '#222',
                                textAlign: 'left',
                                textBaseline: 'top'
                            }
                        }
                    ]
                }
            }
        ]
    }
];

const Root = styled.div `
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
`;
const Canvas = styled.div `
  flex: 1;
  width: initial;
  position: relative;
  overflow: auto;
  background: #fff;
`;
const Tools = styled.div `
  flex-shrink: 0;
  width: 1.75rem;
  background-color: #f8f8f8;
  border-right: 1px solid #d9d9d9;
  overflow-y: auto;
`;
const ToolTitle = styled.div `
  color: #0d1a26;
  font-weight: 600;
  font-size: 0.12rem;
  padding: 0.05rem 0.1rem;
  margin-top: 0.08rem;
  border-bottom: 1px solid #ddd;

  &:first-child {
    border-top: none;
  }
`;
const ToolbarButtons = styled.div `
  padding: 0.1rem 0;
  a {
    display: inline-block;
    color: @text-color;
    line-height: 1;
    width: 0.4rem;
    height: 0.4rem;
    text-align: center;
    text-decoration: none !important;

    .iconfont {
      font-size: 0.24rem;
    }
  }
`;
class TopologyDiagram extends BaseWidget {
    constructor() {
        super(...arguments);
        this.state = {
            id: '',
            data: null,
            toolsConfig: ToolsConfig
        };
        this.canvasOptions = {};
        this.handleContextMenu = e => {
            e.preventDefault();
            e.stopPropagation();
        };
        this.onMessage = (event, data) => {
            const { getRef } = this.props;
            const diagramUtil = getRef(REF_KEY_TOPOLOGY_DIAGRAM_UTIL);
            switch (event) {
                case 'resize':
                case 'scale':
                case 'locked':
                    if (this.topology && diagramUtil) {
                        diagramUtil.setCanvasData(this.topology.data);
                    }
                    break;
            }
        };
    }
    canvasRegister() {
        registerNode('flowData', flowData, flowDataAnchors, flowDataIconRect, flowDataTextRect);
        registerNode('flowSubprocess', flowSubprocess, null, flowSubprocessIconRect, flowSubprocessTextRect);
        registerNode('flowDb', flowDb, null, flowDbIconRect, flowDbTextRect);
        registerNode('flowDocument', flowDocument, flowDocumentAnchors, flowDocumentIconRect, flowDocumentTextRect);
        registerNode('flowInternalStorage', flowInternalStorage, null, flowInternalStorageIconRect, flowInternalStorageTextRect);
        registerNode('flowExternStorage', flowExternStorage, flowExternStorageAnchors, flowExternStorageIconRect, flowExternStorageTextRect);
        registerNode('flowQueue', flowQueue, null, flowQueueIconRect, flowQueueTextRect);
        registerNode('flowManually', flowManually, flowManuallyAnchors, flowManuallyIconRect, flowManuallyTextRect);
        registerNode('flowDisplay', flowDisplay, flowDisplayAnchors, flowDisplayIconRect, flowDisplayTextRect);
        registerNode('flowParallel', flowParallel, flowParallelAnchors, null, null);
        registerNode('flowComment', flowComment, flowCommentAnchors, null, null);
        // activity
        registerNode('activityFinal', activityFinal, null, activityFinalIconRect, activityFinalTextRect);
        registerNode('swimlaneV', swimlaneV, null, swimlaneVIconRect, swimlaneVTextRect);
        registerNode('swimlaneH', swimlaneH, null, swimlaneHIconRect, swimlaneHTextRect);
        registerNode('forkH', fork, forkHAnchors, forkIconRect, forkTextRect);
        registerNode('forkV', fork, forkVAnchors, forkIconRect, forkTextRect);
        // class
        registerNode('simpleClass', simpleClass, null, simpleClassIconRect, simpleClassTextRect);
        registerNode('interfaceClass', interfaceClass, null, interfaceClassIconRect, interfaceClassTextRect);
        // sequence
        registerNode('lifeline', lifeline, lifelineAnchors, lifelineIconRect, lifelineTextRect);
        registerNode('sequenceFocus', sequenceFocus, sequenceFocusAnchors, sequenceFocusIconRect, sequenceFocusTextRect);
    }
    componentDidMount() {
        this.canvasRegister();
        this.canvasOptions.on = this.onMessage;
        this.topology = new Topology('topology-canvas', this.canvasOptions);
        this.openData();
    }
    componentDidUpdate() {
        // this.openData();
    }
    openData() {
        const { topic } = this.props;
        const { block } = topic.getBlock(BLOCK_TYPE_TOPOLOGY);
        if (block && block.data && block.data !== '') {
            this.setState({
                data: block.data
            });
            this.topology.open(block.data);
        }
    }
    onDrag(event, node) {
        event.dataTransfer.setData('Text', JSON.stringify(node.data));
    }
    renderTools() {
        return (createElement(Tools, null, this.state.toolsConfig.map((item, index) => {
            return (createElement("div", { key: index },
                createElement(ToolTitle, null, item.group),
                createElement(ToolbarButtons, null, //TODO
                //@ts-ignore
                item.children.map((btn, i) => {
                    return (createElement("a", { key: i, title: btn.name, draggable: true, onDragStart: ev => {
                            this.onDrag(ev, btn);
                        } },
                        createElement("i", { className: 'iconfont ' + btn.icon, style: this.iconfont })));
                }))));
        })));
    }
    render() {
        return (createElement(Root, null,
            this.renderTools(),
            createElement(Canvas, { id: "topology-canvas", onContextMenu: this.handleContextMenu })));
    }
}

const Root$1 = styled(ZIndex) `
  position: absolute;
  //background: white;
  right: 30px;
  bottom: 20px;
  border-radius: 2px;
  z-index: 3;
  display: flex;
  flex-direction: row;
  user-select: none;
`;
const Item_ = styled(Btn) `
  margin: 10px;
`;
const Item = props => {
    return (createElement(Tooltip, { content: props.tooltip, position: Position.TOP, className: Classes.ICON },
        createElement(Item_, { onClick: props.onClick }, props.children)));
};
const ZoomFactorSpan = styled.span `
  display: inline-block;
  width: 80px;
  height: 18px;
`;
class TopologyDiagramUtils extends Component {
    constructor(props) {
        super(props);
        this.setCanvasData = canvasData => {
            this.setState({ canvasData });
        };
        this.onClickResetZoom = e => {
            const topology = this.getTopology();
            topology.scaleTo(1);
        };
        this.state = {
            deleteConfirm: false,
            canvasData: null
        };
    }
    getTopology() {
        const { getRef } = this.props;
        return getRef(REF_KEY_TOPOLOGY_DIAGRAM).topology;
    }
    render() {
        const props = this.props;
        const { controller } = props;
        const onClickDelete = e => {
            this.setState({ deleteConfirm: true });
        };
        const deleteAlertProps = {
            ...props,
            isOpen: this.state.deleteConfirm,
            content: getI18nText(props, I18nKey.DELETE_TOPOLOGY_TIP),
            onConfirm: e => {
                controller.run('operation', {
                    ...props,
                    opType: OpType.DELETE_TOPIC_BLOCK,
                    blockType: BLOCK_TYPE_TOPOLOGY
                });
            },
            onCancel: e => {
                this.setState({ deleteConfirm: false });
            }
        };
        const { canvasData } = this.state;
        const scale = canvasData ? canvasData.scale : 1;
        return (createElement(Root$1, null,
            createElement(Item, { onClick: this.onClickResetZoom, tooltip: getI18nText(props, I18nKey.RESET_ZOOM) },
                createElement(ZoomFactorSpan, null, `${getI18nText(props, I18nKey.ZOOM)}:${Math.floor(scale * 100)}%`)),
            createElement(Item, { onClick: onClickDelete, tooltip: getI18nText(props, I18nKey.DELETE) }, Icon(IconName.TRASH)),
            createElement(Alert, Object.assign({}, deleteAlertProps))));
    }
}

const DiagramWrapper = styled.div `
  position: relative;
  overflow: auto;
  padding: 0px 0px 0px 5px;
  background: #88888850;
  height: 100%;
`;
const Title = styled.span `
  padding: 0px 20px;
`;
function TopologyDrawer(props) {
    const { controller, topicKey, getRef, saveRef } = props;
    const onDiagramClose = e => {
        e.stopPropagation();
        // const key = `topic-topology-data-${topicKey}`;
        // const topologyData = controller.run('deleteTempValue', { key });
        const diagram = getRef(REF_KEY_TOPOLOGY_DIAGRAM);
        const topologyData = diagram.topology.data;
        controller.run('operation', {
            ...props,
            opType: OpType.SET_TOPIC_BLOCK,
            topicKey,
            blockType: BLOCK_TYPE_TOPOLOGY,
            data: topologyData,
            focusMode: FocusMode.NORMAL
        });
    };
    const diagramProps = {
        ...props,
        ref: saveRef(REF_KEY_TOPOLOGY_DIAGRAM)
    };
    const utilProps = {
        ...props,
        ref: saveRef(REF_KEY_TOPOLOGY_DIAGRAM_UTIL)
    };
    return (createElement(Drawer, { title: createElement(Title, null, getI18nText(props, I18nKey.TOPOLOGY_DIAGRAM_EDITOR)), icon: Icon('topology'), isOpen: true, hasBackdrop: true, backdropClassName: "backdrop", backdropProps: { onMouseDown: stopPropagation }, canOutsideClickClose: false, isCloseButtonShown: true, onClose: onDiagramClose, size: "100%" },
        createElement(DiagramWrapper, { onClick: stopPropagation, onDoubleClick: stopPropagation },
            createElement(TopologyDiagram, Object.assign({}, diagramProps)),
            createElement(TopologyDiagramUtils, Object.assign({}, utilProps)))));
}

function startEditingTopology({ model, topicKey }) {
    const topic = model.getTopic(topicKey);
    const { block } = topic.getBlock(BLOCK_TYPE_TOPOLOGY);
    if (block == null || block.data == null) {
        model = SheetModelModifier.setTopicBlockData({
            model,
            topicKey,
            blockType: BLOCK_TYPE_TOPOLOGY,
            data: ''
        });
    }
    model = SheetModelModifier.focusTopic({
        model,
        topicKey,
        focusMode: FOCUS_MODE_EDITING_TOPOLOGY
    });
    return model;
}
function TopologyDiagramPlugin() {
    return {
        renderTopicBlock(props, next) {
            const { controller, block } = props;
            if (block.type === BLOCK_TYPE_TOPOLOGY) {
                return controller.run('renderTopicBlockTopology', props);
            }
            return next();
        },
        renderTopicBlockTopology(props) {
            return createElement(TopicBlockTopology, Object.assign({}, props));
        },
        renderDrawer(props, next) {
            const { model } = props;
            if (model.focusMode === FOCUS_MODE_EDITING_TOPOLOGY) {
                const topoProps = {
                    ...props,
                    topicKey: model.focusKey,
                    key: 'topology-drawer'
                };
                return createElement(TopologyDrawer, Object.assign({}, topoProps));
            }
            return next();
        },
        customizeTopicContextMenu(props, next) {
            const { controller } = props;
            function editTopology(e) {
                controller.run('operation', {
                    ...props,
                    opType: OP_TYPE_START_EDITING_TOPOLOGY
                });
            }
            return (createElement(Fragment, null,
                next(),
                createElement(MenuDivider, null),
                createElement(MenuItem, { icon: Icon('topology'), text: getI18nText(props, I18nKey.EDIT_TOPOLOGY_DIAGRAM), onClick: editTopology })));
        },
        getOpMap(props, next) {
            const opMap = next();
            opMap.set(OP_TYPE_START_EDITING_TOPOLOGY, toDocModelModifierFunc(startEditingTopology));
            return opMap;
        }
    };
}

export default TopologyDiagramPlugin;
//# sourceMappingURL=main.es.js.map
