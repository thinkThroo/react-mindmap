import React, { Component } from "react";
import Sidebar from "./sidebar";
import ProjectsList from "./list";
// import Modal from "../../fragments/modal";
import EditComponent from "../../project/edit/edit";

import "./index.scss";

class DashboardBody extends Component {

    // register a collapsible function
    constructor (props) {
        super(props);
        this.state = {
            open: true,
            cpModal: false
        }
        this.togglePanel = this.togglePanel.bind(this);
        this.toggleCPModal = this.toggleCPModal.bind(this);
    }

    togglePanel(e) {
        debugger
        this.setState({ open: !this.state.open })
    }

    toggleCPModal() {
        this.setState({
            cpModal: !this.state.cpModal
        });
    }

    render() {

        const {
            open,
            cpModal,
            workspace_id
        } = this.state;

        return (
            <div className="container">
                <ProjectsList 
                    isSidebarOpen={open}
                />
            </div>
        )
    }
}

export default DashboardBody;