import { urls } from "../utils/config";
import ProjectModel from "../models/index";
import { matchModel } from "../utils/project";

export function createProject(payload, workspace_id) {
    payload.user_id = localStorage.getItem("user_id");
    payload.workspace_id = workspace_id;
    let url = urls.project.base + "/" + localStorage.getItem("user_id") + `/${workspace_id}` + "/create";
    return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem('token'),
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
                resolve(data);
            })
            .catch((error) => {
                console.error('Error:', error);
                reject(error);
            });
        });
}

export function getProjects(workspace_id) {
    return new Promise((resolve, reject) => {
        fetch(urls.project.base+"/"+localStorage.getItem('user_id')+`/${workspace_id}/`+"list", {
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
    });
}