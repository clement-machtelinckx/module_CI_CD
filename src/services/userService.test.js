import axios from 'axios';
import {
    createApiClient,
    createUser,
    getApiBaseUrl,
    getUsers,
} from './userService.js';

jest.mock('axios', () => ({
    create: jest.fn(),
}));

describe('userService', () => {
    let apiClient;

    beforeEach(() => {
        apiClient = {
            get: jest.fn(),
            post: jest.fn(),
        };

        axios.create.mockReturnValue(apiClient);
        delete process.env.REACT_APP_API_URL;
    });

    it('uses localhost as default API base URL', () => {
        expect(getApiBaseUrl()).toBe('http://localhost:8000');
    });

    it('uses REACT_APP_API_URL when configured', () => {
        process.env.REACT_APP_API_URL = 'http://api.test';

        expect(getApiBaseUrl()).toBe('http://api.test');
    });

    it('creates an Axios client with the configured base URL', () => {
        process.env.REACT_APP_API_URL = 'http://api.test';

        expect(createApiClient()).toBe(apiClient);
        expect(axios.create).toHaveBeenCalledWith({ baseURL: 'http://api.test' });
    });

    it('fetches users', async () => {
        const users = [{ id: 1, email: 'john@example.com' }];
        apiClient.get.mockResolvedValue({ data: { users } });

        await expect(getUsers()).resolves.toBe(users);
        expect(apiClient.get).toHaveBeenCalledWith('/users');
    });

    it('creates a user', async () => {
        const user = { name: 'Dupont', email: 'dupont@example.com' };
        apiClient.post.mockResolvedValue({ data: { id: 1, ...user } });

        await expect(createUser(user)).resolves.toEqual({ id: 1, ...user });
        expect(apiClient.post).toHaveBeenCalledWith('/users', user);
    });

});
