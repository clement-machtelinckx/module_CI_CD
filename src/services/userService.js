import axios from 'axios';

export function getApiBaseUrl() {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
}

export function createApiClient() {
    return axios.create({
        baseURL: getApiBaseUrl(),
    });
}

export async function getUsers() {
    const response = await createApiClient().get('/users');

    return response.data.users;
}

export async function createUser(user) {
    const response = await createApiClient().post('/users', user);

    return response.data;
}
