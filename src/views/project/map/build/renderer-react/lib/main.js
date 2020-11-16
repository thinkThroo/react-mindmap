'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var ResizeObserver = _interopDefault(require('resize-observer-polyfill'));
var styled = require('styled-components');
var styled__default = _interopDefault(styled);
var debug = _interopDefault(require('debug'));
var core = require('@blueprintjs/core');
var colorString = require('color-string');
var select = require('@blueprintjs/select');
var reactColor = require('react-color');
var cx = _interopDefault(require('classnames'));
var consolidatedEvents = require('consolidated-events');
var core$1 = require('@blink-mind/core');
require('@blink-mind/icons');
require('@blueprintjs/core/lib/css/blueprint.css');
require('@blueprintjs/select/lib/css/blueprint-select.css');
var memoizeOne = _interopDefault(require('memoize-one'));
var immutable = require('immutable');
var lodash = require('lodash');
var icons$1 = require('@blueprintjs/icons');
var reactTabs = require('@slim-ui/react-tabs');
require('@slim-ui/react-tabs/style/react-tabs.css');
var tsKeycodeEnum = require('ts-keycode-enum');
var htmlToText = _interopDefault(require('html-to-text'));
var deepEqual = _interopDefault(require('fast-deep-equal'));
var PropTypes = _interopDefault(require('prop-types'));

class BaseWidget extends React.Component {
    constructor(props) {
        super(props);
    }
    operation(opType, arg) {
        this.props.controller.run('operation', {
            opType,
            ...arg
        });
    }
    run(name, arg) {
        this.props.controller.run(name, arg);
    }
    get topic() {
        return this.props.model.getTopic(this.props.topicKey);
    }
}

const log = debug('node:drag-scroll-widget');
const DragScrollView = styled__default.div `
  position: relative;
  width: 100%;
  height: 100%;
  overflow: scroll;
`;
const DragScrollContent = styled__default.div `
  position: relative;
  width: max-content;
`;
class DragScrollWidget extends React.Component {
    constructor(props) {
        super(props);
        this.contentResizeCallback = (entries, observer) => {
            // log('contentResizeCallback', entries[0].contentRect, this.oldContentRect);
            // if (entries[0].contentRect.width === 0 ) return;
            log('contentResizeCallback');
            if (this.oldContentRect) {
                const widgetStyle = {
                    width: this.content.clientWidth + this.viewBox.clientWidth * 2,
                    height: this.content.clientHeight + this.viewBox.clientHeight * 2
                };
                this.bigView.style.width = widgetStyle.width + 'px';
                this.bigView.style.height = widgetStyle.height + 'px';
            }
            this.oldContentRect = entries[0].contentRect;
        };
        this.contentResizeObserver = new ResizeObserver(this.contentResizeCallback);
        this.contentRef = ref => {
            log('contentRef');
            if (ref) {
                this.content = ref;
                this.oldContentRect = this.content.getBoundingClientRect();
                this.contentResizeObserver.observe(this.content);
            }
        };
        this.viewBoxRef = ref => {
            if (ref) {
                this.viewBox = ref;
                if (!this.props.enableMouseWheel) {
                    log('addEventListener onwheel');
                    this.viewBox.addEventListener('wheel', function (e) {
                        log('onwheel');
                        (e.ctrlKey || e.metaKey) && e.preventDefault();
                    }, {
                        passive: false
                    });
                }
                this.setViewBoxScroll(this.viewBox.clientWidth, this.viewBox.clientHeight);
            }
        };
        this.bigViewRef = ref => {
            if (ref) {
                this.bigView = ref;
            }
        };
        this.setWidgetStyle = () => {
            log('setWidgetStyle');
            if (this.content && this.viewBox && this.bigView) {
                this.bigView.style.width =
                    (this.content.clientWidth + this.viewBox.clientWidth) * 2 + 'px';
                this.bigView.style.height =
                    (this.content.clientHeight + this.viewBox.clientHeight) * 2 + 'px';
                this.content.style.left = this.viewBox.clientWidth + 'px';
                this.content.style.top = this.viewBox.clientHeight + 'px';
            }
        };
        this.setViewBoxScroll = (left, top) => {
            log(`setViewBoxScroll ${left} ${top}`);
            if (this.viewBox) {
                this.viewBox.scrollLeft = left;
                this.viewBox.scrollTop = top;
            }
        };
        this.setViewBoxScrollDelta = (deltaLeft, deltaTop) => {
            log(`setViewBoxScrollDelta ${deltaLeft} ${deltaTop} ${this.viewBox
                .scrollLeft + deltaLeft} ${this.viewBox.scrollTop + deltaTop}`);
            if (this.viewBox) {
                this.viewBox.scrollLeft += deltaLeft;
                this.viewBox.scrollTop += deltaTop;
            }
        };
        this.onMouseDown = e => {
            log('onMouseDown');
            // log(e.nativeEvent.target);
            // mouseKey 表示鼠标按下那个键才可以进行拖动，左键或者右键
            // needKeyPressed 为了支持是否需要按下ctrl键，才可以进行拖动
            // canDragFunc是一个函数，它是为了支持使用者以传入函数的方式，这个函数的返回值表示当前的内容是否可以被拖拽而移动
            const { mouseKey, needKeyPressed, canDragFunc } = this.props;
            if (canDragFunc && !canDragFunc())
                return;
            if ((e.button === 0 && mouseKey === 'left') ||
                (e.button === 2 && mouseKey === 'right')) {
                if (needKeyPressed) {
                    if (!e.ctrlKey)
                        return;
                }
                this._lastCoordX = this.viewBox.scrollLeft + e.nativeEvent.clientX;
                this._lastCoordY = this.viewBox.scrollTop + e.nativeEvent.clientY;
                const ele =  this.viewBox;
                ele.addEventListener('mousemove', this.onMouseMove);
                ele.addEventListener('mouseup', this.onMouseUp);
            }
        };
        this.onMouseUp = e => {
            log('onMouseUp');
            const ele =  this.viewBox;
            ele.removeEventListener('mousemove', this.onMouseMove);
            ele.removeEventListener('mouseup', this.onMouseUp);
        };
        this.onMouseMove = (e) => {
            this.viewBox.scrollLeft = this._lastCoordX - e.clientX;
            this.viewBox.scrollTop = this._lastCoordY - e.clientY;
            // log(`onMouseMove ${this.viewBox.scrollLeft} ${this.viewBox.scrollTop}`);
        };
        this.handleContextMenu = e => {
            e.preventDefault();
        };
        this.state = {
            widgetStyle: {
                width: '10000px',
                height: '10000px'
            }
        };
    }
    componentDidMount() {
        this.setWidgetStyle();
        document.addEventListener('contextmenu', this.handleContextMenu);
    }
    componentWillUnmount() {
        document.removeEventListener('contextmenu', this.handleContextMenu);
    }
    setZoomFactor(zoomFactor) {
        this.bigView.style.transform = `scale(${zoomFactor})`;
        this.bigView.style.transformOrigin = '50% 50%';
    }
    render() {
        // log('render');
        const style = {
            ...this.state.widgetStyle
            // zoom:this.props.zoomFactor,
            // transform: `scale(${this.props.zoomFactor})`,
            // transformOrigin: '50% 50%'
        };
        return (React.createElement(DragScrollView, { ref: this.viewBoxRef, onMouseDown: this.onMouseDown },
            React.createElement("div", { style: style, ref: this.bigViewRef },
                React.createElement(DragScrollContent, { ref: this.contentRef, style: this.state.contentStyle }, this.props.children(this.setViewBoxScroll, this.setViewBoxScrollDelta)))));
    }
}
DragScrollWidget.defaultProps = {
    mouseKey: 'left',
    needKeyPressed: false
};

const log$1 = debug('node:save-ref');
class SaveRef extends React.Component {
    constructor() {
        super(...arguments);
        this.getRef = name => {
            // log(this);
            return this[name];
        };
        this.saveRef = name => {
            return node => {
                if (node) {
                    this[name] = node;
                    this.fireListener(name, node);
                }
                else {
                    delete this[name];
                }
            };
        };
        this.deleteRef = name => {
            log$1('deleteRef:', name);
            delete this[name];
        };
        this.observers = new Map();
        this.fireListener = (name, ref) => {
            if (this.observers.has(name)) {
                const listeners = this.observers.get(name);
                for (const listener of listeners) {
                    listener(name, ref);
                }
            }
        };
        this.registerRefListener = (name, listener) => {
            if (!this.observers.has(name)) {
                this.observers.set(name, [listener]);
            }
            else {
                this.observers.get(name).push(listener);
            }
        };
    }
    render() {
        return this.props.children(this.saveRef, this.getRef, this.deleteRef, this.registerRefListener.bind(this));
    }
}

const IconName = {
    MORE: 'more',
    SHOW_MENU: 'show-menu',
    CLOSE: 'close',
    COLOR_PICKER: 'color-picker',
    NOTES: 'notes',
    PLUS: 'plus',
    MINUS: 'minus',
    COLLAPSE_ALL: 'collapse',
    EXPAND_ALL: 'expand',
    CENTER: 'center',
    TRASH: 'trash',
    SEARCH: 'search',
    THEME: 'theme',
    EXPORT: 'export',
    OPEN_FILE: 'openfile',
    OPEN: 'open',
    NEW_FILE: 'newfile',
    SAVE: 'save',
    LAYOUT_LEFT_AND_RIGHT: 'layout-left-and-right',
    LAYOUT_LEFT: 'layout-left',
    LAYOUT_RIGHT: 'layout-right',
    UNDO: 'undo',
    REDO: 'redo',
    MOVE_UP: 'move-up',
    MOVE_DOWN: 'move-down',
    COPY: 'copy',
    RESIZE: 'resize',
    HYPERLINK: 'hyperlink',
    PASTE: 'paste',
    PASTE_AS_TEXT: 'paste-as-text',
    IMAGE: 'image'
};
function iconClassName(name) {
    return `icon iconfont bm-${name}`;
}
function Icon(iconName) {
    return React.createElement("span", { className: iconClassName(iconName) });
}

function contentRefKey(key) {
    return `content-${key}`;
}
function contentEditorRefKey(key) {
    return `content-editor-${key}`;
}
function descEditorRefKey(key) {
    return `desc-editor-${key}`;
}
function topicWidgetRefKey(key) {
    return `topic-widget-${key}`;
}
function topicWidgetRootRefKey(key) {
    return `topic-widget-root-${key}`;
}
function topicNodeRefKey(key) {
    return `topic-node-${key}`;
}
function linksRefKey(key) {
    return `links-${key}`;
}
function linksSvgRefKey(key) {
    return `links-svg-${key}`;
}
function collapseRefKey(key) {
    return `collapse-${key}`;
}
function dropAreaRefKey(key, dir) {
    return `dropArea-${dir}-${key}`;
}
const RefKey = {
    SHEET_ROOT_KEY: 'SHEET-ROOT-',
    DRAG_SCROLL_WIDGET_KEY: 'DRAG-SCROLL-WIDGET-',
    SVG_HIGHLIGHT_KEY: 'SVG-HIGHLIGHT-',
    FOCUS_HIGHLIGHT_KEY: 'FOCUS-HIGHLIGHT-',
    DROP_EFFECT_KEY: 'DROP-EFFECT-',
    SVG_DROP_EFFECT_KEY: 'SVG-DROP-EFFECT-',
    NODE_LAYER: 'NODE-LAYER-'
};
const EventKey = {
    CENTER_ROOT_TOPIC: 'CENTER_ROOT_TOPIC'
};
const PropKey = {
    DIAGRAM_CUSTOMIZE_BASE_Z_INDEX: 'DIAGRAM_CUSTOMIZE_BASE_Z_INDEX',
    TOPIC_CONTEXT_MENU_ENABLED: 'TOPIC_CONTEXT_MENU_ENABLED',
    TOPIC_TITLE: 'TOPIC_TITLE',
    DRAG_DROP_STATE: 'DRAG_DROP_STATE',
    RIGHT_TOP_PANEL_STATE: 'RIGHT_TOP_PANEL_STATE',
    OPERATION_ENABLED: 'OPERATION_ENABLED'
};
const I18nKey = {
    MIND_MAP: 'MIND_MAP',
    OUTLINER: 'OUTLINER',
    COPY: 'COPY',
    PASTE: 'PASTE',
    DUPLICATE: 'DUPLICATE',
    DELETE: 'DELETE',
    CONFIRM: 'CONFIRM',
    CANCEL: 'CANCEL',
    REMOVE: 'REMOVE',
    RENAME: 'RENAME',
    DEFAULT: 'DEFAULT',
    SEARCH: 'SEARCH',
    BROWSE: 'BROWSE',
    CHOOSE_FILE: 'CHOOSE_FILE',
    LAYOUT: 'LAYOUT',
    LEFT_AND_RIGHT: 'LEFT_AND_RIGHT',
    ONLY_LEFT: 'ONLY_LEFT',
    ONLY_RIGHT: 'ONLY_RIGHT',
    ADD_SHEET: 'ADD_SHEET',
    SHEET: 'SHEET',
    EDIT: 'EDIT',
    PASTE_AS_PLAIN_TEXT: 'PASTE_AS_PLAIN_TEXT',
    PASTE_WITH_STYLE: 'PASTE_WITH_STYLE',
    ADD_SIBLING: 'ADD_SIBLING',
    ADD_CHILD: 'ADD_CHILD',
    EDIT_NOTES: 'EDIT_NOTES',
    REMOVE_NOTES: 'REMOVE_NOTES',
    CONVERT_TO_PLAIN_TEXT: 'CONVERT_TO_PLAIN_TEXT',
    SET_AS_EDITOR_ROOT: 'SET_AS_EDITOR_ROOT',
    EXPORT: 'EXPORT',
    EXPORT_TOPIC: 'EXPORT_TOPIC',
    EDIT_TOPOLOGY_DIAGRAM: 'EDIT_TOPOLOGY_DIAGRAM',
    SET_TOPIC_REFERENCES: 'SET_TOPIC_REFERENCES',
    INSERT_IMAGE: 'INSERT_IMAGE',
    //========================================
    TOPIC_STYLE: 'TOPIC_STYLE',
    STYLE: 'STYLE',
    TEXT_EDITOR: 'TEXT_EDITOR',
    LINK: 'LINK',
    LINK_TO_PARENT: 'LINK_TO_PARENT',
    SUB_LINKS: 'SUB_LINKS',
    COPY_STYLE: 'COPY_STYLE',
    PASTE_STYLE: 'PASTE_STYLE',
    CLEAR_TOPIC_STYLE: 'CLEAR_TOPIC_STYLE',
    CLEAR_ALL_CUSTOM_STYLE: 'CLEAR_ALL_CUSTOM_STYLE',
    LINE_TYPE: 'LINE_TYPE',
    //=======================================
    THEME: 'THEME',
    GLOBAL: 'GLOBAL',
    HIGHLIGHT: 'HIGHLIGHT',
    RANDOM_COLOR: 'RANDOM_COLOR',
    NORMAL_TOPIC: 'NORMAL_TOPIC',
    PRIMARY_TOPIC: 'PRIMARY_TOPIC',
    ROOT_TOPIC: 'ROOT_TOPIC',
    EXPORT_THEME: 'EXPORT_THEME',
    IMPORT_THEME: 'IMPORT_THEME',
    //=======================================
    TAGS: 'TAGS',
    TAGS_MANAGER: 'TAGS_MANAGER',
    TAG_NAME: 'TAG_NAME',
    ADD_TAG: 'ADD_TAG',
    UPDATE_TAG: 'UPDATE_TAG',
    ALREADY_ADDED: 'ALREADY_ADDED',
    CAN_BE_ADDED: 'CAN_BE_ADDED',
    TOPICS_THAT_USE_THIS_TAG: 'TOPICS_THAT_USE_THIS_TAG',
    //=======================================
    BACKGROUND: 'BACKGROUND',
    COLOR: 'COLOR',
    BORDER: 'BORDER',
    WIDTH: 'WIDTH',
    RADIUS: 'RADIUS',
    FONT_FAMILY: 'FONT_FAMILY',
    FONT_STYLE: 'FONT_STYLE',
    NORMAL: 'NORMAL',
    ITALIC: 'ITALIC',
    OBLIQUE: 'OBLIQUE',
    FONT_WEIGHT: 'FONT_WEIGHT',
    FONT_SIZE: 'FONT_SIZE',
    LINE_HEIGHT: 'LINE_HEIGHT',
    PADDING: 'PADDING',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    NONE: 'NONE',
    SOLID: 'SOLID',
    DOTTED: 'DOTTED',
    DASHED: 'DASHED',
    DOUBLE: 'DOUBLE',
    ROUND: 'ROUND',
    CURVE: 'CURVE',
    LINE: 'LINE',
    COLLAPSE_ALL: 'COLLAPSE_ALL',
    EXPAND_ALL: 'EXPAND_ALL',
    CENTER_ROOT_TOPIC: 'CENTER_ROOT_TOPIC',
    ZOOM: 'ZOOM',
    ZOOM_IN: 'ZOOM_IN',
    ZOOM_OUT: 'ZOOM_OUT',
    RESET: 'RESET',
    RESET_ZOOM: 'RESET_ZOOM',
    NOTE_PLACEHOLDER: 'NOTE_PLACEHOLDER',
    TOPOLOGY_DIAGRAM_EDITOR: 'TOPOLOGY_DIAGRAM_EDITOR',
    BASIC: 'BASIC',
    FLOW_GRAPH: 'FLOW_GRAPH',
    ACTIVITY_DIAGRAM: 'ACTIVITY_DIAGRAM',
    SEQUENCE_DIAGRAM: 'SEQUENCE_DIAGRAM',
    CLASS_DIAGRAM: 'CLASS_DIAGRAM',
    REFERENCE_TOPICS: 'REFERENCE_TOPICS',
    REFERENCED_TOPICS: 'REFERENCED_TOPICS',
    GOTO_ORIGINAL_TOPIC: 'GOTO_ORIGINAL_TOPIC',
    INDENT: 'INDENT',
    OUTDENT: 'OUTDENT',
    PASTE_AND_SPLIT_BY_LINE_BREAK: 'PASTE_AND_SPLIT_BY_LINE_BREAK',
    SELECT_REF_TOPICS_TIP: 'SELECT_REF_TOPICS_TIP',
    TAG_NAME_OVER_MAX_TIP: 'TAG_NAME_OVER_MAX_TIP',
    DELETE_TAG_TIP: 'DELETE_TAG_TIP',
    DELETE_TOPOLOGY_TIP: 'DELETE_TOPOLOGY_TIP',
    DELETE_REFERENCE_TIP: 'DELETE_REFERENCE_TIP',
    FILE_FORMAT_ERROR: 'FILE_FORMAT_ERROR',
    SELECT_IMAGE_TIP1: 'SELECT_IMAGE_TIP1',
    SELECT_IMAGE_TIP2: 'SELECT_IMAGE_TIP2',
    SELECT_IMAGE_ERR_TIP: 'SELECT_IMAGE_ERR_TIP',
    HYPERLINK: 'HYPERLINK',
    INSERT_HYPERLINK: 'INSERT_HYPERLINK',
    SET_TO_ORIGINAL_SIZE: 'SET_TO_ORIGINAL_SIZE',
    MOVE_UP: 'MOVE_UP',
    MOVE_DOWN: 'MOVE_DOWN'
};
const TempValueKey = {
    EDITOR_CONTENT: 'EDITOR_CONTENT'
};

const stopPropagation = e => {
    e.stopPropagation();
};

function browserDownloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
}
function browserDownloadText(text, filename) {
    const url = `data:text/plain,${encodeURIComponent(text)}`;
    browserDownloadFile(url, filename);
}
function browserOpenFile(accept) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    return new Promise((resolve, reject) => {
        input.addEventListener('change', evt => {
            //@ts-ignore
            const file = evt.target.files[0];
            const fr = new FileReader();
            fr.onload = (evt) => {
                //@ts-ignore
                const txt = evt.target.result;
                resolve(txt);
            };
            fr.onerror = (evt) => {
                //@ts-ignore
                reject(evt.target.error);
            };
            fr.readAsText(file);
        });
        input.click();
    });
}

function paddingCss(arg) {
    const { top = 0, right = 0, bottom = 0, left = 0 } = arg;
    return `${top}px ${right}px ${bottom}px ${left}px`;
}
function getComputedStyle(element, property) {
    return window.getComputedStyle(element, null).getPropertyValue(property);
}

// import { I18nKey } from './keys';
function getI18nText(ctx, key) {
    try {
        if (Array.isArray(key)) {
            return key.map(k => ctx.controller.run('getI18nText', { ...ctx, key: k }));
        }
        return ctx.controller.run('getI18nText', {
            ...ctx,
            key: key.toUpperCase()
        });
    }
    catch (e) {
        throw e;
    }
}
// export function getCssI18nText(ctx, cssName) {
//   const cssNames = {
//     none: I18nKey.NONE,
//     solid: I18nKey.SOLID,
//     dotted: I18nKey.DOTTED,
//     dashed: I18nKey.DASHED,
//     double: I18nKey.DOUBLE,
//
//     round: I18nKey.ROUND,
//     curve: I18nKey.CURVE,
//
//   };
//
//   return getI18nText(ctx, cssNames[cssName]);
// }

const COLORS = {
    HIGHLIGHT: '#48aff0',
    DARK: {
        ZINDEX_BG: '#383838',
        TOOLBAR_BG: '#494646',
        ITEM_BG: '#726E6F',
        ITEM_BG_ACTIVE: '#58595A',
        ITEM: '#C6C2C3',
        ITEM_ACTIVE: '#FFFFFF',
        // CONTAINER_BG: '#2f3235'
        CONTAINER_BG: '#444'
    },
    LIGHT: {
        TOOLBAR_BG: '#D6D6D6',
        ITEM: core.Colors.GRAY3,
        ITEM_BG: core.Colors.LIGHT_GRAY1,
        ITEM_ACTIVE: core.Colors.BLACK,
        ITEM_BG_ACTIVE: core.Colors.LIGHT_GRAY1,
        CONTAINER_BG: core.Colors.LIGHT_GRAY5
    }
};
function setColorAlpha(color, alpha) {
    const [r, g, b, a] = colorString.get.rgb(color);
    return colorString.to.rgb([r, g, b, alpha]);
}
function setColorAlphaPercent(color, percent) {
    const [r, g, b, a] = colorString.get.rgb(color);
    return colorString.to.rgb([r, g, b, a * percent]);
}

function swap(list, idx1, idx2) {
    const size = list.size;
    if (idx1 >= 0 && idx1 < size && idx2 >= 0 && idx2 < size && idx1 !== idx2) {
        const v1 = list.get(idx1);
        const v2 = list.get(idx2);
        return list
            .delete(idx1)
            .insert(idx1, v2)
            .delete(idx2)
            .insert(idx2, v1);
    }
    return list;
}

const isOSX = navigator.userAgent.includes('Mac');

function tvZoomFactorKey(model) {
    return `ZoomFactor-${model.id}-${model.config.viewMode}`;
}

function op(controller, args) {
    controller.run('operation', args);
}

function selectTo(div, sel, dir) {
    sel = sel || window.getSelection();
    const anchorNode = sel.anchorNode;
    if (div.contains(anchorNode)) {
        const anchorOffset = sel.anchorOffset;
        const range = new Range();
        if (dir === 'end') {
            range.setStart(anchorNode, anchorOffset);
            range.setEndAfter(div.lastChild);
        }
        else {
            range.setStartBefore(div.firstChild);
            range.setEnd(anchorNode, anchorOffset);
        }
        sel.removeAllRanges();
        sel.addRange(range);
    }
}
function selectToEnd(div, sel) {
    selectTo(div, sel, 'end');
}
function selectToStart(div, sel) {
    selectTo(div, sel, 'start');
}

function getLinkKey(fromKey, toKey) {
    return `link-${fromKey}-${toKey}`;
}
function centerY(rect) {
    return (rect.top + rect.bottom) / 2;
}
function centerX(rect) {
    return (rect.left + rect.right) / 2;
}
function centerPointX(p1, p2) {
    return (p1.x + p2.x) / 2;
}
function centerPointY(p1, p2) {
    return (p1.y + p2.y) / 2;
}
function center(rect) {
    return [(rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2];
}
function getRelativeRect(el, rel, scale = 1) {
    const rect = el.getBoundingClientRect();
    const relRect = rel.getBoundingClientRect();
    const relCenter = center(relRect);
    const elCenter = center(rect);
    elCenter[0] = (elCenter[0] - relCenter[0]) / scale;
    elCenter[1] = (elCenter[1] - relCenter[1]) / scale;
    const width = rect.width / scale;
    const height = rect.height / scale;
    return {
        left: elCenter[0] - width / 2,
        right: elCenter[0] + width / 2,
        top: elCenter[1] - height / 2,
        bottom: elCenter[1] + height / 2,
        width,
        height
    };
}
function getRelativeVector(el, rel) {
    const rect = el.getBoundingClientRect();
    const relRect = rel.getBoundingClientRect();
    const relCenter = center(relRect);
    const elCenter = center(rect);
    return [elCenter[0] - relCenter[0], elCenter[1] - relCenter[1]];
}

const Flex = styled__default.div `
  display: flex;
  flex-direction: ${props => props.flexDirection ? props.flexDirection : 'row'};
  align-items: ${props => props.alignItems};
  justify-content: ${props => props.justifyContent};
`;
const InlineBlockSpan = styled__default.span `
  display: inline-block;
`;
const Margin = styled__default.div `
  margin: ${props => props.margin};
`;
const ShowMenuIcon = styled__default.div `
  font-size: 20px !important;
`;
const IconBg = styled__default.div `
  padding: 5px;
  cursor: pointer;
`;
const Btn = styled__default.div `
  cursor: pointer;
  &:hover {
    color: ${COLORS.LIGHT.ITEM_BG_ACTIVE};
  }
`;
const StyledCheckbox = styled__default(core.Checkbox) `
  margin-bottom: 0px !important;
`;
const CloseIcon = styled__default.div `
  position: absolute;
  right: 5px;
  top: 5px;
  z-index: 1;
  //padding: 5px;
`;
const Title = styled__default.div `
  height: 16px;
`;
const TopicBlockIcon = styled__default.span `
  margin: 0px 10px;
  &:hover {
    color: palevioletred;
  }
`;
const ZIndex = styled__default.div `
  z-index: ${props => props.zIndex};
  .bp3-dark & {
    background-color: ${COLORS.DARK.ZINDEX_BG};
  }
`;
const PanelTabRoot = styled__default.div `
  font-size: 12px;
  min-width: 380px;
  max-width: 482px;
  max-height: 480px;
  overflow: auto;
`;
const ToolbarItemPopoverTarget = styled__default.div `
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;
const VListContainer = styled__default.div `
  max-height: ${props => props.maxHeight || '300px'};
  overflow-y: auto;
  overflow-x: hidden;
`;

const SettingTitle = styled__default.div `
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: bold;
`;
const SettingItem = styled__default.span `
  margin: 0 10px 0 2px;
`;
const SettingBoxContainer = styled__default.div `
  padding: 10px;
  margin: 0 0 10px 0;
  //border: rgba(16, 22, 26, 0.15) solid 1px;
  border-radius: 5px;

  background: ${COLORS.LIGHT.CONTAINER_BG};

  .bp3-dark & {
    background: ${COLORS.DARK.CONTAINER_BG};
  }
`;
const SettingLabel = styled__default(SettingItem) ``;
const SettingRow = styled__default.div `
  display: flex;
  align-items: center;
  //justify-content: center;
  margin: 5px 0;
`;
const SettingRowTitle = styled__default.div `
  margin: 0 5px 0 0;
  width: 88px;
`;
const ColorBar = styled__default.div `
  height: 3px;
  width: 80%;
  margin-left: 10%;
  margin-right: 10%;
  margin-bottom: 2px;
  background: ${props => props.color};
`;
const WithBorder = styled__default.div `
  border: 1px solid grey;
  cursor: pointer;
  font-weight: bold;
`;

const GlobalStyle = styled.createGlobalStyle `
  .bp3-dark {
    color : ${core.Colors.GRAY5} !important;
    .bp3-card {
      background-color: ${COLORS.DARK.TOOLBAR_BG} !important;
    }
    
    .bp3-menu-item {
      &:active &:hover {
        background-color: ${COLORS.DARK.ITEM_BG_ACTIVE} !important;
      }
    }
    
    .bp3-button, .bp3-menu, .bp3-input, .bp3-menu-item, .bp3-tab, .bp3-drawer {
      color : ${COLORS.DARK.ITEM};
      background-color: ${COLORS.DARK.ITEM_BG} ;
    }
  }
`;

const Label = styled__default.div `
  margin: ${props => (props.width == null ? '0 5px 0 0' : null)};
  width: ${props => props.width};
`;
function SettingGroup(props) {
    return React.createElement("div", { className: "bm-setting-group bp3-divider" }, props.children);
}
function SettingItemFlex(props) {
    const { layout = 'h', children } = props;
    const flexProps = {
        flexDirection: layout === 'h' ? 'row' : 'column',
        alignItems: 'center'
    };
    return (React.createElement(SettingItem, null,
        React.createElement(Flex, Object.assign({}, flexProps), children)));
}
function SettingItemColorPicker(props) {
    const { title, layout = 'h', color, handleColorChange } = props;
    return (React.createElement(SettingItemFlex, { layout: layout },
        title != null && React.createElement(Label, null, title),
        React.createElement(core.Popover, null,
            React.createElement(WithBorder, null,
                React.createElement("div", { className: iconClassName(IconName.COLOR_PICKER) }),
                React.createElement(ColorBar, { color: color })),
            React.createElement("div", null,
                React.createElement(reactColor.SketchPicker, { color: color, onChangeComplete: color => {
                        const { r, g, b, a } = color.rgb;
                        handleColorChange(`rgba(${r},${g},${b},${a})`);
                    } })))));
}
function SettingItemButton(props) {
    const { title, ...restProps } = props;
    return (React.createElement(SettingItem, null,
        React.createElement(core.Button, Object.assign({}, restProps), title)));
}
function SettingItemNumericInput(props) {
    const { layout = 'h', labelWidth, title, ...restProps } = props;
    return (React.createElement(SettingItemFlex, { layout: layout },
        React.createElement(Label, { width: labelWidth }, title),
        React.createElement(core.NumericInput, Object.assign({}, restProps))));
}
function SettingItemInput(props) {
    const { layout = 'h', labelWidth, title, ...restProps } = props;
    return (React.createElement(SettingItemFlex, { layout: layout },
        React.createElement(Label, { width: labelWidth },
            title,
            " "),
        React.createElement(core.InputGroup, Object.assign({}, restProps))));
}
function SettingItemSelect(props) {
    const { layout = 'h', filterable = false, title, labelWidth, text, ...rest } = props;
    const PxSelect = select.Select.ofType();
    const pxProps = {
        filterable,
        ...rest
    };
    return (React.createElement(SettingItemFlex, { layout: layout },
        title && React.createElement(Label, { width: labelWidth }, title),
        React.createElement(PxSelect, Object.assign({}, pxProps),
            React.createElement(core.Button, { text: text }))));
}
const renderItem = unit => (v, { handleClick }) => {
    return React.createElement(core.MenuItem, { text: `${v}${unit}`, key: v, onClick: handleClick });
};
const renderItemI18n = ctx => (v, { handleClick }) => {
    return React.createElement(core.MenuItem, { text: getI18nText(ctx, v), key: v, onClick: handleClick });
};
const PxSelect = select.Select.ofType();
const borderWidthItems = [...Array(7).keys()];

function ToolbarItem(props) {
    const { controller, children, onClick, className, iconName, iconCxName } = props;
    let { disabled } = props;
    disabled = disabled || !controller.getValue(PropKey.OPERATION_ENABLED, props);
    const handleClick = e => {
        if (!disabled && onClick)
            onClick(e);
    };
    const nProps = {
        onClick: handleClick,
        className: cx('bm-toolbar-item', { 'bm-toolbar-item-disabled': disabled }, className)
    };
    return (React.createElement("div", Object.assign({}, nProps),
        React.createElement("div", { className: cx(iconClassName(iconName), iconCxName) }),
        children));
}
function ToolbarGroupItem(props) {
    const { items } = props;
    return (React.createElement("div", { className: "bm-toolbar-group" }, items.map(item => {
        const iProps = {
            ...item
        };
        return React.createElement(ToolbarItem, Object.assign({}, iProps));
    })));
}

function RenameDialog(props) {
    const { handleConfirm, handleClose, isOpen } = props;
    const [title, setTitle] = React.useState(props.title);
    const onChange = e => {
        setTitle(e.target.value);
    };
    return (React.createElement(core.Dialog, { title: getI18nText(props, I18nKey.RENAME), onClose: handleClose, isOpen: isOpen },
        React.createElement("div", { className: core.Classes.DIALOG_BODY },
            React.createElement("input", { className: "bp3-input .modifier", type: "text", value: title, onChange: onChange, placeholder: "Text input", dir: "auto" })),
        React.createElement("div", { className: core.Classes.DIALOG_FOOTER },
            React.createElement("div", { className: core.Classes.DIALOG_FOOTER_ACTIONS },
                React.createElement(core.Button, { onClick: handleClose }, getI18nText(props, I18nKey.CANCEL)),
                React.createElement(core.AnchorButton, { onClick: handleConfirm(title) }, getI18nText(props, I18nKey.CONFIRM))))));
}

const objectValues = require('object.values');
const contains = require('document.contains');
const DISPLAY = {
    BLOCK: 'block',
    FLEX: 'flex',
    INLINE: 'inline',
    INLINE_BLOCK: 'inline-block',
    CONTENTS: 'contents'
};
// const propTypes = forbidExtraProps({
//   children: PropTypes.node.isRequired,
//   onOutsideClick: PropTypes.func.isRequired,
//   disabled: PropTypes.bool,
//   useCapture: PropTypes.bool,
//   display: PropTypes.oneOf(objectValues(DISPLAY))
// });
const defaultProps = {
    disabled: false,
    // `useCapture` is set to true by default so that a `stopPropagation` in the
    // children will not prevent all outside click handlers from firing - maja
    useCapture: true,
    display: DISPLAY.BLOCK
};
class OutsideClickHandler extends React.Component {
    constructor(props) {
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.setChildNodeRef = this.setChildNodeRef.bind(this);
    }
    componentDidMount() {
        const { disabled, useCapture } = this.props;
        if (!disabled)
            this.addMouseDownEventListener(useCapture);
    }
    componentDidUpdate({ disabled: prevDisabled }) {
        const { disabled, useCapture } = this.props;
        if (prevDisabled !== disabled) {
            if (disabled) {
                this.removeEventListeners();
            }
            else {
                this.addMouseDownEventListener(useCapture);
            }
        }
    }
    componentWillUnmount() {
        this.removeEventListeners();
    }
    // Use mousedown/mouseup to enforce that clicks remain outside the root's
    // descendant tree, even when dragged. This should also get triggered on
    // touch devices.
    onMouseDown(e) {
        const { useCapture } = this.props;
        const isDescendantOfRoot = this.childNode && contains(this.childNode, e.target);
        if (!isDescendantOfRoot) {
            if (this.removeMouseUp) {
                this.removeMouseUp();
                this.removeMouseUp = null;
            }
            this.removeMouseUp = consolidatedEvents.addEventListener(document, 'mouseup', this.onMouseUp, { capture: useCapture });
        }
    }
    // Use mousedown/mouseup to enforce that clicks remain outside the root's
    // descendant tree, even when dragged. This should also get triggered on
    // touch devices.
    onMouseUp(e) {
        const { onOutsideClick } = this.props;
        const isDescendantOfRoot = this.childNode && contains(this.childNode, e.target);
        if (this.removeMouseUp) {
            this.removeMouseUp();
            this.removeMouseUp = null;
        }
        if (!isDescendantOfRoot) {
            onOutsideClick(e);
        }
    }
    setChildNodeRef(ref) {
        this.childNode = ref;
    }
    addMouseDownEventListener(useCapture) {
        this.removeMouseDown = consolidatedEvents.addEventListener(document, 'mousedown', this.onMouseDown, { capture: useCapture });
    }
    removeEventListeners() {
        if (this.removeMouseDown)
            this.removeMouseDown();
        if (this.removeMouseUp)
            this.removeMouseUp();
    }
    render() {
        const { children, display } = this.props;
        return (React.createElement("div", { ref: this.setChildNodeRef, style: display !== DISPLAY.BLOCK && objectValues(DISPLAY).includes(display)
                ? { display }
                : undefined }, children));
    }
}
OutsideClickHandler.defaultProps = defaultProps;

function Alert(props) {
    const { content, onClose: _onClose, onCancel, ...rest } = props;
    const onClose = _onClose || onCancel;
    const alertProps = {
        cancelButtonText: getI18nText(props, I18nKey.CANCEL),
        confirmButtonText: getI18nText(props, I18nKey.CONFIRM),
        canEscapeKeyCancel: true,
        ...rest,
        onClose,
        onCancel
    };
    return (React.createElement(core.Alert, Object.assign({}, alertProps),
        React.createElement("p", null, content)));
}

const HotKeyChar = {
    Mod: isOSX ? '⌘' : 'Ctrl',
    Shift: isOSX ? '⇧' : 'Shift',
    Alt: isOSX ? '⌥' : 'Alt'
};
function KeyboardHotKeyWidget(props) {
    const { hotkeys } = props;
    if (hotkeys == null)
        return null;
    const res = [];
    for (let i = 0; i < hotkeys.length; i++) {
        const hotkey = hotkeys[i];
        res.push(React__default.createElement("kbd", { key: i }, HotKeyChar[hotkey] || hotkey));
    }
    return React__default.createElement("div", null, res);
}

function Toolbar(props) {
    const { controller } = props;
    return (React.createElement("div", { className: "bm-toolbar" }, controller.run('renderToolbarItems', props)));
}

function ToolbarItemLayout(props) {
    const layoutDirs = [
        [
            core$1.DiagramLayoutType.LEFT_AND_RIGHT,
            getI18nText(props, I18nKey.LEFT_AND_RIGHT),
            'layout-left-and-right'
        ],
        [
            core$1.DiagramLayoutType.LEFT_TO_RIGHT,
            getI18nText(props, I18nKey.ONLY_RIGHT),
            'layout-right'
        ],
        [
            core$1.DiagramLayoutType.RIGHT_TO_LEFT,
            getI18nText(props, I18nKey.ONLY_LEFT),
            'layout-left'
        ]
    ];
    const onClickSetLayout = layoutDir => e => {
        const { controller } = props;
        controller.run('operation', {
            ...props,
            opType: core$1.OpType.SET_LAYOUT_DIR,
            layoutDir
        });
    };
    const nProps = {
        ...props,
        iconName: IconName.LAYOUT_LEFT_AND_RIGHT,
        iconCxName: 'layout',
        label: getI18nText(props, I18nKey.LAYOUT)
    };
    return (React.createElement(ToolbarItem, Object.assign({}, nProps),
        React.createElement(core.Popover, { enforceFocus: false },
            React.createElement(ToolbarItemPopoverTarget, null),
            React.createElement(core.Menu, null, layoutDirs.map(dir => (React.createElement(core.MenuItem, { key: dir[1], icon: Icon(dir[2]), text: dir[1], onClick: onClickSetLayout(dir[0]) })))))));
}

function ToolbarItemAddSheet(props) {
    const { controller } = props;
    const onClick = () => {
        const sheetModel = controller.run('createNewSheetModel', props);
        controller.run('operation', {
            ...props,
            opType: core$1.OpType.ADD_SHEET,
            sheetModel
        });
    };
    return (React.createElement(core.MenuItem, { text: getI18nText(props, I18nKey.ADD_SHEET), onClick: onClick }));
}

function ToolbarItemMore(props) {
    const { controller } = props;
    const itemConfigs = controller.run('customizeToolbarItemMore', props);
    itemConfigs.sort((a, b) => a.order - b.order);
    return (React.createElement(ToolbarItem, Object.assign({ iconName: IconName.MORE, iconCxName: "more" }, props),
        React.createElement(core.Popover, { enforceFocus: false },
            React.createElement(ToolbarItemPopoverTarget, null),
            React.createElement(core.Menu, null, itemConfigs.map(item => React.createElement(item.element, {
                ...props,
                key: item.order.toString()
            }))))));
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function CreateModelPlugin() {
    return {
        createNewDocModel(ctx) {
            const { controller } = ctx;
            const docModel = new core$1.DocModel({
                sheetModels: immutable.List([controller.run('createNewSheetModel', ctx)]),
                currentSheetIndex: 0
            });
            controller.docModel = docModel;
            return docModel;
        },
        // TODO
        createNewSheetModel(ctx) {
            const { docModel } = ctx;
            const idx = docModel ? docModel.sheetModels.size + 1 : 1;
            const title = getI18nText(ctx, I18nKey.SHEET) + idx;
            return core$1.SheetModel.createEmpty({ title });
        }
    };
}

const log$2 = debug('plugin:event');
function EventPlugin() {
    const eventListeners = {};
    let _isHandlingMouseMove = false;
    return {
        isHandlingMouseMove(ctx) {
            return _isHandlingMouseMove;
        },
        setHandlingMouseMove(v) {
            _isHandlingMouseMove = v;
        },
        handleTopicClick(props) {
            log$2('handleTopicClick');
            const { controller, model, topicKey } = props;
            log$2(model.zoomFactor);
            //TODO
            if (model.editingDescKey !== null)
                return;
            if (model.editingContentKey === topicKey)
                return;
            if (model.focusKey === topicKey &&
                (model.focusMode === core$1.FocusMode.EDITING_CONTENT ||
                    model.focusMode === core$1.FocusMode.NORMAL))
                return;
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.FOCUS_TOPIC,
                focusMode: core$1.FocusMode.NORMAL
            });
        },
        handleTopicDoubleClick(props) {
            const { controller, model } = props;
            if (model.editingDescKey !== null)
                return;
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.FOCUS_TOPIC,
                focusMode: core$1.FocusMode.EDITING_CONTENT
            });
        },
        handleTopicContextMenu(props) {
            const { controller } = props;
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.FOCUS_TOPIC,
                focusMode: core$1.FocusMode.SHOW_POPUP
            });
        },
        handleDialogClose(props) { },
        addEventListener(props) {
            const { key, listener, once, controller } = props;
            if (!eventListeners[key])
                eventListeners[key] = [];
            if (once) {
                only.origin = listener;
                eventListeners[key].push(only);
            }
            else {
                eventListeners[key].push(listener);
            }
            function only() {
                listener();
                controller.run('removeEventListener', {
                    key,
                    listener
                });
            }
        },
        removeEventListener(props) {
            const { key, listener } = props;
            if (eventListeners[key]) {
                eventListeners[key] = eventListeners[key].filter(fn => {
                    return fn !== listener && fn.origin !== listener;
                });
            }
        },
        fireEvent(props) {
            const { key } = props;
            if (eventListeners[key]) {
                eventListeners[key].forEach(fn => fn());
            }
        }
    };
}

function GetValuePlugin() {
    return {
        getValue(props, next) {
            const { propKey, controller, diagramState } = props;
            switch (propKey) {
                case PropKey.DIAGRAM_CUSTOMIZE_BASE_Z_INDEX:
                    return 3;
                case PropKey.TOPIC_CONTEXT_MENU_ENABLED:
                    return controller.run('isOperationEnabled', props);
                case PropKey.OPERATION_ENABLED:
                    return controller.run('isOperationEnabled', props);
                case PropKey.TOPIC_TITLE:
                    return controller.run('getTopicTitle', props);
                case PropKey.DRAG_DROP_STATE:
                    return diagramState.dragDrop;
                case PropKey.RIGHT_TOP_PANEL_STATE:
                    return diagramState.rightTopPanel;
            }
            return next();
        }
    };
}

const HotKeyName = {
    ADD_CHILD: 'ADD_CHILD',
    ADD_SIBLING: 'ADD_SIBLING',
    DELETE_TOPIC: 'DELETE_TOPIC',
    SWAP_UP: 'SWAP_UP',
    SWAP_DOWN: 'SWAP_DOWN',
    EDIT_CONTENT: 'EDIT_CONTENT',
    EDIT_NOTES: 'EDIT_NOTES',
    DELETE_NOTES: 'DELETE_NOTES',
    SET_EDITOR_ROOT: 'SET_EDITOR_ROOT',
    PASTE: 'PASTE'
};
const MoveTopicDir = {
    CENTER: 0,
    LEFT_CENTER: 1
};

function op$1(opType, props) {
    const { topicKey, controller } = props;
    if (topicKey === undefined) {
        props = { ...props, topicKey: controller.model.focusKey };
    }
    controller.run('operation', { ...props, opType });
}
function HotKeyPlugin() {
    return {
        customizeHotKeys(ctx) {
            const { controller } = ctx;
            const model = controller.model;
            const handleHotKeyDown = (opType, opArg) => e => {
                // log('HotKeyPlugin', opType);
                op$1(opType, { ...ctx, ...opArg });
                e.stopImmediatePropagation();
                e.preventDefault();
            };
            const topicHotKeys = new Map([
                [
                    HotKeyName.SWAP_UP,
                    {
                        label: 'swap up',
                        combo: 'mod + up',
                        allowInInput: true,
                        preventDefault: true,
                        stopPropagation: true,
                        onKeyDown: handleHotKeyDown(core$1.OpType.SWAP_UP)
                    }
                ],
                [
                    HotKeyName.SWAP_DOWN,
                    {
                        label: 'swap down',
                        combo: 'mod + down',
                        allowInInput: true,
                        preventDefault: true,
                        stopPropagation: true,
                        onKeyDown: handleHotKeyDown(core$1.OpType.SWAP_DOWN)
                    }
                ],
                [
                    HotKeyName.DELETE_TOPIC,
                    {
                        label: 'delete topic',
                        combo: 'del',
                        allowInInput: true,
                        preventDefault: true,
                        stopPropagation: true,
                        onKeyDown: handleHotKeyDown(core$1.OpType.DELETE_TOPIC)
                    }
                ],
                [
                    HotKeyName.EDIT_NOTES,
                    {
                        label: 'edit notes',
                        combo: 'alt + d',
                        allowInInput: true,
                        onKeyDown: handleHotKeyDown(core$1.OpType.START_EDITING_DESC)
                    }
                ],
                [
                    HotKeyName.SET_EDITOR_ROOT,
                    {
                        label: 'set editor root',
                        combo: 'alt + f',
                        allowInInput: true,
                        onKeyDown: handleHotKeyDown(core$1.OpType.SET_EDITOR_ROOT)
                    }
                ]
            ]);
            const topic = model.currentFocusTopic;
            if (topic && topic.getBlock(core$1.BlockType.DESC).block)
                topicHotKeys.set(HotKeyName.DELETE_NOTES, {
                    label: 'delete notes',
                    combo: 'alt + shift + d',
                    allowInInput: true,
                    onKeyDown: handleHotKeyDown(core$1.OpType.DELETE_TOPIC_BLOCK, {
                        blockType: core$1.BlockType.DESC
                    })
                });
            const globalHotKeys = new Map();
            const viewModeTopicHotKeys = new Map();
            const viewModeMindMapTopicHotKeys = new Map([
                [
                    HotKeyName.ADD_SIBLING,
                    {
                        label: 'add sibling',
                        combo: 'enter',
                        onKeyDown: handleHotKeyDown(core$1.OpType.ADD_SIBLING)
                    }
                ],
                [
                    HotKeyName.EDIT_CONTENT,
                    {
                        label: 'edit content',
                        combo: 'space',
                        onKeyDown: handleHotKeyDown(core$1.OpType.START_EDITING_CONTENT)
                    }
                ],
                [
                    HotKeyName.ADD_CHILD,
                    {
                        label: 'add child',
                        combo: 'tab',
                        allowInInput: true,
                        preventDefault: true,
                        stopPropagation: true,
                        onKeyDown: handleHotKeyDown(core$1.OpType.ADD_CHILD)
                    }
                ]
            ]);
            viewModeTopicHotKeys.set(core$1.ViewModeMindMap, viewModeMindMapTopicHotKeys);
            return {
                topicHotKeys,
                globalHotKeys,
                viewModeTopicHotKeys
            };
        }
    };
}

function I18nPlugin() {
    const i18nTextMap = new Map([
        [I18nKey.MIND_MAP, 'Mind Map'],
        [I18nKey.OUTLINER, 'Outliner'],
        [I18nKey.COPY, 'Copy'],
        [I18nKey.PASTE, 'Paste'],
        [I18nKey.DUPLICATE, 'Duplicate'],
        [I18nKey.DELETE, 'Delete'],
        [I18nKey.CONFIRM, 'Confirm'],
        [I18nKey.CANCEL, 'Cancel'],
        [I18nKey.REMOVE, 'Remove'],
        [I18nKey.RENAME, 'Rename'],
        [I18nKey.DEFAULT, 'Default'],
        [I18nKey.SEARCH, 'Search'],
        [I18nKey.BROWSE, 'Browse'],
        [I18nKey.LAYOUT, 'Layout'],
        [I18nKey.LEFT_AND_RIGHT, 'Left And Right'],
        [I18nKey.ONLY_LEFT, 'Only Left'],
        [I18nKey.ONLY_RIGHT, 'Only Right'],
        [I18nKey.ADD_SHEET, 'Add Sheet'],
        [I18nKey.SHEET, 'Sheet'],
        [I18nKey.EDIT, 'Edit'],
        [I18nKey.ADD_CHILD, 'Add Child'],
        [I18nKey.ADD_SIBLING, 'Add Sibling'],
        [I18nKey.EDIT_NOTES, 'Edit Notes'],
        [I18nKey.REMOVE_NOTES, 'Remove Notes'],
        [I18nKey.CONVERT_TO_PLAIN_TEXT, 'Convert to Plain Text'],
        [I18nKey.SET_AS_EDITOR_ROOT, 'Set as Editor Root'],
        [I18nKey.EXPORT, 'Export'],
        [I18nKey.EDIT_TOPOLOGY_DIAGRAM, 'Edit Topology Diagram'],
        [I18nKey.SET_TOPIC_REFERENCES, 'Set Topic References'],
        [I18nKey.INSERT_IMAGE, 'Insert image'],
        [I18nKey.TOPIC_STYLE, 'TopicStyle'],
        [I18nKey.STYLE, 'Style'],
        [I18nKey.TEXT_EDITOR, 'Text Editor'],
        [I18nKey.LINK, 'Link'],
        [I18nKey.LINK_TO_PARENT, 'LinkToParent'],
        [I18nKey.SUB_LINKS, 'SubLinks'],
        [I18nKey.COPY_STYLE, 'Copy Style'],
        [I18nKey.PASTE_STYLE, 'Paste Style'],
        [I18nKey.CLEAR_TOPIC_STYLE, 'Clear Topic Style'],
        [I18nKey.CLEAR_ALL_CUSTOM_STYLE, 'Clear All Custom Style'],
        [I18nKey.LINE_TYPE, 'LineType'],
        [I18nKey.THEME, 'Theme'],
        [I18nKey.GLOBAL, 'Global'],
        [I18nKey.HIGHLIGHT, 'Highlight'],
        [I18nKey.RANDOM_COLOR, 'Random Color'],
        [I18nKey.NORMAL_TOPIC, 'NormalTopic'],
        [I18nKey.PRIMARY_TOPIC, 'PrimaryTopic'],
        [I18nKey.ROOT_TOPIC, 'RootTopic'],
        [I18nKey.EXPORT_THEME, 'Export Theme'],
        [I18nKey.IMPORT_THEME, 'Import Theme'],
        [I18nKey.TAGS, 'Tags'],
        [I18nKey.TAGS_MANAGER, 'Tags Manager'],
        [I18nKey.TAG_NAME, 'Tag Name'],
        [I18nKey.ADD_TAG, 'Add Tag'],
        [I18nKey.UPDATE_TAG, 'Update Tag'],
        [I18nKey.ALREADY_ADDED, 'Already Added'],
        [I18nKey.CAN_BE_ADDED, 'Can be Added'],
        [I18nKey.TOPICS_THAT_USE_THIS_TAG, 'Topics that Use this Tag'],
        [I18nKey.BACKGROUND, 'Background'],
        [I18nKey.COLOR, 'Color'],
        [I18nKey.BORDER, 'Border'],
        [I18nKey.WIDTH, 'Width'],
        [I18nKey.RADIUS, 'Radius'],
        [I18nKey.FONT_FAMILY, 'FontFamily'],
        [I18nKey.FONT_STYLE, 'FontStyle'],
        [I18nKey.NORMAL, 'Normal'],
        [I18nKey.ITALIC, 'Italic'],
        [I18nKey.OBLIQUE, 'Oblique'],
        [I18nKey.FONT_WEIGHT, 'FontWeight'],
        [I18nKey.FONT_SIZE, 'FontSize'],
        [I18nKey.LINE_HEIGHT, 'LineHeight'],
        [I18nKey.PADDING, 'Padding'],
        [I18nKey.TOP, 'Top'],
        [I18nKey.BOTTOM, 'Bottom'],
        [I18nKey.LEFT, 'Left'],
        [I18nKey.RIGHT, 'Right'],
        [I18nKey.NONE, 'None'],
        [I18nKey.SOLID, 'Solid'],
        [I18nKey.DOTTED, 'Dotted'],
        [I18nKey.DASHED, 'Dashed'],
        [I18nKey.DOUBLE, 'Double'],
        [I18nKey.ROUND, 'Round'],
        [I18nKey.CURVE, 'Curve'],
        [I18nKey.LINE, 'Line'],
        [I18nKey.COLLAPSE_ALL, 'Collapse All'],
        [I18nKey.EXPAND_ALL, 'Expand All'],
        [I18nKey.CENTER_ROOT_TOPIC, 'Center Root Topic'],
        [I18nKey.ZOOM, 'zoom'],
        [I18nKey.ZOOM_IN, 'Zoom In'],
        [I18nKey.ZOOM_OUT, 'Zoom Out'],
        [I18nKey.RESET, 'Reset'],
        [I18nKey.RESET_ZOOM, 'Reset Zoom'],
        [I18nKey.NOTE_PLACEHOLDER, 'Write topic notes here'],
        [I18nKey.TOPOLOGY_DIAGRAM_EDITOR, 'Topology Diagram Editor'],
        [I18nKey.BASIC, 'Basic'],
        [I18nKey.FLOW_GRAPH, 'Flow Graph'],
        [I18nKey.ACTIVITY_DIAGRAM, 'Activity Diagram'],
        [I18nKey.SEQUENCE_DIAGRAM, 'Sequence Diagram'],
        [I18nKey.CLASS_DIAGRAM, 'Class Diagram'],
        [I18nKey.REFERENCE_TOPICS, 'Reference Topics'],
        [I18nKey.REFERENCED_TOPICS, 'Referenced Topics'],
        [I18nKey.GOTO_ORIGINAL_TOPIC, 'Goto Original Topic'],
        [I18nKey.INDENT, 'Indent'],
        [I18nKey.OUTDENT, 'Outdent'],
        [
            I18nKey.SELECT_REF_TOPICS_TIP,
            'Please select the topics you want to reference. After selection, click the confirm button.'
        ],
        [
            I18nKey.TAG_NAME_OVER_MAX_TIP,
            'The length of tag name over the maximum length: 50!'
        ],
        [
            I18nKey.DELETE_TAG_TIP,
            'All the relationship about this tag will be lost if you delete this tag! Are you confirm?'
        ],
        [
            I18nKey.DELETE_TOPOLOGY_TIP,
            'Are you confirm to delete this topology diagram?'
        ],
        [I18nKey.DELETE_REFERENCE_TIP, 'Are you confirm to remove this reference?'],
        [I18nKey.FILE_FORMAT_ERROR, 'File Format Error!'],
        [I18nKey.CHOOSE_FILE, 'Choose file'],
        [I18nKey.SELECT_IMAGE_TIP1, 'Please choose png/jpg/gif format image'],
        [
            I18nKey.SELECT_IMAGE_TIP2,
            'If you take a screenshot using some screenshot software (such as QQ, wechat, snipaste), you can paste the image directly in the editing state.'
        ],
        [I18nKey.SELECT_IMAGE_ERR_TIP, 'Only support png/jpg/gif format'],
        [I18nKey.HYPERLINK, 'Hyperlink'],
        [I18nKey.INSERT_HYPERLINK, 'Insert Hyperlink'],
        [I18nKey.SET_TO_ORIGINAL_SIZE, 'Set to original size'],
        [I18nKey.MOVE_UP, 'Move up'],
        [I18nKey.MOVE_DOWN, 'Move down']
    ]);
    return {
        getI18nTextMap() {
            return i18nTextMap;
        },
        getI18nText(ctx) {
            const { controller, key } = ctx;
            const m = controller.run('getI18nTextMap', ctx);
            if (!m.has(key)) {
                throw new Error(`i18n key ${key} is not exist`);
            }
            return m.get(key);
        }
    };
}

function LayoutPlugin() {
    const _zoomFactor = 1;
    return {
        getPartTopics({ layout, model, topicKey }) {
            const topic = model.getTopic(topicKey);
            const subTopicCount = topic.subKeys.size;
            const topics = topic.subKeys.toArray();
            switch (layout) {
                case core$1.DiagramLayoutType.LEFT_TO_RIGHT:
                    return { R: topics };
                case core$1.DiagramLayoutType.RIGHT_TO_LEFT:
                    return { L: topics };
                case core$1.DiagramLayoutType.LEFT_AND_RIGHT:
                    return {
                        L: topics.slice(Math.ceil(subTopicCount / 2), subTopicCount),
                        R: topics.slice(0, Math.ceil(subTopicCount / 2))
                    };
                case core$1.DiagramLayoutType.TOP_TO_BOTTOM:
                    return {
                        B: topics
                    };
            }
        },
        createSubTopics(props) {
            const { model, topicKey, controller, topics, saveRef } = props;
            const topic = model.getTopic(topicKey);
            if (topics.size === 0 || topic.collapse)
                return null;
            const subTopics = [];
            topics.forEach(tKey => {
                const topicProps = {
                    ...props,
                    topicKey: tKey,
                    topic: model.getTopic(tKey),
                    key: tKey,
                    ref: saveRef(topicWidgetRefKey(tKey))
                };
                subTopics.push(controller.run('renderTopicWidget', topicProps));
            });
            return { subTopics };
        },
        layout(props) {
            const { getRef, model } = props;
            const links = getRef(linksRefKey(model.editorRootTopicKey));
            const dropEffect = getRef(RefKey.DROP_EFFECT_KEY + model.id);
            links && links.layout();
            dropEffect && dropEffect.layout();
            const editorRootTopic = model.getTopic(model.editorRootTopicKey);
            layoutTopic(editorRootTopic);
            function layoutTopic(topic) {
                if (topic.key !== model.editorRootTopicKey) {
                    const topicWidget = getRef(topicWidgetRefKey(topic.key));
                    topicWidget && topicWidget.layoutLinks();
                }
                if (!topic.collapse) {
                    for (const subKey of topic.subKeys) {
                        layoutTopic(model.getTopic(subKey));
                    }
                }
            }
        },
        getRelativeRect(props) {
            const { element, controller, getRef, model } = props;
            const zoomFactor = controller.run('getZoomFactor', props);
            const bigView = getRef(RefKey.DRAG_SCROLL_WIDGET_KEY + model.id).bigView;
            return getRelativeRect(element, bigView, zoomFactor);
        },
        getRelativeRectFromViewPort(props) {
            const { element, controller, getRef, model } = props;
            const zoomFactor = controller.run('getZoomFactor', props);
            const viewBox = getRef(RefKey.DRAG_SCROLL_WIDGET_KEY + model.id).viewBox;
            return getRelativeRect(element, viewBox, zoomFactor);
        },
        getRelativeVectorFromViewPort(props) {
            const { element, getRef, model } = props;
            const viewBox = getRef(RefKey.DRAG_SCROLL_WIDGET_KEY + model.id).viewBox;
            return getRelativeVector(element, viewBox);
        },
        addZoomFactorChangeEventListener(props) {
            const { controller, model } = props;
            controller.run('addTempValueChangeListener', {
                key: tvZoomFactorKey(model),
                ...props
            });
        },
        removeZoomFactorChangeEventListener(props) {
            const { controller, model } = props;
            controller.run('removeTempValueChangeListener', {
                key: tvZoomFactorKey(model),
                ...props
            });
        },
        setZoomFactor(props) {
            const { controller, model, zoomFactor } = props;
            return controller.run('setTempValue', {
                key: tvZoomFactorKey(model),
                value: zoomFactor
            });
        },
        getZoomFactor(props) {
            const { controller, model } = props;
            return (controller.run('getTempValue', { key: tvZoomFactorKey(model) }) ||
                _zoomFactor);
        },
        setZoomFactorOnWheel(ctx) {
            const { controller, ev } = ctx;
            if (controller.run('isCommandOrControl', ctx)) {
                let zoomFactor = controller.run('getZoomFactor', ctx);
                zoomFactor = zoomFactor - (ev.nativeEvent.deltaY > 0 ? 0.1 : -0.1);
                if (zoomFactor < 0.5)
                    zoomFactor = 0.5;
                if (zoomFactor > 4)
                    zoomFactor = 4;
                // console.log('zoomFactor=>', zoomFactor);
                controller.run('setZoomFactor', { ...ctx, zoomFactor });
            }
        },
        moveTopicToCenter(ctx) {
            const { controller, getRef, moveDir = MoveTopicDir.CENTER } = ctx;
            const model = controller.model;
            const topicKey = ctx.topicKey || model.focusKey;
            if (model.editorRootTopicKey !== topicKey &&
                core$1.getRelationship(model, topicKey, model.editorRootTopicKey) !==
                    core$1.TopicRelationship.DESCENDANT) {
                throw new Error(`moveTopicToCenter error: topicKey ${topicKey} is not the DESCENDANT of editor root topic`);
            }
            const topic = getRef(topicNodeRefKey(topicKey));
            const dragScroll = getRef(RefKey.DRAG_SCROLL_WIDGET_KEY + model.id);
            const viewBox = dragScroll.viewBox;
            if (!topic || !viewBox) {
                throw new Error(`moveTopicToCenter error: topic or viewBox is null`);
            }
            const vector = getRelativeVector(topic, viewBox);
            //TODO
            if (moveDir === MoveTopicDir.CENTER)
                dragScroll.setViewBoxScrollDelta(vector[0], vector[1]);
            else if (moveDir === MoveTopicDir.LEFT_CENTER) {
                const boxRect = viewBox.getBoundingClientRect();
                const topicRect = topic.getBoundingClientRect();
                const delta = (boxRect.width - topicRect.width) / 2;
                dragScroll.setViewBoxScrollDelta(vector[0] + delta - 200, vector[1]);
            }
        },
        focusTopicAndMoveToCenter(props) {
            const { controller, topicKey, sheetId } = props;
            const opArray = [
                {
                    opType: core$1.OpType.FOCUS_TOPIC,
                    topicKey,
                    focusMode: core$1.FocusMode.NORMAL
                },
                {
                    opType: core$1.OpType.EXPAND_TO,
                    topicKey
                }
            ];
            if (sheetId && sheetId !== controller.model.id) {
                opArray.unshift({ opType: core$1.OpType.SET_CURRENT_SHEET, sheetId });
            }
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.SET_FOCUS_MODE,
                focusMode: core$1.FocusMode.NORMAL
            });
            controller.run('operation', {
                ...props,
                opArray,
                allowUndo: false,
                callback: docModel => () => {
                    controller.run('moveTopicToCenter', { ...props, docModel, topicKey });
                }
            });
        }
    };
}

const log$3 = debug('plugin:operation');
function OperationPlugin() {
    const { addSheet, setCurrentSheet, duplicateSheet, deleteSheet, setSheetTitle, addChild, addSibling, addMultiTopics, addMultiChild, addMultiChildWithExtData, addMultiSibling, toggleCollapse, collapseAll, expandAll, expandTo, focusTopic, topicContentToPlainText, setFocusMode, deleteTopics, setTopicBlockData, setTopicBlockContentData, deleteTopicBlock, setStyle, clearAllCustomStyle, setTheme, setConfig, setLayoutDir, setEditorRootTopicKey, startEditingContent, startEditingDesc, dragAndDrop, swapUp, swapDown } = core$1.DocModelModifier;
    const OpMap = new Map([
        [core$1.OpType.ADD_SHEET, addSheet],
        [core$1.OpType.SET_CURRENT_SHEET, setCurrentSheet],
        [core$1.OpType.DELETE_SHEET, deleteSheet],
        [core$1.OpType.DUPLICATE_SHEET, duplicateSheet],
        [core$1.OpType.SET_SHEET_TITLE, setSheetTitle],
        [core$1.OpType.TOGGLE_COLLAPSE, toggleCollapse],
        [core$1.OpType.COLLAPSE_ALL, collapseAll],
        [core$1.OpType.EXPAND_ALL, expandAll],
        [core$1.OpType.EXPAND_TO, expandTo],
        [core$1.OpType.ADD_CHILD, addChild],
        [core$1.OpType.ADD_SIBLING, addSibling],
        [core$1.OpType.ADD_MULTI_TOPICS, addMultiTopics],
        [core$1.OpType.ADD_MULTI_CHILD, addMultiChild],
        [core$1.OpType.ADD_MULTI_CHILD_WITH_EXTDATA, addMultiChildWithExtData],
        [core$1.OpType.ADD_MULTI_SIBLING, addMultiSibling],
        [core$1.OpType.DELETE_TOPIC, deleteTopics],
        [core$1.OpType.FOCUS_TOPIC, focusTopic],
        [core$1.OpType.SET_FOCUS_MODE, setFocusMode],
        [core$1.OpType.SET_STYLE, setStyle],
        [core$1.OpType.CLEAR_ALL_CUSTOM_STYLE, clearAllCustomStyle],
        [core$1.OpType.SET_CONFIG, setConfig],
        [core$1.OpType.SET_THEME, setTheme],
        [core$1.OpType.TOPIC_CONTENT_TO_PLAIN_TEXT, topicContentToPlainText],
        [core$1.OpType.SET_TOPIC_BLOCK, setTopicBlockData],
        [core$1.OpType.SET_TOPIC_BLOCK_CONTENT, setTopicBlockContentData],
        [core$1.OpType.DELETE_TOPIC_BLOCK, deleteTopicBlock],
        [core$1.OpType.START_EDITING_CONTENT, startEditingContent],
        [core$1.OpType.START_EDITING_DESC, startEditingDesc],
        [core$1.OpType.DRAG_AND_DROP, dragAndDrop],
        [core$1.OpType.SET_EDITOR_ROOT, setEditorRootTopicKey],
        [core$1.OpType.SET_LAYOUT_DIR, setLayoutDir],
        [core$1.OpType.SWAP_UP, swapUp],
        [core$1.OpType.SWAP_DOWN, swapDown]
    ]);
    let enabled = true;
    let whiteListOperation = new Set();
    return {
        isOperationEnabled(props) {
            return enabled;
        },
        enableOperation() {
            enabled = true;
        },
        disableOperation({ whiteList }) {
            enabled = false;
            if (whiteList)
                whiteListOperation = new Set(whiteList);
            else
                whiteListOperation.clear();
        },
        /** plugin can extend Operation Map
         * for example: A plugin can write a function
         * getOpMap(ctx,next) {
         *   let opMap = next();
         *   opMap.set("OpTypeName",opFunc);
         *   return opMap;
         * }
         * @param ctx
         */
        getOpMap(ctx) {
            return OpMap;
        },
        //TODO 有空重构这个函数
        operation(ctx) {
            if (ctx.controller.docModel) {
                ctx = {
                    ...ctx,
                    docModel: ctx.controller.docModel,
                    model: ctx.controller.docModel.currentSheetModel
                };
            }
            const { controller, opType, docModel, opArray, callback } = ctx;
            if (opArray != null && !Array.isArray(opArray)) {
                throw new Error('operation: the type of opArray must be array!');
            }
            if (opType != null && opArray != null) {
                throw new Error('operation: opType and opArray conflict!');
            }
            const isOperationEnabled = controller.run('isOperationEnabled', ctx);
            if (!isOperationEnabled) {
                // warning(
                //   true,
                //   `You have disabled operation,but you run operation ${props} now!`
                // );
                if (whiteListOperation.size === 0)
                    return;
                if (opArray != null) {
                    const opNotInWhiteList = opArray.filter(op => !whiteListOperation.has(op.opType));
                    if (opNotInWhiteList && opNotInWhiteList.length > 0) {
                        return;
                    }
                }
                else if (!whiteListOperation.has(opType)) {
                    return;
                }
            }
            log$3('operation:', opType || opArray.map(op => op.opType), ctx);
            const opMap = controller.run('getOpMap', ctx);
            controller.run('beforeOperation', ctx);
            let newDocModel;
            if (opArray != null) {
                newDocModel = opArray.reduce((acc, cur) => {
                    const { opType } = cur;
                    if (!opMap.has(opType))
                        throw new Error(`opType:${opType} not exist!`);
                    const opFunc = opMap.get(opType);
                    const opFuncProps = { controller, ...cur, docModel: acc };
                    let res = controller.run('beforeOpFunction', opFuncProps);
                    res = opFunc({ ...opFuncProps, docModel: res });
                    res = controller.run('afterOpFunction', {
                        ...opFuncProps,
                        docModel: res
                    });
                    return res;
                }, docModel);
            }
            else {
                if (!opMap.has(opType))
                    throw new Error(`opType:${opType} not exist!`);
                const opFunc = opMap.get(opType);
                newDocModel = controller.run('beforeOpFunction', ctx);
                newDocModel = opFunc({ ...ctx, docModel: newDocModel });
                newDocModel = controller.run('afterOpFunction', {
                    ...ctx,
                    docModel: newDocModel
                });
            }
            // log(
            //   'newDocModel:',
            //   newDocModel,
            //   newDocModel.currentSheetModel.focusKey,
            //   //TODO currentFocusTopic可能为空
            //   newDocModel.currentSheetModel.currentFocusTopic &&
            //     newDocModel.currentSheetModel.currentFocusTopic.contentData
            // );
            if (controller.run('getAllowUndo', ctx) && newDocModel !== docModel) {
                const { undoStack } = controller.run('getUndoRedoStack', ctx);
                controller.run('setUndoStack', {
                    ...ctx,
                    undoStack: undoStack.push(docModel)
                });
            }
            controller.change(newDocModel, callback ? callback(newDocModel) : null);
            controller.run('afterOperation', ctx);
            // log(controller.model);
        },
        deleteRefKey(ctx) { },
        // 在整个Operation执行之前被调用
        beforeOperation(props) { },
        afterOperation(props) { },
        // 在单个OpFunction执行之前被调用
        beforeOpFunction(ctx) {
            const { docModel } = ctx;
            return docModel;
        },
        afterOpFunction(ctx) {
            return ctx.docModel;
        },
        openNewDocModel(ctx) {
            const { controller, newDocModel } = ctx;
            controller.run('operation', {
                ...ctx,
                opType: core$1.OpType.EXPAND_TO,
                model: newDocModel.currentSheetModel,
                topicKey: newDocModel.currentSheetModel.focusKey,
                docModel: newDocModel,
                callback: docModel => () => {
                    controller.run('moveTopicToCenter', {
                        ...ctx,
                        docModel,
                        topicKey: docModel.currentSheetModel.focusKey
                    });
                }
            });
        }
    };
}

function OptmizationPlugin() {
    return {
        componentAreEqual(ctx) {
            const { prevProps, nextProps } = ctx;
            const { model: nmodel, docModel: ndocModel, topic: ntopic } = nextProps;
            if (ndocModel.currentSheetModel !== nmodel)
                return true;
            const { model, topic, topicKey } = prevProps;
            if (nmodel.config.theme !== model.config.theme)
                return false;
            if (nmodel.focusKey === topicKey || model.focusKey === topicKey)
                return false;
            if (ntopic === topic)
                return true;
            return false;
        },
        sheetAreEqual(ctx) {
            const { nextProps } = ctx;
            const { model: nmodel, docModel: ndocModel } = nextProps;
            if (ndocModel.currentSheetModel !== nmodel)
                return true;
            return false;
        }
    };
}

function PlatformPlugin() {
    let _isOSX;
    return {
        isOSX(ctx) {
            if (_isOSX == null) {
                _isOSX = navigator.userAgent.includes('Mac');
            }
            return _isOSX;
        },
        isCommandOrControl(ctx) {
            const { controller, ev } = ctx;
            const isOSX = controller.run('isOSX', ctx);
            return (isOSX && ev.metaKey) || (!isOSX && ev.ctrlKey);
        }
    };
}

const NodeLayer = styled__default.div `
  position: relative;
  display: flex;
  align-items: center;
  padding: 5px;
  background: ${props => props.theme.background};
`;
const DIV = styled__default.div `
  width: 100%;
  height: 100%;
`;
class MindDragScrollWidget extends React.PureComponent {
    constructor(props) {
        super(props);
        this.setZoomFactor = zoomFactor => {
            this.dragScrollWidget.setZoomFactor(zoomFactor);
        };
        this.onWheel = ev => {
            const { controller } = this.props;
            controller.run('setZoomFactorOnWheel', { ...this.props, ev });
        };
    }
    componentDidMount() {
        const { getRef, docModel, model, controller } = this.props;
        controller.run('addZoomFactorChangeEventListener', {
            ...this.props,
            listener: this.setZoomFactor
        });
        const rootTopic = getRef(topicNodeRefKey(model.editorRootTopicKey));
        //TODO
        const nodeLayer = getRef(RefKey.NODE_LAYER + model.id);
        const rootTopicRect = rootTopic.getBoundingClientRect();
        const nodeLayerRect = nodeLayer.getBoundingClientRect();
        this.dragScrollWidget.setViewBoxScrollDelta(0, rootTopicRect.top -
            nodeLayerRect.top -
            this.dragScrollWidget.viewBox.getBoundingClientRect().height / 2 +
            rootTopicRect.height);
        //为了解决缩放之后切换到其他显示模式, 再次切换回去会错乱
        this.setZoomFactor(controller.run('getZoomFactor', this.props));
        this.layout();
        setTimeout(() => {
            docModel.currentSheetModel === model &&
                controller.run('moveTopicToCenter', {
                    ...this.props,
                    topicKey: model.focusKey
                });
        });
    }
    componentWillUnmount() {
        const { controller } = this.props;
        controller.run('removeZoomFactorChangeEventListener', {
            ...this.props,
            listener: this.setZoomFactor
        });
    }
    get dragScrollWidget() {
        const { getRef, model } = this.props;
        return getRef(RefKey.DRAG_SCROLL_WIDGET_KEY + model.id);
    }
    componentDidUpdate() {
        const { controller } = this.props;
        controller.run('fireEvent', {
            ...this.props,
            key: EventKey.CENTER_ROOT_TOPIC
        });
        this.layout();
    }
    layout() {
        const { controller } = this.props;
        controller.run('layout', this.props);
    }
    render() {
        const { saveRef, model, controller } = this.props;
        const topicKey = model.editorRootTopicKey;
        const topic = model.getTopic(topicKey);
        return (React.createElement(DIV, { onWheel: this.onWheel },
            React.createElement(DragScrollWidget, Object.assign({}, this.state, { enableMouseWheel: false, ref: saveRef(RefKey.DRAG_SCROLL_WIDGET_KEY + model.id) }), (setViewBoxScroll, setViewBoxScrollDelta) => {
                const rootWidgetProps = {
                    ...this.props,
                    topicKey,
                    topic,
                    setViewBoxScroll,
                    setViewBoxScrollDelta
                };
                return (React.createElement(NodeLayer, { ref: saveRef(RefKey.NODE_LAYER + model.id) }, controller.run('renderRootWidget', rootWidgetProps)));
            })));
    }
}

const log$4 = require('debug')('node:mindmap-sheet');
const Container = styled__default.div `
  width: 100%;
  height: 100%;
  overflow: auto;
  flex-grow: 1;
  background: ${props => props.theme.background};
  position: relative;
`;
function MindMapSheet_(props) {
    const { controller, saveRef, model } = props;
    log$4('model', model);
    const [diagramState, setDiagramState_] = React.useState(controller.run('getInitialSheetState', props));
    const setDiagramState = arg => {
        setDiagramState_({ ...diagramState, ...arg });
    };
    const nProps = {
        ...props,
        diagramState,
        setDiagramState
    };
    return (React__default.createElement(Container, { ref: saveRef(RefKey.SHEET_ROOT_KEY + model.id) },
        React__default.createElement(MindDragScrollWidget, Object.assign({}, nProps)),
        controller.run('renderSheetCustomize', nProps)));
}
const MindMapSheet = React__default.memo(MindMapSheet_, (prevProps, nextProps) => {
    const { controller } = prevProps;
    return controller.run('sheetAreEqual', { prevProps, nextProps });
});

const Title$1 = styled__default.span `
  user-select: none;
`;
let SheetTitle = class SheetTitle extends React.Component {
    constructor(props) {
        super(props);
        this.onClickRename = () => {
            this.setState({ showRenameDialog: true });
        };
        this.handleCancelRename = () => {
            this.setState({ showRenameDialog: false });
        };
        this.handleConfirmRename = title => e => {
            this.setState({
                showRenameDialog: false
            });
            const props = this.props;
            const { controller } = props;
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.SET_SHEET_TITLE,
                title
            });
        };
        this.onClickDelete = () => {
            const props = this.props;
            const { controller, docModel } = props;
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.DELETE_SHEET,
                sheetModel: docModel.currentSheetModel
            });
        };
        this.onClickDuplicate = () => {
            const props = this.props;
            const { controller, docModel } = props;
            const title = controller.run('getSheetTitle', props) + getI18nText(props, I18nKey.COPY);
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.DUPLICATE_SHEET,
                sheetModel: docModel.currentSheetModel,
                title
            });
        };
        this.state = {
            showRenameDialog: false
        };
    }
    renderContextMenu() {
        const props = this.props;
        const { docModel, model, controller } = props;
        if (model == null)
            return;
        if (docModel.currentSheetModel !== model) {
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.SET_CURRENT_SHEET,
                sheetModel: model
            });
        }
        return (React.createElement(core.Menu, null,
            React.createElement(core.MenuItem, { onClick: this.onClickRename, text: getI18nText(props, I18nKey.RENAME) }),
            React.createElement(core.Divider, null),
            React.createElement(core.MenuItem, { onClick: this.onClickDuplicate, text: getI18nText(props, I18nKey.DUPLICATE) }),
            React.createElement(core.MenuItem, { onClick: this.onClickDelete, text: getI18nText(props, I18nKey.DELETE) })));
    }
    render() {
        const props = this.props;
        const { controller } = props;
        const title = controller.run('getSheetTitle', props);
        const renameDlgProps = {
            ...props,
            isOpen: this.state.showRenameDialog,
            title,
            handleConfirm: this.handleConfirmRename,
            handleClose: this.handleCancelRename
        };
        return (React.createElement("div", null,
            React.createElement(Title$1, null, title),
            React.createElement(RenameDialog, Object.assign({}, renameDlgProps))));
    }
};
SheetTitle = __decorate([
    core.ContextMenuTarget
], SheetTitle);

const PanelRoot = styled__default(ZIndex) `
  position: absolute;
  background: white;
  right: 30px;
  top: 20px;
  border-radius: 2px;
  user-select: none;
`;
const StyledTabs = styled__default(core.Tabs) `
  padding: 0px 10px;
`;
function RightTopPanelWidget(props) {
    const { controller, zIndex, diagramState, setDiagramState } = props;
    const { rightTopPanel } = diagramState;
    const { isOpen, selectedTabId } = rightTopPanel;
    const setRightTopPanelState = obj => {
        setDiagramState({
            rightTopPanel: { ...rightTopPanel, ...obj }
        });
    };
    if (!isOpen) {
        return (React.createElement(PanelRoot, { zIndex: zIndex },
            React.createElement(IconBg, { onClick: () => {
                    setRightTopPanelState({ isOpen: true });
                } },
                React.createElement(ShowMenuIcon, { className: iconClassName(IconName.SHOW_MENU) }))));
    }
    const handleTabIdChange = tabId => {
        setRightTopPanelState({
            selectedTabId: tabId
        });
    };
    return (React.createElement(PanelRoot, { zIndex: zIndex },
        React.createElement(Title, null,
            React.createElement(CloseIcon, { className: cx('bp3-button', iconClassName(IconName.CLOSE)), onClick: () => {
                    setRightTopPanelState({ isOpen: false });
                } })),
        React.createElement(StyledTabs, { id: "tabs", selectedTabId: selectedTabId, onChange: handleTabIdChange }, controller.run('renderRightTopPanelTabs', props))));
}

const SettingItemSelect$1 = props => (React.createElement(SettingItemSelect, Object.assign({ labelWidth: '45px' }, props)));
const borderWidthItems$1 = [...Array(7).keys()];
const borderRadiusItems = [0, 5, 10, 15, 20, 25, 30, 35];
const borderStyleItems = ['none', 'solid', 'dotted', 'dashed', 'double'];
function BorderStyleEditor(props) {
    const { contentStyle, setContentStyle } = props;
    const handleBorderWidthChange = value => {
        // log('handleBorderWithChange:', value);
        setContentStyle({ borderWidth: `${value}px` });
    };
    const handleBorderStyleChange = value => {
        setContentStyle({ borderStyle: value });
    };
    const handleBorderRadiusChange = value => {
        // log('handleBorderRadiusChange:', value);
        setContentStyle({ borderRadius: `${value}px` });
    };
    const handleBorderColorChange = color => {
        setContentStyle({ borderColor: color });
    };
    return (React.createElement(SettingGroup, null,
        React.createElement(SettingTitle, null, getI18nText(props, I18nKey.BORDER)),
        React.createElement(SettingRow, null,
            React.createElement(SettingItemSelect$1, { title: `${getI18nText(props, I18nKey.WIDTH)}:`, text: contentStyle.borderWidth
                    ? contentStyle.borderWidth
                    : getI18nText(props, I18nKey.DEFAULT), items: borderWidthItems$1, itemRenderer: renderItem('px'), onItemSelect: handleBorderWidthChange }),
            React.createElement(SettingItemSelect$1, { title: `${getI18nText(props, I18nKey.STYLE)}:`, text: contentStyle.borderStyle
                    ? getI18nText(props, contentStyle.borderStyle)
                    : getI18nText(props, I18nKey.NONE), items: borderStyleItems, itemRenderer: renderItemI18n(props), onItemSelect: handleBorderStyleChange }),
            React.createElement(SettingItemSelect$1, { title: `${getI18nText(props, I18nKey.RADIUS)}:`, text: contentStyle.borderRadius, items: borderRadiusItems, itemRenderer: renderItem('px'), onItemSelect: handleBorderRadiusChange }),
            React.createElement(SettingItemColorPicker, { color: contentStyle.borderColor, handleColorChange: handleBorderColorChange }))));
}

function ClearAllCustomStyle(props) {
    const { controller } = props;
    const handleClearAllCustomStyle = e => {
        controller.run('operation', {
            ...props,
            opType: core$1.OpType.CLEAR_ALL_CUSTOM_STYLE
        });
    };
    return (React.createElement(SettingGroup, null,
        React.createElement(SettingItem, null,
            React.createElement(core.Button, { onClick: handleClearAllCustomStyle }, getI18nText(props, I18nKey.CLEAR_ALL_CUSTOM_STYLE)))));
}

const lineTypes = ['curve', 'round', 'line'];
function LinkStyleEditor(props) {
    const { showLinkStyle = true, showSubLinkStyle = true, linkStyle = {}, subLinkStyle = {}, setLinkStyle, setSubLinkStyle } = props;
    const handleLinkWidthChange = value => {
        setLinkStyle({ lineWidth: `${value}px` });
    };
    const handleLinkTypeChange = value => {
        setLinkStyle({ lineType: value });
    };
    const handleLinkColorChange = color => {
        setLinkStyle({ lineColor: color });
    };
    const handleSubLinkWidthChange = value => {
        setSubLinkStyle({ lineWidth: `${value}px` });
    };
    const handleSubLinkTypeChange = value => {
        setSubLinkStyle({ lineType: value });
    };
    const handleSubLinkColorChange = color => {
        setSubLinkStyle({ lineColor: color });
    };
    return (React.createElement(SettingGroup, null,
        React.createElement(SettingTitle, null, getI18nText(props, I18nKey.LINK)),
        showLinkStyle && (React.createElement(SettingRow, { alignItems: "center" },
            React.createElement(SettingRowTitle, null,
                getI18nText(props, I18nKey.LINK_TO_PARENT) + ':',
                ' '),
            React.createElement(SettingItemSelect, { text: `${getI18nText(props, I18nKey.WIDTH)}: ${linkStyle ? linkStyle.lineWidth : '0px'}`, items: borderWidthItems, itemRenderer: renderItem('px'), onItemSelect: handleLinkWidthChange }),
            React.createElement(SettingItemSelect, { text: `${getI18nText(props, I18nKey.LINE_TYPE)}: ${getI18nText(props, linkStyle.lineType)}`, items: lineTypes, itemRenderer: renderItemI18n(props), onItemSelect: handleLinkTypeChange }),
            React.createElement(SettingItemColorPicker, { color: linkStyle.lineColor, handleColorChange: handleLinkColorChange }))),
        showSubLinkStyle && (React.createElement(SettingRow, { alignItems: "center" },
            React.createElement(SettingRowTitle, null, getI18nText(props, I18nKey.SUB_LINKS) + ': '),
            React.createElement(SettingItemSelect, { text: `${getI18nText(props, I18nKey.WIDTH)}: ${subLinkStyle ? subLinkStyle.lineWidth : '0px'}`, items: borderWidthItems, itemRenderer: renderItem('px'), onItemSelect: handleSubLinkWidthChange }),
            React.createElement(SettingItemSelect, { text: `${getI18nText(props, I18nKey.LINE_TYPE)}: ${getI18nText(props, subLinkStyle.lineType)}`, items: lineTypes, itemRenderer: renderItemI18n(props), onItemSelect: handleSubLinkTypeChange }),
            React.createElement(SettingItemColorPicker, { color: subLinkStyle.lineColor, handleColorChange: handleSubLinkColorChange })))));
}

const log$5 = debug('node:style-editor');
let copiedStyle;
function StyleEditor(props) {
    const { controller, model, topicKey } = props;
    const topic = model.getTopic(topicKey);
    const setContentStyle = style => {
        controller.run('setTopicContentStyle', { ...props, style });
    };
    const handleBackgroundColorChange = color => {
        setContentStyle({ background: color });
    };
    const handleClearStyle = () => {
        if (topic.style) {
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.SET_STYLE,
                style: null
            });
        }
    };
    const handleCopyStyle = () => {
        copiedStyle = controller.run('getTopicStyle', props);
        log$5(copiedStyle);
    };
    const handlePasteStyle = () => {
        if (copiedStyle) {
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.SET_STYLE,
                style: JSON.stringify(copiedStyle)
            });
        }
    };
    if (!model.focusKey)
        return null;
    const contentStyle = controller.run('getTopicContentStyle', props);
    const linkStyle = controller.run('getLinkStyle', props);
    const subLinkStyle = controller.run('getSubLinksStyle', props);
    const setLinkStyle = linkStyle => {
        controller.run('setLinkStyle', {
            ...props,
            linkStyle
        });
    };
    const setSubLinkStyle = subLinkStyle => {
        controller.run('setSubLinkStyle', {
            ...props,
            subLinkStyle
        });
    };
    const linkStyleEditorProps = {
        ...props,
        linkStyle,
        subLinkStyle,
        setLinkStyle,
        setSubLinkStyle
    };
    const contentStyleEditorPros = {
        ...props,
        contentStyle,
        setContentStyle
    };
    const viewModeMindMap = model.config.viewMode === core$1.ViewModeMindMap;
    return (React.createElement(PanelTabRoot, null,
        viewModeMindMap ? (React.createElement(BorderStyleEditor, Object.assign({}, contentStyleEditorPros))) : null,
        controller.run('renderTextStyleEditor', contentStyleEditorPros),
        viewModeMindMap ? (React.createElement(SettingGroup, null,
            React.createElement(SettingTitle, null, getI18nText(props, I18nKey.BACKGROUND)),
            React.createElement(SettingItemColorPicker, { color: contentStyle.background, handleColorChange: handleBackgroundColorChange }))) : null,
        viewModeMindMap ? React.createElement(LinkStyleEditor, Object.assign({}, linkStyleEditorProps)) : null,
        React.createElement(SettingGroup, null,
            React.createElement(SettingItemButton, { title: getI18nText(props, I18nKey.CLEAR_TOPIC_STYLE), onClick: handleClearStyle }),
            React.createElement(SettingItemButton, { title: getI18nText(props, I18nKey.COPY_STYLE), onClick: handleCopyStyle }),
            React.createElement(SettingItemButton, { title: getI18nText(props, I18nKey.PASTE_STYLE), onClick: handlePasteStyle })),
        ClearAllCustomStyle(props)));
}

/** Event handler that exposes the target element's value as a boolean. */
function handleBooleanChange(handler) {
    return (event) => handler(event.target.checked);
}

const expand = require('css-shorthand-expand');
function PaddingStyleEditor(props) {
    const { contentStyle, setContentStyle } = props;
    const padding = expand('padding', contentStyle.padding || '0');
    const commonProps = {
        layout: 'v',
        min: 0,
        max: 99,
        style: {
            width: 38
        }
    };
    const top = parseInt(padding['padding-top']);
    const right = parseInt(padding['padding-right']);
    const bottom = parseInt(padding['padding-bottom']);
    const left = parseInt(padding['padding-left']);
    const p = {
        top,
        right,
        bottom,
        left
    };
    const setPadding = dir => v => {
        setContentStyle({ padding: paddingCss({ ...p, [dir]: v }) });
    };
    const topProps = {
        ...commonProps,
        title: getI18nText(props, I18nKey.TOP),
        value: top,
        onValueChange: setPadding('top')
    };
    const rightProps = {
        ...commonProps,
        title: getI18nText(props, I18nKey.RIGHT),
        value: right,
        onValueChange: setPadding('right')
    };
    const bottomProps = {
        ...commonProps,
        title: getI18nText(props, I18nKey.BOTTOM),
        value: bottom,
        onValueChange: setPadding('bottom')
    };
    const leftProps = {
        ...commonProps,
        title: getI18nText(props, I18nKey.LEFT),
        value: left,
        onValueChange: setPadding('left')
    };
    return (React.createElement(SettingGroup, null,
        React.createElement(SettingTitle, null, getI18nText(props, I18nKey.PADDING)),
        React.createElement(SettingRow, null,
            React.createElement(SettingItemNumericInput, Object.assign({}, topProps)),
            React.createElement(SettingItemNumericInput, Object.assign({}, rightProps)),
            React.createElement(SettingItemNumericInput, Object.assign({}, bottomProps)),
            React.createElement(SettingItemNumericInput, Object.assign({}, leftProps)))));
}

const SettingItemSelect$2 = props => (React.createElement(SettingItemSelect, Object.assign({ labelWidth: '80px' }, props)));
function TextStyleEditor(props) {
    const { controller, contentStyle, setContentStyle } = props;
    const handleFontSizeChange = value => {
        // log('handleFontSizeChange:', value);
        setContentStyle({ fontSize: value });
    };
    const handleLineHeightChange = e => {
        // log('handleLineHeightChange:', e.target.value);
        setContentStyle({ lineHeight: e.target.value });
    };
    const handleColorChange = color => {
        setContentStyle({ color });
    };
    const fontF = contentStyle.fontFamily || getI18nText(props, I18nKey.DEFAULT);
    const fontFamilyProps = {
        filterable: true,
        title: getI18nText(props, I18nKey.FONT_FAMILY) + ':',
        text: React.createElement("span", { style: { fontFamily: fontF } }, fontF),
        items: controller.run('getFontList', props),
        itemRenderer: item => {
            const text = React.createElement("span", { style: { fontFamily: item } }, item);
            return (React.createElement(core.MenuItem, { key: item, text: text, onClick: () => {
                    setContentStyle({ fontFamily: item });
                } }));
        },
        itemPredicate: (query, item, _index, exactMatch) => {
            const normalizedTitle = item.toLowerCase();
            const normalizedQuery = query.toLowerCase();
            if (exactMatch) {
                return normalizedTitle === normalizedQuery;
            }
            else {
                return normalizedTitle.indexOf(normalizedQuery) >= 0;
            }
        },
        onItemSelect: item => {
            setContentStyle({ fontFamily: item });
        }
    };
    const fontStyle = contentStyle.fontStyle || 'Normal';
    const fontStyleProps = {
        title: getI18nText(props, I18nKey.FONT_STYLE) + ':',
        text: fontStyle,
        items: ['Normal', 'Italic', 'Oblique'],
        itemRenderer: (v, { handleClick }) => {
            return React.createElement(core.MenuItem, { key: v, text: v, onClick: handleClick });
        },
        onItemSelect: item => {
            setContentStyle({
                fontStyle: item
            });
        }
    };
    const fontWeight = contentStyle.fontWeight || '400';
    const fontWeightItemsMap = new Map([
        ['100', 'Thin'],
        ['200', 'ExtraLight'],
        ['300', 'Light'],
        ['400', 'Normal'],
        ['500', 'Medium'],
        ['600', 'DemiBold'],
        ['700', 'Bold'],
        ['800', 'UltraBold'],
        ['900', 'Heavy']
    ]);
    const fontWeightProps = {
        title: getI18nText(props, I18nKey.FONT_WEIGHT) + ':',
        text: fontWeightItemsMap.get(fontWeight),
        items: Array.from(fontWeightItemsMap.keys()),
        itemRenderer: (v, { handleClick }) => {
            return (React.createElement(core.MenuItem, { key: v, text: fontWeightItemsMap.get(v), onClick: handleClick }));
        },
        onItemSelect: item => {
            setContentStyle({
                fontWeight: item
            });
        }
    };
    const fontSizeNumInputProps = {
        title: `${getI18nText(props, I18nKey.FONT_SIZE)}:`,
        labelWidth: '80px',
        min: 12,
        max: 100,
        value: parseInt(contentStyle.fontSize),
        style: {
            width: 50
        },
        onValueChange: handleFontSizeChange
    };
    const lineHeightInputProps = {
        title: `${getI18nText(props, I18nKey.LINE_HEIGHT)}:`,
        style: {
            width: '50px'
        },
        labelWidth: '80px',
        value: contentStyle.lineHeight || '',
        onChange: handleLineHeightChange
    };
    return (React.createElement(SettingGroup, null,
        React.createElement(SettingTitle, null, getI18nText(props, I18nKey.TEXT_EDITOR)),
        React.createElement(SettingRow, null,
            React.createElement(SettingItemSelect$2, Object.assign({}, fontFamilyProps)),
            React.createElement(SettingItemNumericInput, Object.assign({}, fontSizeNumInputProps))),
        React.createElement(SettingRow, null,
            React.createElement(SettingItemSelect$2, Object.assign({}, fontWeightProps)),
            React.createElement(SettingItemSelect$2, Object.assign({}, fontStyleProps))),
        React.createElement(SettingRow, null,
            React.createElement(SettingItemInput, Object.assign({}, lineHeightInputProps)),
            React.createElement(SettingItemColorPicker, { color: contentStyle.color, handleColorChange: handleColorChange }))));
}

const TopicThemeEditorRoot = styled__default.div `
  height: 250px;
  overflow: auto;
`;
function TopicThemeEditor(props) {
    const { topicStyle, setTopicStyle } = props;
    const { contentStyle = {}, linkStyle = {}, subLinkStyle = {} } = topicStyle;
    const setContentStyle = (contentStyle) => {
        setTopicStyle({ contentStyle });
    };
    const nProps = {
        ...props,
        contentStyle,
        setContentStyle
    };
    const setLinkStyle = (linkStyle) => {
        setTopicStyle({ linkStyle });
    };
    const setSubLinkStyle = (subLinkStyle) => {
        setTopicStyle({ subLinkStyle });
    };
    const linkStyleEditorProps = {
        ...props,
        showLinkStyle: false,
        linkStyle,
        subLinkStyle,
        setLinkStyle,
        setSubLinkStyle
    };
    return (React.createElement(TopicThemeEditorRoot, null,
        React.createElement(BorderStyleEditor, Object.assign({}, nProps)),
        React.createElement(PaddingStyleEditor, Object.assign({}, nProps)),
        React.createElement(TextStyleEditor, Object.assign({}, nProps)),
        React.createElement(SettingGroup, null,
            React.createElement(SettingTitle, null, getI18nText(props, I18nKey.BACKGROUND)),
            React.createElement(SettingItemColorPicker, { color: contentStyle.background, handleColorChange: color => {
                    setContentStyle({ background: color });
                } })),
        React.createElement(LinkStyleEditor, Object.assign({}, linkStyleEditorProps))));
}

const log$6 = debug('node:theme-editor');
let tabId = 'normal';
function ThemeEditor(props) {
    const [alertThemeError, setAlertThemeError] = React.useState(false);
    const { model, controller } = props;
    // 注意这里一定要用cloneDeep
    const theme = lodash.cloneDeep(model.config.theme);
    const { rootTopic, primaryTopic, normalTopic } = controller.run('getThemeOfTopic', { ...props, isClone: true });
    const setTheme = theme => {
        controller.run('operation', {
            ...props,
            opType: core$1.OpType.SET_THEME,
            theme
        });
    };
    const handleBackgroundColorChange = background => {
        setTheme(lodash.merge(theme, { background }));
    };
    const handleHighlightColorChange = highlightColor => {
        setTheme(lodash.merge(theme, { highlightColor }));
    };
    const handleRandomColorChange = handleBooleanChange(randomColor => {
        setTheme(lodash.merge(theme, { randomColor }));
    });
    const setRootTopicStyle = (style) => {
        setTheme(lodash.merge(theme, { rootTopic: style }));
    };
    const setPrimaryTopicStyle = (style) => {
        setTheme(lodash.merge(theme, { primaryTopic: style }));
    };
    const setNormalTopicStyle = (style) => {
        setTheme(lodash.merge(theme, { normalTopic: style }));
    };
    const rootTopicEditorProps = {
        ...props,
        topicStyle: rootTopic,
        setTopicStyle: setRootTopicStyle
    };
    const rootTopicEditor = React.createElement(TopicThemeEditor, Object.assign({}, rootTopicEditorProps));
    const primaryTopicEditorProps = {
        ...props,
        topicStyle: primaryTopic,
        setTopicStyle: setPrimaryTopicStyle
    };
    const primaryTopicEditor = React.createElement(TopicThemeEditor, Object.assign({}, primaryTopicEditorProps));
    const normalTopicEditorProps = {
        ...props,
        topicStyle: normalTopic,
        setTopicStyle: setNormalTopicStyle
    };
    const normalTopicEditor = React.createElement(TopicThemeEditor, Object.assign({}, normalTopicEditorProps));
    const tabsProps = {
        id: tabId,
        handleTabIdChange: id => {
            tabId = id;
        }
    };
    const topicThemes = (React.createElement(SettingBoxContainer, null,
        React.createElement(core.Tabs, Object.assign({}, tabsProps),
            React.createElement(core.Tab, { id: "normal", title: getI18nText(props, I18nKey.NORMAL_TOPIC), panel: normalTopicEditor }),
            React.createElement(core.Tab, { id: "primary", title: getI18nText(props, I18nKey.PRIMARY_TOPIC), panel: primaryTopicEditor }),
            React.createElement(core.Tab, { id: "root", title: getI18nText(props, I18nKey.ROOT_TOPIC), panel: rootTopicEditor }))));
    const handleExportTheme = e => {
        // setShowExportDialog(true);
        const text = JSON.stringify(theme);
        browserDownloadText(text, 'blink-mind-theme.json');
    };
    const handleImportTheme = e => {
        browserOpenFile('.json,.txt').then(txt => {
            const t = JSON.parse(txt);
            if (!core$1.isThemeType(t)) {
                setAlertThemeError(true);
                return;
            }
            setTheme(t);
        });
    };
    const alertProps = {
        ...props,
        isOpen: alertThemeError,
        cancelButtonText: null,
        content: getI18nText(props, I18nKey.FILE_FORMAT_ERROR),
        onClose: e => {
            setAlertThemeError(false);
        }
    };
    const alert = React.createElement(Alert, Object.assign({}, alertProps));
    return (React.createElement(PanelTabRoot, null,
        React.createElement(SettingGroup, null,
            React.createElement(SettingTitle, null, getI18nText(props, I18nKey.GLOBAL)),
            React.createElement(SettingRow, null,
                React.createElement(SettingLabel, null, getI18nText(props, I18nKey.BACKGROUND) + ':'),
                React.createElement(SettingItemColorPicker, { color: theme.background, handleColorChange: handleBackgroundColorChange }),
                React.createElement(SettingLabel, null, getI18nText(props, I18nKey.HIGHLIGHT) + ':'),
                React.createElement(SettingItemColorPicker, { color: theme.highlightColor, handleColorChange: handleHighlightColorChange }),
                React.createElement(SettingLabel, null, getI18nText(props, I18nKey.RANDOM_COLOR) + ':'),
                React.createElement(StyledCheckbox, { checked: theme.randomColor, onChange: handleRandomColorChange }))),
        topicThemes,
        React.createElement(SettingGroup, null,
            React.createElement(SettingItemButton, { title: getI18nText(props, I18nKey.EXPORT_THEME), onClick: handleExportTheme }),
            React.createElement(SettingItemButton, { title: getI18nText(props, I18nKey.IMPORT_THEME), onClick: handleImportTheme })),
        alert));
}

const log$7 = debug('node:view-port-viewer');
const ViewerRoot = styled__default(ZIndex) `
  position: absolute;
  background: white;
  right: 25px;
  bottom: 25px;
  border-radius: 2px;
  display: flex;
  flex-direction: row;
`;
const Item = props => {
    return (React.createElement(core.Tooltip, { content: props.tooltip, position: core.Position.TOP, className: core.Classes.ICON },
        React.createElement("div", { className: "bm-btn", onClick: props.onClick, tabIndex: -1 }, props.children)));
};
class ViewPortViewer extends BaseWidget {
    constructor() {
        super(...arguments);
        this.zoomFactorChange = zoomFactor => {
            log$7('zoomFactorChange', zoomFactor);
            this.setState({ zoomFactor });
        };
        this.onClickResetZoom = e => {
            const props = this.props;
            const { controller } = props;
            controller.run('setZoomFactor', {
                ...props,
                zoomFactor: 1
            });
        };
        this.onClickAddZoom = e => {
            const props = this.props;
            const { controller } = props;
            const zoomFactor = controller.run('getZoomFactor', props);
            controller.run('setZoomFactor', {
                ...props,
                zoomFactor: zoomFactor + 0.1
            });
        };
        this.onClickMinusZoom = e => {
            const props = this.props;
            const { controller } = props;
            const zoomFactor = controller.run('getZoomFactor', props);
            controller.run('setZoomFactor', {
                ...props,
                zoomFactor: zoomFactor - 0.1
            });
        };
        this.onClickCollapseAll = e => {
            const props = this.props;
            const { controller } = props;
            controller.run('addEventListener', {
                ...props,
                key: EventKey.CENTER_ROOT_TOPIC,
                listener: this.centerRootTopic,
                once: true
            });
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.COLLAPSE_ALL
            });
        };
        this.onClickExpandAll = e => {
            const props = this.props;
            const { controller } = props;
            controller.run('addEventListener', {
                ...props,
                key: EventKey.CENTER_ROOT_TOPIC,
                listener: this.centerRootTopic,
                once: true
            });
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.EXPAND_ALL
            });
        };
        this.centerRootTopic = () => {
            const { controller } = this.props;
            const model = controller.model;
            controller.run('moveTopicToCenter', {
                ...this.props,
                topicKey: model.editorRootTopicKey
            });
        };
    }
    componentDidMount() {
        const props = this.props;
        const { controller } = props;
        controller.run('addZoomFactorChangeEventListener', {
            ...props,
            listener: this.zoomFactorChange
        });
    }
    componentWillUnmount() {
        const props = this.props;
        const { controller } = props;
        controller.run('removeZoomFactorChangeEventListener', {
            ...props,
            listener: this.zoomFactorChange
        });
    }
    render() {
        log$7('render');
        const props = this.props;
        const { controller, zIndex, model } = props;
        const zoomFactor = controller.run('getZoomFactor', props);
        return (React.createElement(ViewerRoot, { zIndex: zIndex },
            React.createElement(Item, { onClick: this.onClickCollapseAll, tooltip: getI18nText(props, I18nKey.COLLAPSE_ALL) }, Icon(IconName.COLLAPSE_ALL)),
            React.createElement(Item, { onClick: this.onClickExpandAll, tooltip: getI18nText(props, I18nKey.EXPAND_ALL) }, Icon(IconName.EXPAND_ALL)),
            model.config.viewMode === core$1.ViewModeMindMap ? (React.createElement(Item, { onClick: this.centerRootTopic, tooltip: getI18nText(props, I18nKey.CENTER_ROOT_TOPIC) }, Icon(IconName.CENTER))) : null,
            React.createElement(Item, { onClick: this.onClickMinusZoom, tooltip: getI18nText(props, I18nKey.ZOOM_IN) }, Icon(IconName.MINUS)),
            React.createElement(Item, { onClick: this.onClickResetZoom, tooltip: getI18nText(props, I18nKey.RESET) },
                React.createElement("span", { className: "iconfont" }, `${getI18nText(props, I18nKey.ZOOM)}:${Math.floor(zoomFactor * 100)}%`)),
            React.createElement(Item, { onClick: this.onClickAddZoom, tooltip: getI18nText(props, I18nKey.ZOOM_OUT) }, Icon(IconName.PLUS))));
    }
}

//TODO 是否需要themeProvider
function Theme({ theme, children }) {
    return (
    //@ts-ignore
    React.createElement(styled.ThemeProvider, { theme: theme },
        React.createElement(React.Fragment, null, children)));
}

const Root = styled__default.div `
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;
const TabsContainer = styled__default.div `
  width: 100%;
  //height: 100%;
  //overflow: auto;
  flex-grow: 1;
  background: ${props => props.theme.background};
  position: relative;
`;
function DiagramRoot(props) {
    const { controller, docModel } = props;
    const onClickAddSheet = () => {
        controller.run('operation', {
            ...props,
            opType: core$1.OpType.ADD_SHEET,
            sheetModel: controller.run('createNewSheetModel', props)
        });
    };
    const onSelect = (index, lastIndex, e) => {
        if (index !== lastIndex && index !== docModel.sheetModels.size) {
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.SET_CURRENT_SHEET,
                sheetModel: docModel.sheetModels.get(index),
                callback: docModel => () => {
                    controller.run('moveTopicToCenter', props);
                }
            });
        }
    };
    const onCopy = ev => {
        controller.run('handleCopy', { ...props, ev });
    };
    const model = docModel.currentSheetModel;
    const sheetModels = docModel.sheetModels.toArray();
    let i = 0;
    const tabClassName = 'react-tabs__tab';
    const tabProps = {
        className: tabClassName,
        tabIndex: '-1'
    };
    const tabs = sheetModels.map(model => {
        const index = i++;
        const nProps = { ...props, model, index };
        return (React.createElement(reactTabs.Tab, Object.assign({ key: index }, tabProps),
            React.createElement(SheetTitle, Object.assign({}, nProps))));
    });
    tabs.push(React.createElement(reactTabs.Tab, Object.assign({ key: i++ }, tabProps),
        React.createElement(core.Icon, { onClick: onClickAddSheet, icon: icons$1.IconNames.PLUS })));
    i = 0;
    // const tabPanelProps = {
    //   className: 'tab-panel react-tabs__tab-panel'
    // };
    const tabPanelProps = {
        className: 'tab-panel',
        selectedClassName: 'tab-panel__selected'
    };
    const tabPanels = sheetModels.map(model => {
        return (React.createElement(reactTabs.TabPanel, Object.assign({ key: i++ }, tabPanelProps),
            React.createElement(Theme, { theme: model.config.theme }, controller.run('renderSheet', {
                ...props,
                model
            }))));
    });
    tabPanels.push(React.createElement(reactTabs.TabPanel, Object.assign({ key: i++ }, tabPanelProps)));
    const tabsProps = {
        className: 'bm-sheet-tabs react-tabs react-tabs__tabs',
        selectedIndex: docModel.currentSheetIndex,
        forceRenderTabPanel: true,
        onSelect
    };
    const child = (React.createElement(TabsContainer, null,
        React.createElement(reactTabs.Tabs, Object.assign({}, tabsProps),
            tabPanels,
            React.createElement(reactTabs.TabList, { className: "tab-list" }, tabs))));
    return (React.createElement(Root, { onCopy: onCopy },
        controller.run('renderToolbar', { ...props, model }),
        controller.run('renderDiagramCustomize', props),
        child));
}

function DialogWidget(props) {
    const { dialogContent, dialogProps } = props;
    const _dialogProps = {
        isOpen: dialogContent != null,
        autoFocus: true,
        enforceFocus: true,
        usePortal: true,
        ...dialogProps
    };
    return (React.createElement(core.Dialog, Object.assign({}, _dialogProps),
        React.createElement("div", { className: core.Classes.DIALOG_BODY, style: { minHeight: 0 } }, dialogContent)));
}

const EditorRootBreadcrumbsRoot = styled__default(ZIndex) `
  position: absolute;
  width: 20%;
  padding: 0 5px;
  background: white;
  left: 20px;
  top: 20px;
  border-radius: 2px;
`;
const TooltipContent = styled__default.div `
  max-width: 600px;
`;
const BreadcrumbTitle = styled__default.span ``;
class EditorRootBreadcrumbs extends BaseWidget {
    constructor(props) {
        super(props);
        this.setEditorRootTopicKey = topicKey => () => {
            const { model, controller } = this.props;
            if (model.editorRootTopicKey !== topicKey) {
                controller.run('operation', {
                    ...this.props,
                    opType: core$1.OpType.SET_EDITOR_ROOT,
                    topicKey
                });
            }
        };
        this.breadcrumbRenderer = props => {
            const { text, ...breadProps } = props;
            const needTooltip = text.length > 8;
            const title = needTooltip ? text.substr(0, 8) + '...' : text;
            //TODO
            const content = React.createElement(TooltipContent, null, text);
            const tooltipProps = {
                content,
                position: core.PopoverPosition.BOTTOM_RIGHT
            };
            const breadcrumb = (React.createElement(core.Breadcrumb, Object.assign({}, breadProps),
                React.createElement(BreadcrumbTitle, null, title)));
            return needTooltip ? (React.createElement(core.Tooltip, Object.assign({}, tooltipProps), breadcrumb)) : (breadcrumb);
        };
    }
    render() {
        const props = this.props;
        const { model, controller, zIndex } = props;
        const editingRootKey = model.editorRootTopicKey;
        if (editingRootKey === model.rootTopicKey)
            return null;
        const items = [];
        let topic = model.getTopic(editingRootKey);
        while (topic != null) {
            const title = controller.getValue(PropKey.TOPIC_TITLE, {
                ...props,
                topicKey: topic.key
            });
            items.unshift({
                text: title,
                onClick: this.setEditorRootTopicKey(topic.key)
            });
            topic = model.getTopic(topic.parentKey);
        }
        const breadcrumbProps = {
            items,
            breadcrumbRenderer: this.breadcrumbRenderer
        };
        return (React.createElement(EditorRootBreadcrumbsRoot, { zIndex: zIndex },
            React.createElement(core.Breadcrumbs, Object.assign({}, breadcrumbProps))));
    }
}

const RootLinksSvg = styled__default.svg `
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  pointer-events: none;
`;
const log$8 = debug('node:root-sub-links');
class RootSubLinks extends BaseWidget {
    constructor() {
        super(...arguments);
        this.state = {
            curves: []
        };
    }
    layout() {
        const props = this.props;
        const { model, getRef, topicKey, zoomFactor, controller } = props;
        const topic = model.getTopic(topicKey);
        const content = getRef(contentRefKey(topicKey));
        const svg = getRef(linksSvgRefKey(topicKey));
        const bigView = getRef(RefKey.DRAG_SCROLL_WIDGET_KEY + model.id).bigView;
        const contentRect = getRelativeRect(content, bigView, zoomFactor);
        const svgRect = getRelativeRect(svg, bigView, zoomFactor);
        let p1, p2;
        p1 = {
            x: centerX(contentRect) - svgRect.left,
            y: centerY(contentRect) - svgRect.top
        };
        const curves = [];
        topic.subKeys.forEach(key => {
            const linkStyle = controller.run('getLinkStyle', {
                ...props,
                topicKey: key
            });
            const lineType = linkStyle.lineType;
            const subTopicContent = getRef(contentRefKey(key));
            const rect = getRelativeRect(subTopicContent, bigView, zoomFactor);
            if (rect.left > contentRect.right) {
                p2 = {
                    x: rect.left,
                    y: centerY(rect)
                };
            }
            else {
                p2 = {
                    x: rect.right,
                    y: centerY(rect)
                };
            }
            p2 = { x: p2.x - svgRect.left, y: p2.y - svgRect.top };
            let curve;
            if (lineType === 'curve') {
                curve = `M ${p1.x} ${p1.y} C ${p1.x} ${centerPointY(p1, p2)} ${centerPointX(p1, p2)} ${p2.y} ${p2.x} ${p2.y}`;
            }
            else if (lineType === 'line') {
                curve = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
            }
            else if (lineType === 'round') {
                const vDir = p2.y > p1.y ? 1 : -1;
                const hDir = p2.x > p1.x ? 1 : -1;
                const radius = linkStyle.lineRadius;
                if (radius == null) {
                    throw new Error('link line type is round, but lineRadius is not provided!');
                }
                if (p2.y === p1.y) {
                    curve = `M ${p1.x} ${p1.y} H ${p2.x}`;
                }
                else {
                    // 0 表示逆时针 1 表示顺时针
                    curve = `M ${p1.x} ${p1.y}  V ${p2.y -
                        vDir * radius} A ${radius} ${radius} 0 0 ${vDir * hDir === 1 ? 0 : 1} ${p1.x + radius * hDir} ${p2.y} H ${p2.x}`;
                }
            }
            curves.push(React.createElement("path", { key: `link-${key}`, d: curve, strokeWidth: linkStyle.lineWidth, stroke: linkStyle.lineColor, fill: "none" }));
        });
        this.setState({
            curves
        });
    }
    render() {
        log$8('render');
        const { topicKey, saveRef } = this.props;
        return (React.createElement(RootLinksSvg, { ref: saveRef(linksSvgRefKey(topicKey)) },
            React.createElement("g", null, this.state.curves)));
    }
}

const log$9 = debug('RootNode');
const LayerPart = styled__default.div `
  display: flex;
  position: relative;

  align-items: ${props => 
//@ts-ignore
props.topicDirection === core$1.TopicDirection.LEFT ? 'flex-end' : 'flex-start'};
  flex-direction: column;

  padding: ${props => 
//@ts-ignore
props.topicDirection === core$1.TopicDirection.LEFT
    ? '15px 60px 15px 0px'
    : '15px 0px 15px 60px'};
`;
const Topic = styled__default.div `
  display: flex;
  position: relative;
  align-items: center;
  z-index: 3;
`;
class RootWidget extends React.Component {
    renderPartTopics(topics, dir) {
        const { controller, saveRef } = this.props;
        const res = controller.run('createSubTopics', {
            ...this.props,
            dir,
            isRoot: true,
            topics
        });
        if (!res)
            return null;
        const { subTopics } = res;
        const cxName = `bm-layer-${dir === core$1.TopicDirection.LEFT ? 'left' : 'right'}`;
        return (
        //@ts-ignore
        React.createElement(LayerPart, { topicDirection: dir, ref: saveRef(cxName) }, subTopics));
    }
    render() {
        log$9('render');
        const props = this.props;
        const { model, topicKey, saveRef, controller } = props;
        const topicStyle = controller.run('getTopicContentStyle', props);
        const config = model.config;
        const topicContent = controller.run('renderTopicNode', {
            ...props,
            topicStyle,
            dir: core$1.TopicDirection.MAIN
        });
        const partTopics = controller.run('getPartTopics', {
            layout: config.layoutDir,
            model,
            topicKey
        });
        const rootTopic = (React.createElement(Topic, { ref: saveRef(topicNodeRefKey(topicKey)) }, topicContent));
        const children = controller.run('renderRootWidgetOtherChildren', props);
        switch (config.layoutDir) {
            case core$1.DiagramLayoutType.LEFT_AND_RIGHT:
                return (React.createElement(React.Fragment, null,
                    this.renderPartTopics(partTopics.L, 'L'),
                    rootTopic,
                    this.renderPartTopics(partTopics.R, 'R'),
                    children));
            case core$1.DiagramLayoutType.LEFT_TO_RIGHT:
                return (React.createElement(React.Fragment, null,
                    rootTopic,
                    this.renderPartTopics(partTopics.R, 'R'),
                    children));
            case core$1.DiagramLayoutType.RIGHT_TO_LEFT:
                return (React.createElement(React.Fragment, null,
                    this.renderPartTopics(partTopics.L, 'L'),
                    rootTopic,
                    children));
            case core$1.DiagramLayoutType.TOP_TO_BOTTOM:
                return (React.createElement(React.Fragment, null,
                    rootTopic,
                    this.renderPartTopics(partTopics.B, 'B'),
                    children));
        }
        return null;
    }
}

const Icon$1 = styled__default.div `
  position: absolute;
  top: ${props => props.hasUnderline ? 'calc(100% - 8px)' : 'calc(50% - 8px)'};
  ${({ dir }) => {
    if (dir === core$1.TopicDirection.RIGHT)
        return styled.css `
        right: -25px;
      `;
    if (dir === core$1.TopicDirection.LEFT)
        return styled.css `
        left: -25px;
      `;
}};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  //@ts-ignore
  //background: ${props => props.background};
  background: #fff;
  color: #888;
  cursor: pointer;
  padding: 0;
  //font-size: 16px !important;
  line-height: 16px;
  border: 0;
  z-index: 2;
  
  &:before {
    transform: scale(0.8, 0.8);
  }
`;
function TopicCollapseIcon(props) {
    const { topic, topicKey, dir, saveRef, onClickCollapse, linkStyle } = props;
    const hasUnderline = linkStyle.hasUnderline;
    return topic.subKeys.size > 0 ? (React__default.createElement(Icon$1, { ref: saveRef(collapseRefKey(topicKey)), onClick: onClickCollapse, 
        // background={topicStyle.background}
        dir: dir, hasUnderline: hasUnderline, className: iconClassName(topic.collapse ? 'plus' : 'minus') })) : null;
}

function useClickOutside(callback) {
    const container = React.useRef(null);
    const [isTouchEvent, setTouchEvent] = React.useState(false);
    const eventType = isTouchEvent ? 'touchend' : 'click';
    function handleEvent(e) {
        if (e.type === 'click' && isTouchEvent) {
            return;
        } // prettier-ignore
        if (container.current && e.target !== null) {
            if (!container.current.contains(e.target)) {
                callback(e);
            }
        }
    }
    React.useEffect(() => {
        document.addEventListener(eventType, handleEvent, true);
        return () => {
            document.removeEventListener(eventType, handleEvent, true);
        };
    });
    React.useEffect(() => {
        setTouchEvent('ontouchstart' in document.documentElement);
    }, []);
    return container;
}

const useEventListener = (eventName, handler, element = global) => {
  const savedHandler = React.useRef();

  React.useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  React.useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = event => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
};

const EditingRoot = styled__default.div `
  position: relative;
  padding: 5px;
`;
const cancelEvent = e => {
    e.preventDefault();
    e.stopPropagation();
};
// 包裹一层，处理drag事件
function TopicBlockContent(props) {
    const { controller, model, topic, topicKey } = props;
    const readOnly = model.editingContentKey !== topicKey;
    const ref = useClickOutside(() => {
        if (!readOnly) {
            // console.log('onClickOutSide');
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.SET_FOCUS_MODE,
                focusMode: core$1.FocusMode.NORMAL
            });
        }
    });
    const handleKeyDown = e => {
        switch (e.keyCode) {
            case tsKeycodeEnum.Key.Enter:
                if (!e.shiftKey) {
                    controller.run('operation', {
                        ...props,
                        opType: core$1.OpType.FOCUS_TOPIC,
                        focusMode: core$1.FocusMode.NORMAL
                    });
                    e.nativeEvent.stopImmediatePropagation();
                    return true;
                }
                break;
        }
        return false;
    };
    const editor = controller.run('renderTopicContentEditor', {
        ...props,
        readOnly,
        handleKeyDown
    });
    return (React__default.createElement(EditingRoot, { ref: ref, onDragEnter: cancelEvent, onDragOver: cancelEvent }, editor));
}

const log$a = debug('node:popup');
const Popup = styled__default.div `
  padding: 5px;
  //position: absolute;
  //left: 0;
  //top: 0;
`;

class TopicContextMenu extends BaseWidget {
    render() {
        const { controller } = this.props;
        return (React.createElement(core.Menu, null, controller.run('customizeTopicContextMenu', this.props)));
    }
}

const log$b = require('debug')('node:topic-desc');
function TopicDesc(props) {
    const { controller, model, topicKey } = props;
    const isEditing = model.editingDescKey === topicKey;
    log$b('isEditing', isEditing);
    const onClick = e => {
        e.stopPropagation();
        controller.run('operation', {
            ...props,
            opType: core$1.OpType.START_EDITING_DESC
        });
    };
    return (React.createElement(TopicBlockIcon, { onClick: onClick, className: iconClassName(IconName.NOTES), tabIndex: -1 }));
}

const log$c = debug('node:topic-drop-effect');
const DropEffectSvg = styled__default.svg `
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  pointer-events: none;
`;
class TopicDropEffect extends BaseWidget {
    constructor() {
        super(...arguments);
        this.state = {
            content: null
        };
    }
    layout() {
        const props = this.props;
        const { getRef, model, zoomFactor, diagramState } = props;
        const dragDrop = diagramState.dragDrop;
        if (dragDrop == null) {
            this.setState({
                content: null
            });
            return;
        }
        const { targetKey, targetDir } = dragDrop;
        log$c('layout', targetDir);
        if (targetKey == null) {
            this.setState({
                content: null
            });
            return;
        }
        let refKey;
        if (targetDir === 'in') {
            refKey = contentRefKey(targetKey);
        }
        else {
            refKey = dropAreaRefKey(targetKey, targetDir);
        }
        const content = getRef(refKey);
        const svg = getRef(RefKey.SVG_DROP_EFFECT_KEY + model.id);
        const bigView = getRef(RefKey.DRAG_SCROLL_WIDGET_KEY + model.id).bigView;
        const contentRect = getRelativeRect(content, bigView, zoomFactor);
        const svgRect = getRelativeRect(svg, bigView, zoomFactor);
        const padding = 3;
        const x = contentRect.left - svgRect.left - padding;
        const y = contentRect.top - svgRect.top - padding;
        const width = contentRect.width + 2 * padding;
        const height = contentRect.height + 2 * padding;
        this.setState({
            content: (React.createElement("g", null,
                React.createElement("rect", { x: x, y: y, width: width, height: height, fill: "none", stroke: model.config.theme.highlightColor, strokeDasharray: "5,5", strokeWidth: 2 })))
        });
    }
    render() {
        const { saveRef, model } = this.props;
        return (React.createElement(DropEffectSvg, { ref: saveRef(RefKey.SVG_DROP_EFFECT_KEY + model.id) }, this.state.content));
    }
}

const FocusHighlightSvg = styled__default.svg `
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  pointer-events: none;
`;

const log$d = debug('node:topic-node-widget');
const TopicNodeRow = styled__default.div `
  display: flex;
  align-items: center;
  //overflow: hidden;
  position: relative;
`;
const TopicNodeRoot = styled__default.div `
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
`;
const Column = styled__default.div `
  position: relative;
`;
const NodeRows = styled__default.div `
  display: flex;
  flex-direction: column;
  outline-offset: 2px;
  outline: ${props => props.isFocus && `solid 2px ${props.theme.highlightColor}`};
  &:hover {
    outline: ${props => !props.isFocus && `solid 2px  ${props.outlineColor}`};
  }
`;
let TopicNodeWidget = class TopicNodeWidget extends BaseWidget {
    constructor(props) {
        super(props);
        this.onMouseDown = ev => {
            ev.stopPropagation();
        };
        this.onDragStart = ev => {
            log$d('onDragStart');
            this.run('handleTopicDragStart', { ...this.props, ev });
        };
        this.onDragOver = ev => {
            // log('onDragOver');
            ev.preventDefault();
        };
        this.onDragEnter = ev => {
            log$d('onDragEnter', this.props.topicKey);
            this.run('handleTopicDragEnter', { ...this.props, ev, dropDir: 'in' });
        };
        this.onDragLeave = ev => {
            this.run('handleTopicDragLeave', { ...this.props, ev, dropDir: 'in' });
        };
        this.onDrop = ev => {
            log$d('onDrop');
            this.run('handleTopicDrop', { ...this.props, ev, dropDir: 'in' });
        };
        this.onPaste = ev => {
            log$d('onPaste');
            this.run('handleTopicPaste', { ...this.props, ev });
        };
        this.onClick = ev => {
            const props = this.props;
            const { controller } = props;
            //TODO bug [Violation] 'setTimeout' handler took 69ms
            this.handleTopicClickTimeout = setTimeout(() => {
                // log('handleTopicClick');
                //注意这里要传递this.props, 而不是props, 因为会先调用onClick, 再调用其他的topic-content-editor的onClickOutside
                //其他组件的onClickOutside是个同步的函数,会设置新的model, 如果这里用props传参,会导致model 还是老的model
                controller.run('handleTopicClick', { ...this.props, ev });
            }, 50);
        };
        this.onDoubleClick = ev => {
            clearTimeout(this.handleTopicClickTimeout);
            const { controller } = this.props;
            controller.run('handleTopicDoubleClick', { ...this.props, ev });
        };
        this.needRelocation = false;
        this.onClickCollapse = e => {
            e.stopPropagation();
            const { topicKey, getRef } = this.props;
            this.needRelocation = true;
            const collapseIcon = getRef(collapseRefKey(topicKey));
            const rect = collapseIcon.getBoundingClientRect();
            log$d('oldRect', rect);
            this.oldCollapseIconVector = [
                rect.left + rect.width / 2,
                rect.top + rect.height / 2
            ];
            log$d('oldCollapseIconVector', this.oldCollapseIconVector);
            // this.oldCollapseIconVector = controller.run('getRelativeVectorFromViewPort', {
            //   ...this.props,
            //   element: collapseIcon
            // });
            this.operation(core$1.OpType.TOGGLE_COLLAPSE, this.props);
        };
        this.state = {
            dragEnter: false
        };
    }
    renderContextMenu() {
        const { controller } = this.props;
        if (!controller.getValue(PropKey.TOPIC_CONTEXT_MENU_ENABLED, {
            ...this.props
        })) {
            return;
        }
        this.operation(core$1.OpType.FOCUS_TOPIC, {
            ...this.props,
            focusMode: core$1.FocusMode.SHOW_POPUP
        });
        return controller.run('renderTopicContextMenu', this.props);
    }
    onContextMenuClose() {
        // Optional method called once the context menu is closed.
    }
    componentDidUpdate() {
        if (this.needRelocation) {
            const { getRef, topicKey, setViewBoxScrollDelta } = this.props;
            const newIcon = getRef(collapseRefKey(topicKey));
            const newRect = newIcon.getBoundingClientRect();
            // const newVector = controller.run('getRelativeVectorFromViewPort', {
            //   ...this.props,
            //   element: getRef(collapseRefKey(topicKey))
            // });
            const newVector = [
                newRect.left + newRect.width / 2,
                newRect.top + newRect.height / 2
            ];
            log$d('newVector:', newVector);
            log$d('oldVector:', this.oldCollapseIconVector);
            //TODO bug
            const vector = [
                newVector[0] - this.oldCollapseIconVector[0],
                newVector[1] - this.oldCollapseIconVector[1]
            ];
            log$d('vector', vector);
            setViewBoxScrollDelta(vector[0], vector[1]);
            this.needRelocation = false;
        }
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const { controller } = this.props;
        return !controller.run('componentAreEqual', {
            ...this.props,
            prevProps: this.props,
            nextProps
        });
    }
    render() {
        const props = this.props;
        const { saveRef, getRef, topicKey, model, controller, topicStyle, dir } = props;
        log$d('render', topicKey, model.focusMode, getRef(topicNodeRefKey(topicKey)));
        const draggable = controller.run('isOperationEnabled', props) &&
            model.editingContentKey !== topicKey;
        const collapseIcon = controller.run('renderTopicCollapseIcon', {
            ...props,
            onClickCollapse: this.onClickCollapse.bind(this)
        });
        const prevDropArea = controller.run('renderTopicDropArea', {
            ...props,
            dropDir: 'prev'
        });
        const nextDropArea = controller.run('renderTopicDropArea', {
            ...props,
            dropDir: 'next'
        });
        const outlineColor = setColorAlphaPercent(model.config.theme.highlightColor, 0.6);
        const nodeProps = {
            isFocus: topicKey === model.focusKey,
            outlineColor,
            style: topicStyle,
            draggable,
            ref: saveRef(contentRefKey(topicKey)),
            onDragStart: this.onDragStart,
            onClick: this.onClick,
            onDoubleClick: this.onDoubleClick,
            onMouseDown: this.onMouseDown,
            onDragEnter: this.onDragEnter,
            onDragLeave: this.onDragLeave,
            onDragOver: this.onDragOver,
            onDrop: this.onDrop,
            onPaste: this.onPaste
        };
        // log(topicKey, 'style', topicStyle);
        return (React.createElement(TopicNodeRoot, { ref: saveRef(topicNodeRefKey(topicKey)) },
            prevDropArea,
            React.createElement(Column, null,
                React.createElement(NodeRows, Object.assign({}, nodeProps), controller.run('renderTopicNodeRows', props)),
                dir !== core$1.TopicDirection.MAIN && collapseIcon),
            nextDropArea));
    }
};
TopicNodeWidget = __decorate([
    core.ContextMenuTarget
], TopicNodeWidget);
function TopicNodeLastRow(props) {
    const { controller } = props;
    const ref = React.useRef();
    const addRowClickHandler = handler => {
        const rowDiv = ref.current;
        rowDiv.addEventListener('click', handler);
        return () => {
            rowDiv.removeEventListener('click', handler);
        };
    };
    const nProps = {
        ...props,
        addRowClickHandler
    };
    return (React.createElement(TopicNodeRow, { ref: ref },
        controller.run('renderTopicBlocks', nProps),
        controller.run('renderTopicNodeLastRowOthers', nProps)));
}

const MenuItem = styled__default.li `
  list-style: none;
  padding: 3px 12px;
  font-size: 14px;
  line-height: 18px;
  cursor: pointer;
  &:hover {
    background: darkgray;
  }
`;
const MenuItemLabel = styled__default.span `
  margin-left: 8px;
`;

const TopicLinksSvg = styled__default.svg `
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  pointer-events: none;
`;
const log$e = debug('node:topic-sub-links');
class TopicSubLinks extends BaseWidget {
    constructor() {
        super(...arguments);
        this.state = {
            curves: []
        };
    }
    layout() {
        const props = this.props;
        const { model, topic, getRef, topicKey, dir, controller } = props;
        const z = controller.run('getZoomFactor', props);
        const content = getRef(contentRefKey(topicKey));
        const svg = getRef(linksSvgRefKey(topicKey));
        const collapseIcon = getRef(collapseRefKey(topicKey));
        const bigView = getRef(RefKey.DRAG_SCROLL_WIDGET_KEY + model.id).bigView;
        const svgRect = getRelativeRect(svg, bigView, z);
        const collapseRect = getRelativeRect(collapseIcon, bigView, z);
        const contentRect = getRelativeRect(content, bigView, z);
        const mLinkStyle = controller.run('getLinkStyle', props);
        log$e(topicKey);
        log$e('svgRect', svgRect);
        log$e('collapseRect', collapseRect);
        log$e('contentRect', contentRect);
        let p1, p2, p3, p4;
        // p2 折叠icon 右侧10个像素
        const marginCollapseIcon = 10;
        let y = (mLinkStyle.hasUnderline ? contentRect.bottom : centerY(contentRect)) -
            svgRect.top;
        if (dir === core$1.TopicDirection.RIGHT) {
            p1 = {
                x: 0,
                y
            };
            p2 = {
                x: collapseRect.right - svgRect.left + marginCollapseIcon,
                y
            };
        }
        else if (dir === core$1.TopicDirection.LEFT) {
            p1 = {
                x: svgRect.right - svgRect.left,
                y
            };
            p2 = {
                x: collapseRect.left - svgRect.left - marginCollapseIcon,
                y
            };
        }
        const curves = [];
        topic.subKeys.forEach(key => {
            let curve;
            const linkStyle = controller.run('getLinkStyle', {
                ...props,
                topicKey: key
            });
            // log(key);
            const subContent = getRef(contentRefKey(key));
            if (!subContent)
                return;
            const rect = getRelativeRect(subContent, bigView, z);
            y = (linkStyle.hasUnderline ? rect.bottom : centerY(rect)) - svgRect.top;
            const x = (dir === core$1.TopicDirection.RIGHT ? rect.left : rect.right) - svgRect.left;
            p3 = { x, y };
            p4 = linkStyle.hasUnderline
                ? {
                    x: (dir === core$1.TopicDirection.RIGHT ? rect.right : rect.left) -
                        svgRect.left +
                        (dir === core$1.TopicDirection.RIGHT ? 1 : -1),
                    y: p3.y
                }
                : p3;
            const { lineType } = linkStyle;
            if (lineType === 'curve') {
                curve = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} C ${p2.x} ${centerPointY(p2, p3)} ${centerPointX(p2, p3)} ${p3.y} ${p3.x} ${p3.y}`;
            }
            else if (lineType === 'round') {
                const vDir = p3.y > p1.y ? 1 : -1;
                const hDir = p3.x > p1.x ? 1 : -1;
                const radius = linkStyle.lineRadius;
                // if (p3.y === p1.y) { //这样判断不可靠
                if ((!linkStyle.hasUnderline && topic.subKeys.size === 1) ||
                    Math.abs(p3.y - p1.y) <= 1) {
                    curve = `M ${p1.x} ${p1.y} L ${p3.x} ${p3.y}`;
                }
                else {
                    // 0 表示逆时针 1 表示顺时针
                    curve = `M ${p1.x} ${p1.y} H ${p2.x} V ${p3.y -
                        vDir * radius} A ${radius} ${radius} 0 0 ${vDir * hDir === 1 ? 0 : 1} ${p2.x + radius * hDir} ${p3.y} H ${p3.x}`;
                }
            }
            else if (lineType === 'line') {
                curve = `M ${p1.x} ${p1.y} H ${p2.x} L ${p3.x} ${p3.y}`;
            }
            curve = `${curve} L ${p4.x} ${p4.y}`;
            curves.push(React__default.createElement("path", { key: `link-${key}`, d: curve, strokeWidth: linkStyle.lineWidth, stroke: linkStyle.lineColor, fill: "none" }));
        });
        this.setState({
            curves
        });
    }
    render() {
        const { topicKey, saveRef } = this.props;
        return (React__default.createElement(TopicLinksSvg, { ref: saveRef(linksSvgRefKey(topicKey)) },
            React__default.createElement("g", null, this.state.curves)));
    }
}

const log$f = debug('node:topic-widget');
const TopicWidgetRoot = styled__default.div `
  display: flex;
  align-items: stretch;
  flex-direction: ${props => props.topicDirection === core$1.TopicDirection.RIGHT ? 'row' : 'row-reverse'};
`;
// TODO
const NodeChildren = styled__default.div `
  position: relative;
  padding: ${props => props.dir === core$1.TopicDirection.RIGHT
    ? `0 0 0 ${props.marginH}px`
    : `0 ${props.marginH}px 0 0`};
`;
const SubNodes = styled__default.div `
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
`;
class TopicWidget extends React.Component {
    renderSubTopics(props) {
        const { controller, model, topicKey, dir } = props;
        const topics = model.getTopic(topicKey).subKeys.toArray();
        const res = controller.run('createSubTopics', { ...props, topics });
        if (!res)
            return null;
        const { subTopics } = res;
        const subLinks = controller.run('renderSubLinks', props);
        return (React.createElement(NodeChildren, { dir: dir, marginH: model.config.theme.marginH },
            React.createElement(SubNodes, null, subTopics),
            subLinks));
    }
    // componentDidUpdate(): void {
    //   this.layoutLinks();
    // }
    //
    // componentDidMount(): void {
    //   this.layoutLinks();
    // }
    layoutLinks() {
        const { getRef, topicKey, model } = this.props;
        const topic = model.getTopic(topicKey);
        if (topic.subKeys.size === 0 || topic.collapse)
            return;
        log$f('layoutLinks', topicKey);
        const links = getRef(linksRefKey(topicKey));
        links && links.layout();
    }
    render() {
        const props = this.props;
        const { controller, topic, topicKey, dir, saveRef } = props;
        log$f('render', topicKey);
        const topicStyle = controller.run('getTopicContentStyle', props);
        const linkStyle = controller.run('getLinkStyle', props);
        const propsMore = {
            ...props,
            topic,
            topicStyle,
            linkStyle
        };
        const topicNode = controller.run('renderTopicNode', propsMore);
        return (React.createElement(TopicWidgetRoot, { topicDirection: dir, ref: saveRef(topicWidgetRootRefKey(topicKey)) },
            topicNode,
            this.renderSubTopics(propsMore)));
    }
}

const items = [
    {
        icon: 'edit',
        label: I18nKey.EDIT,
        shortcut: ['Space'],
        rootCanUse: true,
        opType: core$1.OpType.START_EDITING_CONTENT,
        viewMode: [core$1.ViewModeMindMap]
    },
    {
        icon: 'add-sibling',
        label: I18nKey.ADD_SIBLING,
        shortcut: ['Enter'],
        opType: core$1.OpType.ADD_SIBLING,
        viewMode: [core$1.ViewModeMindMap]
    },
    {
        icon: 'add-child',
        label: I18nKey.ADD_CHILD,
        shortcut: ['Tab'],
        rootCanUse: true,
        opType: core$1.OpType.ADD_CHILD,
        viewMode: [core$1.ViewModeMindMap]
    },
    {
        icon: 'move-up',
        label: I18nKey.MOVE_UP,
        shortcut: ['Mod', 'Up'],
        rootCanUse: false,
        opType: core$1.OpType.SWAP_UP
    },
    {
        icon: 'move-down',
        label: I18nKey.MOVE_DOWN,
        shortcut: ['Mod', 'Down'],
        rootCanUse: false,
        opType: core$1.OpType.SWAP_DOWN
    },
    {
        icon: 'notes',
        label: I18nKey.EDIT_NOTES,
        shortcut: ['Alt', 'D'],
        rootCanUse: true,
        opType: core$1.OpType.START_EDITING_DESC
    },
    {
        icon: 'trash',
        enabledFunc: ({ topic }) => {
            return topic.getBlock(core$1.BlockType.DESC).block != null;
        },
        label: I18nKey.REMOVE_NOTES,
        shortcut: ['Alt', 'Shift', 'D'],
        rootCanUse: true,
        opType: core$1.OpType.DELETE_TOPIC_BLOCK,
        opArg: {
            blockType: core$1.BlockType.DESC
        }
    },
    {
        icon: 'delete-node',
        label: I18nKey.DELETE,
        shortcut: ['Del'],
        opType: core$1.OpType.DELETE_TOPIC
    },
    {
        icon: 'root',
        label: I18nKey.SET_AS_EDITOR_ROOT,
        shortcut: ['Alt', 'F'],
        opType: core$1.OpType.SET_EDITOR_ROOT
    },
    {
        icon: 'convert',
        label: I18nKey.CONVERT_TO_PLAIN_TEXT,
        opType: core$1.OpType.TOPIC_CONTENT_TO_PLAIN_TEXT
    }
];
function ContextMenuPlugin() {
    return {
        renderTopicContextMenu(props) {
            return React.createElement(TopicContextMenu, Object.assign({}, props));
        },
        customizeTopicContextMenu(ctx) {
            const { topicKey, model, controller, topic } = ctx;
            const viewMode = model.config.viewMode;
            const isRoot = topicKey === model.editorRootTopicKey;
            function onClickItem(item) {
                return function (e) {
                    item.opType &&
                        controller.run('operation', {
                            ...ctx,
                            opType: item.opType,
                            ...item.opArg
                        });
                };
            }
            return items.map(item => {
                if (item.enabledFunc && !item.enabledFunc({ topic, model }))
                    return null;
                if (isRoot && !item.rootCanUse)
                    return null;
                if (item.viewMode && !item.viewMode.includes(viewMode))
                    return null;
                return (React.createElement(core.MenuItem, { key: item.label, icon: Icon(item.icon), text: getI18nText(ctx, item.label), labelElement: React.createElement(KeyboardHotKeyWidget, { hotkeys: item.shortcut }), onClick: onClickItem(item) }));
            });
        }
    };
}

function DialogPlugin() {
    return {
        renderDialog(ctx) {
            const { controller } = ctx;
            const dialog = controller.run('customizeDialog', ctx);
            if (dialog == null)
                return null;
            const { dialogContent, dialogProps } = dialog;
            const props = {
                ...ctx,
                dialogContent,
                dialogProps
            };
            return React__default.createElement(DialogWidget, Object.assign({ key: "dialog" }, props));
        },
        customizeDialog(ctx) {
            return null;
        }
    };
}

const log$g = debug('plugin:drag-and-drop');
const DropArea = styled__default.div `
  height: ${props => `${props.height}px`};
  width: 100%;
  margin: 1px 0;
  padding: 2px 0;
`;
function DragAndDropPlugin() {
    // let dragTargetKey: KeyType = null;
    // let dragTargetDir: string = null;
    return {
        renderTopicDropArea(props) {
            const { topicKey, dropDir, saveRef, controller } = props;
            const onDragEnter = ev => {
                log$g('onDragEnter', topicKey, dropDir);
                controller.run('handleTopicDragEnter', { ...props, ev, dropDir });
            };
            const onDragLeave = ev => {
                log$g('onDragLeave', topicKey, dropDir);
                controller.run('handleTopicDragLeave', { ...props, ev, dropDir });
            };
            const onDragOver = ev => {
                ev.preventDefault();
            };
            const onDrop = ev => {
                log$g('onDrop', topicKey, dropDir);
                controller.run('handleTopicDrop', { ...props, ev, dropDir });
            };
            const eventHandlers = {
                onDragEnter,
                onDragLeave,
                onDragOver,
                onDrop
            };
            return (React.createElement(DropArea
            // height={model.config.theme.marginV / 2}
            , Object.assign({ 
                // height={model.config.theme.marginV / 2}
                height: 8, ref: saveRef(dropAreaRefKey(topicKey, dropDir)) }, eventHandlers)));
        },
        renderDragAndDropEffect(props) {
            log$g('renderDragAndDropEffect');
            const { saveRef, model } = props;
            return (React.createElement(TopicDropEffect, Object.assign({ ref: saveRef(RefKey.DROP_EFFECT_KEY + model.id) }, props)));
        },
        handleTopicDragStart(props) {
            log$g('handleTopicDragStart');
            const { controller, ev } = props;
            ev.stopPropagation();
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.FOCUS_TOPIC,
                focusMode: core$1.FocusMode.DRAGGING
            });
        },
        canDrop(props) {
            const { controller, srcKey, dstKey, dropDir } = props;
            const model = controller.model;
            if (srcKey === model.editorRootTopicKey ||
                srcKey === dstKey ||
                core$1.getRelationship(model, srcKey, dstKey) === core$1.TopicRelationship.ANCESTOR)
                return false;
            if (dstKey === model.editorRootTopicKey && dropDir !== 'in')
                return false;
            const srcTopic = model.getTopic(srcKey);
            return !(srcTopic.parentKey === dstKey && dropDir === 'in');
        },
        handleTopicDragEnter(props) {
            const { dropDir, topicKey, controller, setDiagramState } = props;
            const model = controller.model;
            log$g('handleTopicDragEnter:', topicKey, dropDir);
            const canDrop = controller.run('canDrop', {
                ...props,
                srcKey: model.focusKey,
                dstKey: topicKey
            });
            if (canDrop) {
                setDiagramState({
                    dragDrop: {
                        targetKey: topicKey,
                        targetDir: dropDir
                    }
                });
            }
        },
        handleTopicDragLeave(props) {
            const { topicKey, dropDir, getRef, ev, diagramState, setDiagramState } = props;
            const relatedTarget = ev.nativeEvent.relatedTarget;
            log$g('handleTopicDragLeave:', topicKey, dropDir);
            const content = getRef(contentRefKey(topicKey));
            if (content == relatedTarget || content.contains(relatedTarget)) {
                return;
            }
            setDiagramState({ dragDrop: null });
        },
        handleTopicDrop(props) {
            log$g('handleTopicDrop');
            const { controller, topicKey, diagramState, setDiagramState } = props;
            const model = controller.model;
            props = { ...props, srcKey: model.focusKey, dstKey: topicKey };
            setDiagramState({ dragDrop: null });
            if (controller.run('canDrop', props)) {
                controller.run('operation', {
                    ...props,
                    opType: core$1.OpType.DRAG_AND_DROP
                });
            }
        }
    };
}

function LinkLinePlugin() {
    return {
        renderSubLinks(props) {
            const { saveRef, topicKey, model } = props;
            const topic = model.getTopic(topicKey);
            if (topic.subKeys.size === 0 || topic.collapse)
                return null;
            return React.createElement(TopicSubLinks, Object.assign({ ref: saveRef(linksRefKey(topicKey)) }, props));
        },
        renderRootSubLinks(props) {
            // log('renderRootSubLinks');
            const { saveRef, topicKey } = props;
            // 这里逻辑有问题,会导致layout 错误
            // const topic = model.getTopic(topicKey);
            // if (topic.subKeys.size === 0) return null;
            return React.createElement(RootSubLinks, Object.assign({ ref: saveRef(linksRefKey(topicKey)) }, props));
        }
        // renderLinkPath(props) {
        //   const {linkStyle,contentRect,svgRect,dir,subContentRect} = props;
        // }
    };
}

const log$h = require('debug')('plugin:paste');
function PastePlugin() {
    let pasteType;
    const processTopicJson = (topicJson, parentKey) => {
        const res = [];
        topicJson.parentKey = parentKey;
        topicJson.key = core$1.createKey();
        topicJson.subTopics.forEach(t => {
            res.push(...processTopicJson(t, topicJson.key));
        });
        topicJson.subKeys = topicJson.subTopics.map(s => s.key);
        res.push(topicJson);
        return res;
    };
    return {
        setPasteType(ctx) {
            pasteType = ctx.pasteType;
        },
        getPasteType(ctx) {
            return pasteType;
        },
        // customizeTopicContextMenu(ctx, next) {
        //   function onClickPastePlainText(e) {
        //     pasteType = 'PASTE_PLAIN_TEXT';
        //     document.execCommand('paste');
        //   }
        //   function onClickPasteWithStyle(e) {
        //     pasteType = 'PASTE_WITH_STYLE';
        //     document.execCommand('paste');
        //   }
        //
        //   const res = next();
        //   res.push(
        //     <MenuItem
        //       key="paste-plain-text"
        //       icon={Icon(IconName.PASTE_AS_TEXT)}
        //       text={getI18nText(ctx, I18nKey.PASTE_AS_PLAIN_TEXT)}
        //       labelElement={<KeyboardHotKeyWidget hotkeys={['Meta', 'V']} />}
        //       onClick={onClickPastePlainText}
        //     />,
        //     <MenuItem
        //       key="paste-with-style"
        //       icon={Icon(IconName.PASTE)}
        //       text={getI18nText(ctx, I18nKey.PASTE_WITH_STYLE)}
        //       labelElement={
        //         <KeyboardHotKeyWidget hotkeys={['Meta', 'Shift', 'V']} />
        //       }
        //       onClick={onClickPasteWithStyle}
        //     />
        //   );
        //   return res;
        // },
        selectedKeysToClipboardData(ctx) {
            const { controller } = ctx;
            const model = controller.model;
            if (model.selectedKeys) {
                // 首先要normalize selectedKeys
                if (core$1.isAllSibiling(model, model.selectedKeys)) {
                    const topics = model.selectedKeys.map(topicKey => {
                        return controller.run('topicToJson', {
                            ...ctx,
                            model,
                            topicKey
                        });
                    });
                    const obj = { topics };
                    const json = JSON.stringify(obj, null, 2);
                    log$h('selectedKeysToClipboardData', json);
                    return json;
                }
            }
            return null;
        },
        topicToJson(ctx) {
            const { controller, model, topicKey } = ctx;
            const topic = model.getTopic(topicKey);
            const blocks = controller.run('serializeBlocks', { ...ctx, topic });
            const extData = controller.run('topicExtDataToJson', ctx);
            const { collapse } = topic;
            return {
                collapse,
                blocks,
                extData,
                subTopics: topic.subKeys
                    .toArray()
                    .map(subKey => controller.run('topicToJson', { ...ctx, topicKey: subKey }))
            };
        },
        pasteFromJson(ctx) {
            const { controller, json, docModel, topicKey } = ctx;
            let extData = docModel.extData;
            const res = [];
            if (json) {
                // 这一步生成随机的key, 并且将树状结构变成平铺结构
                const flattenTopics = [];
                json.topics.forEach(topic => {
                    flattenTopics.push(...processTopicJson(topic, topicKey));
                });
                for (const item of flattenTopics) {
                    res.push(controller.run('topicFromJson', {
                        ...ctx,
                        json: item
                    }));
                    extData = controller.run('processTopicExtData', {
                        ...ctx,
                        extData,
                        topic: item
                    });
                }
                controller.run('operation', {
                    ...ctx,
                    opType: core$1.OpType.ADD_MULTI_CHILD_WITH_EXTDATA,
                    topicArray: res,
                    extData
                });
            }
            return null;
        },
        processTopicExtData(ctx) {
            let { extData } = ctx;
            return extData;
        },
        topicFromJson(ctx) {
            const { controller, json } = ctx;
            return controller.run('deserializeTopic', { ...ctx, topic: json });
        },
        topicExtDataToJson(ctx) {
            return {};
        },
        handleCopy(ctx) {
            const { controller, ev } = ctx;
            const model = controller.model;
            if (model.selectedKeys) {
                ev.preventDefault();
                // navigator.clipboard.writeText('test clipboard');
                ev.nativeEvent.clipboardData.setData('text/bmind', controller.run('selectedKeysToClipboardData', ctx));
            }
        }
    };
}

const DescEditorWrapper = styled__default.div `
  overflow: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  flex: auto;
  background-color: white;
`;
function renderDrawer(props) {
    const { controller, model, topicKey } = props;
    const DescEditorRef = React.useRef();
    if (model.focusMode === core$1.FocusMode.EDITING_DESC) {
        const onDescEditorClose = e => {
            e.stopPropagation();
            const descData = model.getTopic(topicKey).getBlock(core$1.BlockType.DESC).block
                .data;
            controller.run('operation', {
                ...props,
                opType: core$1.OpType.SET_TOPIC_BLOCK,
                topicKey,
                blockType: core$1.BlockType.DESC,
                data: descData.set('data', DescEditorRef.current.getContent()),
                focusMode: core$1.FocusMode.NORMAL
            });
        };
        const descEditor = controller.run('renderTopicDescEditor', {
            ...props,
            ref: DescEditorRef
        });
        return (React.createElement(core.Drawer, { key: "drawer", title: getI18nText(props, I18nKey.EDIT_NOTES), icon: Icon('note'), isOpen: true, hasBackdrop: true, backdropProps: { onMouseDown: stopPropagation }, isCloseButtonShown: false, onClose: onDescEditorClose, size: "70%" }, descEditor));
    }
}

const log$i = debug('plugin:rendering');
function RenderingPlugin() {
    let diagramProps;
    return {
        getDiagramProps() {
            return diagramProps;
        },
        renderDiagram(props) {
            const { docModel } = props;
            return (React__default.createElement(SaveRef, null, (saveRef, getRef, deleteRef) => {
                diagramProps = {
                    ...props,
                    saveRef,
                    getRef,
                    deleteRef
                };
                log$i('renderDiagram', docModel);
                return React__default.createElement(DiagramRoot, diagramProps);
            }));
        },
        renderDiagramCustomize(ctx) {
            return [];
        },
        renderSheet(props) {
            const { model } = props;
            if (model.config.viewMode === core$1.ViewModeMindMap)
                return React__default.createElement(MindMapSheet, props);
        },
        renderDrawer,
        getInitialSheetState(props) {
            return {
                rightTopPanel: { isOpen: false, selectedTabId: 'topic-style' }
            };
        },
        renderSheetCustomize(props) {
            const { controller, model } = props;
            const zIndex = controller.getValue(PropKey.DIAGRAM_CUSTOMIZE_BASE_Z_INDEX);
            const nProps = {
                ...props,
                zIndex,
                topicKey: model.focusKey,
                topic: model.getTopic(model.focusKey)
            };
            const breadcrumbs = controller.run('renderEditorRootBreadcrumbs', nProps);
            // const styleEditor = controller.run('renderStyleEditor', nProps);
            const rightTopPanel = controller.run('renderRightTopPanel', nProps);
            const dialog = controller.run('renderDialog', {
                ...nProps,
                zIndex: zIndex + 1
            });
            const drawer = controller.run('renderDrawer', {
                ...nProps,
                zIndex: zIndex + 1
            });
            const viewportViewer = controller.run('renderViewPortViewer', nProps);
            return [breadcrumbs, rightTopPanel, dialog, drawer, viewportViewer];
        },
        renderEditorRootBreadcrumbs(props) {
            return React__default.createElement(EditorRootBreadcrumbs, Object.assign({ key: "EditorRootBreadcrumbs" }, props));
        },
        renderDoc({ children }) {
            return children;
        },
        renderRootWidget(props) {
            return React__default.createElement(RootWidget, Object.assign({}, props));
        },
        renderTopicWidget(props) {
            return React__default.createElement(TopicWidget, Object.assign({}, props));
        },
        renderTopicNode(props) {
            return React__default.createElement(TopicNodeWidget, Object.assign({}, props));
        },
        renderTopicNodeRows(props) {
            const { controller } = props;
            return [controller.run('renderTopicNodeLastRow', props)];
        },
        renderTopicNodeLastRow(props) {
            return React__default.createElement(TopicNodeLastRow, Object.assign({ key: "last-row" }, props));
        },
        renderTopicCollapseIcon(props) {
            return React__default.createElement(TopicCollapseIcon, Object.assign({}, props));
        },
        renderTopicNodeLastRowOthers(props) {
            return [];
        },
        renderTopicBlocks(props) {
            const { topic, controller } = props;
            const blocks = topic.blocks;
            const res = [];
            let i = 0;
            blocks.forEach(block => {
                const b = controller.run('renderTopicBlock', {
                    ...props,
                    block,
                    blockKey: `block-${i}`
                });
                if (b) {
                    res.push(React__default.createElement(React__default.Fragment, { key: `block-${i}` }, b));
                    i++;
                }
            });
            return res;
        },
        renderTopicBlock(props) {
            const { controller, block } = props;
            switch (block.type) {
                case core$1.BlockType.CONTENT:
                    return controller.run('renderTopicBlockContent', props);
                case core$1.BlockType.DESC:
                    return controller.run('renderTopicBlockDesc', props);
            }
            return null;
        },
        renderTopicBlockContent(props) {
            return React__default.createElement(TopicBlockContent, Object.assign({}, props));
        },
        renderTopicBlockDesc(props) {
            return React__default.createElement(TopicDesc, Object.assign({}, props));
        },
        renderRootWidgetOtherChildren(props) {
            const { controller } = props;
            const zoomFactor = controller.run('getZoomFactor', props);
            props = { ...props, zoomFactor };
            return (React__default.createElement(React__default.Fragment, null,
                controller.run('renderRootSubLinks', props),
                controller.run('renderDragAndDropEffect', props)));
        },
        renderViewPortViewer(props) {
            return React__default.createElement(ViewPortViewer, Object.assign({ key: "view-port-viewer" }, props));
        }
    };
}

function RightTopPanelPlugin() {
    return {
        renderRightTopPanel(props) {
            const nProps = {
                ...props,
                key: 'right-top-panel'
            };
            return React.createElement(RightTopPanelWidget, Object.assign({}, nProps));
        },
        renderRightTopPanelTabs(props) {
            const { controller } = props;
            const styleEditorTab = controller.run('renderTopicStyleEditor', props);
            const themeEditorTab = controller.run('renderThemeEditor', props);
            return [styleEditorTab, themeEditorTab];
        },
        renderTopicStyleEditor(ctx) {
            const tProps = {
                id: 'topic-style',
                key: 'topic-style',
                title: getI18nText(ctx, I18nKey.TOPIC_STYLE),
                panel: React.createElement(StyleEditor, Object.assign({}, ctx))
            };
            return React.createElement(core.Tab, Object.assign({}, tProps));
        },
        renderTextStyleEditor(ctx) {
            return React.createElement(TextStyleEditor, Object.assign({}, ctx));
        },
        renderThemeEditor(props) {
            const tProps = {
                id: 'theme-editor',
                key: 'theme-editor',
                title: getI18nText(props, I18nKey.THEME),
                panel: React.createElement(ThemeEditor, Object.assign({}, props))
            };
            return React.createElement(core.Tab, Object.assign({}, tProps));
        }
    };
}

function SheetPlugin() {
    return {
        getSheetTitle(ctx) {
            const { docModel, model } = ctx;
            return (model.title ||
                `${getI18nText(ctx, I18nKey.SHEET)}${docModel.getSheetIndex(model) + 1}`);
        }
    };
}

const log$j = debug('plugin:toolbar');
function ToolbarPlugin() {
    return {
        renderToolbar(props) {
            return React.createElement(Toolbar, Object.assign({}, props));
        },
        renderToolbarItems(props) {
            const { controller } = props;
            const itemConfigs = controller.run('customizeToolbar', props);
            //TODO 这里要判断 order不重复
            itemConfigs.sort((a, b) => a.order - b.order);
            log$j(itemConfigs);
            return itemConfigs.map(item => React.createElement(item.element, {
                ...props,
                key: item.order.toString()
            }));
        },
        customizeToolbar(props) {
            return [
                {
                    order: 0,
                    element: ToolbarItemMore
                },
                {
                    order: 100,
                    element: ToolbarItemLayout
                }
            ];
        },
        customizeToolbarItemMore(props) {
            return [
                {
                    order: 10,
                    element: ToolbarItemAddSheet
                }
            ];
        }
    };
}

const log$k = debug('plugin:utils');
function UtilsPlugin() {
    const tempValueMap = new Map();
    const eventListenerMap = new Map();
    return {
        addTempValueChangeListener(props) {
            const { key, listener } = props;
            if (!eventListenerMap.has(key)) {
                eventListenerMap.set(key, []);
            }
            eventListenerMap.get(key).push(listener);
        },
        removeTempValueChangeListener(props) {
            const { key, listener } = props;
            if (eventListenerMap.has(key)) {
                const res = eventListenerMap.get(key).filter(l => l !== listener);
                eventListenerMap.set(key, res);
            }
        },
        getTempValue(props) {
            const { key } = props;
            log$k('getTempValue', key);
            return tempValueMap.get(key);
        },
        setTempValue(props) {
            const { key, value } = props;
            log$k('setTempValue', key);
            tempValueMap.set(key, value);
            if (eventListenerMap.has(key)) {
                const listeners = eventListenerMap.get(key);
                for (const listener of listeners) {
                    listener(value);
                }
            }
        },
        deleteTempValue(props) {
            const { key } = props;
            log$k('deleteTempValue', key);
            const value = tempValueMap.get(key);
            tempValueMap.delete(key);
            return value;
        }
    };
}

function ReactPlugin(options = {}) {
    return [
        RenderingPlugin(),
        UtilsPlugin(),
        PastePlugin(),
        ContextMenuPlugin(),
        RightTopPanelPlugin(),
        ToolbarPlugin(),
        DragAndDropPlugin(),
        SheetPlugin(),
        LinkLinePlugin(),
        DialogPlugin()
    ];
}

const log$l = debug('plugin:StylePlugin');
function StylePlugin() {
    const colorMap = new Map();
    let colorIndex = 0;
    return {
        getFontList(props) {
            return [];
        },
        getTopicStyle(props) {
            const { controller } = props;
            return {
                contentStyle: controller.run('getTopicContentStyle', props),
                linkStyle: controller.run('getLinkStyle', props),
                subLinkStyle: controller.run('getSubLinksStyle', props)
            };
        },
        getTopicContentStyle(props) {
            const { topicKey, model, controller } = props;
            log$l('getTopicContentStyle:', topicKey, model);
            const visualLevel = model.getVisualDepth(topicKey);
            const theme = model.config.theme;
            let themeStyle;
            if (visualLevel === core$1.TopicVisualLevel.ROOT)
                themeStyle = theme.rootTopic;
            else if (visualLevel === core$1.TopicVisualLevel.PRIMARY)
                themeStyle = theme.primaryTopic;
            else
                themeStyle = theme.normalTopic;
            themeStyle = { ...theme.contentStyle, ...themeStyle.contentStyle };
            if (theme.randomColor) {
                const randomColor = controller.run('getRandomColor', props);
                themeStyle = {
                    ...themeStyle,
                    background: randomColor,
                    borderColor: randomColor,
                    subLinkStyle: {
                        ...themeStyle.subLinkStyle,
                        lineColor: randomColor
                    }
                };
            }
            const topic = model.getTopic(topicKey);
            if (!topic.style) {
                return themeStyle;
            }
            const customStyle = JSON.parse(topic.style);
            return {
                ...themeStyle,
                ...customStyle.contentStyle
            };
        },
        getLinkStyle(props) {
            const { topicKey, model, controller } = props;
            log$l('getLinkStyle', topicKey);
            const visualLevel = model.getVisualDepth(topicKey);
            const theme = model.config.theme;
            let linkStyle = theme.linkStyle;
            let presetStyle;
            if (visualLevel === core$1.TopicVisualLevel.ROOT)
                presetStyle = theme.rootTopic.linkStyle;
            else if (visualLevel === core$1.TopicVisualLevel.PRIMARY)
                presetStyle = theme.primaryTopic.linkStyle;
            else
                presetStyle = theme.normalTopic.linkStyle;
            linkStyle = { ...linkStyle, ...presetStyle };
            const topic = model.getTopic(topicKey);
            if (topic.parentKey != null) {
                const parentSubLinkStyle = controller.run('getSubLinksStyle', {
                    ...props,
                    topicKey: topic.parentKey
                });
                linkStyle = {
                    ...linkStyle,
                    ...parentSubLinkStyle
                };
            }
            if (!topic.style) {
                return linkStyle;
            }
            const customStyle = JSON.parse(topic.style);
            return {
                ...linkStyle,
                ...customStyle.linkStyle
            };
        },
        getSubLinksStyle(props) {
            const { topicKey, model, controller } = props;
            log$l('getLinkStyle', topicKey);
            const visualLevel = model.getVisualDepth(topicKey);
            const theme = model.config.theme;
            let subLinkStyle = theme.linkStyle;
            let presetStyle;
            if (visualLevel === core$1.TopicVisualLevel.ROOT)
                presetStyle = theme.rootTopic.subLinkStyle;
            else if (visualLevel === core$1.TopicVisualLevel.PRIMARY)
                presetStyle = theme.primaryTopic.subLinkStyle;
            else
                presetStyle = theme.normalTopic.subLinkStyle;
            subLinkStyle = { ...subLinkStyle, ...presetStyle };
            const topic = model.getTopic(topicKey);
            // 获取父节点的color
            if (theme.randomColor) {
                const randomColor = controller.run('getRandomColor', props);
                log$l(randomColor);
                subLinkStyle = {
                    ...subLinkStyle,
                    lineColor: randomColor
                };
            }
            if (!topic.style) {
                return subLinkStyle;
            }
            const customStyle = JSON.parse(topic.style);
            const res = {
                ...subLinkStyle,
                ...customStyle.subLinkStyle
            };
            // if (res.lineRadius == null) res.lineRadius = 5;
            return res;
        },
        setTopicContentStyle(props) {
            const { topicKey, controller, style, model } = props;
            const topic = model.getTopic(topicKey);
            const topicStyle = topic.style;
            const styleObj = topicStyle ? JSON.parse(topicStyle) : {};
            const newStyleObj = {
                ...styleObj,
                contentStyle: {
                    ...styleObj.contentStyle,
                    ...style
                }
            };
            if (!lodash.isEqual(styleObj, newStyleObj)) {
                const newStyleStr = JSON.stringify(newStyleObj);
                controller.run('operation', {
                    ...props,
                    opType: core$1.OpType.SET_STYLE,
                    style: newStyleStr
                });
            }
        },
        setLinkStyle(props) {
            const { topicKey, controller, linkStyle, model } = props;
            const topic = model.getTopic(topicKey);
            const style = topic.style;
            const styleObj = style ? JSON.parse(style) : {};
            const newStyleObj = {
                ...styleObj,
                linkStyle: {
                    ...styleObj.linkStyle,
                    ...linkStyle
                }
            };
            if (!lodash.isEqual(styleObj, newStyleObj)) {
                const newStyleStr = JSON.stringify(newStyleObj);
                controller.run('operation', {
                    ...props,
                    opType: core$1.OpType.SET_STYLE,
                    style: newStyleStr
                });
            }
        },
        setSubLinkStyle(props) {
            const { topicKey, controller, subLinkStyle, model } = props;
            const topic = model.getTopic(topicKey);
            const style = topic.style;
            const styleObj = style ? JSON.parse(style) : {};
            const newStyleObj = {
                ...styleObj,
                subLinkStyle: {
                    ...styleObj.subLinkStyle,
                    ...subLinkStyle
                }
            };
            if (!lodash.isEqual(styleObj, newStyleObj)) {
                const newStyleStr = JSON.stringify(newStyleObj);
                controller.run('operation', {
                    ...props,
                    opType: core$1.OpType.SET_STYLE,
                    style: newStyleStr
                });
            }
        },
        getTopicThemeStyle(props) {
            const { topicKey, model } = props;
            const visualLevel = model.getVisualDepth(topicKey);
            const theme = model.config.theme;
            if (visualLevel === core$1.TopicVisualLevel.ROOT)
                return theme.rootTopic;
            if (visualLevel === core$1.TopicVisualLevel.PRIMARY)
                return theme.primaryTopic;
            return theme.normalTopic;
        },
        getRandomColor(props) {
            const { topicKey } = props;
            if (colorMap.has(topicKey))
                return colorMap.get(topicKey);
            const colors = [
                '#00CC99',
                '#FFEE88',
                // '#A167A5',
                '#E5F993',
                '#F5C396',
                '#DB995A',
                '#83BCFF',
                '#ED7B84',
                '#739E82',
                '#D3BCC0',
                '#FFA0FD',
                '#EFD3D7',
                '#C6878F'
            ];
            const color = colors[++colorIndex % colors.length];
            colorMap.set(topicKey, color);
            log$l('getRandomColor', topicKey, color);
            return color;
        }
    };
}

function ThemePlugin() {
    return {
        getThemeOfTopic(ctx) {
            const { model } = ctx;
            const theme = model.config.theme;
            const { contentStyle, rootTopic, primaryTopic, normalTopic } = theme;
            return {
                rootTopic: {
                    ...rootTopic,
                    contentStyle: { ...contentStyle, ...rootTopic.contentStyle }
                },
                primaryTopic: {
                    ...primaryTopic,
                    contentStyle: { ...contentStyle, ...primaryTopic.contentStyle }
                },
                normalTopic: {
                    ...normalTopic,
                    contentStyle: { ...contentStyle, ...normalTopic.contentStyle }
                }
            };
        },
        setDarkMode(ctx) {
            const { darkMode } = ctx;
            if (darkMode) {
                if (!document.body.classList.contains(core.Classes.DARK)) {
                    document.body.classList.add(core.Classes.DARK);
                }
            }
            else {
                if (document.body.classList.contains(core.Classes.DARK)) {
                    document.body.classList.remove(core.Classes.DARK);
                }
            }
        },
        toggleDarkMode(ctx) {
            document.body.classList.toggle(core.Classes.DARK);
        }
    };
}

/**
 * Expose `isUrl`.
 */

var isUrl_1 = isUrl;

/**
 * RegExps.
 * A URL must match #1 and then at least one of #2/#3.
 * Use two levels of REs to avoid REDOS.
 */

var protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;

var localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
var nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;

/**
 * Loosely validate a URL `string`.
 *
 * @param {String} string
 * @return {Boolean}
 */

function isUrl(string){
  if (typeof string !== 'string') {
    return false;
  }

  var match = string.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }

  var everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) {
    return false;
  }

  if (localhostDomainRE.test(everythingAfterProtocol) ||
      nonLocalhostDomainRE.test(everythingAfterProtocol)) {
    return true;
  }

  return false;
}

const log$m = require('debug')('node:content-editable');
function normalizeHtml(str) {
    return str && str.replace(/&nbsp;|\u202F|\u00A0/g, ' ');
}
function replaceCaret(el) {
    log$m('replaceCaret', el.innerHTML);
    // Place the caret at the end of the element
    const target = document.createTextNode('');
    el.appendChild(target);
    // do not move caret if element was not focused
    // const isTargetFocused = document.activeElement === el;
    if (target !== null && target.nodeValue !== null) {
        const sel = window.getSelection();
        if (sel !== null) {
            const range = document.createRange();
            range.setStart(target, target.nodeValue.length);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        if (el instanceof HTMLElement)
            el.focus();
    }
}
/**
 * A simple component for an html element with editable contents.
 */
class ContentEditable extends React__default.Component {
    constructor() {
        super(...arguments);
        this.lastHtml = this.props.html;
        this.el = typeof this.props.innerRef === 'function'
            ? { current: null }
            : React__default.createRef();
        this.getEl = () => (this.props.innerRef && typeof this.props.innerRef !== 'function'
            ? this.props.innerRef
            : this.el).current;
        this.emitChange = (originalEvt) => {
            log$m('emitChange');
            const el = this.getEl();
            if (!el)
                return;
            const html = el.innerHTML;
            // if (this.props.onChange && html !== this.lastHtml) {
            // 为了考虑到在一个节点上面快速输入，切换到另一个节点，第一个节点上输入的内容无法撤销这种情况
            if (this.props.onChange) {
                // Clone event with Object.assign to avoid
                // "Cannot assign to read only property 'target' of object"
                const evt = Object.assign({}, originalEvt, {
                    target: {
                        value: html
                    }
                });
                this.props.onChange(evt);
            }
            this.lastHtml = html;
        };
        this.onInput = e => {
            log$m('onInput');
            if (this.props.handleOnInput && this.props.handleOnInput(e))
                return;
            this.emitChange(e);
        };
        this.onBlur = e => {
            this.emitChange(e);
        };
        this.onKeyDown = e => {
            // log('onKeyDown', e.target.innerHTML);
            if (this.props.handleKeyDown && this.props.handleKeyDown(e)) {
                e.preventDefault();
                return false;
            }
            // this.emitChange(e);
        };
    }
    render() {
        const { tagName, html, innerRef, handleKeyDown, handleOnInput, handleOnPaste, focus, ...props } = this.props;
        return React__default.createElement(tagName || 'div', {
            ...props,
            ref: typeof innerRef === 'function'
                ? (current) => {
                    innerRef(current);
                    this.el.current = current;
                }
                : innerRef || this.el,
            onInput: this.onInput,
            onBlur: this.onBlur,
            // onKeyUp: this.props.onKeyUp || this.emitChange,
            onKeyDown: this.onKeyDown,
            onPaste: handleOnPaste,
            contentEditable: !this.props.disabled,
            dangerouslySetInnerHTML: { __html: html }
        }, this.props.children);
    }
    shouldComponentUpdate(nextProps) {
        const { props } = this;
        const el = this.getEl();
        // We need not rerender if the change of props simply reflects the user's edits.
        // Rerendering in this case would make the cursor/caret jump
        // Rerender if there is no element yet... (somehow?)
        if (!el)
            return true;
        // ...or if html really changed... (programmatically, not by user edit)
        if (normalizeHtml(nextProps.html) !== normalizeHtml(el.innerHTML)) {
            return true;
        }
        // Handle additional properties
        const res = props.focus !== nextProps.focus ||
            props.disabled !== nextProps.disabled ||
            props.tagName !== nextProps.tagName ||
            props.className !== nextProps.className ||
            props.innerRef !== nextProps.innerRef ||
            !deepEqual(props.style, nextProps.style);
        // log('shouldComponentUpdate',res);
        return res;
    }
    componentDidMount() {
        const el = this.getEl();
        if (!el) {
            return;
        }
        // Perhaps React (whose VDOM gets outdated because we often prevent
        // rerendering) did not update the DOM. So we update it manually now.
        if (this.props.html !== el.innerHTML) {
            el.innerHTML = this.lastHtml = this.props.html;
        }
        this.props.focus && replaceCaret(el);
    }
    componentDidUpdate() {
        log$m('componentDidUpdate');
        const el = this.getEl();
        if (!el) {
            return;
        }
        // Perhaps React (whose VDOM gets outdated because we often prevent
        // rerendering) did not update the DOM. So we update it manually now.
        if (this.props.html !== el.innerHTML) {
            el.innerHTML = this.lastHtml = this.props.html;
        }
        this.props.focus && replaceCaret(el);
    }
}
ContentEditable.propTypes = {
    html: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    tagName: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
};

const log$n = require('debug')('node:topic-content-editor');
let debounce = false;
let _isPaste = false;
function TopicContentEditor(props) {
    const { controller, model, topicKey, topic, readOnly, className, handleKeyDown: _handleKeyDown, handleOnInput } = props;
    const content = topic.getBlock(core$1.BlockType.CONTENT).block.data;
    const onChange = evt => {
        log$n('inputType', evt.nativeEvent.inputType);
        const data = evt.target.value;
        if (evt.type === 'blur') {
            const { undoStack } = controller.run('getUndoRedoStack', props);
            const lastUndoDocModel = undoStack.peek();
            if (lastUndoDocModel && lastUndoDocModel.currentSheetModel) {
                const lastTopic = lastUndoDocModel.currentSheetModel.getTopic(topicKey);
                if (lastTopic && lastTopic.contentData !== data) {
                    controller.run('operation', {
                        ...props,
                        opType: core$1.OpType.SET_TOPIC_BLOCK,
                        blockType: core$1.BlockType.CONTENT,
                        data
                    });
                    return;
                }
            }
        }
        if (evt.nativeEvent.inputType === 'historyUndo' ||
            evt.nativeEvent.inputType === 'historyRedo') {
            evt.nativeEvent.preventDefault();
            return;
        }
        if (data !== topic.contentData) {
            if (debounce && !_isPaste) {
                //无法进行undo
                controller.run('operation', {
                    ...props,
                    opType: core$1.OpType.SET_TOPIC_BLOCK_CONTENT,
                    data
                });
                setTimeout(() => {
                    debounce = false;
                }, 2000);
            }
            else {
                controller.run('operation', {
                    ...props,
                    opType: core$1.OpType.SET_TOPIC_BLOCK,
                    blockType: core$1.BlockType.CONTENT,
                    data
                });
                debounce = true;
            }
        }
        _isPaste = false;
    };
    const innerEditorDivRef = props.innerEditorDivRef || React.useRef();
    const handleKeyDown = e => {
        return _handleKeyDown(e);
    };
    const handleOnPaste = e => {
        log$n('handleOnPaste');
        // e.preventDefault();
        const pasteType = controller.run('getPasteType', props);
        const bmind = e.clipboardData.getData('text/bmind');
        if (bmind) {
            const json = JSON.parse(bmind);
            log$n(json);
            controller.run('pasteFromJson', { ...props, json });
        }
        // else if (pasteType === 'PASTE_WITH_STYLE') {
        //   console.log('PASTE_WITH_STYLE');
        //   const html = e.clipboardData.getData('text/html');
        //   setTimeout(() => {
        //     _isPaste = true;
        //     document.execCommand('insertHTML', false, html);
        //   });
        // }
        else {
            const html = e.clipboardData.getData('text/html');
            const text = e.clipboardData.getData('text/plain');
            log$n({ text, html });
            // 无法递归执行document.execCommand
            // _isPaste = true;
            // //@ts-ignore
            _isPaste = true;
            if (isUrl_1(text)) {
                e.preventDefault();
                document.execCommand('insertHtml', false, `<a href=${text}>${text}</a>`);
            }
        }
        controller.run('setPasteType', { pasteType: null });
    };
    const editProps = {
        className: cx('bm-content-editable', className),
        handleKeyDown,
        handleOnInput,
        handleOnPaste,
        html: content,
        disabled: readOnly,
        focus: model.focusKey === topicKey,
        placeholder: 'new topic',
        innerRef: innerEditorDivRef,
        // onChange: v => {
        //   setEditorState(v);
        // }
        onChange
    };
    log$n('render', topicKey
    // innerEditorDivRef.current
    );
    return React__default.createElement(ContentEditable, Object.assign({}, editProps));
}

function TopicContentEditorPlugin() {
    return {
        getTopicTitle(ctx) {
            const { topicKey, maxLength, usePlainText = true, sheetId, docModel } = ctx;
            const model = sheetId ? docModel.getSheetModel(sheetId) : ctx.model;
            const topic = model.getTopic(topicKey);
            const block = topic.getBlock(core$1.BlockType.CONTENT).block;
            let text = usePlainText
                ? htmlToText.fromString(block.data, { preserveNewlines: true })
                : block.data;
            if (maxLength != null) {
                text =
                    text.length > maxLength ? text.substr(0, maxLength) + '...' : text;
            }
            return text;
        },
        renderTopicContentEditor(props) {
            return React__default.createElement(TopicContentEditor, Object.assign({}, props));
        },
        serializeBlockData(props, next) {
            const { block } = props;
            if (block.type === core$1.BlockType.CONTENT) {
                return typeof block.data === 'string'
                    ? block.data
                    : block.data.getCurrentContent().getPlainText();
            }
            return next();
        }
    };
}

const log$o = require('debug')('plugin:undo');
function UndoPlugin() {
    let undoStack = immutable.Stack();
    let redoStack = immutable.Stack();
    return {
        //是否允许undo
        getAllowUndo(ctx) {
            const { controller, allowUndo = true } = ctx;
            if (allowUndo === false)
                return false;
            return controller.run('customizeAllowUndo', ctx);
        },
        customizeAllowUndo(ctx) {
            const { docModel, opType } = ctx;
            const model = docModel.currentSheetModel;
            if (opType) {
                switch (opType) {
                    // 这几种情况不加入undo 队列
                    case core$1.OpType.FOCUS_TOPIC:
                    case core$1.OpType.SET_FOCUS_MODE:
                    case core$1.OpType.START_EDITING_CONTENT:
                        return false;
                    case core$1.OpType.START_EDITING_DESC:
                        return !model.currentFocusTopic.getBlock(core$1.BlockType.DESC).block;
                    case core$1.OpType.SET_TOPIC_BLOCK_CONTENT:
                        return false;
                }
            }
            if (model.focusMode === core$1.FocusMode.EDITING_DESC)
                return false;
            return model.config.allowUndo;
        },
        getUndoRedoStack() {
            return {
                undoStack,
                redoStack
            };
        },
        setUndoStack(ctx) {
            log$o('setUndoStack', ctx.undoStack);
            undoStack = ctx.undoStack;
        },
        setRedoStack(ctx) {
            log$o('setRedoStack', ctx.redoStack);
            redoStack = ctx.redoStack;
        },
        canUndo(ctx) {
            const { controller } = ctx;
            const isOperationEnabled = controller.run('isOperationEnabled', ctx);
            if (!isOperationEnabled)
                return false;
            const { undoStack } = controller.run('getUndoRedoStack', ctx);
            const allowUndo = controller.run('getAllowUndo', ctx);
            return undoStack.size > 0 && allowUndo;
        },
        canRedo(ctx) {
            const { controller } = ctx;
            const isOperationEnabled = controller.run('isOperationEnabled', ctx);
            if (!isOperationEnabled)
                return false;
            const { redoStack } = controller.run('getUndoRedoStack', ctx);
            const allowUndo = controller.run('getAllowUndo', ctx);
            return redoStack.size > 0 && allowUndo;
        },
        undo(ctx) {
            const { controller, docModel } = ctx;
            if (!controller.run('getAllowUndo', ctx)) {
                return;
            }
            const { undoStack, redoStack } = controller.run('getUndoRedoStack', ctx);
            const newDocModel = undoStack.peek();
            if (!newDocModel)
                return;
            controller.run('setUndoStack', {
                ...ctx,
                undoStack: undoStack.shift()
            });
            controller.run('setRedoStack', {
                ...ctx,
                redoStack: redoStack.push(docModel)
            });
            log$o('undo', newDocModel.currentSheetModel.topics);
            controller.change(newDocModel);
        },
        redo(ctx) {
            const { controller, docModel } = ctx;
            if (!controller.run('getAllowUndo', ctx)) {
                return;
            }
            const { undoStack, redoStack } = controller.run('getUndoRedoStack', ctx);
            const newDocModel = redoStack.peek();
            if (!newDocModel)
                return;
            controller.run('setUndoStack', {
                ...ctx,
                undoStack: undoStack.push(docModel)
            });
            controller.run('setRedoStack', {
                ...ctx,
                redoStack: redoStack.shift()
            });
            log$o('redo', newDocModel.currentSheetModel.topics);
            controller.change(newDocModel);
        }
    };
}

function DefaultPlugin() {
    return [
        ReactPlugin(),
        LayoutPlugin(),
        OperationPlugin(),
        UndoPlugin(),
        StylePlugin(),
        EventPlugin(),
        HotKeyPlugin(),
        GetValuePlugin(),
        TopicContentEditorPlugin(),
        CreateModelPlugin(),
        ThemePlugin(),
        PlatformPlugin(),
        I18nPlugin(),
        OptmizationPlugin()
    ];
}

const log$p = debug('node:Diagram');
exports.Diagram = class Diagram extends React.Component {
    constructor() {
        super(...arguments);
        this.resolveController = memoizeOne((plugins = [], TheDefaultPlugin) => {
            const defaultPlugin = TheDefaultPlugin();
            this.controller = new core$1.Controller({
                plugins: [plugins, defaultPlugin],
                onChange: this.props.onChange
            });
        });
    }
    getDiagramProps() {
        return this.controller.run('getDiagramProps');
    }
    renderHotkeys() {
        const props = this.props;
        const controller = props.controller || this.controller;
        const model = controller.model;
        log$p('renderHotkeys', model);
        const hotKeys = controller.run('customizeHotKeys', {
            ...props,
            controller
        });
        if (hotKeys === null)
            return null;
        if (!(hotKeys.topicHotKeys instanceof Map &&
            hotKeys.globalHotKeys instanceof Map)) {
            throw new TypeError('topicHotKeys and globalHotKeys must be a Map');
        }
        const children = [];
        if (model.focusMode === core$1.FocusMode.NORMAL ||
            model.focusMode === core$1.FocusMode.SHOW_POPUP ||
            model.focusMode === core$1.FocusMode.EDITING_CONTENT) {
            hotKeys.topicHotKeys.forEach((v, k) => {
                children.push(React.createElement(core.Hotkey, Object.assign({ key: k }, v, { global: true })));
            });
            hotKeys.viewModeTopicHotKeys.has(model.config.viewMode) &&
                hotKeys.viewModeTopicHotKeys
                    .get(model.config.viewMode)
                    .forEach((v, k) => {
                    children.push(React.createElement(core.Hotkey, Object.assign({ key: k }, v, { global: true })));
                });
        }
        hotKeys.globalHotKeys.forEach((v, k) => {
            children.push(React.createElement(core.Hotkey, Object.assign({ key: k }, v, { global: true })));
        });
        return React.createElement(core.Hotkeys, null, children);
    }
    openNewDocModel(newModel) {
        const props = this.getDiagramProps();
        const { controller } = props;
        controller.run('openNewDocModel', {
            ...props,
            newModel
        });
    }
    render() {
        const { plugins, controller } = this.props;
        if (controller)
            this.controller = controller;
        else
            this.resolveController(plugins, DefaultPlugin);
        let { docModel } = this.props;
        if (!docModel) {
            docModel = this.controller.run('createNewDocModel', {
                controller: this.controller
            });
        }
        this.diagramProps = {
            ...this.props,
            docModel,
            controller: this.controller
        };
        return this.controller.run('renderDiagram', this.diagramProps);
    }
};
exports.Diagram = __decorate([
    core.HotkeysTarget
], exports.Diagram);

exports.Alert = Alert;
exports.BaseWidget = BaseWidget;
exports.Btn = Btn;
exports.COLORS = COLORS;
exports.CloseIcon = CloseIcon;
exports.ColorBar = ColorBar;
exports.DefaultPlugin = DefaultPlugin;
exports.DragScrollWidget = DragScrollWidget;
exports.EventKey = EventKey;
exports.Flex = Flex;
exports.GlobalStyle = GlobalStyle;
exports.HotKeyName = HotKeyName;
exports.I18nKey = I18nKey;
exports.Icon = Icon;
exports.IconBg = IconBg;
exports.IconName = IconName;
exports.InlineBlockSpan = InlineBlockSpan;
exports.KeyboardHotKeyWidget = KeyboardHotKeyWidget;
exports.Margin = Margin;
exports.MoveTopicDir = MoveTopicDir;
exports.OutsideClickHandler = OutsideClickHandler;
exports.PanelTabRoot = PanelTabRoot;
exports.PropKey = PropKey;
exports.PxSelect = PxSelect;
exports.RefKey = RefKey;
exports.RenameDialog = RenameDialog;
exports.SaveRef = SaveRef;
exports.SettingBoxContainer = SettingBoxContainer;
exports.SettingGroup = SettingGroup;
exports.SettingItem = SettingItem;
exports.SettingItemButton = SettingItemButton;
exports.SettingItemColorPicker = SettingItemColorPicker;
exports.SettingItemFlex = SettingItemFlex;
exports.SettingItemInput = SettingItemInput;
exports.SettingItemNumericInput = SettingItemNumericInput;
exports.SettingItemSelect = SettingItemSelect;
exports.SettingLabel = SettingLabel;
exports.SettingRow = SettingRow;
exports.SettingRowTitle = SettingRowTitle;
exports.SettingTitle = SettingTitle;
exports.ShowMenuIcon = ShowMenuIcon;
exports.StyledCheckbox = StyledCheckbox;
exports.TempValueKey = TempValueKey;
exports.Title = Title;
exports.Toolbar = Toolbar;
exports.ToolbarGroupItem = ToolbarGroupItem;
exports.ToolbarItem = ToolbarItem;
exports.ToolbarItemAddSheet = ToolbarItemAddSheet;
exports.ToolbarItemLayout = ToolbarItemLayout;
exports.ToolbarItemMore = ToolbarItemMore;
exports.ToolbarItemPopoverTarget = ToolbarItemPopoverTarget;
exports.TopicBlockIcon = TopicBlockIcon;
exports.VListContainer = VListContainer;
exports.WithBorder = WithBorder;
exports.ZIndex = ZIndex;
exports.borderWidthItems = borderWidthItems;
exports.browserDownloadFile = browserDownloadFile;
exports.browserDownloadText = browserDownloadText;
exports.browserOpenFile = browserOpenFile;
exports.center = center;
exports.centerPointX = centerPointX;
exports.centerPointY = centerPointY;
exports.centerX = centerX;
exports.centerY = centerY;
exports.collapseRefKey = collapseRefKey;
exports.contentEditorRefKey = contentEditorRefKey;
exports.contentRefKey = contentRefKey;
exports.descEditorRefKey = descEditorRefKey;
exports.dropAreaRefKey = dropAreaRefKey;
exports.getComputedStyle = getComputedStyle;
exports.getI18nText = getI18nText;
exports.getLinkKey = getLinkKey;
exports.getRelativeRect = getRelativeRect;
exports.getRelativeVector = getRelativeVector;
exports.iconClassName = iconClassName;
exports.isOSX = isOSX;
exports.linksRefKey = linksRefKey;
exports.linksSvgRefKey = linksSvgRefKey;
exports.op = op;
exports.paddingCss = paddingCss;
exports.renderItem = renderItem;
exports.renderItemI18n = renderItemI18n;
exports.selectTo = selectTo;
exports.selectToEnd = selectToEnd;
exports.selectToStart = selectToStart;
exports.setColorAlpha = setColorAlpha;
exports.setColorAlphaPercent = setColorAlphaPercent;
exports.stopPropagation = stopPropagation;
exports.swap = swap;
exports.topicNodeRefKey = topicNodeRefKey;
exports.topicWidgetRefKey = topicWidgetRefKey;
exports.topicWidgetRootRefKey = topicWidgetRootRefKey;
exports.tvZoomFactorKey = tvZoomFactorKey;
exports.useClickOutside = useClickOutside;
exports.useEventListener = useEventListener;
//# sourceMappingURL=main.js.map
