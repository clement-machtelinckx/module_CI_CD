import axios from 'axios';

export function getAdminApiBaseUrl() {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
}

export function createAdminApiClient() {
    return axios.create({
        baseURL: getAdminApiBaseUrl(),
    });
}

export function createAuthHeaders(token) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

export async function loginAdmin(email, password) {
    const response = await createAdminApiClient().post('/admin/login', {
        email,
        password,
    });

    return response.data;
}

export async function getAdminUsers(token) {
    const response = await createAdminApiClient().get('/admin/users', createAuthHeaders(token));

    return response.data.users;
}

export async function deleteAdminUser(id, token) {
    const response = await createAdminApiClient().delete(`/admin/users/${id}`, createAuthHeaders(token));

    return response.data;
}

export async function updateAdminUser(id, data, token) {
    const response = await createAdminApiClient().patch(
        `/admin/users/${id}`,
        data,
        createAuthHeaders(token)
    );

    return response.data;
}
