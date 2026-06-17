import axios from 'axios';
import {
    createAdminApiClient,
    createAuthHeaders,
    deleteAdminUser,
    getAdminApiBaseUrl,
    getAdminUsers,
    loginAdmin,
    updateAdminUser,
} from './adminService.js';

jest.mock('axios', () => ({
    create: jest.fn(),
}));

describe('adminService', () => {
    let apiClient;

    beforeEach(() => {
        apiClient = {
            get: jest.fn(),
            post: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
        };

        axios.create.mockReturnValue(apiClient);
        delete process.env.REACT_APP_API_URL;
    });

    it('uses localhost as default API base URL', () => {
        expect(getAdminApiBaseUrl()).toBe('http://localhost:8000');
    });

    it('uses REACT_APP_API_URL when configured', () => {
        process.env.REACT_APP_API_URL = 'http://api.test';

        expect(getAdminApiBaseUrl()).toBe('http://api.test');
    });

    it('creates an Axios client with the configured base URL', () => {
        process.env.REACT_APP_API_URL = 'http://api.test';

        expect(createAdminApiClient()).toBe(apiClient);
        expect(axios.create).toHaveBeenCalledWith({ baseURL: 'http://api.test' });
    });

    it('creates authorization headers', () => {
        expect(createAuthHeaders('token-123')).toEqual({
            headers: {
                Authorization: 'Bearer token-123',
            },
        });
    });

    it('logs an admin in', async () => {
        const loginResponse = {
            token: 'token-123',
            admin: { email: 'admin@example.com' },
        };
        apiClient.post.mockResolvedValue({ data: loginResponse });

        await expect(loginAdmin('admin@example.com', 'secret')).resolves.toBe(loginResponse);
        expect(apiClient.post).toHaveBeenCalledWith('/admin/login', {
            email: 'admin@example.com',
            password: 'secret',
        });
    });

    it('fetches admin users with Authorization header', async () => {
        const users = [{ id: 1, email: 'john@example.com' }];
        apiClient.get.mockResolvedValue({ data: { users } });

        await expect(getAdminUsers('token-123')).resolves.toBe(users);
        expect(apiClient.get).toHaveBeenCalledWith('/admin/users', {
            headers: {
                Authorization: 'Bearer token-123',
            },
        });
    });

    it('deletes an admin user with Authorization header', async () => {
        apiClient.delete.mockResolvedValue({ data: { deletedId: 1 } });

        await expect(deleteAdminUser(1, 'token-123')).resolves.toEqual({ deletedId: 1 });
        expect(apiClient.delete).toHaveBeenCalledWith('/admin/users/1', {
            headers: {
                Authorization: 'Bearer token-123',
            },
        });
    });

    it('updates an admin user with Authorization header', async () => {
        const partialUser = { city: 'Paris' };
        apiClient.patch.mockResolvedValue({ data: { id: 1, ...partialUser } });

        await expect(updateAdminUser(1, partialUser, 'token-123')).resolves.toEqual({ id: 1, ...partialUser });
        expect(apiClient.patch).toHaveBeenCalledWith(
            '/admin/users/1',
            partialUser,
            {
                headers: {
                    Authorization: 'Bearer token-123',
                },
            }
        );
    });
});
