'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var core = require('@blink-mind/core');
var rendererReact = require('@blink-mind/renderer-react');
var core$1 = require('@blueprintjs/core');
var React = require('react');
var topologyCore = require('topology-core');
var middles = require('topology-core/middles');
var topologyFlowDiagram = require('topology-flow-diagram');
require('@blink-mind/icons/iconfont/topology');
var styled = _interopDefault(require('styled-components'));
var topologyActivityDiagram = require('topology-activity-diagram');
var topologyClassDiagram = require('topology-class-diagram');
var topologySequenceDiagram = require('topology-sequence-diagram');

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
        className: rendererReact.iconClassName('topology'),
        onClick,
        tabIndex: -1
    };
    return React.createElement(rendererReact.TopicBlockIcon, Object.assign({}, iconProps));
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
class TopologyDiagram extends rendererReact.BaseWidget {
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
        middles.registerNode('flowData', topologyFlowDiagram.flowData, topologyFlowDiagram.flowDataAnchors, topologyFlowDiagram.flowDataIconRect, topologyFlowDiagram.flowDataTextRect);
        middles.registerNode('flowSubprocess', topologyFlowDiagram.flowSubprocess, null, topologyFlowDiagram.flowSubprocessIconRect, topologyFlowDiagram.flowSubprocessTextRect);
        middles.registerNode('flowDb', topologyFlowDiagram.flowDb, null, topologyFlowDiagram.flowDbIconRect, topologyFlowDiagram.flowDbTextRect);
        middles.registerNode('flowDocument', topologyFlowDiagram.flowDocument, topologyFlowDiagram.flowDocumentAnchors, topologyFlowDiagram.flowDocumentIconRect, topologyFlowDiagram.flowDocumentTextRect);
        middles.registerNode('flowInternalStorage', topologyFlowDiagram.flowInternalStorage, null, topologyFlowDiagram.flowInternalStorageIconRect, topologyFlowDiagram.flowInternalStorageTextRect);
        middles.registerNode('flowExternStorage', topologyFlowDiagram.flowExternStorage, topologyFlowDiagram.flowExternStorageAnchors, topologyFlowDiagram.flowExternStorageIconRect, topologyFlowDiagram.flowExternStorageTextRect);
        middles.registerNode('flowQueue', topologyFlowDiagram.flowQueue, null, topologyFlowDiagram.flowQueueIconRect, topologyFlowDiagram.flowQueueTextRect);
        middles.registerNode('flowManually', topologyFlowDiagram.flowManually, topologyFlowDiagram.flowManuallyAnchors, topologyFlowDiagram.flowManuallyIconRect, topologyFlowDiagram.flowManuallyTextRect);
        middles.registerNode('flowDisplay', topologyFlowDiagram.flowDisplay, topologyFlowDiagram.flowDisplayAnchors, topologyFlowDiagram.flowDisplayIconRect, topologyFlowDiagram.flowDisplayTextRect);
        middles.registerNode('flowParallel', topologyFlowDiagram.flowParallel, topologyFlowDiagram.flowParallelAnchors, null, null);
        middles.registerNode('flowComment', topologyFlowDiagram.flowComment, topologyFlowDiagram.flowCommentAnchors, null, null);
        // activity
        middles.registerNode('activityFinal', topologyActivityDiagram.activityFinal, null, topologyActivityDiagram.activityFinalIconRect, topologyActivityDiagram.activityFinalTextRect);
        middles.registerNode('swimlaneV', topologyActivityDiagram.swimlaneV, null, topologyActivityDiagram.swimlaneVIconRect, topologyActivityDiagram.swimlaneVTextRect);
        middles.registerNode('swimlaneH', topologyActivityDiagram.swimlaneH, null, topologyActivityDiagram.swimlaneHIconRect, topologyActivityDiagram.swimlaneHTextRect);
        middles.registerNode('forkH', topologyActivityDiagram.fork, topologyActivityDiagram.forkHAnchors, topologyActivityDiagram.forkIconRect, topologyActivityDiagram.forkTextRect);
        middles.registerNode('forkV', topologyActivityDiagram.fork, topologyActivityDiagram.forkVAnchors, topologyActivityDiagram.forkIconRect, topologyActivityDiagram.forkTextRect);
        // class
        middles.registerNode('simpleClass', topologyClassDiagram.simpleClass, null, topologyClassDiagram.simpleClassIconRect, topologyClassDiagram.simpleClassTextRect);
        middles.registerNode('interfaceClass', topologyClassDiagram.interfaceClass, null, topologyClassDiagram.interfaceClassIconRect, topologyClassDiagram.interfaceClassTextRect);
        // sequence
        middles.registerNode('lifeline', topologySequenceDiagram.lifeline, topologySequenceDiagram.lifelineAnchors, topologySequenceDiagram.lifelineIconRect, topologySequenceDiagram.lifelineTextRect);
        middles.registerNode('sequenceFocus', topologySequenceDiagram.sequenceFocus, topologySequenceDiagram.sequenceFocusAnchors, topologySequenceDiagram.sequenceFocusIconRect, topologySequenceDiagram.sequenceFocusTextRect);
    }
    componentDidMount() {
        this.canvasRegister();
        this.canvasOptions.on = this.onMessage;
        this.topology = new topologyCore.Topology('topology-canvas', this.canvasOptions);
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
        return (React.createElement(Tools, null, this.state.toolsConfig.map((item, index) => {
            return (React.createElement("div", { key: index },
                React.createElement(ToolTitle, null, item.group),
                React.createElement(ToolbarButtons, null, //TODO
                //@ts-ignore
                item.children.map((btn, i) => {
                    return (React.createElement("a", { key: i, title: btn.name, draggable: true, onDragStart: ev => {
                            this.onDrag(ev, btn);
                        } },
                        React.createElement("i", { className: 'iconfont ' + btn.icon, style: this.iconfont })));
                }))));
        })));
    }
    render() {
        return (React.createElement(Root, null,
            this.renderTools(),
            React.createElement(Canvas, { id: "topology-canvas", onContextMenu: this.handleContextMenu })));
    }
}

const Root$1 = styled(rendererReact.ZIndex) `
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
const Item_ = styled(rendererReact.Btn) `
  margin: 10px;
`;
const Item = props => {
    return (React.createElement(core$1.Tooltip, { content: props.tooltip, position: core$1.Position.TOP, className: core$1.Classes.ICON },
        React.createElement(Item_, { onClick: props.onClick }, props.children)));
};
const ZoomFactorSpan = styled.span `
  display: inline-block;
  width: 80px;
  height: 18px;
`;
class TopologyDiagramUtils extends React.Component {
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
            content: rendererReact.getI18nText(props, rendererReact.I18nKey.DELETE_TOPOLOGY_TIP),
            onConfirm: e => {
                controller.run('operation', {
                    ...props,
                    opType: core.OpType.DELETE_TOPIC_BLOCK,
                    blockType: BLOCK_TYPE_TOPOLOGY
                });
            },
            onCancel: e => {
                this.setState({ deleteConfirm: false });
            }
        };
        const { canvasData } = this.state;
        const scale = canvasData ? canvasData.scale : 1;
        return (React.createElement(Root$1, null,
            React.createElement(Item, { onClick: this.onClickResetZoom, tooltip: rendererReact.getI18nText(props, rendererReact.I18nKey.RESET_ZOOM) },
                React.createElement(ZoomFactorSpan, null, `${rendererReact.getI18nText(props, rendererReact.I18nKey.ZOOM)}:${Math.floor(scale * 100)}%`)),
            React.createElement(Item, { onClick: onClickDelete, tooltip: rendererReact.getI18nText(props, rendererReact.I18nKey.DELETE) }, rendererReact.Icon(rendererReact.IconName.TRASH)),
            React.createElement(core$1.Alert, Object.assign({}, deleteAlertProps))));
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
            opType: core.OpType.SET_TOPIC_BLOCK,
            topicKey,
            blockType: BLOCK_TYPE_TOPOLOGY,
            data: topologyData,
            focusMode: core.FocusMode.NORMAL
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
    return (React.createElement(core$1.Drawer, { title: React.createElement(Title, null, rendererReact.getI18nText(props, rendererReact.I18nKey.TOPOLOGY_DIAGRAM_EDITOR)), icon: rendererReact.Icon('topology'), isOpen: true, hasBackdrop: true, backdropClassName: "backdrop", backdropProps: { onMouseDown: rendererReact.stopPropagation }, canOutsideClickClose: false, isCloseButtonShown: true, onClose: onDiagramClose, size: "100%" },
        React.createElement(DiagramWrapper, { onClick: rendererReact.stopPropagation, onDoubleClick: rendererReact.stopPropagation },
            React.createElement(TopologyDiagram, Object.assign({}, diagramProps)),
            React.createElement(TopologyDiagramUtils, Object.assign({}, utilProps)))));
}

function startEditingTopology({ model, topicKey }) {
    const topic = model.getTopic(topicKey);
    const { block } = topic.getBlock(BLOCK_TYPE_TOPOLOGY);
    if (block == null || block.data == null) {
        model = core.SheetModelModifier.setTopicBlockData({
            model,
            topicKey,
            blockType: BLOCK_TYPE_TOPOLOGY,
            data: ''
        });
    }
    model = core.SheetModelModifier.focusTopic({
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
            return React.createElement(TopicBlockTopology, Object.assign({}, props));
        },
        renderDrawer(props, next) {
            const { model } = props;
            if (model.focusMode === FOCUS_MODE_EDITING_TOPOLOGY) {
                const topoProps = {
                    ...props,
                    topicKey: model.focusKey,
                    key: 'topology-drawer'
                };
                return React.createElement(TopologyDrawer, Object.assign({}, topoProps));
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
            return (React.createElement(React.Fragment, null,
                next(),
                React.createElement(core$1.MenuDivider, null),
                React.createElement(core$1.MenuItem, { icon: rendererReact.Icon('topology'), text: rendererReact.getI18nText(props, rendererReact.I18nKey.EDIT_TOPOLOGY_DIAGRAM), onClick: editTopology })));
        },
        getOpMap(props, next) {
            const opMap = next();
            opMap.set(OP_TYPE_START_EDITING_TOPOLOGY, core.toDocModelModifierFunc(startEditingTopology));
            return opMap;
        }
    };
}

exports.default = TopologyDiagramPlugin;
//# sourceMappingURL=main.js.map
