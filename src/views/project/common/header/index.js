import React from "react";
import WorkspaceDD from "../../../fragments/workspace-dd";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { setActiveProjectMW } from "../../../../store/actions/projects";

import "./index.scss";

const Header = (props) => {
    const { 
        workspace_id
    } = props.match.params;
    const {
        title
    } = props;

    const resetId = (e) => {
        props.setActiveProjectMW(null);
    }

    return (
        <header class="main-header">

            <div className="hdr-container">
                <NavLink 
                    to={`/workspace/${workspace_id}/dashboard`}
                    onClick={resetId}
                    className="back-btn"
                    >
                        <img alt="analyse" src="/assets/web/back-nav.svg" />
                </NavLink>
                <h1>{title && title.quillText ? title.quillText : "Loading"}</h1>
                <div className="s-ws-container">
                    <WorkspaceDD />
                </div>
                <div className="profile-c">
                    <img className="profile" src="/assets/web/default-profile.svg" alt="profile-icon" />
                </div>
            </div>
        </header>
    )
}

export default withRouter(connect(null,{
    setActiveProjectMW
})(Header));