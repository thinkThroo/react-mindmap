import React, { Component } from "react";
// import Header from "../../fragments/header";
// import Sidebar from "../common/sidebar";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { setActiveProjectMW, updateProjectMW } from "../../../store/actions/projects";
import Notify from "./notify";
import { getDuration } from "../../../services/analyse";
import * as Datetime from 'react-datetime';

import "./index.scss";

class Reminders extends Component {
    
    ws = null;

    componentDidMount() {
        const {
            setActiveProjectMW
        } = this.props;
        // get params
        const { id } = this.props.match.params;
        setActiveProjectMW(id);        
    }

    formatAMPM = (d) => {
        let minutes = d.getMinutes().toString().length == 1 ? '0' + d.getMinutes() : d.getMinutes(),
            hours = d.getHours().toString().length == 1 ? '0' + d.getHours() : d.getHours(),
            ampm = d.getHours() >= 12 ? 'pm' : 'am',
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear() + ' ' + hours + ':' + minutes + ampm;
    }

    calcDuration(activeProject) {
        this.setState({ duration: getDuration(activeProject.startTime, activeProject.endTime).val });
    }

    render() {
        const {
            isSidebarOpen,
            projects,
            activeProjectId,
            updateProjectMW
        } = this.props;
        let tasks = projects[activeProjectId].tasks;
        let taskKeys = Object.keys(projects[activeProjectId].tasks);
        return (
            <>
                {/* <Header />
                <Sidebar />                 */}
                <div className={isSidebarOpen ? "dv" : "dv toggle"}>
                    <div className="reminders">
                        <table>
                            <tr>
                                <th>Task</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Duration</th>
                                <th>Remind me at</th>
                            </tr>
                            {
                                taskKeys.map((key) => <tr>
                                        <td className="title-col-width">{tasks[key].title.quillText}</td>
                                        <td>
                                            {/* {this.formatAMPM(tasks[key].startTime)} */}
                                            <Datetime
                                                viewMode="time"
                                                timeFormat={true}
                                                value={tasks[key].startTime}
                                                inputProps={{ placeholder: "Enter start time", readOnly: true}}
                                                onChange={(value) => {
                                                    updateProjectMW({ id: this.props.match.params.id, tid: tasks[key].id, key: "startTime", val: value.toDate() });
                                                }}
                                            />
                                        </td>
                                        <td>
                                            {/* {this.formatAMPM(tasks[key].endTime)} */}
                                            <Datetime
                                                viewMode="time"
                                                timeFormat={true}
                                                value={tasks[key].endTime}
                                                inputProps={{ placeholder: "Enter end time", readOnly: true}}
                                                onChange={(value) => {
                                                    updateProjectMW({ id: this.props.match.params.id, tid: tasks[key].id, key: "endTime", val: value.toDate() });
                                                }}
                                            />
                                        </td>
                                        <td>{getDuration(tasks[key].startTime, tasks[key].endTime).val}</td>
                                        <td>
                                            {/* {this.formatAMPM(tasks[key].endTime)} */}
                                            <Datetime
                                                viewMode="time"
                                                timeFormat={true}
                                                value={tasks[key].endTime}
                                                inputProps={{ placeholder: "Enter start time", readOnly: true, disabled: true}}
                                                // onChange={(value) => {
                                                //     this.props.updateProjectMW({ id: this.props.id, tid, key: "startTime", val: value.toDate() });
                                                //     this.calcDuration({ ...activeProject, startTime: value.toDate() });
                                                // }}
                                            />
                                        </td>
                                    </tr>
                                )
                            }
                        </table>
                        <Notify
                            id={this.props.match.params.id}
                        // title={}
                        // body={}
                        // startTime={}
                        // endTime={}
                        />
                    </div>
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
)(Reminders));