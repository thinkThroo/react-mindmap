import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { setActiveProjectMW } from "../../../../store/actions/projects";
import { withRouter } from "react-router-dom";

import "./index.scss";

class Sidebar extends Component {

    resetId = (e) => {
        this.props.setActiveProjectMW(null);
    }

    // return an array from projectType string split based on "+"
    getProjectType = (pt) => {
        // if (pt && pt === "map") {
        //     return "m";
        // } else if (pt && pt === "map+analyse") {
        //     return "ma";
        // } else if (pt && pt ==="map+analyse+reminders") {
        //     return "mar";
        // }
        if (Boolean(pt))
            return pt.split("+");
        else 
            return [];
    }

    render() {

        const {
            activeWSProject
        } = this.props;

        const { 
            workspace_id
        } = this.props.match.params;

        // console.log("activeWSProject in sidebar", activeWSProject);


        let projectType;
        if (activeWSProject) {
            projectType = this.getProjectType(activeWSProject.projectType);
        }

        console.log("projectType::", projectType, "projectType.indexOf('map')", projectType.indexOf("map"));

        return (
            <div className="sidebar">
                {/* <div className="btd">
                    <NavLink 
                        to={`/workspace/${workspace_id}/dashboard`}
                        onClick={this.resetId}
                        className="back-btn"
                        >
                            <img alt="analyse" src="/assets/web/back-nav.svg" />
                    </NavLink>
                </div> */}
                <div className="contents">
                    {   
                        projectType.indexOf("roadmap") != -1 &&
                        <NavLink 
                            to="roadmap" 
                            activeClassName="proj-tab active"
                            className="proj-tab">
                                <img alt="edit-project" src="/assets/web/roadmap.svg" />
                        </NavLink>
                    }
                    {   
                        projectType.indexOf("map") != -1 &&
                        <NavLink 
                            to="edit" 
                            activeClassName="proj-tab active"
                            className="proj-tab">
                                <img alt="edit-project" src="/assets/web/edit-project.svg" />
                        </NavLink>
                    }
                    {
                        projectType.indexOf("analyse") != -1 &&
                        <NavLink 
                            to="assess"
                            activeClassName="proj-tab active"
                            className={!(projectType && projectType.includes("a")) ? "proj-tab" : "proj-tab"}
                            >
                            <img alt="analyse" src="/assets/web/assessment.svg" />
                        </NavLink>
                    }
                    {
                        projectType.indexOf("reminders") != -1 &&
                        <NavLink 
                            to="reminders"
                            activeClassName="proj-tab active"
                            className={!(projectType && projectType.includes("a") && projectType.includes("r")) ? "proj-tab" : "proj-tab"}>
                            <img alt="reminders" src="/assets/web/reminders.svg" />
                        </NavLink>
                    }
                </div>
            </div>
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
        setActiveProjectMW
    }
)(Sidebar))