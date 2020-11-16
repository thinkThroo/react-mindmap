'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var core = require('@blink-mind/core');
var rendererReact = require('@blink-mind/renderer-react');
var core$1 = require('@blueprintjs/core');
var React = require('react');
var React__default = _interopDefault(React);
var styled = _interopDefault(require('styled-components'));
var immutable = require('immutable');
var select = require('@blueprintjs/select');
var Highlighter = _interopDefault(require('react-highlight-words'));
var debug = _interopDefault(require('debug'));
var fileSaver = require('file-saver');
var htmlToImage = require('html-to-image');

const FOCUS_MODE_SET_REFERENCE_TOPICS = 'FOCUS_MODE_SET_REFERENCE_TOPICS';
// 添加引用的Topic
const OP_TYPE_START_SET_REFERENCE_TOPICS = 'OP_TYPE_START_SET_REFERENCE_TOPICS';
const OP_TYPE_SET_REFERENCE_TOPICS = 'OP_TYPE_SET_REFERENCE_TOPICS';
const EXT_DATA_KEY_TOPIC_REFERENCE = 'TOPIC_REFERENCE';
const EXT_KEY_TOPIC_REFERENCE = 'EXT_KEY_TOPIC_REFERENCE';

const Root = styled(rendererReact.ZIndex) `
  position: absolute;
  left: calc(50% - 150px);
  top: 30px;
  width: 300px;
  background: white;
  padding: 10px;
  user-select: none;
`;
const Title = styled.div `
  margin-bottom: 10px;
`;
function AddReferenceTopicPanel(props) {
    const { zIndex, controller, topicKey } = props;
    const onClickCancel = e => {
        controller.run('clearSelectedReferenceKeys', props);
        controller.run('enableOperation', props);
        controller.run('operation', {
            ...props,
            opType: core.OpType.SET_FOCUS_MODE,
            focusMode: core.FocusMode.NORMAL
        });
    };
    const onClickConfirm = e => {
        const referenceKeys = controller.run('getSelectedReferenceKeys', props);
        controller.run('enableOperation', props);
        controller.run('operation', {
            ...props,
            opArray: [
                {
                    opType: OP_TYPE_SET_REFERENCE_TOPICS,
                    topicKey,
                    referenceKeys
                },
                {
                    opType: core.OpType.FOCUS_TOPIC,
                    topicKey,
                    focusMode: core.FocusMode.NORMAL
                }
            ],
            allowUndo: false
        });
        controller.run('clearSelectedReferenceKeys', props);
    };
    return (React.createElement(Root, { zIndex: zIndex },
        React.createElement(Title, null, rendererReact.getI18nText(props, rendererReact.I18nKey.SELECT_REF_TOPICS_TIP)),
        React.createElement(rendererReact.Flex, { justifyContent: 'space-around' },
            React.createElement(core$1.Button, { onClick: onClickConfirm }, rendererReact.getI18nText(props, rendererReact.I18nKey.CONFIRM)),
            React.createElement(core$1.Button, { onClick: onClickCancel }, rendererReact.getI18nText(props, rendererReact.I18nKey.CANCEL)))));
}

const defaultReferenceRecord = {
    keyList: immutable.List(),
    dataMap: immutable.Map()
};
class ReferenceRecord extends immutable.Record(defaultReferenceRecord) {
    get keyList() {
        return this.get('keyList');
    }
    get dataMap() {
        return this.get('dataMap');
    }
}
const defaultExtDataReferenceRecord = {
    reference: immutable.Map()
};
class ExtDataReference extends immutable.Record(defaultExtDataReferenceRecord) {
    get reference() {
        return this.get('reference');
    }
    getReferenceKeys(topicKey) {
        if (this.reference.has(topicKey)) {
            return this.reference.get(topicKey).keyList.toArray();
        }
        return [];
    }
    getReferencedKeys(topicKey) {
        const res = [];
        this.reference.forEach((v, k) => {
            if (v.keyList.includes(topicKey)) {
                res.push(k);
            }
        });
        return res;
    }
}

// TODO 能否优化这个函数的写法
function setReferenceTopicKeys({ docModel, topicKey, referenceKeys }) {
    let extData = docModel.getExtDataItem(EXT_DATA_KEY_TOPIC_REFERENCE, ExtDataReference);
    let referenceRecord = extData.reference.get(topicKey) || new ReferenceRecord();
    referenceRecord = referenceRecord.set('keyList', immutable.List(referenceKeys));
    extData = extData.setIn(['reference', topicKey], referenceRecord);
    docModel = docModel.setIn(['extData', EXT_DATA_KEY_TOPIC_REFERENCE], extData);
    return docModel;
}

const Root$1 = styled.div `
  display: flex;
  width: 380px;
  margin: 10px;
  justify-content: center;
  align-items: center;
`;
const Content = styled.div `
  width: 300px;
  text-decoration: underline;
  cursor: pointer;
`;
const ButtonPlace = styled.div `
  width: 80px;
`;
function ReferenceTopicThumbnail(props) {
    const { controller, refKey, refType, removeHandler } = props;
    const [deleteConfirm, setDeleteConfirm] = React.useState(false);
    const onClick = e => {
        e.stopPropagation();
        controller.run('focusTopicAndMoveToCenter', { ...props, topicKey: refKey });
    };
    const onClickRemove = e => {
        setDeleteConfirm(true);
    };
    const content = controller.getValue(rendererReact.PropKey.TOPIC_TITLE, {
        ...props,
        topicKey: refKey,
        maxLength: 100
    });
    const deleteAlertProps = {
        ...props,
        isOpen: deleteConfirm,
        content: rendererReact.getI18nText(props, rendererReact.I18nKey.DELETE_REFERENCE_TIP),
        onConfirm: e => {
            removeHandler(e);
        },
        onCancel: e => {
            setDeleteConfirm(false);
        }
    };
    return (React.createElement(Root$1, null,
        React.createElement(Content, { onClick: onClick }, content),
        React.createElement(ButtonPlace, null, refType === 'reference' && (React.createElement(React.Fragment, null,
            React.createElement(core$1.Button, { onClick: onClickRemove }, rendererReact.getI18nText(props, rendererReact.I18nKey.REMOVE)),
            React.createElement(rendererReact.Alert, Object.assign({}, deleteAlertProps)))))));
}

const Root$2 = styled.div ``;
const Group = styled.div `
  padding: 10px;
`;
const GroupList = styled.div `
  max-height: 200px;
  overflow: auto;
`;
const GroupTitle = styled.div `
  font-size: 20px;
  color: ${rendererReact.COLORS.HIGHLIGHT};
`;
const GotoBtn = styled.div `
  text-decoration: underline;
  color: ${rendererReact.COLORS.HIGHLIGHT};
  cursor: pointer;
`;
function ReferenceTopicList(props) {
    const { topicKey, controller, model, docModel } = props;
    const extData = docModel.extData.get(EXT_DATA_KEY_TOPIC_REFERENCE);
    const removeReference = refKey => e => {
        e.stopPropagation();
        const keyList = extData.reference.get(topicKey).keyList;
        controller.run('operation', {
            ...props,
            opArray: [
                {
                    opType: OP_TYPE_SET_REFERENCE_TOPICS,
                    topicKey: topicKey,
                    focusMode: core.FocusMode.NORMAL,
                    referenceKeys: keyList.delete(keyList.indexOf(refKey)).toArray()
                }
            ]
        });
    };
    const referenceKeys = extData.getReferenceKeys(topicKey);
    const referenceGroup = referenceKeys.length === 0 ? null : (React.createElement(Group, null,
        React.createElement(GroupTitle, null, rendererReact.getI18nText(props, rendererReact.I18nKey.REFERENCE_TOPICS) + ':'),
        React.createElement(GroupList, null, referenceKeys.map(key => {
            const thumbProps = {
                ...props,
                key,
                refKey: key,
                refType: 'reference',
                removeHandler: removeReference(key)
            };
            //@ts-ignore
            return React.createElement(ReferenceTopicThumbnail, Object.assign({}, thumbProps));
        }))));
    const referencedKeys = extData.getReferencedKeys(topicKey);
    const referencedGroup = referencedKeys.length === 0 ? null : (React.createElement(Group, null,
        React.createElement(GroupTitle, null, rendererReact.getI18nText(props, rendererReact.I18nKey.REFERENCED_TOPICS) + ':'),
        React.createElement(GroupList, null, referencedKeys.map(key => {
            const thumbProps = {
                ...props,
                key,
                refKey: key,
                refType: 'referenced'
            };
            //@ts-ignore
            return React.createElement(ReferenceTopicThumbnail, Object.assign({}, thumbProps));
        }))));
    const onClickGotoOriginTopic = e => {
        e.stopPropagation();
        controller.run('focusTopicAndMoveToCenter', props);
    };
    const currentTopic = model.focusKey !== topicKey && (React.createElement(Group, null,
        React.createElement(GotoBtn, { onClick: onClickGotoOriginTopic }, rendererReact.getI18nText(props, rendererReact.I18nKey.GOTO_ORIGINAL_TOPIC))));
    return (React.createElement(Root$2, { onMouseDown: rendererReact.stopPropagation },
        referenceGroup,
        referencedGroup,
        currentTopic));
}

function TopicExtReference(props) {
    const { docModel, topicKey } = props;
    const extData = docModel.getExtDataItem(EXT_DATA_KEY_TOPIC_REFERENCE, ExtDataReference);
    const refRecord = extData.reference.get(topicKey);
    const referencedKeys = [];
    extData.reference.forEach((v, k) => {
        if (v.keyList.includes(topicKey))
            referencedKeys.push(k);
    });
    if ((refRecord == null || refRecord.keyList.size === 0) &&
        referencedKeys.length === 0)
        return null;
    const iconProps = {
        className: rendererReact.iconClassName('reference'),
        tabIndex: -1
    };
    const icon = React.createElement(rendererReact.TopicBlockIcon, Object.assign({}, iconProps));
    const tooltipContent = React.createElement(ReferenceTopicList, Object.assign({}, props));
    const tooltipProps = {
        autoFocus: false,
        content: tooltipContent,
        target: icon,
        interactionKind: core$1.PopoverInteractionKind.CLICK,
        hoverOpenDelay: 500
    };
    return React.createElement(core$1.Popover, Object.assign({}, tooltipProps));
}

function TopicReferenceCheckbox(props) {
    const { topicKey, selectedTopicKeys } = props;
    const a = selectedTopicKeys.has(topicKey);
    const [checked, setChecked] = React.useState(a);
    const checkboxProps = {
        checked,
        onChange: () => {
            if (selectedTopicKeys.has(topicKey)) {
                selectedTopicKeys.delete(topicKey);
            }
            else {
                selectedTopicKeys.add(topicKey);
            }
            setChecked(!checked);
        }
    };
    return React.createElement(rendererReact.StyledCheckbox, Object.assign({}, checkboxProps));
}

function TopicReferencePlugin() {
    let selectedTopicKeys = new Set();
    function startSetReferenceTopics({ docModel, model, topicKey }) {
        const extData = docModel.getExtDataItem(EXT_DATA_KEY_TOPIC_REFERENCE, ExtDataReference);
        selectedTopicKeys = new Set(extData.getReferenceKeys(topicKey));
        model = core.SheetModelModifier.focusTopic({
            model,
            topicKey,
            focusMode: FOCUS_MODE_SET_REFERENCE_TOPICS
        });
        docModel = core.setCurrentSheetModel(docModel, model);
        return docModel;
    }
    return {
        customizeTopicContextMenu(props, next) {
            const { controller, model } = props;
            if (model.config.viewMode !== core.ViewModeMindMap)
                return next();
            function onClickSetReferenceTopics(e) {
                controller.run('operation', {
                    ...props,
                    opType: OP_TYPE_START_SET_REFERENCE_TOPICS
                });
                controller.run('disableOperation', {
                    ...props,
                    whiteList: [core.OpType.TOGGLE_COLLAPSE]
                });
            }
            return (React.createElement(React.Fragment, null,
                next(),
                React.createElement(core$1.MenuDivider, null),
                React.createElement(core$1.MenuItem, { key: EXT_KEY_TOPIC_REFERENCE, icon: rendererReact.Icon('reference'), text: rendererReact.getI18nText(props, rendererReact.I18nKey.SET_TOPIC_REFERENCES), onClick: onClickSetReferenceTopics })));
        },
        componentAreEqual(ctx, next) {
            const { prevProps, nextProps } = ctx;
            const { model: nmodel } = nextProps;
            const { model } = prevProps;
            if (nmodel.focusMode !== model.focusMode &&
                (nmodel.focusMode === FOCUS_MODE_SET_REFERENCE_TOPICS ||
                    model.focusMode === FOCUS_MODE_SET_REFERENCE_TOPICS))
                return false;
            return next();
        },
        getOpMap(props, next) {
            const opMap = next();
            opMap.set(OP_TYPE_START_SET_REFERENCE_TOPICS, startSetReferenceTopics);
            opMap.set(OP_TYPE_SET_REFERENCE_TOPICS, setReferenceTopicKeys);
            return opMap;
        },
        beforeOpFunction(props, next) {
            let docModel = next();
            const model = docModel.currentSheetModel;
            const { opType, topicKey } = props;
            // 注意是在beforeOpFunction里面操作
            if (opType === core.OpType.DELETE_TOPIC &&
                topicKey !== model.editorRootTopicKey) {
                const allDeleteKeys = core.getAllSubTopicKeys(model, topicKey);
                allDeleteKeys.push(topicKey);
                let extData = docModel.getExtDataItem(EXT_DATA_KEY_TOPIC_REFERENCE, ExtDataReference);
                let reference = extData.reference;
                // 注意这里要处理所有被删除的Key
                allDeleteKeys.forEach((deleteKey) => {
                    const referencedKeys = extData.getReferencedKeys(deleteKey);
                    // 处理被引用的部分
                    reference = reference.withMutations(reference => {
                        referencedKeys.forEach(v => {
                            reference.updateIn([v, 'keyList'], (keyList) => keyList.delete(keyList.indexOf(deleteKey)));
                        });
                    });
                    // 处理引用的部分
                    if (reference.has(deleteKey)) {
                        reference = reference.delete(deleteKey);
                    }
                });
                extData = extData.set('reference', reference);
                docModel = docModel.setIn(['extData', EXT_DATA_KEY_TOPIC_REFERENCE], extData);
            }
            return docModel;
        },
        renderSheetCustomize(props, next) {
            const { model, controller } = props;
            const zIndex = controller.getValue(rendererReact.PropKey.DIAGRAM_CUSTOMIZE_BASE_Z_INDEX) + 2;
            const res = next();
            if (model.focusMode === FOCUS_MODE_SET_REFERENCE_TOPICS) {
                const panelProps = {
                    ...props,
                    zIndex,
                    topicKey: model.focusKey,
                    key: 'AddReferenceTopicPanel'
                };
                res.push(React.createElement(AddReferenceTopicPanel, Object.assign({}, panelProps)));
            }
            return res;
        },
        renderTopicNodeLastRowOthers(props, next) {
            const { model, topicKey, controller } = props;
            const res = next();
            res.push(controller.run('renderTopicExtReference', {
                ...props,
                key: EXT_KEY_TOPIC_REFERENCE + '-icon'
            }));
            if (model.focusMode === FOCUS_MODE_SET_REFERENCE_TOPICS &&
                model.focusKey !== topicKey) {
                const checkBoxProps = { ...props, key: 'checkbox', selectedTopicKeys };
                const checkbox = React.createElement(TopicReferenceCheckbox, Object.assign({}, checkBoxProps));
                res.push(checkbox);
            }
            return res;
        },
        renderTopicExtReference(props, next) {
            return React.createElement(TopicExtReference, Object.assign({}, props));
        },
        clearSelectedReferenceKeys() {
            selectedTopicKeys.clear();
        },
        getSelectedReferenceKeys() {
            return Array.from(selectedTopicKeys);
        },
        //TODO
        deserializeExtDataItem(props, next) {
            const { extDataKey, extDataItem } = props;
            if (extDataKey === EXT_DATA_KEY_TOPIC_REFERENCE) {
                let extDataReference = new ExtDataReference();
                for (const key in extDataItem.reference) {
                    const item = extDataItem.reference[key];
                    const referenceRecord = new ReferenceRecord({
                        keyList: immutable.List(item.keyList),
                        dataMap: immutable.Map(item.dataMap)
                    });
                    extDataReference = extDataReference.update('reference', reference => reference.set(key, referenceRecord));
                }
                return extDataReference;
            }
            return next();
        }
    };
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var classnames = createCommonjsModule(function (module) {
/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg) && arg.length) {
				var inner = classNames.apply(null, arg);
				if (inner) {
					classes.push(inner);
				}
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if ( module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else {
		window.classNames = classNames;
	}
}());
});

function TopicTitleThumbnail(props) {
    const { controller, topicKey, sheetId, query, active, usePlainText = true, titleMaxLength = 100, ...restProps } = props;
    const navigateToTopic = e => {
        controller.run('focusTopicAndMoveToCenter', {
            ...props,
            topicKey,
            sheetId
        });
    };
    const topicTitle = controller.getValue(rendererReact.PropKey.TOPIC_TITLE, {
        ...props,
        usePlainText
    });
    // const needTip = topicTitle.length > titleMaxLength;
    // const title = needTip
    //   ? topicTitle.substr(0, titleMaxLength) + '...'
    //   : topicTitle;
    const titleProps = {
        // ...restProps,
        key: topicKey,
        className: classnames('bm-topic-title-thumbnail', {
            'bm-topic-title-thumbnail-active': active
        }),
        onClick: navigateToTopic
    };
    return (React.createElement("div", Object.assign({}, titleProps), query
        ? Highlighter({ searchWords: [query], textToHighlight: topicTitle })
        : topicTitle));
}

const HOT_KEY_NAME_SEARCH = 'DEFAULT_SEARCH';
const FOCUS_MODE_SEARCH = 'FOCUS_MODE_SEARCH';
const SEARCH_QUERY_TEMP_VALUE_KEY = 'SEARCH_QUERY';

const NavOmniBar = select.Omnibar.ofType();
const StyledNavOmniBar = styled(NavOmniBar) `
  top: 20%;
  left: 25% !important;
  width: 50% !important;
`;
function SearchPanel(props) {
    const { docModel, controller } = props;
    const query = controller.run('getTempValue', {
        key: SEARCH_QUERY_TEMP_VALUE_KEY
    });
    const inputProps = {
        placeholder: rendererReact.getI18nText(props, rendererReact.I18nKey.SEARCH)
    };
    const onClose = () => {
        controller.run('operation', {
            ...props,
            opType: core.OpType.SET_FOCUS_MODE,
            focusMode: core.FocusMode.NORMAL
        });
    };
    const getAllSections = () => {
        const res = [];
        docModel.sheetModels.forEach(model => {
            model.topics.forEach((topic, topicKey) => {
                res.push({
                    topicKey,
                    sheetId: model.id
                });
            });
        });
        return res;
    };
    const renderItem = (section, { handleClick, modifiers, query }) => {
        const { topicKey } = section;
        const thumbnailProps = {
            ...props,
            ...section,
            active: modifiers.active,
            //@ts-ignore
            onClick: handleClick,
            query: controller.run('getTempValue', {
                key: SEARCH_QUERY_TEMP_VALUE_KEY
            })
        };
        return React.createElement(TopicTitleThumbnail, Object.assign({ key: topicKey }, thumbnailProps));
    };
    const itemListPredicate = (query, items) => {
        controller.run('setTempValue', {
            key: SEARCH_QUERY_TEMP_VALUE_KEY,
            value: query
        });
        return items.filter(item => {
            const topicTitle = controller.getValue(rendererReact.PropKey.TOPIC_TITLE, {
                ...props,
                ...item
            });
            if (topicTitle.trim() === '') {
                return false;
            }
            return topicTitle.toLowerCase().includes(query.toLowerCase());
        });
    };
    const items = getAllSections();
    const onItemSelect = (section) => {
        controller.run('focusTopicAndMoveToCenter', {
            ...props,
            ...section
        });
    };
    const omniBarProps = {
        query,
        inputProps,
        itemListPredicate,
        isOpen: true,
        items: items,
        itemRenderer: renderItem,
        onItemSelect,
        onClose,
        resetOnSelect: true
    };
    return React.createElement(StyledNavOmniBar, Object.assign({}, omniBarProps));
}

function ToolbarItemSearch(props) {
    const onClickSearch = e => {
        const { controller } = props;
        controller.run('operation', {
            ...props,
            opType: core.OpType.SET_FOCUS_MODE,
            focusMode: FOCUS_MODE_SEARCH
        });
    };
    return (React.createElement(rendererReact.ToolbarItem, Object.assign({ iconName: rendererReact.IconName.SEARCH, iconCxName: "search", onClick: onClickSearch }, props)));
}

function SearchPlugin() {
    return {
        customizeHotKeys(props, next) {
            const { controller } = props;
            const model = controller.model;
            const hotKeys = next();
            hotKeys.globalHotKeys.set(HOT_KEY_NAME_SEARCH, {
                label: 'search',
                combo: 'mod + f',
                allowInInput: true,
                onKeyDown: () => {
                    controller.run('operation', {
                        ...props,
                        opType: core.OpType.FOCUS_TOPIC,
                        topicKey: model.focusKey,
                        focusMode: FOCUS_MODE_SEARCH
                    });
                }
            });
            return hotKeys;
        },
        customizeToolbar(props, next) {
            const res = next();
            res.push({
                order: 300,
                element: ToolbarItemSearch
            });
            return res;
        },
        renderDiagramCustomize(props, next) {
            const res = next();
            const { controller } = props;
            const model = controller.model;
            if (model.focusMode === FOCUS_MODE_SEARCH) {
                const searchPanelProps = {
                    key: 'search-panel',
                    ...props
                };
                res.push(React.createElement(SearchPanel, Object.assign({}, searchPanelProps)));
            }
            return res;
        }
    };
}

function ToolbarItemOpenFile(props) {
    const onClickOpenFile = () => {
        const { controller } = props;
        rendererReact.browserOpenFile('.json,.blinkmind,.bm').then(txt => {
            const obj = JSON.parse(txt);
            const newDocModel = controller.run('deserializeDocModel', {
                controller,
                obj
            });
            controller.run('openNewDocModel', { ...props, newDocModel });
        });
    };
    return (React.createElement(rendererReact.ToolbarItem, Object.assign({ iconName: rendererReact.IconName.OPEN_FILE, onClick: onClickOpenFile }, props)));
}

function OpenFilePlugin() {
    return {
        customizeToolbar(props, next) {
            const res = next();
            res.push({
                order: 10,
                element: ToolbarItemOpenFile
            });
            return res;
        }
    };
}

function ToolbarItemExport(props) {
    const [showDialog, setShowDialog] = React.useState(false);
    const onClickExport = () => {
        const { controller } = props;
        const json = controller.run('serializeDocModel', props);
        const jsonStr = JSON.stringify(json, null, 2);
        const url = `data:text/plain,${encodeURIComponent(jsonStr)}`;
        rendererReact.browserDownloadFile(url, 'example.json');
        setShowDialog(false);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(rendererReact.ToolbarItem, Object.assign({ iconName: rendererReact.IconName.EXPORT, onClick: () => setShowDialog(true) }, props)),
        React.createElement(core$1.Dialog, { onClose: () => {
                setShowDialog(false);
            }, isOpen: showDialog, autoFocus: true, enforceFocus: true, usePortal: true, title: "Please select export file format" },
            React.createElement(core$1.Menu, null,
                React.createElement(core$1.MenuItem, { text: "JSON(.json)", onClick: onClickExport }),
                React.createElement(core$1.MenuDivider, null)))));
}

function ExportFilePlugin() {
    return {
        customizeToolbar(props, next) {
            const res = next();
            res.push({
                order: 20,
                element: ToolbarItemExport
            });
            return res;
        }
    };
}

function ToolbarGroupItemUndoRedo(props) {
    const { controller } = props;
    const onClickUndo = () => {
        controller.run('undo', props);
    };
    const onClickRedo = () => {
        controller.run('redo', props);
    };
    const canUndo = controller.run('canUndo', props);
    const canRedo = controller.run('canRedo', props);
    const undoProps = {
        ...props,
        key: 'undo',
        iconName: rendererReact.IconName.UNDO,
        disabled: !canUndo,
        onClick: onClickUndo
    };
    const redoProps = {
        ...props,
        key: 'redo',
        iconName: rendererReact.IconName.REDO,
        disabled: !canRedo,
        onClick: onClickRedo
    };
    return React.createElement(rendererReact.ToolbarGroupItem, { items: [undoProps, redoProps] });
}
function ToolbarItemUndo(props) {
    const { controller } = props;
    const onClickUndo = () => {
        controller.run('undo', props);
    };
    const canUndo = controller.run('canUndo', props);
    return (React.createElement(rendererReact.ToolbarItem, Object.assign({ iconName: rendererReact.IconName.UNDO, disabled: !canUndo, onClick: onClickUndo }, props)));
}
function ToolbarItemRedo(props) {
    const { controller } = props;
    const onClickRedo = () => {
        controller.run('redo', props);
    };
    const canUndo = controller.run('canRedo', props);
    return (React.createElement(rendererReact.ToolbarItem, Object.assign({ iconName: rendererReact.IconName.REDO, disabled: !canUndo, onClick: onClickRedo }, props)));
}
function UndoRedoPlugin() {
    return {
        customizeToolbar(props, next) {
            const res = next();
            res.push({
                order: 200,
                element: ToolbarItemUndo
            }, {
                order: 210,
                element: ToolbarItemRedo
            });
            return res;
        }
    };
}

const defaultTagRecord = {
    name: null,
    style: null,
    topicKeys: immutable.List()
};
class TagRecord extends immutable.Record(defaultTagRecord) {
    get name() {
        return this.get('name');
    }
    get style() {
        return this.get('style');
    }
    get topicKeys() {
        return this.get('topicKeys');
    }
}
const defaultExtDataTagsRecord = {
    tags: immutable.Map()
};
class ExtDataTags extends immutable.Record(defaultExtDataTagsRecord) {
    get tags() {
        return this.get('tags');
    }
    getTopicTags(topicKey) {
        const res = [];
        this.tags.forEach(v => {
            v.topicKeys.includes(topicKey) && res.push(v);
        });
        return res;
    }
}

const OP_TYPE_ADD_TAG = 'OP_TYPE_ADD_TAG';
const OP_TYPE_DELETE_TAG = 'OP_TYPE_DELETE_TAG';
const OP_TYPE_UPDATE_TAG = 'OP_TYPE_UPDATE_TAG';
const OP_TYPE_ADD_TOPIC_TAG = 'OP_TYPE_ADD_TOPIC_TAG';
const OP_TYPE_REMOVE_TOPIC_TAG = 'OP_TYPE_REMOVE_TOPIC_TAG';
const TAG_NAME_MAX_LEN = 50;
const EXT_DATA_KEY_TAGS = 'TAGS';
const EXT_KEY_TAGS = 'EXT_KEY_TAGS';

function AddTagWidget(props) {
    const [tagName, setTagName] = React.useState('');
    const [background, setBackground] = React.useState('grey');
    const [color, setColor] = React.useState('black');
    const [showAlert, setShowAlert] = React.useState(false);
    const [alertTitle, setAlertTitle] = React.useState('');
    const { controller, docModel } = props;
    const handleTagNameChange = e => {
        setTagName(e.target.value);
    };
    const nameProps = {
        title: rendererReact.getI18nText(props, rendererReact.I18nKey.TAG_NAME) + ':',
        value: tagName,
        onChange: handleTagNameChange,
        style: {
            width: 100
        }
    };
    const nameItem = React.createElement(rendererReact.SettingItemInput, Object.assign({}, nameProps));
    const bgColorProps = {
        title: rendererReact.getI18nText(props, rendererReact.I18nKey.BACKGROUND) + ':',
        color: background,
        handleColorChange: color => {
            setBackground(color);
        }
    };
    const bgColorItem = React.createElement(rendererReact.SettingItemColorPicker, Object.assign({}, bgColorProps));
    const colorProps = {
        title: rendererReact.getI18nText(props, rendererReact.I18nKey.COLOR) + ':',
        color: color,
        handleColorChange: color => {
            setColor(color);
        }
    };
    const colorItem = React.createElement(rendererReact.SettingItemColorPicker, Object.assign({}, colorProps));
    const extData = docModel.getExtDataItem(EXT_DATA_KEY_TAGS, ExtDataTags);
    const disabled = extData.tags.has(tagName) || tagName.trim() === '';
    const getTagStyle = () => {
        const style = {
            backgroundColor: background,
            color
        };
        return JSON.stringify(style);
    };
    const addTagBtnProps = {
        title: rendererReact.getI18nText(props, rendererReact.I18nKey.ADD_TAG),
        disabled,
        onClick: () => {
            if (tagName.trim().length > TAG_NAME_MAX_LEN) {
                setShowAlert(true);
                setAlertTitle(rendererReact.getI18nText(props, rendererReact.I18nKey.TAG_NAME_OVER_MAX_TIP));
                return;
            }
            const tag = new TagRecord({
                name: tagName.trim(),
                style: getTagStyle()
            });
            controller.run('operation', {
                ...props,
                opType: OP_TYPE_ADD_TAG,
                tag
            });
        }
    };
    const alertProps = {
        isOpen: showAlert,
        onClose: e => {
            setShowAlert(false);
        }
    };
    const alert = showAlert && (React.createElement(core$1.Alert, Object.assign({}, alertProps),
        React.createElement("p", null, alertTitle)));
    const addTagBtn = React.createElement(rendererReact.SettingItemButton, Object.assign({}, addTagBtnProps));
    return (React.createElement(rendererReact.SettingRow, null,
        nameItem,
        bgColorItem,
        colorItem,
        addTagBtn,
        alert));
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

const StyledTag = styled(core$1.Tag) `
  margin: 0 10px 0 0;
`;

function TagTopicList(props) {
    const { docModel, tag } = props;
    const topicList = tag.topicKeys.map(topicKey => {
        const sheetId = docModel.getSheetIdThatContainsTopic(topicKey);
        const thumbnailProps = {
            ...props,
            sheetId,
            topicKey
        };
        return React.createElement(TopicTitleThumbnail, Object.assign({ key: topicKey }, thumbnailProps));
    });
    return (React.createElement(React.Fragment, null,
        React.createElement(rendererReact.SettingTitle, null, rendererReact.getI18nText(props, rendererReact.I18nKey.TOPICS_THAT_USE_THIS_TAG)),
        React.createElement(rendererReact.SettingBoxContainer, { style: { width: '500px' } },
            React.createElement(rendererReact.VListContainer, null, topicList))));
}

function UpdateTagWidget(props) {
    const { controller, docModel, tag } = props;
    const style = JSON.parse(tag.style);
    const [tagName, setTagName] = React.useState(tag.name);
    const [background, setBackground] = React.useState(style.backgroundColor);
    const [color, setColor] = React.useState(style.color);
    const handleTagNameChange = e => {
        setTagName(e.target.value);
    };
    const nameProps = {
        title: rendererReact.getI18nText(props, rendererReact.I18nKey.TAG_NAME) + ':',
        value: tagName,
        onChange: handleTagNameChange,
        style: {
            width: 100
        }
    };
    const nameItem = React.createElement(rendererReact.SettingItemInput, Object.assign({}, nameProps));
    const bgColorProps = {
        title: rendererReact.getI18nText(props, rendererReact.I18nKey.BACKGROUND) + ':',
        color: background,
        handleColorChange: color => {
            setBackground(color);
        }
    };
    const bgColorItem = React.createElement(rendererReact.SettingItemColorPicker, Object.assign({}, bgColorProps));
    const colorProps = {
        title: rendererReact.getI18nText(props, rendererReact.I18nKey.COLOR) + ':',
        color: color,
        handleColorChange: color => {
            setColor(color);
        }
    };
    const colorItem = React.createElement(rendererReact.SettingItemColorPicker, Object.assign({}, colorProps));
    const extData = docModel.getExtDataItem(EXT_DATA_KEY_TAGS, ExtDataTags);
    const trimTagName = tagName.trim();
    const disabled = (extData.tags.has(trimTagName) && trimTagName !== tag.name) ||
        trimTagName === '' ||
        trimTagName.length > TAG_NAME_MAX_LEN;
    const getTagStyle = () => {
        const style = {
            backgroundColor: background,
            color
        };
        return JSON.stringify(style);
    };
    const btnProps = {
        title: rendererReact.getI18nText(props, rendererReact.I18nKey.UPDATE_TAG),
        disabled,
        onClick: () => {
            const newTag = new TagRecord({
                name: trimTagName,
                style: getTagStyle(),
                topicKeys: tag.topicKeys
            });
            controller.run('operation', {
                ...props,
                opType: OP_TYPE_UPDATE_TAG,
                oldTagName: tag.name,
                newTag: newTag
            });
        }
    };
    const btn = React.createElement(rendererReact.SettingItemButton, Object.assign({}, btnProps));
    return (React.createElement(rendererReact.SettingRow, null,
        nameItem,
        bgColorItem,
        colorItem,
        btn));
}

let TagWidget = class TagWidget extends React.PureComponent {
    constructor(props) {
        super(props);
        this.onClickUpdateTag = e => { };
        this.handleClick = e => {
            const { onClick, tag, clickToUpdate } = this.props;
            onClick && onClick(tag)(e);
            if (clickToUpdate) {
                const contextMenu = (React.createElement(core$1.Menu, null,
                    React.createElement(UpdateTagWidget, Object.assign({}, this.props)),
                    React.createElement(core$1.Divider, null),
                    React.createElement(TagTopicList, Object.assign({}, this.props))));
                core$1.ContextMenu.show(contextMenu, { left: e.clientX, top: e.clientY });
            }
        };
    }
    renderContextMenu() {
        const props = this.props;
        return props.isTopicTag ? null : (React.createElement(core$1.Menu, null,
            React.createElement(UpdateTagWidget, Object.assign({}, props)),
            React.createElement(core$1.Divider, null),
            React.createElement(TagTopicList, Object.assign({}, props))));
    }
    render() {
        const { tag, large = true, onRemove } = this.props;
        const tagProps = {
            key: tag.name,
            style: JSON.parse(tag.style),
            // onClick: onClick ? onClick(tag) : null,
            onClick: this.handleClick,
            onRemove: onRemove ? onRemove(tag) : null,
            interactive: true,
            large
        };
        return React.createElement(StyledTag, Object.assign({}, tagProps), tag.name);
    }
};
TagWidget = __decorate([
    core$1.ContextMenuTarget
], TagWidget);
const TagWidgetWrapper = styled.div `
  display: inline-block;
  margin-bottom: 10px;
`;
function StyledTagWidget(props) {
    return (React.createElement(TagWidgetWrapper, null,
        React.createElement(TagWidget, Object.assign({}, props))));
}

let currentTag;
function AllTagsWidget(props) {
    const [showAlert, setShowAlert] = React.useState(false);
    const { controller, docModel } = props;
    const extData = docModel.getExtDataItem(EXT_DATA_KEY_TAGS, ExtDataTags);
    if (extData.tags.size === 0)
        return null;
    const tags = extData.tags.toArray().map(([name, tag]) => {
        const tagProps = {
            ...props,
            key: name,
            clickToUpdate: true,
            tag,
            onClick: tag => e => {
                currentTag = tag;
            },
            onRemove: tag => e => {
                currentTag = tag;
                setShowAlert(true);
            }
        };
        return React.createElement(StyledTagWidget, Object.assign({}, tagProps));
    });
    const alertProps = {
        ...props,
        isOpen: showAlert,
        content: rendererReact.getI18nText(props, rendererReact.I18nKey.DELETE_TAG_TIP),
        onConfirm: e => {
            controller.run('operation', {
                ...props,
                opType: OP_TYPE_DELETE_TAG,
                tagName: currentTag.name
            });
            currentTag = null;
            setShowAlert(false);
        },
        onCancel: e => {
            setShowAlert(false);
        }
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(rendererReact.SettingBoxContainer, null, tags),
        React.createElement(rendererReact.Alert, Object.assign({}, alertProps))));
}

function TopicTagsWidget(props) {
    const { controller } = props;
    const topicTags = controller.run('getTopicTags', props);
    const tagsCanBeAdded = controller.run('getTopicTagsCanBeAdded', props);
    const topicTagsWidget = topicTags.map(tag => {
        const tagProps = {
            ...props,
            isTopicTag: true,
            tag,
            onRemove: (tag) => e => {
                controller.run('operation', {
                    ...props,
                    opType: OP_TYPE_REMOVE_TOPIC_TAG,
                    tagName: tag.name
                });
            }
        };
        return React.createElement(StyledTagWidget, Object.assign({ key: tag.name }, tagProps));
    });
    const tagsCanBeAddedWidget = tagsCanBeAdded.map(tag => {
        const tagProps = {
            ...props,
            isTopicTag: true,
            tag,
            onClick: (tag) => e => {
                controller.run('operation', {
                    ...props,
                    opType: OP_TYPE_ADD_TOPIC_TAG,
                    tagName: tag.name
                });
            }
        };
        return React.createElement(StyledTagWidget, Object.assign({ key: tag.name }, tagProps));
    });
    return (React.createElement(React.Fragment, null,
        React.createElement(rendererReact.SettingGroup, null,
            React.createElement(rendererReact.SettingTitle, null, rendererReact.getI18nText(props, rendererReact.I18nKey.ALREADY_ADDED)),
            React.createElement(rendererReact.SettingBoxContainer, null, topicTagsWidget)),
        React.createElement(rendererReact.SettingGroup, null,
            React.createElement(rendererReact.SettingTitle, null, rendererReact.getI18nText(props, rendererReact.I18nKey.CAN_BE_ADDED)),
            React.createElement(rendererReact.SettingBoxContainer, null, tagsCanBeAddedWidget))));
}

function TagEditor(props) {
    return (React.createElement(rendererReact.PanelTabRoot, null,
        React.createElement(rendererReact.SettingBoxContainer, null,
            React.createElement(rendererReact.SettingTitle, null, rendererReact.getI18nText(props, rendererReact.I18nKey.TAGS_MANAGER)),
            React.createElement(AddTagWidget, Object.assign({}, props)),
            React.createElement(AllTagsWidget, Object.assign({}, props))),
        React.createElement(rendererReact.SettingBoxContainer, null,
            React.createElement(TopicTagsWidget, Object.assign({}, props)))));
}

function addNewTag({ docModel, tag }) {
    let extData = docModel.getExtDataItem(EXT_DATA_KEY_TAGS, ExtDataTags);
    if (extData.tags.has(tag.name)) {
        return docModel;
    }
    extData = extData.update('tags', tags => tags.set(tag.name, tag));
    docModel = docModel.setIn(['extData', EXT_DATA_KEY_TAGS], extData);
    return docModel;
}
function deleteTag({ docModel, tagName }) {
    let extData = docModel.getExtDataItem(EXT_DATA_KEY_TAGS, ExtDataTags);
    if (!extData.tags.has(tagName)) {
        return docModel;
    }
    extData = extData.update('tags', tags => tags.delete(tagName));
    docModel = docModel.setIn(['extData', EXT_DATA_KEY_TAGS], extData);
    return docModel;
}
function updateTag({ docModel, oldTagName, newTag }) {
    let extData = docModel.getExtDataItem(EXT_DATA_KEY_TAGS, ExtDataTags);
    extData = extData.update('tags', tags => tags.delete(oldTagName).set(newTag.name, newTag));
    docModel = docModel.setIn(['extData', EXT_DATA_KEY_TAGS], extData);
    return docModel;
}
function addTopicTag({ docModel, topicKey, tagName }) {
    let extData = docModel.getExtDataItem(EXT_DATA_KEY_TAGS, ExtDataTags);
    extData = extData.updateIn(['tags', tagName, 'topicKeys'], (topicKeys) => 
    // @ts-ignore
    topicKeys.push(topicKey));
    docModel = docModel.setIn(['extData', EXT_DATA_KEY_TAGS], extData);
    return docModel;
}
function removeTopicTag({ docModel, topicKey, tagName }) {
    let extData = docModel.getExtDataItem(EXT_DATA_KEY_TAGS, ExtDataTags);
    extData = extData.updateIn(['tags', tagName, 'topicKeys'], (topicKeys) => 
    // @ts-ignore
    topicKeys.delete(topicKeys.indexOf(topicKey)));
    docModel = docModel.setIn(['extData', EXT_DATA_KEY_TAGS], extData);
    return docModel;
}

function TagsPlugin() {
    const tabId = 'tags-editor';
    return {
        componentAreEqual(ctx, next) {
            const { docModel } = ctx.prevProps;
            const { docModel: nDocModel, topicKey } = ctx.nextProps;
            const extData = docModel.extData.get(EXT_DATA_KEY_TAGS);
            const nExtData = nDocModel.extData.get(EXT_DATA_KEY_TAGS);
            if (extData !== nExtData) {
                // console.log('extData !== nExtData');
                if (extData && extData.getTopicTags(topicKey).length) {
                    return false;
                }
                if (nExtData && nExtData.getTopicTags(topicKey).length) {
                    return false;
                }
            }
            return next();
        },
        renderRightTopPanelTabs(props, next) {
            const res = next();
            const tProps = {
                id: tabId,
                key: tabId,
                title: rendererReact.getI18nText(props, rendererReact.I18nKey.TAGS),
                panel: React.createElement(TagEditor, Object.assign({}, props))
            };
            const tab = React.createElement(core$1.Tab, Object.assign({}, tProps));
            res.push(tab);
            return res;
        },
        getOpMap(props, next) {
            const opMap = next();
            opMap.set(OP_TYPE_ADD_TAG, addNewTag);
            opMap.set(OP_TYPE_DELETE_TAG, deleteTag);
            opMap.set(OP_TYPE_UPDATE_TAG, updateTag);
            opMap.set(OP_TYPE_ADD_TOPIC_TAG, addTopicTag);
            opMap.set(OP_TYPE_REMOVE_TOPIC_TAG, removeTopicTag);
            return opMap;
        },
        topicExtDataToJson(ctx, next) {
            const { docModel, topicKey } = ctx;
            const res = next();
            const extData = docModel.getExtDataItem(EXT_DATA_KEY_TAGS, ExtDataTags);
            const tags = [];
            extData.tags.forEach((v, k) => {
                if (v.topicKeys.includes(topicKey)) {
                    tags.push({
                        name: v.name,
                        style: v.style
                    });
                }
            });
            res[EXT_DATA_KEY_TAGS] = tags;
            return res;
        },
        processTopicExtData(ctx, next) {
            let extData = next();
            let { topic } = ctx;
            if (topic.extData[EXT_DATA_KEY_TAGS]) {
                if (!extData.has(EXT_DATA_KEY_TAGS)) {
                    let extDataTags = new ExtDataTags();
                    extData = extData.set(EXT_DATA_KEY_TAGS, extDataTags);
                }
                let list = immutable.List();
                for (let tag of topic.extData[EXT_DATA_KEY_TAGS]) {
                    extData = extData.updateIn([EXT_DATA_KEY_TAGS, 'tags'], tags => {
                        return tags.has(tag.name)
                            ? tags.updateIn([tag.name, 'topicKeys'], topicKeys => topicKeys.push(topic.key))
                            : tags.set(tag.name, new TagRecord({
                                name: tag.name,
                                style: tag.style,
                                topicKeys: immutable.List([topic.key])
                            }));
                    });
                }
            }
            return extData;
        },
        renderTopicNodeLastRowOthers(props, next) {
            const { controller } = props;
            const res = next();
            res.push(controller.run('renderTopicExtTag', {
                ...props,
                key: EXT_KEY_TAGS
            }));
            return res;
        },
        renderTopicExtTag(props) {
            const { controller, diagramState, setDiagramState } = props;
            const tags = controller.run('getTopicTags', props);
            const tagsWidget = tags.map(tag => {
                const tagProps = {
                    ...props,
                    key: tag.name,
                    clickToUpdate: true,
                    onClick: () => e => {
                        setDiagramState({
                            rightTopPanel: {
                                ...diagramState.rightTopPanel,
                                isOpen: true,
                                selectedTabId: tabId
                            }
                        });
                        controller.run('setRightTopPanelProps', {
                            ...props,
                            value: {
                                isOpen: true,
                                selectedTabId: tabId
                            }
                        });
                    },
                    isTopicTag: true,
                    large: false,
                    tag
                };
                return React.createElement(TagWidget, Object.assign({}, tagProps));
            });
            return tagsWidget;
        },
        //TODO
        deserializeExtDataItem(props, next) {
            const { extDataKey, extDataItem } = props;
            if (extDataKey === EXT_DATA_KEY_TAGS) {
                let extDataTags = new ExtDataTags();
                for (const key in extDataItem.tags) {
                    const item = extDataItem.tags[key];
                    const { name, style, topicKeys } = item;
                    const record = new TagRecord({
                        name,
                        style,
                        topicKeys: immutable.List(topicKeys)
                    });
                    extDataTags = extDataTags.update('tags', tags => tags.set(key, record));
                }
                return extDataTags;
            }
            return next();
        },
        getTopicTags(props) {
            const { docModel, topicKey } = props;
            const extData = docModel.getExtDataItem(EXT_DATA_KEY_TAGS, ExtDataTags);
            const res = [];
            extData.tags.forEach(v => {
                if (v.topicKeys.includes(topicKey)) {
                    res.push(v);
                }
            });
            return res;
        },
        getTopicTagsCanBeAdded(props) {
            const { docModel, topicKey } = props;
            const extData = docModel.getExtDataItem(EXT_DATA_KEY_TAGS, ExtDataTags);
            const res = [];
            extData.tags.forEach(v => {
                if (!v.topicKeys.includes(topicKey)) {
                    res.push(v);
                }
            });
            return res;
        }
    };
}

const darkTheme1 = {
    name: 'dark-theme1',
    randomColor: false,
    background: '#2f2f2f',
    highlightColor: '#C31004',
    marginH: 50,
    marginV: 5,
    contentStyle: {
        lineHeight: '1'
    },
    linkStyle: {
        lineRadius: 5,
        lineWidth: '2px',
        lineColor: '#595959',
        lineType: 'curve'
    },
    rootTopic: {
        contentStyle: {
            background: '#C31004',
            color: '#fff',
            fontSize: '34px',
            borderRadius: '5px',
            padding: '16px 18px 16px 18px'
        },
        subLinkStyle: {
            lineType: 'curve'
        }
    },
    primaryTopic: {
        contentStyle: {
            background: 'rgba(100,100,100,1)',
            borderRadius: '5px',
            color: '#fff',
            fontSize: '14px',
            padding: '6px 10px 5px 10px'
        },
        subLinkStyle: {
            hasUnderline: true,
            lineType: 'round'
        }
    },
    normalTopic: {
        contentStyle: {
            borderRadius: '5px',
            background: '#fff0',
            color: '#fff',
            fontSize: '13px',
            padding: '1px'
        },
        subLinkStyle: {
            hasUnderline: true,
            lineType: 'round'
        }
    }
};

const themeRandomColorSquare = {
    name: 'random-color-square',
    randomColor: true,
    background: 'rgb(57,60,65)',
    highlightColor: '#50C9CE',
    marginH: 60,
    marginV: 20,
    contentStyle: {
        lineHeight: '1.5',
        fontSize: '16px'
    },
    linkStyle: {
        lineRadius: 5,
        lineType: 'curve',
        lineWidth: '3px'
    },
    rootTopic: {
        contentStyle: {
            fontSize: '36px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '3px'
        }
    },
    primaryTopic: {
        contentStyle: {
            fontSize: '24px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '3px'
        }
    },
    normalTopic: {
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '3px'
        }
    }
};

const themeRandomColorRound = {
    name: 'random-color-round',
    randomColor: true,
    background: 'rgb(57,60,65)',
    highlightColor: '#50C9CE',
    marginH: 60,
    marginV: 20,
    contentStyle: {
        lineHeight: '1.5',
        color: '#262626'
    },
    linkStyle: {
        lineRadius: 5,
        lineType: 'curve',
        lineWidth: '3px'
    },
    rootTopic: {
        contentStyle: {
            fontSize: '34px',
            borderRadius: '35px',
            padding: '5px 10px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '3px',
            lineColor: 'rgb(113, 203, 45)'
        }
    },
    primaryTopic: {
        contentStyle: {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '10px',
            fontSize: '20px',
            padding: '0px 5px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '2px',
            lineColor: 'rgb(113, 203, 45)'
        }
    },
    normalTopic: {
        contentStyle: {
            borderRadius: '10px',
            fontSize: '13px',
            padding: '0'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '2px',
            lineColor: 'white'
        }
    }
};

const theme1 = {
    name: 'theme1',
    randomColor: false,
    background: 'rgb(250,245,205)',
    highlightColor: '#50C9CE',
    marginH: 50,
    marginV: 5,
    contentStyle: {
        lineHeight: '1.5'
    },
    linkStyle: {
        lineRadius: 5,
        lineType: 'curve'
    },
    rootTopic: {
        contentStyle: {
            background: 'rgb(221, 170, 68)',
            color: '#fff',
            fontSize: '34px',
            borderRadius: '5px',
            padding: '16px 18px 16px 18px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '2px',
            lineColor: 'rgb(221, 170, 68)'
        }
    },
    primaryTopic: {
        contentStyle: {
            background: '#e8eaec',
            color: '#333',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: 'rgb(221, 170, 68)',
            borderRadius: '5px',
            fontSize: '17px',
            padding: '0px 5px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '2px',
            lineColor: 'rgb(221, 170, 68)'
        }
    },
    normalTopic: {
        contentStyle: {
            background: '#fff',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#e8eaec',
            borderRadius: '20px',
            color: 'rgb(187, 136, 34)',
            fontSize: '13px',
            padding: '0'
        },
        subLinkStyle: {
            lineType: 'round',
            lineRadius: 5,
            lineWidth: '1px',
            lineColor: 'rgb(187, 136, 34)'
        }
    }
};

const theme2 = {
    name: 'theme2',
    randomColor: false,
    background: '#F3E1E1',
    highlightColor: '#F5A623',
    marginH: 45,
    marginV: 10,
    contentStyle: {
        lineHeight: '1.5'
    },
    linkStyle: {
        lineRadius: 5,
        lineType: 'curve'
    },
    rootTopic: {
        contentStyle: {
            background: '#50C18A',
            color: '#fff',
            fontSize: '34px',
            borderRadius: '5px',
            padding: '16px 18px 16px 18px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '2px',
            lineColor: '#43a9ff'
        }
    },
    primaryTopic: {
        contentStyle: {
            background: '#ffffff',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgb(221, 170, 68)',
            borderRadius: '5px',
            color: 'rgb(103,103,103)',
            fontSize: '18px',
            padding: '5px'
        },
        subLinkStyle: {
            lineType: 'round',
            lineRadius: 5,
            lineWidth: '2px',
            lineColor: '#43a9ff'
        }
    },
    normalTopic: {
        contentStyle: {
            background: '#fff',
            borderRadius: '5px',
            color: 'rgb(103,103,103)',
            fontSize: '13px',
            padding: '0',
            boxShadow: '1px 1px 1px #ccc'
        },
        subLinkStyle: {
            lineType: 'round',
            lineRadius: 5,
            lineWidth: '1px',
            lineColor: '#43a9ff'
        }
    }
};

const theme3 = {
    name: 'theme3',
    randomColor: false,
    background: '#A9DEF9',
    highlightColor: '#9013FE',
    marginH: 50,
    marginV: 20,
    contentStyle: {
        lineHeight: '1.5'
    },
    linkStyle: {
        lineRadius: 5,
        lineType: 'curve'
    },
    rootTopic: {
        contentStyle: {
            background: '#FF99C8',
            color: '#fff',
            fontSize: '34px',
            borderRadius: '5px',
            padding: '16px 18px 16px 18px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '2px',
            lineColor: '#43a9ff'
        }
    },
    primaryTopic: {
        contentStyle: {
            background: '#FCF6BD',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#E4C1F9',
            borderRadius: '5px',
            color: 'rgb(103,103,103)',
            fontSize: '18px',
            padding: '5px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '2px',
            lineColor: '#43a9ff'
        }
    },
    normalTopic: {
        contentStyle: {
            background: '#E4FDE1',
            borderRadius: '5px',
            color: 'rgb(103,103,103)',
            fontSize: '13px',
            padding: '0px',
            boxShadow: '1px 1px 1px #ccc'
        },
        subLinkStyle: {
            lineType: 'round',
            lineRadius: 5,
            lineWidth: '1px',
            lineColor: '#43a9ff'
        }
    }
};

const theme4 = {
    name: 'theme3',
    randomColor: false,
    background: '#CCFBFE',
    highlightColor: '#D0021B',
    marginH: 50,
    marginV: 20,
    contentStyle: {
        lineHeight: '1.5'
    },
    linkStyle: {
        lineRadius: 5,
        lineType: 'curve'
    },
    rootTopic: {
        contentStyle: {
            background: '#CD8987',
            color: '#fff',
            fontSize: '34px',
            borderRadius: '5px',
            padding: '16px 18px 16px 18px'
        },
        subLinkStyle: {
            lineType: 'curve',
            lineWidth: '2px',
            lineColor: '#43a9ff'
        }
    },
    primaryTopic: {
        contentStyle: {
            background: '#CDACA1',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#E4C1F9',
            borderRadius: '5px',
            color: 'rgb(103,103,103)',
            fontSize: '18px',
            padding: '5px'
        },
        subLinkStyle: {
            lineType: 'line',
            lineWidth: '2px',
            lineColor: '#43a9ff'
        }
    },
    normalTopic: {
        contentStyle: {
            background: '#CDCACC',
            borderRadius: '5px',
            color: 'rgb(103,103,103)',
            fontSize: '13px',
            padding: '0',
            boxShadow: '1px 1px 1px #ccc'
        },
        subLinkStyle: {
            lineType: 'line',
            lineRadius: 5,
            lineWidth: '1px',
            lineColor: '#43a9ff'
        }
    }
};

function ThemeSelectorPlugin() {
    const themeMap = new Map([
        ['default', core.defaultTheme],
        ['dark-theme1', darkTheme1],
        ['random-color-square', themeRandomColorSquare],
        ['random-color-round', themeRandomColorRound],
        ['theme1', theme1],
        ['theme2', theme2],
        ['theme3', theme3],
        ['theme4', theme4]
    ]);
    return {
        getAllThemes(props) {
            return themeMap;
        },
        getTheme(props) {
            const { controller, themeKey } = props;
            return controller.run('getAllThemes', props).get(themeKey);
        },
        setTheme(ctx) {
            const { controller, themeKey } = ctx;
            const allThemes = controller.run('getAllThemes', ctx);
            if (!allThemes.has(themeKey)) {
                throw new Error(`the theme key ${themeKey} is not exist!`);
            }
            controller.run('operation', {
                ...ctx,
                opType: core.OpType.SET_THEME,
                theme: allThemes.get(themeKey)
            });
        },
        createNewSheetModel(ctx, next) {
            const { controller, themeKey = 'default' } = ctx;
            const theme = controller.run('getTheme', { ...ctx, themeKey });
            let model = next();
            model = model.setIn(['config', 'theme'], theme);
            return model;
        }
    };
}

function serializeImage(url, type = 'image/png') {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onerror = function (error) {
            reject(error);
        };
        image.onload = function () {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve({
                    url: canvas.toDataURL(type, 1),
                    width: canvas.width,
                    height: canvas.height
                });
            }
            catch (e) {
                reject(e);
            }
        };
    });
}

const EXT_DATA_KEY_IMAGES = 'EXT_DATA_KEY_IMAGES';
const OP_TYPE_ADD_IMAGE = 'OP_TYPE_ADD_IMAGE';
const OP_TYPE_ADD_TOPIC_IMAGE = 'OP_TYPE_ADD_TOPIC_IMAGE';
const OP_TYPE_DELETE_TOPIC_IMAGE = 'OP_TYPE_DELETE_TOPIC_IMAGE';
const OP_TYPE_SET_TOPIC_IMAGE = 'OP_TYPE_SET_TOPIC_IMAGE';
const OP_TYPE_MOVE_TOPIC_IMAGE = 'OP_TYPE_MOVE_TOPIC_IMAGE';

const Root$3 = styled.div `
  position: relative;
  margin: 5px;
  padding-right: 35px;
`;
const ImgContainer = styled(rendererReact.OutsideClickHandler) `
  position: relative;
`;
const ResizeIcon = styled.div `
  position: absolute;
  right: 28px;
  bottom: -7px;
  width: 10px;
  height: 10px;
  cursor: nwse-resize;
  background: ${props => props.theme.highlightColor};
`;
const ResizeImg = styled.img `
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0.6;
`;
const Img = styled.img `
  display: block;
  outline-offset: 2px;
  resize: both;
  outline: ${props => props.toolbarVisible && `solid 1px ${props.theme.highlightColor}`};
`;
const EditButtons = styled.div `
  position: absolute;
  right: 0;
  bottom: 5px;
`;
const EditButton = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px;
  //border-radius: 50%;
  width: 24px;
  height: 24px;
  text-align: center;
  vertical-align: middle;
  border: gray 1px solid;
  background: rgba(125, 188, 255, 0.6);
  &:hover {
    cursor: pointer;
    color: ${rendererReact.COLORS.LIGHT.ITEM_BG_ACTIVE};
  }
`;
const ResizePopoverContent = styled.div `
  width: 200px;
  height: 200px;
  background: fuchsia;
`;
function ImageWidget(props) {
    const { image, index, totalCount, ...rest } = props;
    const { controller, model, topicKey } = rest;
    const { key: imageKey, imageRecord, width, height } = image;
    const { url, width: originWidth, height: originHeight } = imageRecord;
    const [toolbarVisible, setToolbarVisible] = React.useState(false);
    const [tempSize, setTempSize] = React.useState({ width, height });
    const [status, setStatus] = React.useState('normal');
    const isOriginSize = width === originWidth && height === originHeight;
    const canMoveUp = index > 0;
    const canMoveDown = index < totalCount - 1;
    const onClickDelete = () => {
        controller.run('operation', {
            ...rest,
            opType: OP_TYPE_DELETE_TOPIC_IMAGE,
            imageKey
        });
    };
    const moveImage = moveDir => {
        controller.run('operation', {
            ...rest,
            opType: OP_TYPE_MOVE_TOPIC_IMAGE,
            imageKey,
            moveDir
        });
    };
    const onClickMoveUp = () => {
        moveImage('up');
    };
    const onClickMoveDown = () => {
        moveImage('down');
    };
    const onClickResetSize = () => {
        controller.run('operation', {
            ...props,
            opType: OP_TYPE_SET_TOPIC_IMAGE,
            imageKey,
            imageData: { width: originWidth, height: originHeight }
        });
    };
    let resizeSize;
    const imageRef = ref => {
    };
    const rootRef = ref => {
    };
    const onImageClick = e => {
        if (model.focusKey !== topicKey) {
            controller.run('operation', {
                ...props,
                opType: core.OpType.FOCUS_TOPIC,
                focusMode: core.FocusMode.EDITING_CONTENT
            });
        }
        setToolbarVisible(true);
    };
    const onImageOutsideClick = () => {
        setToolbarVisible(false);
    };
    const resizeMouseMove = e => {
        const delta = e.screenX - initMouseX;
        resizeSize = {
            width: width + delta,
            height: height + (delta * height) / width
        };
        setTempSize(resizeSize);
    };
    const resizeMouseUp = e => {
        document.body.style.cursor = null;
        document.removeEventListener('mousemove', resizeMouseMove);
        document.removeEventListener('mouseup', resizeMouseUp);
        setStatus('normal');
        controller.run('operation', {
            ...props,
            opType: OP_TYPE_SET_TOPIC_IMAGE,
            imageKey,
            imageData: { width: resizeSize.width, height: resizeSize.height }
        });
        controller.run('setHandlingMouseMove', false);
    };
    let initMouseX;
    const prepareResize = e => {
        e.preventDefault();
        e.stopPropagation();
        controller.run('setHandlingMouseMove', true);
        document.body.style.cursor = 'nwse-resize';
        initMouseX = e.screenX;
        setStatus('resize');
        document.addEventListener('mousemove', resizeMouseMove);
        document.addEventListener('mouseup', resizeMouseUp);
    };
    const imgProps = {
        src: url,
        width,
        height,
        ref: imageRef,
        toolbarVisible,
        onClick: onImageClick
    };
    const rootProps = {
        ref: rootRef
    };
    const renderResizeImg = () => {
        if (status !== 'resize')
            return null;
        // console.log('renderResizeImg', tempSize);
        const resizeImgProps = {
            src: url,
            width: tempSize.width,
            height: tempSize.height
        };
        return React.createElement(ResizeImg, Object.assign({}, resizeImgProps));
    };
    const renderEditButtons = () => {
        return (React.createElement(React.Fragment, null,
            React.createElement(ResizeIcon, { onMouseDown: prepareResize }),
            React.createElement(EditButtons, null,
                canMoveUp && (React.createElement(EditButton, { title: rendererReact.getI18nText(props, rendererReact.I18nKey.MOVE_UP), className: rendererReact.iconClassName(rendererReact.IconName.MOVE_UP), onClick: onClickMoveUp })),
                canMoveDown && (React.createElement(EditButton, { title: rendererReact.getI18nText(props, rendererReact.I18nKey.MOVE_DOWN), className: rendererReact.iconClassName(rendererReact.IconName.MOVE_DOWN), onClick: onClickMoveDown })),
                !isOriginSize && (React.createElement(EditButton, { title: rendererReact.getI18nText(props, rendererReact.I18nKey.SET_TO_ORIGINAL_SIZE), className: rendererReact.iconClassName('size-original'), onClick: onClickResetSize })),
                React.createElement(EditButton, { title: rendererReact.getI18nText(props, rendererReact.I18nKey.DELETE), className: rendererReact.iconClassName(rendererReact.IconName.TRASH), onClick: onClickDelete }))));
    };
    const imgContainerProps = {
        useCapture: false,
        onOutsideClick: onImageOutsideClick
    };
    return (React.createElement(Root$3, Object.assign({}, rootProps),
        React.createElement(ImgContainer, Object.assign({}, imgContainerProps),
            React.createElement(Img, Object.assign({}, imgProps)),
            toolbarVisible && renderEditButtons()),
        renderResizeImg()));
}

const Root$4 = styled.div `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
function TopicImagesWidget(props) {
    const { controller } = props;
    const images = controller.run('getTopicImages', props);
    let index = 0;
    const child = images.map(image => {
        const imageProps = {
            ...props,
            image,
            index,
            totalCount: images.length
        };
        index++;
        return React.createElement(ImageWidget, Object.assign({ key: image.key }, imageProps));
    });
    return React.createElement(Root$4, null, child);
}

const defaultImageRecord = {
    key: null,
    url: null,
    width: null,
    height: null
};
class ImageRecord extends immutable.Record(defaultImageRecord) {
    get key() {
        return this.get('key');
    }
    get url() {
        return this.get('url');
    }
    get width() {
        return this.get('width');
    }
    get height() {
        return this.get('height');
    }
}
const defaultTopicImageRecord = {
    key: null,
    width: null,
    height: null
};
class TopicImageRecord extends immutable.Record(defaultTopicImageRecord) {
    get key() {
        return this.get('key');
    }
    get width() {
        return this.get('width');
    }
    get height() {
        return this.get('height');
    }
}
const defaultExtDataImagesRecord = {
    images: immutable.Map(),
    topics: immutable.Map()
};
// images 和 topics 分开管理，
class ExtDataImages extends immutable.Record(defaultExtDataImagesRecord) {
    get images() {
        return this.get('images');
    }
    get topics() {
        return this.get('topics');
    }
}

const md5 = require('blueimp-md5');
const Root$5 = styled.div ``;
const ErrorTip = styled.div `
  color: red;
  height: 24px;
`;
const Tips = styled.div `
  margin-top: 20px;
`;
const Tip = styled.div `
  padding: 5px 0;
`;
function InsertImageDialog(props) {
    const { controller, setDiagramState } = props;
    const [inputText, setInputText] = React.useState(rendererReact.getI18nText(props, rendererReact.I18nKey.CHOOSE_FILE));
    const onInputChange = e => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!['image/png', 'image/jpg', 'image/jpeg', 'image/gif'].includes(file.type)) {
                setInputText(React__default.createElement(ErrorTip, null, rendererReact.getI18nText(props, rendererReact.I18nKey.SELECT_IMAGE_ERR_TIP)));
            }
            else {
                const fr = new FileReader();
                fr.onload = () => {
                    const url = fr.result;
                    const img = new Image();
                    img.onload = () => {
                        //@ts-ignore
                        const image = new ImageRecord({
                            key: md5(url),
                            url,
                            width: img.width,
                            height: img.height
                        });
                        setDiagramState({ dialogType: null });
                        controller.run('operation', {
                            ...props,
                            opType: OP_TYPE_ADD_IMAGE,
                            image
                        });
                    };
                    //@ts-ignore
                    img.src = url;
                };
                fr.readAsDataURL(file);
                const src = URL.createObjectURL(file);
                serializeImage(src, file.type).then(res => {
                    // TODO md5
                });
            }
        }
    };
    const fileInputProps = {
        onInputChange,
        text: inputText,
        fill: true,
        buttonText: rendererReact.getI18nText(props, rendererReact.I18nKey.BROWSE)
    };
    return (React__default.createElement(Root$5, null,
        React__default.createElement("div", null,
            React__default.createElement(core$1.FileInput, Object.assign({}, fileInputProps))),
        React__default.createElement(Tips, null,
            React__default.createElement(Tip, null, rendererReact.getI18nText(props, rendererReact.I18nKey.SELECT_IMAGE_TIP1)),
            React__default.createElement(Tip, null, rendererReact.getI18nText(props, rendererReact.I18nKey.SELECT_IMAGE_TIP2)))));
}

function addImage({ docModel, topicKey, image }) {
    let extData = docModel.getExtDataItem(EXT_DATA_KEY_IMAGES, ExtDataImages);
    const topicImage = new TopicImageRecord({
        key: image.key,
        width: image.width,
        height: image.height
    });
    extData = extData
        .update('images', images => images.set(image.key, image))
        .update('topics', topics => {
        if (!topics.has(topicKey)) {
            return topics.set(topicKey, immutable.List([topicImage]));
        }
        else {
            const imgData = topics.get(topicKey).find(v => v.key === image.key);
            if (imgData != null)
                return topics;
            return topics.update(topicKey, list => list.push(topicImage));
        }
    });
    docModel = docModel.setIn(['extData', EXT_DATA_KEY_IMAGES], extData);
    return docModel;
}
function deleteTopicImage({ docModel, topicKey, imageKey }) {
    let extData = docModel.getExtDataItem(EXT_DATA_KEY_IMAGES, ExtDataImages);
    extData = extData.updateIn(['topics', topicKey], list => list.delete(list.findIndex(v => v.key === imageKey)));
    if (getUsedImageKeyTopicCount(extData, imageKey) === 0) {
        extData = extData.update('images', images => images.delete(imageKey));
    }
    docModel = docModel.setIn(['extData', EXT_DATA_KEY_IMAGES], extData);
    return docModel;
}
function addTopicImage({ docModel, topicKey, imageKey }) {
    let extData = docModel.getExtDataItem(EXT_DATA_KEY_IMAGES, ExtDataImages);
    const image = extData.images.get(imageKey);
    if (image == null) {
        throw new Error(`imageKey ${imageKey} not exist`);
    }
    let topicData = extData.topics.get(topicKey) || immutable.List();
    if (topicData.find(v => v.key === imageKey) == null) {
        topicData = topicData.push(new TopicImageRecord({
            key: imageKey,
            width: image.width,
            height: image.height
        }));
        extData = extData.update('topics', topics => topics.set(topicKey, topicData));
        docModel = docModel.setIn(['extData', EXT_DATA_KEY_IMAGES], extData);
    }
    return docModel;
}
function setTopicImage({ docModel, topicKey, imageKey, imageData }) {
    let extData = docModel.getExtDataItem(EXT_DATA_KEY_IMAGES, ExtDataImages);
    let topicData = extData.topics.get(topicKey);
    if (topicData == null) {
        throw new Error(`topicKey ${topicKey} does not has imageData`);
    }
    if (topicData.find(v => v.key === imageKey) == null) {
        throw new Error(`topicKey ${topicKey} does not has imageData of key ${imageKey}`);
    }
    const index = topicData.findIndex(v => v.key === imageKey);
    topicData = topicData.update(index, topicImage => topicImage.merge(imageData));
    extData = extData.update('topics', topics => topics.set(topicKey, topicData));
    docModel = docModel.setIn(['extData', EXT_DATA_KEY_IMAGES], extData);
    return docModel;
}
function moveTopicImage({ docModel, topicKey, imageKey, moveDir }) {
    let extData = docModel.getExtDataItem(EXT_DATA_KEY_IMAGES, ExtDataImages);
    let topicData = extData.topics.get(topicKey);
    const index = topicData.findIndex(v => v.key === imageKey);
    if (moveDir === 'up') {
        topicData = rendererReact.swap(topicData, index, index - 1);
    }
    else {
        topicData = rendererReact.swap(topicData, index, index + 1);
    }
    extData = extData.update('topics', topics => topics.set(topicKey, topicData));
    docModel = docModel.setIn(['extData', EXT_DATA_KEY_IMAGES], extData);
    return docModel;
}
function getUsedImageKeyTopicCount(extData, imageKey) {
    let count = 0;
    extData.topics.forEach(v => {
        if (v.find(v => v.key === imageKey))
            count++;
    });
    return count;
}

const log = debug('plugin:insert-image');
const md5$1 = require('blueimp-md5');
function InsertImagesPlugin() {
    return {
        handleTopicPaste(ctx, next) {
            const { ev, ...rest } = ctx;
            log('handleTopicPaste', ev);
            const { controller } = rest;
            if (ev.clipboardData && ev.clipboardData.items.length > 0) {
                const data = ev.clipboardData;
                if (data.items.length === 1) {
                    const item = data.items[0];
                    if (item.type === 'image/png') {
                        const blob = item.getAsFile();
                        if (blob) {
                            const src = URL.createObjectURL(blob);
                            serializeImage(src).then(res => {
                                // TODO md5
                                const image = new ImageRecord({
                                    key: md5$1(res.url),
                                    ...res
                                });
                                controller.run('operation', {
                                    ...rest,
                                    opType: OP_TYPE_ADD_IMAGE,
                                    image
                                });
                            });
                        }
                    }
                }
            }
        },
        customizeDialog(ctx, next) {
            const { diagramState, setDiagramState } = ctx;
            const onClose = () => {
                setDiagramState({ dialogType: null });
            };
            if (diagramState.dialogType === 'INSERT_IMAGE') {
                return {
                    dialogProps: {
                        title: rendererReact.getI18nText(ctx, rendererReact.I18nKey.INSERT_IMAGE),
                        onClose
                    },
                    dialogContent: React__default.createElement(InsertImageDialog, Object.assign({}, ctx))
                };
            }
            return next();
        },
        customizeTopicContextMenu(ctx, next) {
            const { controller, setDiagramState } = ctx;
            const res = next();
            const onClickInsertImage = () => {
                setDiagramState({
                    dialogType: 'INSERT_IMAGE'
                });
            };
            res.push(React__default.createElement(core$1.MenuItem, { key: "insert-image", icon: rendererReact.Icon(rendererReact.IconName.IMAGE), text: rendererReact.getI18nText(ctx, rendererReact.I18nKey.INSERT_IMAGE), 
                // labelElement={<KeyboardHotKeyWidget hotkeys={['Tab']} />}
                onClick: onClickInsertImage }));
            return res;
        },
        getOpMap(ctx, next) {
            const opMap = next();
            opMap.set(OP_TYPE_ADD_IMAGE, addImage);
            opMap.set(OP_TYPE_ADD_TOPIC_IMAGE, addTopicImage);
            opMap.set(OP_TYPE_DELETE_TOPIC_IMAGE, deleteTopicImage);
            opMap.set(OP_TYPE_SET_TOPIC_IMAGE, setTopicImage);
            opMap.set(OP_TYPE_MOVE_TOPIC_IMAGE, moveTopicImage);
            return opMap;
        },
        renderTopicNodeRows(ctx, next) {
            const { controller } = ctx;
            const res = next();
            res.push(controller.run('renderTopicExtImage', ctx));
            return res;
        },
        renderTopicExtImage(ctx) {
            return React__default.createElement(TopicImagesWidget, Object.assign({ key: "images" }, ctx));
        },
        getTopicImages(ctx) {
            const { docModel, topicKey } = ctx;
            const extData = docModel.getExtDataItem(EXT_DATA_KEY_IMAGES, ExtDataImages);
            if (!extData.topics.has(topicKey))
                return [];
            return extData.topics
                .get(topicKey)
                .toArray()
                .map(v => {
                return {
                    key: v.key,
                    imageRecord: extData.images.get(v.key),
                    width: v.width,
                    height: v.height
                };
            });
        },
        topicExtDataToJson(ctx, next) {
            const { docModel, topicKey } = ctx;
            const res = next();
            const extData = docModel.getExtDataItem(EXT_DATA_KEY_IMAGES, ExtDataImages);
            if (extData.topics.has(topicKey)) {
                res[EXT_DATA_KEY_IMAGES] = extData.topics
                    .get(topicKey)
                    .toArray()
                    .map(r => {
                    const image = extData.images.get(r.key);
                    return {
                        key: r.key,
                        url: image.url,
                        originalWidth: image.width,
                        originalHeight: image.height,
                        width: r.width,
                        height: r.height
                    };
                });
            }
            return res;
        },
        processTopicExtData(ctx, next) {
            let extData = next();
            let { topic } = ctx;
            if (topic.extData[EXT_DATA_KEY_IMAGES]) {
                if (!extData.has(EXT_DATA_KEY_IMAGES)) {
                    let extDataImages = new ExtDataImages();
                    extData = extData.set(EXT_DATA_KEY_IMAGES, extDataImages);
                }
                let list = immutable.List();
                for (let image of topic.extData[EXT_DATA_KEY_IMAGES]) {
                    extData = extData.updateIn([EXT_DATA_KEY_IMAGES, 'images'], images => {
                        return images.has(image.key)
                            ? images
                            : images.set(image.key, new ImageRecord({
                                key: image.key,
                                url: image.url,
                                width: image.originWidth,
                                height: image.originHeight
                            }));
                    });
                    list = list.push(new TopicImageRecord({
                        key: image.key,
                        width: image.width,
                        height: image.height
                    }));
                }
                extData = extData.updateIn([EXT_DATA_KEY_IMAGES, 'topics'], topics => topics.set(topic.key, list));
            }
            return extData;
        },
        customizeAllowUndo(ctx, next) {
            const { opType } = ctx;
            if (opType === OP_TYPE_ADD_IMAGE)
                return true;
            return next();
        },
        deserializeExtDataItem(ctx, next) {
            const { extDataKey, extDataItem } = ctx;
            if (extDataKey === EXT_DATA_KEY_IMAGES) {
                let extData = new ExtDataImages();
                for (const key in extDataItem.images) {
                    const item = extDataItem.images[key];
                    const record = new ImageRecord(item);
                    extData = extData.update('images', images => images.set(key, record));
                }
                for (const key in extDataItem.topics) {
                    const item = extDataItem.topics[key];
                    const record = immutable.List(item.map(v => {
                        return new TopicImageRecord(v);
                    }));
                    extData = extData.update('topics', topics => topics.set(key, record));
                }
                return extData;
            }
            return next();
        },
        getTotalTopicImageCount(ctx) {
            const { docModel } = ctx;
            const extData = docModel.getExtDataItem(EXT_DATA_KEY_IMAGES, ExtDataImages);
            return extData.images.size;
        }
    };
}

const _debugNameSpaces = [
    'bmd:*',
    // 'plugin:toolbar',
    'plugin:operation'
    // 'plugin:drag-and-drop'
];
if (!localStorage.allDebugNS)
    localStorage.allDebugNS = _debugNameSpaces.join(',');
function DebugNamespaceWidget(props) {
    const [debugStr, setDebugStr] = React.useState(localStorage.debug || '');
    const [allDebugNS, setAllDebugNS] = React.useState(localStorage.allDebugNS.split(',').sort());
    const [nsName, setNsName] = React.useState('');
    const nameProps = {
        title: 'namespace:',
        value: nsName,
        onChange: e => {
            //@ts-ignore
            setNsName(e.target.value);
        },
        style: {
            width: 100
        }
    };
    const nsNameInput = React__default.createElement(rendererReact.SettingItemInput, Object.assign({}, nameProps));
    const addNsBtnProps = {
        title: 'Add Or Delete Namespace',
        onClick(e) {
            let _allDebugNS;
            if (allDebugNS.includes(nsName)) {
                _allDebugNS = allDebugNS.filter(i => i !== nsName);
            }
            else {
                _allDebugNS = [...allDebugNS, nsName];
            }
            setAllDebugNS(_allDebugNS);
            localStorage.allDebugNS = _allDebugNS.join(',');
        }
    };
    const addNsBtn = React__default.createElement(rendererReact.SettingItemButton, Object.assign({}, addNsBtnProps));
    return (React__default.createElement("div", null,
        React__default.createElement("div", null, allDebugNS.map(item => {
            const cprops = {
                key: item,
                label: item,
                checked: debugStr.split(',').includes(item),
                onChange: e => {
                    let checkedItems = debugStr.split(',').filter(i => i !== '');
                    if (checkedItems.includes(item)) {
                        checkedItems = checkedItems.filter(i => i !== item);
                    }
                    else {
                        checkedItems.push(item);
                    }
                    const newDebugStr = checkedItems.join(',');
                    setDebugStr(newDebugStr);
                    localStorage.debug = newDebugStr;
                }
            };
            return React__default.createElement(core$1.Checkbox, Object.assign({}, cprops));
        })),
        React__default.createElement(rendererReact.SettingRow, null,
            nsNameInput,
            addNsBtn)));
}

function DebugPanel(props) {
    return (React__default.createElement("div", null,
        React__default.createElement(DebugNamespaceWidget, null)));
}

function DebugPlugin() {
    const tabId = 'debug';
    return {
        renderRightTopPanelTabs(props, next) {
            const res = next();
            const tProps = {
                id: tabId,
                key: tabId,
                title: 'Debug',
                panel: React__default.createElement(DebugPanel, Object.assign({}, props))
            };
            const tab = React__default.createElement(core$1.Tab, Object.assign({}, tProps));
            res.push(tab);
            return res;
        }
    };
}

function ContextMenuExportTopic(props) {
    const { controller, model, topicKey, getRef } = props;
    const isMindMap = model.config.viewMode === core.ViewModeMindMap;
    const outlinerEle = document.getElementById(`bm-outliner-${model.id}`);
    const exportTo = (type) => () => {
        const options = isMindMap
            ? {
                backgroundColor: model.config.theme.background
            }
            : {
                backgroundColor: window.getComputedStyle(outlinerEle).backgroundColor
            };
        const title = controller.run('getTopicTitle', { ...props, maxLength: 40 });
        const topicWidgetEle = isMindMap && topicKey === model.editorRootTopicKey
            ? getRef(rendererReact.RefKey.NODE_LAYER + model.id)
            : getRef(rendererReact.topicWidgetRootRefKey(topicKey));
        switch (type) {
            case 'png':
            case 'jpg':
                htmlToImage.toBlob(topicWidgetEle, options).then(blob => {
                    fileSaver.saveAs(blob, `${title}.${type}`);
                });
                break;
            case 'svg':
                htmlToImage.toSvgDataURL(topicWidgetEle, options).then(dataUrl => {
                    fileSaver.saveAs(dataUrl, `${title}.svg`);
                });
                break;
        }
    };
    return (React.createElement(core$1.MenuItem, { icon: rendererReact.Icon(rendererReact.IconName.EXPORT), text: rendererReact.getI18nText(props, rendererReact.I18nKey.EXPORT) },
        React.createElement(core$1.MenuItem, { text: "PNG", onClick: exportTo('png') }),
        React.createElement(core$1.MenuItem, { text: "JPG", onClick: exportTo('jpg') }),
        React.createElement(core$1.MenuItem, { text: "SVG", onClick: exportTo('svg') })));
}

const EXT_KEY_EXPORT_TOPIC = 'EXT_KEY_EXPORT_TOPIC';

function ExportTopicPlugin() {
    return {
        customizeTopicContextMenu(ctx, next) {
            const res = next();
            res.push(React.createElement(ContextMenuExportTopic, Object.assign({ key: EXT_KEY_EXPORT_TOPIC }, ctx)));
            return res;
        }
    };
}

function SimpleCaptureErrorPlugin() {
    return {
        captureError(ctx) {
            const { error } = ctx;
            /* tslint:disable */
            console.error(error);
        }
    };
}

exports.DebugPlugin = DebugPlugin;
exports.EXT_DATA_KEY_IMAGES = EXT_DATA_KEY_IMAGES;
exports.ExportFilePlugin = ExportFilePlugin;
exports.ExportTopicPlugin = ExportTopicPlugin;
exports.FOCUS_MODE_SEARCH = FOCUS_MODE_SEARCH;
exports.HOT_KEY_NAME_SEARCH = HOT_KEY_NAME_SEARCH;
exports.InsertImagesPlugin = InsertImagesPlugin;
exports.OP_TYPE_ADD_IMAGE = OP_TYPE_ADD_IMAGE;
exports.OP_TYPE_ADD_TOPIC_IMAGE = OP_TYPE_ADD_TOPIC_IMAGE;
exports.OP_TYPE_DELETE_TOPIC_IMAGE = OP_TYPE_DELETE_TOPIC_IMAGE;
exports.OP_TYPE_MOVE_TOPIC_IMAGE = OP_TYPE_MOVE_TOPIC_IMAGE;
exports.OP_TYPE_SET_TOPIC_IMAGE = OP_TYPE_SET_TOPIC_IMAGE;
exports.OpenFilePlugin = OpenFilePlugin;
exports.SEARCH_QUERY_TEMP_VALUE_KEY = SEARCH_QUERY_TEMP_VALUE_KEY;
exports.SearchPlugin = SearchPlugin;
exports.SimpleCaptureErrorPlugin = SimpleCaptureErrorPlugin;
exports.TagsPlugin = TagsPlugin;
exports.ThemeSelectorPlugin = ThemeSelectorPlugin;
exports.ToolbarGroupItemUndoRedo = ToolbarGroupItemUndoRedo;
exports.ToolbarItemRedo = ToolbarItemRedo;
exports.ToolbarItemSearch = ToolbarItemSearch;
exports.ToolbarItemUndo = ToolbarItemUndo;
exports.TopicReferencePlugin = TopicReferencePlugin;
exports.UndoRedoPlugin = UndoRedoPlugin;
exports.darkTheme1 = darkTheme1;
exports.serializeImage = serializeImage;
exports.theme1 = theme1;
exports.theme2 = theme2;
exports.theme3 = theme3;
exports.theme4 = theme4;
exports.themeRandomColorRound = themeRandomColorRound;
exports.themeRandomColorSquare = themeRandomColorSquare;
//# sourceMappingURL=main.js.map
