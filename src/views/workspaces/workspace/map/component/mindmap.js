import React from "react";
// // import { Diagram } from "@blink-mind/renderer-react";
// import { Diagram } from "../packages/renderer-react/lib/main";
// // import RichTextEditorPlugin from "@blink-mind/plugin-rich-text-editor";
// import RichTextEditorPlugin from "../packages/plugin-rich-text-editor/lib/main";
// // import { JsonSerializerPlugin } from "@blink-mind/plugin-json-serializer";
// import { JsonSerializerPlugin } from "../packages/plugin-json-serializer/lib/main";
// import { ThemeSelectorPlugin } from "@blink-mind/plugin-theme-selector";
// import TopologyDiagramPlugin from "@blink-mind/plugin-topology-diagram";
// import { TopicReferencePlugin, SearchPlugin } from "@blink-mind/plugins";
// import { Toolbar } from "./toolbar/toolbar";
// import { generateSimpleModel } from "../utils";
// import "@blink-mind/renderer-react/lib/main.css";
import { Diagram } from "../packages/renderer-react/lib/main";
import RichTextEditorPlugin from "../packages/plugin-rich-text-editor/lib/main";
import { JsonSerializerPlugin } from "../packages/plugin-json-serializer/lib/main";
import { ThemeSelectorPlugin } from "../packages/plugin-theme-selector/lib/main";
import TopologyDiagramPlugin from "../packages/plugin-topology-diagram/lib/main";
import { TopicReferencePlugin, SearchPlugin } from "../packages/plugins/lib/main";
import { Toolbar } from "./toolbar/toolbar";
import { generateSimpleModel } from "../utils";
import "../packages/renderer-react/lib/main.css";
import debug from "debug";
import { updateWSProject } from "../../../../../services/project";
import { BlockType, ModelModifier } from "../packages/core/lib/main";

const log = debug("app");

const plugins = [
  RichTextEditorPlugin(),
  ThemeSelectorPlugin(),
  TopicReferencePlugin(),
  SearchPlugin(),
  TopologyDiagramPlugin(),
  JsonSerializerPlugin()
];

export class Mindmap extends React.Component {
  constructor (props) {
    super(props);
    this.initModel();
    window["TThroo"] = {
      editNode: this.editNode,
      bindUpdatedTitle: this.bindUpdatedTitle,
      getMap: this.getMap
    }
  }

  editNode = (enModel) => {
    console.log("node in editNode func", enModel);
    const props = this.diagram.getDiagramProps();
    const { controller, model } = props;
    const json = controller.run("serializeTopic", { ...props, topic: enModel.model.getTopic(enModel.topicKey) });
    const jsonStr = JSON.stringify(json);
    let parsedTopic = JSON.parse(jsonStr);
    // // this.updateWsMap();
    // debugger;
    // let parsedTopic = this.getTopicFromMap(this.props.activeWSProject.map, node);
    // console.log("parsedTopic in EDITNODE", parsedTopic);
    this.props.togglePropertiesModal(parsedTopic);
  }

  diagram;
  diagramRef = ref => {
    this.diagram = ref;
    this.setState({});
  };

  initModel() {
    const {
      workspaces,
      activeWorkspace,
      activeWSProject
    } = this.props;
    const model = generateSimpleModel(activeWSProject, workspaces);
    this.state = { model };
  }

  bindUpdatedTitle = (tk, data, tProps) => {
    console.log("inside bindUpdateTitle function::tk::", tk, "data::", data)
    const props = this.diagram.getDiagramProps();
    const { model } = props;
    debugger;
    // update node title
    let umodel = ModelModifier.setBlockData({
      model: model,
      topicKey: tk,
      blockType: BlockType.CONTENT,
      data
    });
    // update node properties...TODO: this is not working. CHeck again.
    // umodel = umodel.updateIn(['topics', tk, 'properties'], properties => tProps);
    umodel = ModelModifier.setProperties({
      model: model,
      topicKey: tk,
      properties: tProps
    })
    this.setState(
      {
        model: umodel
      }
    );
  }

  onClickUndo = e => {
    const props = this.diagram.getDiagramProps();
    const { controller } = props;
    controller.run("undo", props);
  };

  onClickRedo = e => {
    const props = this.diagram.getDiagramProps();
    const { controller } = props;
    controller.run("redo", props);
  };

  renderDiagram() {
    return (
      <Diagram
        ref={this.diagramRef}
        model={this.state.model}
        onChange={this.onChange}
        plugins={plugins}
      />
    );
  }

  updateWsMap = () => {
    let {
      activeWSProject,
      activeWorkspace
    } = this.props;
    activeWSProject.map = this.getMap();
    console.log("activeWSProject.map", activeWSProject.map);
    updateWSProject(activeWorkspace, activeWSProject)
      .then(res => {
        console.log("res in updateWSProject");
      })
      .catch(e => {
        console.log("e::", e);
        if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
          this.props.history.push("/");
        }
      });
  }

  navBack = () => {
    this.props.navBack();
  }

  renderToolbar() {
    const props = this.diagram.getDiagramProps();
    const { controller } = props;
    const canUndo = controller.run("canUndo", props);
    const canRedo = controller.run("canRedo", props);
    const toolbarProps = {
      diagram: this.diagram,
      onClickUndo: this.onClickUndo,
      onClickRedo: this.onClickRedo,
      canUndo,
      canRedo,
      updateWsMap: this.updateWsMap,
      navBack: this.navBack
    };
    return <Toolbar {...toolbarProps} />;
  }

  onChange = (model, callback) => {
    this.setState(
      {
        model
      },
      callback
    );
  };

  componentDidUpdate() {
    this.initModel();
  }

  getMap = () => {
    const props = this.diagram.getDiagramProps();
    const {
      controller
    } = props;
    const json = controller.run("serializeModel", props);
    const jsonStr = JSON.stringify(json);
    let map = JSON.parse(jsonStr);
    return map;
  }

  getTopicFromMap = (map, node) => {
    for (let i = 0; i < map.topics.length; i++) {
      let t = map.topics[i];
      if (t.key == node.topicKey) {
        return t;
      }
    }
  }

  render() {
    return (
      <div className="mindmap">
        {this.diagram && this.renderToolbar()}
        {this.renderDiagram()}
      </div>
    );
  }
}

export default Mindmap;
