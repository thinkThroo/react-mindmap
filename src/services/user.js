import { urls } from "../utils/config";

export const login = (payload) => {
    return new Promise((resolve, reject) => {
        fetch(urls.user.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
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
                console.log('Success login:', data);
                resolve(data);
            })
            .catch((error) => {
                console.error('Error:', error);
                reject(error);
            });
    });
}

export const register = (payload) => {
    return new Promise((resolve, reject) => {
        fetch(urls.user.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
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
            console.log('Success register:', data);
            resolve(data);
        })
        .catch((error) => {
            console.error('Error:', error);
            reject(error);
        });
    });
}