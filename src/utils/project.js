const projectProps = ["title", "description", "outcome", "reward"];

// TODO: CAN THIS BE MOVED TO HANDLE AT BACKEND??
export function updateModel(umData) {
    if (umData) {
        let payload = Object.assign({}, umData);
        // remove quill, quillContent, value, toolbar, placeholder
        projectProps.forEach(prop => {
            delete payload[prop].quill;
            delete payload[prop].quillContent;
            delete payload[prop].toolbar;
            delete payload[prop].placeholder;
        })
        // remove duration, reminders
        delete payload.duration;
        delete payload.reminders;
        return payload;
    } else {
        return {};
    }
}

export function matchModel(data) {
    debugger
    let tasksKeys = Object.keys(data.tasks ? data.tasks : {});
    if ( tasksKeys.length > 0 ) {
        tasksKeys.forEach(key => {
            data.tasks[key] = updateModel(data.tasks[key]);
        })
    } 
    data = updateModel(data);
    return data;
}
