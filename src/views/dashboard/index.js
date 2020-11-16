import React, { Component } from "react";
import Header from "../fragments/header";
import DashboardBody from "./body";

import "./index.scss";

class Dashboard extends Component {

    render() {
        return (
            <>
                <Header />
                <DashboardBody />
            </>
        )
    }
}

export default Dashboard;