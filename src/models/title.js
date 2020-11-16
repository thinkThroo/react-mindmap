class TitleModel {
    constructor(title={}) {
        let ntitle = {
            quill: null,
            quillText: "",
            quillContent: {},
            value: "",
            toolbar: [[{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline']],
            placeholder: "Enter Title"
        };

        this.title = Object.assign({}, {...ntitle});
    }
}

export default TitleModel;