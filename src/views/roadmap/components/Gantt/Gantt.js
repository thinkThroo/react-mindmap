import React, { Component } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

export default class Gantt extends Component {

  constructor (props) {
    super(props);
    this.initZoom();
  }

  // instance of gantt.dataProcessor
  dataProcessor = null;

  initZoom() {
    gantt.ext.zoom.init({
      levels: [
        {
          name: 'Hours',
          scale_height: 60,
          min_column_width: 30,
          scales: [
            { unit: 'day', step: 1, format: '%d %M' },
            { unit: 'hour', step: 1, format: '%H' }
          ]
        },
        {
          name: 'Days',
          scale_height: 60,
          min_column_width: 70,
          scales: [
            { unit: 'week', step: 1, format: 'Week #%W' },
            { unit: 'day', step: 1, format: '%d %M' }
          ]
        },
        {
          name: 'Months',
          scale_height: 60,
          min_column_width: 70,
          scales: [
            { unit: "month", step: 1, format: '%F' },
            { unit: 'week', step: 1, format: '#%W' }
          ]
        },
        {
          name: 'Quarter',
          height: 50,
          min_column_width: 90,
          scales: [
            { unit: "month", step: 1, format: "%M" },
            {
              unit: "quarter", step: 1, format: function (date) {
                var dateToStr = gantt.date.date_to_str("%M");
                var endDate = gantt.date.add(gantt.date.add(date, 3, "month"), -1, "day");
                return dateToStr(date) + " - " + dateToStr(endDate);
              }
            }]
        },
        {
          name: 'Year',
          scale_height: 50,
          min_column_width: 30,
          scales:[
            {unit: "year", step: 1, format: "%Y"}
          ]
        }
      ]
    });
  }

  setZoom(value) {
    gantt.ext.zoom.setLevel(value);
  }

  specifyColumns = () => {

    var textEditor = { type: "text", map_to: "text" };
    var dateEditor = { type: "date", map_to: "start_date", min: new Date(2018, 0, 1) };
    var durationEditor = { type: "number", map_to: "duration", min: 0, max: 100 };

    gantt.config.columns = [
      // { name: "text", tree: true, width: '*', resize: true, editor: textEditor },
      // { name: "start_date", align: "center", resize: true, editor: dateEditor },
      // { name: "duration", label: "Duration (in Hours)", align: "center", editor: durationEditor },
      // { name: "add", width: 44 }
      {name:"text",       label:"Task name",  tree:true, width:"*", editor: textEditor },
      {name:"start_date", label:"Start Date", width: 120, align:"center", editor: dateEditor  },
      // {name:"end_date",   label:"End date",   width: 120, align:"center", editor: dateEditor  },
      { name: "duration", label: "Duration", align: "center", editor: durationEditor },
      // {name:"progress",   label:"Progress",   align:"center" },
      { name: "add", width: 44 }
    ];

    // specify minimum task duration
    gantt.config.min_duration = 60*60*1000;
  }

  setupQuickInfo = () => {
    gantt.config.quickinfo_buttons=["icon_delete","icon_edit", "view_mindmap"];
    gantt.locale.labels["view_mindmap"] = "View Mindmap";

    // register click event on advacned info
    gantt.$click.buttons.view_mindmap=function(id){
      alert("These are view_mindmap details");
      return false; //blocks the default behavior
    };
  }

  initGanttDataProcessor() {
    /**
     * type: "task"|"link"
     * action: "create"|"update"|"delete"
     * item: data object object
     */
    const onDataUpdated = this.props.onDataUpdated;
    this.dataProcessor = gantt.createDataProcessor((type, action, item, id) => {
      return new Promise((resolve, reject) => {
        if (onDataUpdated) {
          onDataUpdated(type, action, item, id);
        }

        // if onDataUpdated changes returns a permanent id of the created item, you can return it from here so dhtmlxGantt could apply it
        // resolve({id: databaseId});
        return resolve();
      });
    });
  }

  shouldComponentUpdate(nextProps) {
    return this.props.zoom !== nextProps.zoom;
  }

  componentDidMount() {
    gantt.config.xml_date = "%Y-%m-%d %H:%i";
    const { tasks } = this.props;
    console.log("gantt:", gantt);
    gantt.plugins({ 
      // tooltip: true ,
      tooltip: true,
      quick_info: true
    }); 
    this.specifyColumns();
    this.setupQuickInfo();
    gantt.init(this.ganttContainer);
    gantt.templates.tooltip_text = function(start,end,task){
      return "<b>Task:</b> "+task.text+"<br/><b>Start date:</b> " + 
      gantt.templates.tooltip_date_format(start)+ 
      "<br/><b>End date:</b> "+gantt.templates.tooltip_date_format(end);
    };
    gantt.config.lightbox.sections=[
      {name:"description", height:70, map_to:"text", type:"textarea",focus:true},
      {name:"period",      height:72, map_to:"auto", type:"time", time_format:["%H:%i","%d","%m","%Y"]}, 
    ];
    gantt.locale.labels.section_period = "Time period";
    // duration unit
    // gantt.config.duration_unit = "hour";
    this.initGanttDataProcessor();
    gantt.parse(tasks);
  }

  componentWillUnmount() {
    if (this.dataProcessor) {
      this.dataProcessor.destructor();
      this.dataProcessor = null;
    }
  }

  render() {
    const { zoom } = this.props;
    this.setZoom(zoom);
    return (
      <div
        ref={(input) => { this.ganttContainer = input }}
        style={{ width: '100%', height: '100%' }}
      ></div>
    );
  }
}
