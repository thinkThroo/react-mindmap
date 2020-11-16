import { OpType, FocusMode, ViewModeMindMap, getAllSubTopicKeys, SheetModelModifier, setCurrentSheetModel, defaultTheme } from '@blink-mind/core';
import { ZIndex, getI18nText, I18nKey, Flex, PropKey, Alert, COLORS, stopPropagation, iconClassName, TopicBlockIcon, StyledCheckbox, Icon, ToolbarItem, IconName, browserOpenFile, browserDownloadFile, ToolbarGroupItem, SettingItemInput, SettingItemColorPicker, SettingItemButton, SettingRow, SettingTitle, SettingBoxContainer, VListContainer, SettingGroup, PanelTabRoot, OutsideClickHandler, swap, RefKey, topicWidgetRootRefKey } from '@blink-mind/renderer-react';
import { Button, PopoverInteractionKind, Popover, MenuDivider, MenuItem, Dialog, Menu, Alert as Alert$1, Tag, Divider, ContextMenu, ContextMenuTarget, Tab, FileInput, Checkbox } from '@blueprintjs/core';
import React__default, { createElement, useState, Fragment, PureComponent } from 'react';
import styled from 'styled-components';
import { List, Map as Map$1, Record } from 'immutable';
import { Omnibar } from '@blueprintjs/select';
import Highlighter from 'react-highlight-words';
import debug from 'debug';
import { saveAs } from 'file-saver';
import { toSvgDataURL, toBlob } from 'html-to-image';

const FOCUS_MODE_SET_REFERENCE_TOPICS = 'FOCUS_MODE_SET_REFERENCE_TOPICS';
// 添加引用的Topic
const OP_TYPE_START_SET_REFERENCE_TOPICS = 'OP_TYPE_START_SET_REFERENCE_TOPICS';
const OP_TYPE_SET_REFERENCE_TOPICS = 'OP_TYPE_SET_REFERENCE_TOPICS';
const EXT_DATA_KEY_TOPIC_REFERENCE = 'TOPIC_REFERENCE';
const EXT_KEY_TOPIC_REFERENCE = 'EXT_KEY_TOPIC_REFERENCE';

const Root = styled(ZIndex) `
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
            opType: OpType.SET_FOCUS_MODE,
            focusMode: FocusMode.NORMAL
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
                    opType: OpType.FOCUS_TOPIC,
                    topicKey,
                    focusMode: FocusMode.NORMAL
                }
            ],
            allowUndo: false
        });
        controller.run('clearSelectedReferenceKeys', props);
    };
    return (createElement(Root, { zIndex: zIndex },
        createElement(Title, null, getI18nText(props, I18nKey.SELECT_REF_TOPICS_TIP)),
        createElement(Flex, { justifyContent: 'space-around' },
            createElement(Button, { onClick: onClickConfirm }, getI18nText(props, I18nKey.CONFIRM)),
            createElement(Button, { onClick: onClickCancel }, getI18nText(props, I18nKey.CANCEL)))));
}

const defaultReferenceRecord = {
    keyList: List(),
    dataMap: Map$1()
};
class ReferenceRecord extends Record(defaultReferenceRecord) {
    get keyList() {
        return this.get('keyList');
    }
    get dataMap() {
        return this.get('dataMap');
    }
}
const defaultExtDataReferenceRecord = {
    reference: Map$1()
};
class ExtDataReference extends Record(defaultExtDataReferenceRecord) {
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
    referenceRecord = referenceRecord.set('keyList', List(referenceKeys));
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
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const onClick = e => {
        e.stopPropagation();
        controller.run('focusTopicAndMoveToCenter', { ...props, topicKey: refKey });
    };
    const onClickRemove = e => {
        setDeleteConfirm(true);
    };
    const content = controller.getValue(PropKey.TOPIC_TITLE, {
        ...props,
        topicKey: refKey,
        maxLength: 100
    });
    const deleteAlertProps = {
        ...props,
        isOpen: deleteConfirm,
        content: getI18nText(props, I18nKey.DELETE_REFERENCE_TIP),
        onConfirm: e => {
            removeHandler(e);
        },
        onCancel: e => {
            setDeleteConfirm(false);
        }
    };
    return (createElement(Root$1, null,
        createElement(Content, { onClick: onClick }, content),
        createElement(ButtonPlace, null, refType === 'reference' && (createElement(Fragment, null,
            createElement(Button, { onClick: onClickRemove }, getI18nText(props, I18nKey.REMOVE)),
            createElement(Alert, Object.assign({}, deleteAlertProps)))))));
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
  color: ${COLORS.HIGHLIGHT};
`;
const GotoBtn = styled.div `
  text-decoration: underline;
  color: ${COLORS.HIGHLIGHT};
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
                    focusMode: FocusMode.NORMAL,
                    referenceKeys: keyList.delete(keyList.indexOf(refKey)).toArray()
                }
            ]
        });
    };
    const referenceKeys = extData.getReferenceKeys(topicKey);
    const referenceGroup = referenceKeys.length === 0 ? null : (createElement(Group, null,
        createElement(GroupTitle, null, getI18nText(props, I18nKey.REFERENCE_TOPICS) + ':'),
        createElement(GroupList, null, referenceKeys.map(key => {
            const thumbProps = {
                ...props,
                key,
                refKey: key,
                refType: 'reference',
                removeHandler: removeReference(key)
            };
            //@ts-ignore
            return createElement(ReferenceTopicThumbnail, Object.assign({}, thumbProps));
        }))));
    const referencedKeys = extData.getReferencedKeys(topicKey);
    const referencedGroup = referencedKeys.length === 0 ? null : (createElement(Group, null,
        createElement(GroupTitle, null, getI18nText(props, I18nKey.REFERENCED_TOPICS) + ':'),
        createElement(GroupList, null, referencedKeys.map(key => {
            const thumbProps = {
                ...props,
                key,
                refKey: key,
                refType: 'referenced'
            };
            //@ts-ignore
            return createElement(ReferenceTopicThumbnail, Object.assign({}, thumbProps));
        }))));
    const onClickGotoOriginTopic = e => {
        e.stopPropagation();
        controller.run('focusTopicAndMoveToCenter', props);
    };
    const currentTopic = model.focusKey !== topicKey && (createElement(Group, null,
        createElement(GotoBtn, { onClick: onClickGotoOriginTopic }, getI18nText(props, I18nKey.GOTO_ORIGINAL_TOPIC))));
    return (createElement(Root$2, { onMouseDown: stopPropagation },
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
        className: iconClassName('reference'),
        tabIndex: -1
    };
    const icon = createElement(TopicBlockIcon, Object.assign({}, iconProps));
    const tooltipContent = createElement(ReferenceTopicList, Object.assign({}, props));
    const tooltipProps = {
        autoFocus: false,
        content: tooltipContent,
        target: icon,
        interactionKind: PopoverInteractionKind.CLICK,
        hoverOpenDelay: 500
    };
    return createElement(Popover, Object.assign({}, tooltipProps));
}

function TopicReferenceCheckbox(props) {
    const { topicKey, selectedTopicKeys } = props;
    const a = selectedTopicKeys.has(topicKey);
    const [checked, setChecked] = useState(a);
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
    return createElement(StyledCheckbox, Object.assign({}, checkboxProps));
}

function TopicReferencePlugin() {
    let selectedTopicKeys = new Set();
    function startSetReferenceTopics({ docModel, model, topicKey }) {
        const extData = docModel.getExtDataItem(EXT_DATA_KEY_TOPIC_REFERENCE, ExtDataReference);
        selectedTopicKeys = new Set(extData.getReferenceKeys(topicKey));
        model = SheetModelModifier.focusTopic({
            model,
            topicKey,
            focusMode: FOCUS_MODE_SET_REFERENCE_TOPICS
        });
        docModel = setCurrentSheetModel(docModel, model);
        return docModel;
    }
    return {
        customizeTopicContextMenu(props, next) {
            const { controller, model } = props;
            if (model.config.viewMode !== ViewModeMindMap)
                return next();
            function onClickSetReferenceTopics(e) {
                controller.run('operation', {
                    ...props,
                    opType: OP_TYPE_START_SET_REFERENCE_TOPICS
                });
                controller.run('disableOperation', {
                    ...props,
                    whiteList: [OpType.TOGGLE_COLLAPSE]
                });
            }
            return (createElement(Fragment, null,
                next(),
                createElement(MenuDivider, null),
                createElement(MenuItem, { key: EXT_KEY_TOPIC_REFERENCE, icon: Icon('reference'), text: getI18nText(props, I18nKey.SET_TOPIC_REFERENCES), onClick: onClickSetReferenceTopics })));
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
            if (opType === OpType.DELETE_TOPIC &&
                topicKey !== model.editorRootTopicKey) {
                const allDeleteKeys = getAllSubTopicKeys(model, topicKey);
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
            const zIndex = controller.getValue(PropKey.DIAGRAM_CUSTOMIZE_BASE_Z_INDEX) + 2;
            const res = next();
            if (model.focusMode === FOCUS_MODE_SET_REFERENCE_TOPICS) {
                const panelProps = {
                    ...props,
                    zIndex,
                    topicKey: model.focusKey,
                    key: 'AddReferenceTopicPanel'
                };
                res.push(createElement(AddReferenceTopicPanel, Object.assign({}, panelProps)));
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
                const checkbox = createElement(TopicReferenceCheckbox, Object.assign({}, checkBoxProps));
                res.push(checkbox);
            }
            return res;
        },
        renderTopicExtReference(props, next) {
            return createElement(TopicExtReference, Object.assign({}, props));
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
                        keyList: List(item.keyList),
                        dataMap: Map$1(item.dataMap)
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
    const topicTitle = controller.getValue(PropKey.TOPIC_TITLE, {
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
    return (createElement("div", Object.assign({}, titleProps), query
        ? Highlighter({ searchWords: [query], textToHighlight: topicTitle })
        : topicTitle));
}

const HOT_KEY_NAME_SEARCH = 'DEFAULT_SEARCH';
const FOCUS_MODE_SEARCH = 'FOCUS_MODE_SEARCH';
const SEARCH_QUERY_TEMP_VALUE_KEY = 'SEARCH_QUERY';

const NavOmniBar = Omnibar.ofType();
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
        placeholder: getI18nText(props, I18nKey.SEARCH)
    };
    const onClose = () => {
        controller.run('operation', {
            ...props,
            opType: OpType.SET_FOCUS_MODE,
            focusMode: FocusMode.NORMAL
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
        return createElement(TopicTitleThumbnail, Object.assign({ key: topicKey }, thumbnailProps));
    };
    const itemListPredicate = (query, items) => {
        controller.run('setTempValue', {
            key: SEARCH_QUERY_TEMP_VALUE_KEY,
            value: query
        });
        return items.filter(item => {
            const topicTitle = controller.getValue(PropKey.TOPIC_TITLE, {
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
    return createElement(StyledNavOmniBar, Object.assign({}, omniBarProps));
}

function ToolbarItemSearch(props) {
    const onClickSearch = e => {
        const { controller } = props;
        controller.run('operation', {
            ...props,
            opType: OpType.SET_FOCUS_MODE,
            focusMode: FOCUS_MODE_SEARCH
        });
    };
    return (createElement(ToolbarItem, Object.assign({ iconName: IconName.SEARCH, iconCxName: "search", onClick: onClickSearch }, props)));
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
                        opType: OpType.FOCUS_TOPIC,
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
                res.push(createElement(SearchPanel, Object.assign({}, searchPanelProps)));
            }
            return res;
        }
    };
}

function ToolbarItemOpenFile(props) {
    const onClickOpenFile = () => {
        const { controller } = props;
        browserOpenFile('.json,.blinkmind,.bm').then(txt => {
            const obj = JSON.parse(txt);
            const newDocModel = controller.run('deserializeDocModel', {
                controller,
                obj
            });
            controller.run('openNewDocModel', { ...props, newDocModel });
        });
    };
    return (createElement(ToolbarItem, Object.assign({ iconName: IconName.OPEN_FILE, onClick: onClickOpenFile }, props)));
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
    const [showDialog, setShowDialog] = useState(false);
    const onClickExport = () => {
        const { controller } = props;
        const json = controller.run('serializeDocModel', props);
        const jsonStr = JSON.stringify(json, null, 2);
        const url = `data:text/plain,${encodeURIComponent(jsonStr)}`;
        browserDownloadFile(url, 'example.json');
        setShowDialog(false);
    };
    return (createElement(Fragment, null,
        createElement(ToolbarItem, Object.assign({ iconName: IconName.EXPORT, onClick: () => setShowDialog(true) }, props)),
        createElement(Dialog, { onClose: () => {
                setShowDialog(false);
            }, isOpen: showDialog, autoFocus: true, enforceFocus: true, usePortal: true, title: "Please select export file format" },
            createElement(Menu, null,
                createElement(MenuItem, { text: "JSON(.json)", onClick: onClickExport }),
                createElement(MenuDivider, null)))));
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
        iconName: IconName.UNDO,
        disabled: !canUndo,
        onClick: onClickUndo
    };
    const redoProps = {
        ...props,
        key: 'redo',
        iconName: IconName.REDO,
        disabled: !canRedo,
        onClick: onClickRedo
    };
    return createElement(ToolbarGroupItem, { items: [undoProps, redoProps] });
}
function ToolbarItemUndo(props) {
    const { controller } = props;
    const onClickUndo = () => {
        controller.run('undo', props);
    };
    const canUndo = controller.run('canUndo', props);
    return (createElement(ToolbarItem, Object.assign({ iconName: IconName.UNDO, disabled: !canUndo, onClick: onClickUndo }, props)));
}
function ToolbarItemRedo(props) {
    const { controller } = props;
    const onClickRedo = () => {
        controller.run('redo', props);
    };
    const canUndo = controller.run('canRedo', props);
    return (createElement(ToolbarItem, Object.assign({ iconName: IconName.REDO, disabled: !canUndo, onClick: onClickRedo }, props)));
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
    topicKeys: List()
};
class TagRecord extends Record(defaultTagRecord) {
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
    tags: Map$1()
};
class ExtDataTags extends Record(defaultExtDataTagsRecord) {
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
    const [tagName, setTagName] = useState('');
    const [background, setBackground] = useState('grey');
    const [color, setColor] = useState('black');
    const [showAlert, setShowAlert] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const { controller, docModel } = props;
    const handleTagNameChange = e => {
        setTagName(e.target.value);
    };
    const nameProps = {
        title: getI18nText(props, I18nKey.TAG_NAME) + ':',
        value: tagName,
        onChange: handleTagNameChange,
        style: {
            width: 100
        }
    };
    const nameItem = createElement(SettingItemInput, Object.assign({}, nameProps));
    const bgColorProps = {
        title: getI18nText(props, I18nKey.BACKGROUND) + ':',
        color: background,
        handleColorChange: color => {
            setBackground(color);
        }
    };
    const bgColorItem = createElement(SettingItemColorPicker, Object.assign({}, bgColorProps));
    const colorProps = {
        title: getI18nText(props, I18nKey.COLOR) + ':',
        color: color,
        handleColorChange: color => {
            setColor(color);
        }
    };
    const colorItem = createElement(SettingItemColorPicker, Object.assign({}, colorProps));
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
        title: getI18nText(props, I18nKey.ADD_TAG),
        disabled,
        onClick: () => {
            if (tagName.trim().length > TAG_NAME_MAX_LEN) {
                setShowAlert(true);
                setAlertTitle(getI18nText(props, I18nKey.TAG_NAME_OVER_MAX_TIP));
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
    const alert = showAlert && (createElement(Alert$1, Object.assign({}, alertProps),
        createElement("p", null, alertTitle)));
    const addTagBtn = createElement(SettingItemButton, Object.assign({}, addTagBtnProps));
    return (createElement(SettingRow, null,
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

const StyledTag = styled(Tag) `
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
        return createElement(TopicTitleThumbnail, Object.assign({ key: topicKey }, thumbnailProps));
    });
    return (createElement(Fragment, null,
        createElement(SettingTitle, null, getI18nText(props, I18nKey.TOPICS_THAT_USE_THIS_TAG)),
        createElement(SettingBoxContainer, { style: { width: '500px' } },
            createElement(VListContainer, null, topicList))));
}

function UpdateTagWidget(props) {
    const { controller, docModel, tag } = props;
    const style = JSON.parse(tag.style);
    const [tagName, setTagName] = useState(tag.name);
    const [background, setBackground] = useState(style.backgroundColor);
    const [color, setColor] = useState(style.color);
    const handleTagNameChange = e => {
        setTagName(e.target.value);
    };
    const nameProps = {
        title: getI18nText(props, I18nKey.TAG_NAME) + ':',
        value: tagName,
        onChange: handleTagNameChange,
        style: {
            width: 100
        }
    };
    const nameItem = createElement(SettingItemInput, Object.assign({}, nameProps));
    const bgColorProps = {
        title: getI18nText(props, I18nKey.BACKGROUND) + ':',
        color: background,
        handleColorChange: color => {
            setBackground(color);
        }
    };
    const bgColorItem = createElement(SettingItemColorPicker, Object.assign({}, bgColorProps));
    const colorProps = {
        title: getI18nText(props, I18nKey.COLOR) + ':',
        color: color,
        handleColorChange: color => {
            setColor(color);
        }
    };
    const colorItem = createElement(SettingItemColorPicker, Object.assign({}, colorProps));
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
        title: getI18nText(props, I18nKey.UPDATE_TAG),
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
    const btn = createElement(SettingItemButton, Object.assign({}, btnProps));
    return (createElement(SettingRow, null,
        nameItem,
        bgColorItem,
        colorItem,
        btn));
}

let TagWidget = class TagWidget extends PureComponent {
    constructor(props) {
        super(props);
        this.onClickUpdateTag = e => { };
        this.handleClick = e => {
            const { onClick, tag, clickToUpdate } = this.props;
            onClick && onClick(tag)(e);
            if (clickToUpdate) {
                const contextMenu = (createElement(Menu, null,
                    createElement(UpdateTagWidget, Object.assign({}, this.props)),
                    createElement(Divider, null),
                    createElement(TagTopicList, Object.assign({}, this.props))));
                ContextMenu.show(contextMenu, { left: e.clientX, top: e.clientY });
            }
        };
    }
    renderContextMenu() {
        const props = this.props;
        return props.isTopicTag ? null : (createElement(Menu, null,
            createElement(UpdateTagWidget, Object.assign({}, props)),
            createElement(Divider, null),
            createElement(TagTopicList, Object.assign({}, props))));
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
        return createElement(StyledTag, Object.assign({}, tagProps), tag.name);
    }
};
TagWidget = __decorate([
    ContextMenuTarget
], TagWidget);
const TagWidgetWrapper = styled.div `
  display: inline-block;
  margin-bottom: 10px;
`;
function StyledTagWidget(props) {
    return (createElement(TagWidgetWrapper, null,
        createElement(TagWidget, Object.assign({}, props))));
}

let currentTag;
function AllTagsWidget(props) {
    const [showAlert, setShowAlert] = useState(false);
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
        return createElement(StyledTagWidget, Object.assign({}, tagProps));
    });
    const alertProps = {
        ...props,
        isOpen: showAlert,
        content: getI18nText(props, I18nKey.DELETE_TAG_TIP),
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
    return (createElement(Fragment, null,
        createElement(SettingBoxContainer, null, tags),
        createElement(Alert, Object.assign({}, alertProps))));
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
        return createElement(StyledTagWidget, Object.assign({ key: tag.name }, tagProps));
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
        return createElement(StyledTagWidget, Object.assign({ key: tag.name }, tagProps));
    });
    return (createElement(Fragment, null,
        createElement(SettingGroup, null,
            createElement(SettingTitle, null, getI18nText(props, I18nKey.ALREADY_ADDED)),
            createElement(SettingBoxContainer, null, topicTagsWidget)),
        createElement(SettingGroup, null,
            createElement(SettingTitle, null, getI18nText(props, I18nKey.CAN_BE_ADDED)),
            createElement(SettingBoxContainer, null, tagsCanBeAddedWidget))));
}

function TagEditor(props) {
    return (createElement(PanelTabRoot, null,
        createElement(SettingBoxContainer, null,
            createElement(SettingTitle, null, getI18nText(props, I18nKey.TAGS_MANAGER)),
            createElement(AddTagWidget, Object.assign({}, props)),
            createElement(AllTagsWidget, Object.assign({}, props))),
        createElement(SettingBoxContainer, null,
            createElement(TopicTagsWidget, Object.assign({}, props)))));
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
                title: getI18nText(props, I18nKey.TAGS),
                panel: createElement(TagEditor, Object.assign({}, props))
            };
            const tab = createElement(Tab, Object.assign({}, tProps));
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
                let list = List();
                for (let tag of topic.extData[EXT_DATA_KEY_TAGS]) {
                    extData = extData.updateIn([EXT_DATA_KEY_TAGS, 'tags'], tags => {
                        return tags.has(tag.name)
                            ? tags.updateIn([tag.name, 'topicKeys'], topicKeys => topicKeys.push(topic.key))
                            : tags.set(tag.name, new TagRecord({
                                name: tag.name,
                                style: tag.style,
                                topicKeys: List([topic.key])
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
                return createElement(TagWidget, Object.assign({}, tagProps));
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
                        topicKeys: List(topicKeys)
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
        ['default', defaultTheme],
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
                opType: OpType.SET_THEME,
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
const ImgContainer = styled(OutsideClickHandler) `
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
    color: ${COLORS.LIGHT.ITEM_BG_ACTIVE};
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
    const [toolbarVisible, setToolbarVisible] = useState(false);
    const [tempSize, setTempSize] = useState({ width, height });
    const [status, setStatus] = useState('normal');
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
                opType: OpType.FOCUS_TOPIC,
                focusMode: FocusMode.EDITING_CONTENT
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
        return createElement(ResizeImg, Object.assign({}, resizeImgProps));
    };
    const renderEditButtons = () => {
        return (createElement(Fragment, null,
            createElement(ResizeIcon, { onMouseDown: prepareResize }),
            createElement(EditButtons, null,
                canMoveUp && (createElement(EditButton, { title: getI18nText(props, I18nKey.MOVE_UP), className: iconClassName(IconName.MOVE_UP), onClick: onClickMoveUp })),
                canMoveDown && (createElement(EditButton, { title: getI18nText(props, I18nKey.MOVE_DOWN), className: iconClassName(IconName.MOVE_DOWN), onClick: onClickMoveDown })),
                !isOriginSize && (createElement(EditButton, { title: getI18nText(props, I18nKey.SET_TO_ORIGINAL_SIZE), className: iconClassName('size-original'), onClick: onClickResetSize })),
                createElement(EditButton, { title: getI18nText(props, I18nKey.DELETE), className: iconClassName(IconName.TRASH), onClick: onClickDelete }))));
    };
    const imgContainerProps = {
        useCapture: false,
        onOutsideClick: onImageOutsideClick
    };
    return (createElement(Root$3, Object.assign({}, rootProps),
        createElement(ImgContainer, Object.assign({}, imgContainerProps),
            createElement(Img, Object.assign({}, imgProps)),
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
        return createElement(ImageWidget, Object.assign({ key: image.key }, imageProps));
    });
    return createElement(Root$4, null, child);
}

const defaultImageRecord = {
    key: null,
    url: null,
    width: null,
    height: null
};
class ImageRecord extends Record(defaultImageRecord) {
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
class TopicImageRecord extends Record(defaultTopicImageRecord) {
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
    images: Map$1(),
    topics: Map$1()
};
// images 和 topics 分开管理，
class ExtDataImages extends Record(defaultExtDataImagesRecord) {
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
    const [inputText, setInputText] = useState(getI18nText(props, I18nKey.CHOOSE_FILE));
    const onInputChange = e => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!['image/png', 'image/jpg', 'image/jpeg', 'image/gif'].includes(file.type)) {
                setInputText(React__default.createElement(ErrorTip, null, getI18nText(props, I18nKey.SELECT_IMAGE_ERR_TIP)));
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
        buttonText: getI18nText(props, I18nKey.BROWSE)
    };
    return (React__default.createElement(Root$5, null,
        React__default.createElement("div", null,
            React__default.createElement(FileInput, Object.assign({}, fileInputProps))),
        React__default.createElement(Tips, null,
            React__default.createElement(Tip, null, getI18nText(props, I18nKey.SELECT_IMAGE_TIP1)),
            React__default.createElement(Tip, null, getI18nText(props, I18nKey.SELECT_IMAGE_TIP2)))));
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
            return topics.set(topicKey, List([topicImage]));
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
    let topicData = extData.topics.get(topicKey) || List();
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
        topicData = swap(topicData, index, index - 1);
    }
    else {
        topicData = swap(topicData, index, index + 1);
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
                        title: getI18nText(ctx, I18nKey.INSERT_IMAGE),
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
            res.push(React__default.createElement(MenuItem, { key: "insert-image", icon: Icon(IconName.IMAGE), text: getI18nText(ctx, I18nKey.INSERT_IMAGE), 
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
                let list = List();
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
                    const record = List(item.map(v => {
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
    const [debugStr, setDebugStr] = useState(localStorage.debug || '');
    const [allDebugNS, setAllDebugNS] = useState(localStorage.allDebugNS.split(',').sort());
    const [nsName, setNsName] = useState('');
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
    const nsNameInput = React__default.createElement(SettingItemInput, Object.assign({}, nameProps));
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
    const addNsBtn = React__default.createElement(SettingItemButton, Object.assign({}, addNsBtnProps));
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
            return React__default.createElement(Checkbox, Object.assign({}, cprops));
        })),
        React__default.createElement(SettingRow, null,
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
            const tab = React__default.createElement(Tab, Object.assign({}, tProps));
            res.push(tab);
            return res;
        }
    };
}

function ContextMenuExportTopic(props) {
    const { controller, model, topicKey, getRef } = props;
    const isMindMap = model.config.viewMode === ViewModeMindMap;
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
            ? getRef(RefKey.NODE_LAYER + model.id)
            : getRef(topicWidgetRootRefKey(topicKey));
        switch (type) {
            case 'png':
            case 'jpg':
                toBlob(topicWidgetEle, options).then(blob => {
                    saveAs(blob, `${title}.${type}`);
                });
                break;
            case 'svg':
                toSvgDataURL(topicWidgetEle, options).then(dataUrl => {
                    saveAs(dataUrl, `${title}.svg`);
                });
                break;
        }
    };
    return (createElement(MenuItem, { icon: Icon(IconName.EXPORT), text: getI18nText(props, I18nKey.EXPORT) },
        createElement(MenuItem, { text: "PNG", onClick: exportTo('png') }),
        createElement(MenuItem, { text: "JPG", onClick: exportTo('jpg') }),
        createElement(MenuItem, { text: "SVG", onClick: exportTo('svg') })));
}

const EXT_KEY_EXPORT_TOPIC = 'EXT_KEY_EXPORT_TOPIC';

function ExportTopicPlugin() {
    return {
        customizeTopicContextMenu(ctx, next) {
            const res = next();
            res.push(createElement(ContextMenuExportTopic, Object.assign({ key: EXT_KEY_EXPORT_TOPIC }, ctx)));
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

export { DebugPlugin, EXT_DATA_KEY_IMAGES, ExportFilePlugin, ExportTopicPlugin, FOCUS_MODE_SEARCH, HOT_KEY_NAME_SEARCH, InsertImagesPlugin, OP_TYPE_ADD_IMAGE, OP_TYPE_ADD_TOPIC_IMAGE, OP_TYPE_DELETE_TOPIC_IMAGE, OP_TYPE_MOVE_TOPIC_IMAGE, OP_TYPE_SET_TOPIC_IMAGE, OpenFilePlugin, SEARCH_QUERY_TEMP_VALUE_KEY, SearchPlugin, SimpleCaptureErrorPlugin, TagsPlugin, ThemeSelectorPlugin, ToolbarGroupItemUndoRedo, ToolbarItemRedo, ToolbarItemSearch, ToolbarItemUndo, TopicReferencePlugin, UndoRedoPlugin, darkTheme1, serializeImage, theme1, theme2, theme3, theme4, themeRandomColorRound, themeRandomColorSquare };
//# sourceMappingURL=main.es.js.map
