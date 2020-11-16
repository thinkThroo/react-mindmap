import React, { Component } from "react";
// import Header from "../../fragments/header";
// import Sidebar from "../common/sidebar";
import TrackComponent from "./track";

import "./index.scss";

class Track extends Component {
    
    render() {
        const {
            isSidebarOpen
        } = this.props;
        return (
            <>
                {/* <Header />
                <Sidebar /> */}
                <TrackComponent 
                    isSidebarOpen={isSidebarOpen}
                />
            </>
        )
    }
}

export default Track;