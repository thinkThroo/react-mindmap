import React, { Component } from "react";
import Mindmap from "./map/component/mindmap";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getProject } from "../../../services/project";
import { setActiveWSProjectMW } from "../../../store/actions/workspace";

class Workspace extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // get params
        const { workspace_id } = this.props.match.params;
        console.log("workspace_id", workspace_id);

        const {
            workspaces,
            activeWorkspace,
            activeWSProject
        } = this.props;

        // if activeWorkspace is null, it means there is a page refresh, because we set activeProject
        // at the time of navigation from dashborad to workspace view
        console.log("about to get worksapcce data, activeWS", activeWSProject);
        if (typeof activeWSProject == "object" && Object.keys(activeWSProject).length == 0) {
            getProject(workspace_id).then(res => {
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
        this.props.history.push("/workspaces");
    }

    render() {
        const {
            workspaces,
            activeWorkspace,
            activeWSProject
        } = this.props;
        
        return (
            <div>
                {
                    Object.keys(activeWSProject).length != 0 ?
                        <Mindmap 
                            workspaces={workspaces}
                            activeWorkspace={activeWorkspace}
                            navBack={this.navBack}
                        /> : 
                        <div>
                            Loading...
                        </div>
                }
            </div>
        )
    }
}

const mapStateToProps = state => {
    // console.log("inside mapStateToPros func in EDIT PAGE", state);
    return {
        activeWorkspace: state.wikis.activeWSProject,
        workspaces: state.wikis.workspaces
    }
}

export default withRouter(connect(
    mapStateToProps,
    {
        setActiveWSProjectMW
    }
)(Workspace));