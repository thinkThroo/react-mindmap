import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { gantt } from 'dhtmlx-gantt';

import Gantt from './components/Gantt';
import Toolbar from './components/Toolbar';
import MessageArea from './components/MessageArea';
import { getProject, updateProject } from "../../services/project";
import { setActiveWSProjectMW } from "../../store/actions/workspace";

import './index.scss';

const data = {
  data: [
    // { id: 1, text: 'Task #1', start_date: '2020-02-12', duration: 3, progress: 0.6 },
    // { id: 2, text: 'Task #2', start_date: '2020-02-16', duration: 3, progress: 0.4 }
    {
      "!nativeeditor_status": "inserted",
      duration: 1,
      end_date: "2020-08-15 00:00",
      id: 1597290817777,
      parent: 0,
      progress: 0,
      start_date: "2020-08-14 00:00",
      text: "New task"
    }
  ],
  links: [
    // { id: 1, source: 1, target: 2, type: '0' }
  ]
};
class Roadmap extends Component {
  state = {
    currentZoom: 'Days',
    messages: [],
    roadmap: {
      data: [
      //   {
      //   // "!nativeeditor_status": "inserted",
      //   duration: 1,
      //   end_date: "2020-08-15 00:00",
      //   id: 1597290817777,
      //   parent: 0,
      //   progress: 0,
      //   start_date: "2020-08-14 00:00",
      //   text: "New task"
      // }
    ],
      links: []
    }
  };

  // addMessage(message) {
  //   const maxLogLength = 5;
  //   const newMessate = { message };
  //   const messages = [
  //     newMessate,
  //     ...this.state.messages
  //   ];

  //   if (messages.length > maxLogLength) {
  //     messages.length = maxLogLength;
  //   }
  //   this.setState({ messages });
  // }

  updateRoadmap = (type, action, item, id) => {
    const {
      roadmap
    } = this.state;
    if (type == "task") {
      if (action == "create") {
        let data = {
          ...item
        }
        roadmap.data.push(data);
      } else if (action == "update") {
        for (let i = 0; i < roadmap.data.length; i++) {
          debugger;
          if (id == roadmap.data[i].id) {
            roadmap.data[i] = item;
            break;
          }
        }
      }
    } else if (type == "link") {
      // todo
    }
    this.setState({
      roadmap
    }, () => {
      const { workspace_id, id } = this.props.match.params;
      updateProject({roadmap}, workspace_id, id);
    });
  }

  logDataUpdate = (type, action, item, id) => {
    console.log("type:", type, "action:", action, "item:", item, "id:", id);
    // let text = item && item.text ? ` (${item.text})` : '';
    // let message = `${type} ${action}: ${id} ${text}`;
    // if (type === 'link' && action !== 'delete') {
    //   message += ` ( source: ${item.source}, target: ${item.target} )`;
    // }
    // this.addMessage(message);
    delete action["!nativeeditor_status"];
    this.updateRoadmap(type, action, item, id);
  }

  handleZoomChange = (zoom) => {
    this.setState({
      currentZoom: zoom
    });
  }

  handleRoadmapGanttParse = (roadmap) => {
    if (roadmap && Object.keys(roadmap).includes("data")) {
      this.setState({
        roadmap
      });
      gantt.parse(roadmap);
    }
  }

  componentDidMount() {
    // get params
    const { 
            workspace_id,
            id
        } = this.props.match.params;
    console.log("workspace_id", workspace_id);

    const {
        activeWSProject
    } = this.props;

    // if activeWorkspace is null, it means there is a page refresh, because we set activeProject
    // at the time of navigation from dashborad to workspace view
    console.log("about to get worksapcce data, activeWS", activeWSProject);
    if (typeof activeWSProject == "object" && Object.keys(activeWSProject).length == 0) {
        getProject(workspace_id, id).then(res => {
            console.log("calling the middle ware now", res);
            if (res && res.list && res.list[0]) {
                this.props.setActiveWSProjectMW(res.list[0]);
                this.handleRoadmapGanttParse(res.list[0].roadmap);
            }
        })
        .catch(e => {
            console.log("e::", e);
            if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                this.props.history.push("/");
            }
        });
    } else {
      this.handleRoadmapGanttParse(activeWSProject.roadmap);
    }
}

  render() {
    const { currentZoom, messages, roadmap } = this.state;
    console.log("roadmap set?:", roadmap);
    return (
      <div className="tthroo-roadmap">
        <div className="zoom-bar">
          <Toolbar
            zoom={currentZoom}
            onZoomChange={this.handleZoomChange}
          />
        </div>
        <div className="gantt-container">
          <Gantt
            tasks={roadmap}
            zoom={currentZoom}
            onDataUpdated={this.logDataUpdate}
          />
        </div>
        {/* <MessageArea
          messages={messages}
        /> */}
      </div>
    );
  }
}

const mapStateToProps = state => {
  // console.log("inside mapStateToPros func in EDIT PAGE", state);
  return {
    activeWSProject: state.wikis.activeWSProject
  }
}

export default withRouter(connect(
  mapStateToProps,
  {
      setActiveWSProjectMW
   }
)(Roadmap));

