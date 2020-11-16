import { urls } from "../utils/config";

export function createWiki(workspace) {
    let payload = {};
    payload.user_id = localStorage.getItem("user_id");
    payload.name = workspace;
    let url = urls.workspace.create;
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
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
                // console.log('Create project response:', data, "WITH parentProjectId", parentProjectId);
                resolve(data);
            })
            .catch((error) => {
                console.error('Error:', error);
                reject(error);
            });
    });
}

export function getWorkspaces() {
    return new Promise((resolve, reject) => {
        fetch(urls.workspace.list + "/" + localStorage.getItem('user_id'), {
            method: 'GET',
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
                // console.log('Projects found list for this user logged in:', data);
                resolve(data);
            })
            .catch((error) => {
                console.log('Error:', error);
                reject(error);
            });
    });
}

export const deleteWorkspaceService = (id) => {
    return new Promise((resolve, reject) => {
        fetch(urls.workspace.base + "/" + localStorage.getItem("user_id") + "/delete/" + id, {
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