import { defaults } from "../utils/config";

// TODO: MAKE THIS A CLASS THAT CAN BE INSTANTIATED
// export const projectModel = {
//     title: {
//         quill: null,
//         quillText: "",
//         quillContent: null,
//         value: "",
//         toolbar: [[{ header: [1, 2, false] }],
//             ['bold', 'italic', 'underline']],
//         placeholder: "Enter Title"
//     },
//     description: {
//         quill: null,
//         quillText: "",
//         quillContent: null,
//         value: "",
//         toolbar: [[{ header: [1, 2, false] }],
//             ['bold', 'italic', 'underline']],
//         placeholder: "Enter Description"
//     },
//     outcome: {
//         quill: null,
//         quillText: "",
//         quillContent: null,
//         value: "",
//         toolbar: [[{ header: [1, 2, false] }],
//             ['bold', 'italic', 'underline']],
//         placeholder: "Enter Outcome"
//     },
//     reward: {
//         quill: null,
//         quillText: "",
//         quillContent: null,
//         value: "",
//         toolbar: [[{ header: [1, 2, false] }],
//             ['bold', 'italic', 'underline']],
//         placeholder: "Enter Reward"
//     },
//     startTime: null,
//     endTime: null,
//     label: defaults.label,
//     status: defaults.status,
//     duration: "",
//     reminders: null,
//     progress: 0,
//     tasks: 0,
//     date: new Date()
// }

class ProjectModel {
    constructor(project) {
        debugger;
        let newProject = {
            title: {
                quill: null,
                quillText: "",
                quillContent: {},
                toolbar: [[{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline']],
                placeholder: "Enter Title"
            },
            description: {
                quill: null,
                quillText: "",
                quillContent: {},
                toolbar: [[{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline']],
                placeholder: "Enter Description"
            },
            outcome: {
                quill: null,
                quillText: "",
                quillContent: {},
                toolbar: [[{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline']],
                placeholder: "Enter Outcome"
            },
            reward: {
                quill: null,
                quillText: "",
                quillContent: {},
                toolbar: [[{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline']],
                placeholder: "Enter Reward"
            },
            startTime: new Date(),
            endTime: new Date(),
            label: defaults.label,
            status: defaults.status,
            duration: "",
            reminders: null,
            progress: 0,
            tasks: {},
            tasksCount: 0,
            date: new Date(),
            isTask: false,
            offsetForTz: localStorage.getItem("offsetForTz")
        };

        if (Object.keys(project).length !== 0) {
            this.project = Object.assign({}, {...newProject}, {...project});
        } else {
            this.project = Object.assign({}, {...project}, {...newProject});
        }
    }
}

export default ProjectModel;
