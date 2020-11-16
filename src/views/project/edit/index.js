import React, { Component } from "react";
// import Header from "../../fragments/header";
// import Sidebar from "../common/sidebar";
// import Quill from "quill";
// import { setActiveProjectMW, updateProjectMW, addProjectMW } from "../../../store/actions/projects";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import EditComponent from "./edit";
import Mindmap from "../../workspaces/workspace/map/component/mindmap";
// import { projectModel } from "../../../../../../models";
// import { defaults } from "../../../../../../utils/config";
import { setActiveWSProjectMW } from "../../../store/actions/workspace";
import { getProject, updateWSProject } from "../../../services/project";
import { updateModel } from "../../../utils/project";

import "../../workspaces/workspace/map/component/mindmap.scss";

class EditProject extends Component {

    state = {
        togglePropertiesModalSt: false,
        topic: {}
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
                }
            })
            .catch(e => {
                console.log("e::", e);
                if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                    this.props.history.push("/");
                }
            });
        }
    }

    navBack = () => {
        this.props.history.push(`/workspace/${this.props.match.params.workspace_id}/dashboard`);
    }

    togglePropertiesModal = (topic) => {
        // get topic data clicked from model
        console.log("topic in edit module::", topic);
        this.setState({
            togglePropertiesModalSt: !this.state.togglePropertiesModalSt,
            topic: topic
        })
    }

    updateProperties = (topic, tProps) => {
        // console.log("inside updateProperties::topic::", topic, "tProps::", tProps, 'map::', this.props.activeWSProject);
        // let map = this.props.activeWSProject.map;
        let map = window["TThroo"].getMap();
        for (let i=0; i < map.topics.length; i++) {
            let t = map.topics[i];
            if (t.key == topic.key) {
                t.properties = updateModel(tProps);
                break;
            }
        }
        console.log("updated map properties, this should have properties updated and should be saved::", map);
        let activeWSProject = this.props.activeWSProject;
        activeWSProject.map = map;
        this.props.setActiveWSProjectMW(activeWSProject);
        // call initModel in mindmap.js func
        window["TThroo"].bindUpdatedTitle(topic.key, tProps.title.quillText, tProps);
        updateWSProject(this.props.match.params.workspace_id, activeWSProject)
        .then(res => {
            console.log("res in updateWSProject");
        })
        .catch(e => {
            console.log("e::", e);
            if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                this.props.history.push("/");
            }
        });
        this.setState({
            topic
        });
    }

    render() {     

        const {
            // modalView,
            togglePropertiesModalSt,
            topic
        } = this.state;

        const {
            activeWSProject
        } = this.props;

        console.log("activeWSProject--##???", activeWSProject);

        return (
            <>
                {
                    Object.keys(activeWSProject).length != 0 
                    ? 
                    <Mindmap 
                        workspaces={[]}
                        activeWorkspace={this.props.match.params.workspace_id}
                        activeWSProject={this.props.activeWSProject}
                        projectId={this.props.match.params.id}
                        navBack={this.navBack}
                        togglePropertiesModal={this.togglePropertiesModal}
                    /> :
                    <div className="mindmap">Loading...</div>
                }

                { 
                    togglePropertiesModalSt && 
                    <EditComponent
                        mode="track"
                        toggleEditModal={this.togglePropertiesModal}
                        topic={topic}
                        updateProperties={this.updateProperties}
                    />
                }
            </>
        )
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
)(EditProject));