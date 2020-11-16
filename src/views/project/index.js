import React, { Component } from "react";
import Header from "./common/header/index";
import Sidebar from "./common/sidebar";
import { setActiveProjectMW } from "../../store/actions/projects";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import EditProject from "./edit";
import Reminders from "./reminders/index";
import Assess from "./assess/index";
import Roadmap from "../roadmap/index";

import "./index.scss";

class Project extends Component {

    componentDidMount() {
        // get params
        const { id } = this.props.match.params;
        setActiveProjectMW(id);
    }


    render() {
        const {
            phase
        } = this.props.match.params;

        const {
            activeWSProject
        } = this.props;

        let View = null;
        if (phase == "edit")
            View = <EditProject />;
        else if (phase == "assess")
            View = <Assess />;
        else if (phase == "reminders")
            View = <Reminders />;
        else if (phase == "roadmap")
            View = <Roadmap />
        return (
            <>
                <Header 
                    title={activeWSProject && activeWSProject.title ? activeWSProject.title : null}
                />
                <div className="project-sb-w">
                    <Sidebar />
                </div>
                {View ? View : <div>Page you are looking for is not found.</div>}
            </>
        )
    }
}

const mapStateToProps = state => {
    // console.log("inside mapStateToPros func in EDIT PAGE", state);
    return {
        meta: state.projects,
        activeProjectId: state.projects.activeProjectId,
        activeWSProject: state.wikis.activeWSProject
    }
}

export default withRouter(connect(
    mapStateToProps,
    {
        setActiveProjectMW
    }
)(Project));