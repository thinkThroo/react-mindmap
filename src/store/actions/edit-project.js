export const setActiveProject = (id) => ({
    type: 'SET_ACTIVE_PROJECT',
    id
});

export const setActiveProjectMW = (id) => (dispatch) => {
    // console.log("id: in setActiveProjectMW", id);
    dispatch(setActiveProject(id));
}

export const setMeta = (meta) => ({
    type: "SET_META",
    meta
})

export const setMetaMW = (meta) => (dispatch) => {
    // console.log("meta in setMeta", meta);
    dispatch(setMeta(meta));
}

export const setMetaObj = (meta) => ({
    // type: "SET_META_OBJ",
    ...meta
})

export const setMetaObjMW = (meta) => (dispatch) => {
    console.log("meta in setMeta", meta);
    // debugger;
    dispatch(setMetaObj(meta));
}
