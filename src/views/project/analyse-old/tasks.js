import React from "react";
import { getDuration } from "../../../services/analyse";
import * as Datetime from 'react-datetime';

const Tasks = ({ projects, activeProjectId, tasksCount, updateProjectMW }) => {
    let tasksLen = Object.keys(projects[activeProjectId].tasks).length;
    let taskKeys = Object.keys(projects[activeProjectId].tasks);
    let tasks = projects[activeProjectId].tasks;
    return (
        // <div>
        //     <ul>
        //         { 
        //             tasksLen > 0 ? 
        //             tasksKey.map((id) => {
        //                 return id != null && tasks[id].title && tasks[id].title.quillText && <li>
        //                     <span>Title: {tasks[id].title.quillText}</span>
        //                     <span style={{marginLeft: '20px'}}>Time Estimated: {getDuration(tasks[id].startTime, tasks[id].endTime).val}</span>
        //                     <span style={{marginLeft: '20px'}}>Time Taken: {getDuration(tasks[id].startTime, tasks[id].timeTaken).val}</span>
        //                 </li>
        //             }) :
        //             <li>You haven't created tasks or added any nodes in map.</li>
        //         }
        //     </ul>
        // </div>
        <div className="analyse">
            <table>
                <tr>
                    <th>Task</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Time Estimated</th>
                    <th>Time Taken</th>
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
                                inputProps={{ placeholder: "Enter start time", readOnly: true }}
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
                                inputProps={{ placeholder: "Enter end time", readOnly: true }}
                                onChange={(value) => {
                                    updateProjectMW({ id: this.props.match.params.id, tid: tasks[key].id, key: "endTime", val: value.toDate() });
                                }}
                            />
                        </td>
                        <td>{getDuration(tasks[key].startTime, tasks[key].endTime).val}</td>
                        <td>
                            {getDuration(tasks[key].startTime, tasks[key].timeTaken).val}
                        </td>
                    </tr>
                    )
                }
            </table>
        </div>
    )
}

export default Tasks;