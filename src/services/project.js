import { urls } from "../utils/config";
import { matchModel } from "../utils/project";

/**
  * throttle function that catches and triggers last invocation
  * use time to see if there is a last invocation
*/
function throttle(callback, delay) {
    let isThrottled = false, args, context;

    function wrapper() {
        if (isThrottled) {
            args = arguments;
            context = this;
            return;
        }

        isThrottled = true;
        callback.apply(this, arguments);

        setTimeout(() => {
            isThrottled = false;
            if (args) {
                wrapper.apply(context, args);
                args = context = null;
            }
        }, delay);
    }

    return wrapper;
}

export function updateProject(payload, workspace_id, project_id) {
    payload.user_id = localStorage.getItem("user_id");
    // payload = matchModel(payload);
    // debugger;
    if (payload) {
        return new Promise((resolve, reject) => {
            fetch(urls.base + "/project/" + localStorage.getItem("user_id") + "/" + workspace_id + "/update/" + project_id, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw {
                            msg: response.statusText,
                            status: response.status
                        }
                    }
                })
                .then((data) => {
                    // TODO: HANDLE .ok CHECK AND THRW ERROR - BEST PRACTISE
                    // console.log('Create project response:', data);
                    resolve(data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                    reject(error);
                });
        });
        //     var ID = function () {
        //         // Math.random should be unique because of its seeding algorithm.
        //         // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        //         // after the decimal.
        //         return '_' + Math.random().toString(36).substr(2, 9);
        //       };
        //     setTimeout(() => {
        //         resolve({id: ID()})
        //     }, 0)
        // });
    }
}

export const updateProjectService = throttle((payload) => {
    debugger
    updateProject(payload)
    .then(res => console.log("res after updating project in updateProject service call", res))
    .catch(e => {
        console.log("e::", e);
        if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
            this.props.history.push("/");
        }
    });
}, 3500)
// throttle(function() {
//     updateProject(payload)
// }, 100)
// updateProject(payload);
// }

export const deleteProjectService = (id, workspace_id) => {
    return new Promise((resolve, reject) => {
        fetch(urls.project.base+"/"+localStorage.getItem('user_id')+`/${workspace_id}/`+ "delete/" + id, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw {
                        msg: response.statusText,
                        status: response.status
                    }
                }
            })
            .then((data) => {
                // TODO: HANDLE .ok CHECK AND THRW ERROR - BEST PRACTISE
                // console.log('delete project response:', data);
                resolve(data);
            })
            .catch((error) => {
                console.error('Error:', error);
                reject(error);
            });
    })
} 

export function getProject(workspaceId, projectId) {
    console.log("in service", workspaceId);
    return new Promise((resolve, reject) => {
        fetch(urls.project.base+"/"+localStorage.getItem('user_id')+"/get/"+workspaceId+"/project/"+projectId, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer '+localStorage.getItem('token'),
                'Content-Type': 'application/json',
            }
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw {
                    msg: response.statusText,
                    status: response.status
                }
            }
        })
        .then((data) => {
            // TODO: HANDLE .ok CHECK AND THRW ERROR - BEST PRACTISE
            // console.log('Projects found list for this user logged in:', data);
            resolve(data);
        })
        .catch((error) => {
            console.error('Error:', error);
            reject(error);
        });
    })
}

export function updateWSProject(ws_id, payload) {
    payload.user_id = localStorage.getItem("user_id");
    debugger;
    if (payload) {
        return new Promise((resolve, reject) => {
            fetch(urls.project.base + "/" + localStorage.getItem("user_id") + "/" + ws_id + "/update/" + payload._id, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw {
                            msg: response.statusText,
                            status: response.status
                        }
                    }
                })
                .then((data) => {
                    // TODO: HANDLE .ok CHECK AND THRW ERROR - BEST PRACTISE
                    // console.log('Create project response:', data);
                    resolve(data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                    reject(error);
                });
        });
    }
}