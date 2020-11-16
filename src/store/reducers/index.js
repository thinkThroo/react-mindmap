import { combineReducers } from 'redux';
import tasks from './add-task';
import events from "./events";
import filter from "./filter";
import notes from "./notes";
// import status from "./status";
// import label from "./label";
import sideBar from "./sidebar";
import projects from "./projects";
import activeProject from "./edit-project";
import wikis from "./workspace";
import projectModal from "./project-modal";

export default combineReducers({
    tasks,
    events,
    filter,
    notes,
    // status,
    // 
    sideBar,
    projects,
    activeProject,
    wikis,
    projectModal
})