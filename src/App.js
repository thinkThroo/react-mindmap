import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Dashboard from "./views/dashboard";
import Project from "./views/project/index";
import Login from "./views/login/index";
import WorkspacesDashboard from "./views/workspaces/dashboard/index";
import Workspace from "./views/workspaces/workspace/index";
// import EditProject from "./views/project/edit";
// import AppDemo from "./views/project/map/index";
// import Track from "./views/project/track/index";
// import Analyse from "./views/project/analyse/index";
// import Reminders from "./views/project/reminders/index";

import './App.scss';

function App() {
  return (
    <Router>
      {/* <div className="tthroo-app"> */}
        <Switch>
          <Route exact path="/">
            <Login />
          </Route>
          {/* <Route path="/calendar">
            <TthrooCalendarContainer />
          </Route>
          <Route path="/notes">
            <NotesView />
          </Route> */}
          <Route path="/workspace/:workspace_id/dashboard">
            <Dashboard />
          </Route>
          <Route path="/workspace/:workspace_id/project/:id/:phase">
            <Project />
          </Route>
          <Route path="/workspaces">
            <WorkspacesDashboard />
          </Route>
          <Route path="/workspace/:workspace_id">
            <Workspace />
          </Route>
          {/* <Route path="/map">
            <AppDemo />
          </Route> */}
          {/* <Route path="/project/:id/edit">
            <EditProject />
          </Route>
          <Route path="/project/:id/track">
            <Track />
          </Route>
          <Route path="/project/:id/map">
            <Map />
          </Route>
          <Route path="/project/:id/analyse">
            <Analyse />
          </Route>
          <Route path="/project/:id/reminders">
            <Reminders />
          </Route> */}
        </Switch>
        {/* {
          filter.value === "calendar" ?
          <TthrooCalendarContainer /> :
          <NotesView />
        } */}
      {/* </div> */}
    </Router>
  )
}

export default App;
