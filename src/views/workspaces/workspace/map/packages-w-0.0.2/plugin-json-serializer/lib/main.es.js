import { Model, FocusMode, Config, Topic, Block } from '@blink-mind/core';
import debug from 'debug';
import { Map, isImmutable, List } from 'immutable';

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

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var log = debug('plugin:json-serializer');
function JsonSerializerPlugin() {
    return {
        serializeModel: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var model = props.model, controller = props.controller;
            var obj = {
                rootTopicKey: model.rootTopicKey,
                editorRootTopicKey: model.editorRootTopicKey,
                focusKey: model.focusKey,
                extData: controller.run('serializeExtData', __assign(__assign({}, props), { extData: model.extData })),
                topics: model.topics
                    .valueSeq()
                    .toArray()
                    .map(function (topic) { return controller.run('serializeTopic', __assign(__assign({}, props), { topic: topic })); }),
                config: controller.run('serializeConfig', __assign(__assign({}, props), { config: model.config })),
                formatVersion: model.formatVersion
            };
            return obj;
        },
        deserializeModel: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var obj = props.obj, controller = props.controller;
            if (obj.formatVersion == null) {
                obj.formatVersion = '0.0';
            }
            var rootTopicKey = obj.rootTopicKey, editorRootTopicKey = obj.editorRootTopicKey, focusKey = obj.focusKey, topics = obj.topics, config = obj.config, extData = obj.extData, formatVersion = obj.formatVersion;
            var res = new Model();
            res = res.merge({
                rootTopicKey: rootTopicKey,
                editorRootTopicKey: editorRootTopicKey == null ? rootTopicKey : editorRootTopicKey,
                focusKey: focusKey,
                extData: controller.run('deserializeExtData', __assign(__assign({}, props), { extData: extData,
                    formatVersion: formatVersion })),
                config: controller.run('deserializeConfig', __assign(__assign({}, props), { config: config,
                    formatVersion: formatVersion })),
                topics: controller.run('deserializeTopics', __assign(__assign({}, props), { topics: topics,
                    formatVersion: formatVersion })),
                formatVersion: obj.formatVersion
            });
            if (res.focusKey == null) {
                res = res.set('focusKey', res.rootTopicKey);
            }
            if (res.focusMode == null) {
                res = res.set('focusMode', FocusMode.NORMAL);
            }
            log('deserializeModel', res);
            return res;
        },
        serializeExtData: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var extData = props.extData, controller = props.controller;
            var res = {};
            extData.forEach(function (v, k) {
                res[k] = controller.run('serializeExtDataItem', {
                    props: props,
                    extDataKey: k,
                    extDataItem: v
                });
            });
            return res;
        },
        deserializeExtData: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var extData = props.extData, controller = props.controller;
            var res = Map();
            for (var extDataKey in extData) {
                res = res.set(extDataKey, controller.run('deserializeExtDataItem', __assign(__assign({}, props), { extDataKey: extDataKey, extDataItem: extData[extDataKey] })));
            }
            return res;
        },
        serializeExtDataItem: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var extDataItem = props.extDataItem;
            if (isImmutable(extDataItem)) {
                return extDataItem.toJS();
            }
            return extDataItem;
        },
        deserializeExtDataItem: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var extDataItem = props.extDataItem;
            return extDataItem;
        },
        serializeConfig: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var config = props.config;
            return config.toJS();
        },
        deserializeConfig: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var config = props.config;
            return new Config(config);
        },
        serializeTopic: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var topic = props.topic, controller = props.controller;
            console.log("props in serializeTopic:", props);
            var blocks = topic.blocks.map(function (block) {
                return controller.run('serializeBlock', __assign(__assign({}, props), { block: block }));
            });
            var blocksStr = JSON.stringify(blocks);
            var parsedBlocks = JSON.parse(blocksStr);
            console.log("in serializeTopci function::, checking what's in topic.properties", topic.properties);
            return {
                key: topic.key,
                parentKey: topic.parentKey,
                subKeys: topic.subKeys.toArray(),
                collapse: topic.collapse,
                style: topic.style,
                blocks: blocks,
                properties: topic.properties ? topic.properties : {
                    title: {
                        quillText: parsedBlocks[0].data
                    },
                }
                // properties: {
                //   title: {
                //     quillText: parsedBlocks[0].data
                //   }
                // }
            };
        },
        deserializeTopic: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var topic = props.topic, controller = props.controller;
            var key = topic.key, parentKey = topic.parentKey, subKeys = topic.subKeys, blocks = topic.blocks, style = topic.style, collapse = topic.collapse, task_id = topic.task_id;
            var res = new Topic();
            res = res.merge({
                key: key,
                parentKey: parentKey,
                subKeys: List(subKeys),
                style: style,
                collapse: collapse,
                blocks: controller.run('deserializeBlocks', __assign(__assign({}, props), { blocks: blocks })),
                task_id: task_id
            });
            return res;
        },
        deserializeTopics: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var topics = props.topics, controller = props.controller;
            var res = Map();
            res = res.withMutations(function (r) {
                topics.forEach(function (topic) {
                    return r.set(topic.key, controller.run('deserializeTopic', __assign(__assign({}, props), { topic: topic })));
                });
            });
            return res;
        },
        serializeBlock: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var block = props.block, controller = props.controller;
            var res = {
                type: block.type,
                data: controller.run('serializeBlockData', __assign({}, props))
            };
            return res;
        },
        serializeBlockData: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var block = props.block;
            return block.data;
        },
        deserializeBlock: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var block = props.block, controller = props.controller;
            var type = block.type;
            return new Block({
                type: type,
                data: controller.run('deserializeBlockData', __assign(__assign({}, props), { block: block }))
            });
        },
        deserializeBlockData: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var block = props.block;
            return block.data;
        },
        deserializeBlocks: function (props, next) {
            var nextRes = next();
            if (nextRes != null)
                return nextRes;
            var blocks = props.blocks, controller = props.controller;
            var res = List();
            res = res.withMutations(function (res) {
                blocks.forEach(function (block) {
                    return res.push(controller.run('deserializeBlock', __assign(__assign({}, props), { block: block })));
                });
            });
            return res;
        }
    };
}

export { JsonSerializerPlugin };
//# sourceMappingURL=main.es.js.map
