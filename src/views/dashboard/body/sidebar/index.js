import React, { Component } from "react";
import { connect } from 'react-redux';
import LabelDD from "../../../fragments/edit-dropdowns/label-dd";
import { withRouter } from "react-router-dom";

import "./index.scss";
// import 'react-calendar/dist/Calendar.css';

export class Sidebar extends Component {

    constructor (props) {
        super(props);
        this.createProject = this.createProject.bind(this);
    }

    createProject() {
        const {
            toggleCPModal
        } = this.props;
        toggleCPModal();
    }

    navToWSDashboard = () => {
        this.props.history.push("/workspaces")
    }

    render() {

        return <div className="sidebar">
            <div>
                <button className="sb-btn" onClick={this.navToWSDashboard}>
                    Back
                </button>
            </div>
            <div>
                <button
                    className="sb-btn em c-p"
                    onClick={this.createProject}
                >
                    Create Project
                </button>
            </div>
            {/* <div className="em">
                <LabelDD
                    mode="status"
                />
            </div>
            <div className="em">
                <LabelDD
                    mode="label"
                />
            </div> */}
        </div>
    }
}

const mapStateToProps = state => {
    return { }
}

export default withRouter(connect(
    mapStateToProps,
    { }
)(Sidebar));
