import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import {
    adminEmailStorageKey,
    adminTokenStorageKey,
} from './Composants/AdminLogin.jsx';
import { getAdminUsers } from './services/adminService.js';
import { getUsers } from './services/userService.js';

jest.mock('./services/adminService.js', () => ({
    deleteAdminUser: jest.fn(),
    getAdminUsers: jest.fn(),
    loginAdmin: jest.fn(),
    updateAdminUser: jest.fn(),
}));

jest.mock('./services/userService.js', () => ({
    createUser: jest.fn(),
    getUsers: jest.fn(),
}));

const publicUsers = [
    {
        id: 1,
        name: 'Machtelinckx',
        firstName: 'Clem',
        city: 'Cannes',
    },
    {
        id: 2,
        name: 'Dupont',
        firstName: 'Jean',
        city: 'Paris',
    },
];

describe('App', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        getUsers.mockResolvedValue(publicUsers);
        getAdminUsers.mockResolvedValue(publicUsers);
    });

    it('renders the counter, public API users count, admin login, documentation link and form', async () => {
        render(<App />);

        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /users manager/i })).toBeInTheDocument();
        expect(await screen.findByText(/2 utilisateur\(s\) récupéré\(s\) depuis l'api/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /voir la documentation/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /administration/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /connexion admin/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /formulaire/i })).toBeInTheDocument();
        expect(screen.getByDisplayValue(/sauvegarder/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /liste des inscrits/i })).toBeInTheDocument();
    });

    it('starts in admin mode when a token and email are stored', async () => {
        localStorage.setItem(adminTokenStorageKey, 'token-123');
        localStorage.setItem(adminEmailStorageKey, 'admin@example.com');

        render(<App />);

        expect(screen.getByRole('status')).toHaveTextContent(/connecté en tant que admin@example.com/i);
        expect(await screen.findByText(/2 utilisateur\(s\) récupéré\(s\) depuis l'api/i)).toBeInTheDocument();
        expect(getAdminUsers).toHaveBeenCalledWith('token-123');

        fireEvent.click(screen.getByRole('button', { name: /déconnexion/i }));

        await waitFor(() => expect(getUsers).toHaveBeenCalled());
        expect(screen.getByRole('button', { name: /connexion admin/i })).toBeInTheDocument();
        expect(localStorage.getItem(adminTokenStorageKey)).toBeNull();
    });
});
