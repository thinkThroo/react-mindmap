import React, { Component } from "react";

class Select extends Component {
    constructor (props) {
        super();
        this.state = {
            tech: 'select'
        };
    }
    render() {
        return (
            <div>
                <select id="lang" onChange={this.props.handleProjectTypeChange} value={this.props.projectType}>
                    <option value="select">Select Project Type</option>
                    <option value="map">Map</option>
                    <option value="map+analyse">Map + Analyse</option>
                    <option value="map+analyse+reminders">Map + Analyse + Reminders</option>
                </select>
            </div>
        )
    }
}

export default Select;