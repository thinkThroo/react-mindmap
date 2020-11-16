import React from "react";
import WorkspaceDD from "./workspace-dd";

import "./header.scss";

const Header = () => {
    return (
        <header class="main-header">

            <div className="hdr-container">
                <div className="tthroo-logo-container">
                    <img className="tthroo-logo" src="/assets/web/tthroo-logo.svg" alt="TThroo.io" />
                    <span className="tthroo">TThroo</span>
                </div>
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

export default Header;