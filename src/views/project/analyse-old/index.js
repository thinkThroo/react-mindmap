import React, { Component } from "react";
// import Header from "../../fragments/header";
// import Sidebar from "../common/sidebar";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { setActiveProjectMW } from "../../../store/actions/projects";
import Tasks from "./tasks";
import { updateProjectMW } from "../../../store/actions/projects";

import "react-datetime/css/react-datetime.css";
import "./index.scss";
import "../common/layout.scss";

class Analyse extends Component {

    componentDidMount() {
        const {
            setActiveProjectMW
        } = this.props;
        // get params
        const { id } = this.props.match.params;
        setActiveProjectMW(id);
    }

    render() {
        const {
            projects,
            activeProjectId, 
            tasksCount,
            isSidebarOpen
        } = this.props;
        debugger;
        return (
            <>
                {/* <Header />
                <Sidebar />                 */}
                <div className={isSidebarOpen ? "dv" : "dv toggle"}>
                    <Tasks 
                        projects={projects}
                        activeProjectId={activeProjectId}
                        tasksCount={tasksCount}
                        updateProjectMW={updateProjectMW}
                    />
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        projects: state.projects.list,
        activeProjectId: state.projects.activeProjectId, 
        tasksCount: state.projects.list[state.projects.activeProjectId].tasksCount
    }
}

export default withRouter(connect(
    mapStateToProps,
    { 
        setActiveProjectMW,
        updateProjectMW
    }
)(Analyse));