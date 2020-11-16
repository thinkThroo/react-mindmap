let defaultState = {
    id: "",
    meta: {
        isSet: false,
        title: {
            quill: null,
            quillContent: [],
            quillText: null,
            value: "",
            toolbar: [[{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline']],
            placeholder: "Enter Title"
        },
        description: {
            quill: null,
            quillContent: [],
            quillText: null,
            value: "",
            toolbar: [[{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline']],
            placeholder: "Enter Description"
        },
        outcome: {
            quill: null,
            quillContent: [],
            quillText: null,
            value: "",
            toolbar: [[{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline']],
            placeholder: "Enter Outcome"
        },
        reward: {
            quill: null,
            quillContent: [],
            quillText: null,
            value: "",
            toolbar: [[{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline']],
            placeholder: "Enter Reward"
        },
        startTime: null,
        endTime: null,
        label: "",
        status: "",
        duration: null,
        reminders: null
    },
    map: {

    },
    track: {

    },
    analyse: {

    }
}

const activeProject = (state = defaultState, action) => {
    switch(action.type) {
        case "SET_META":
            return {
                ...state,
                meta: action.meta
            }
        case "SET_META_OBJ":
            // debugger;
            return {
                ...state,
                meta: {...state.meta, [action.key]: action.val}
            } 
        default:
            return state;
    }
}

export default activeProject;