import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminLogin, {
    adminEmailStorageKey,
    adminTokenStorageKey,
} from './AdminLogin.jsx';
import { loginAdmin } from '../services/adminService.js';

jest.mock('../services/adminService.js', () => ({
    loginAdmin: jest.fn(),
}));

describe('AdminLogin', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        loginAdmin.mockResolvedValue({
            token: 'token-123',
            admin: { email: 'admin@example.com' },
        });
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('logs an admin in and stores only token and email', async () => {
        const onLogin = jest.fn();

        render(<AdminLogin adminSession={null} onLogin={onLogin} onLogout={jest.fn()} />);

        fireEvent.change(screen.getByLabelText(/^email admin/i), {
            target: { value: ' admin@example.com ' },
        });
        fireEvent.change(screen.getByLabelText(/^mot de passe admin/i), {
            target: { value: 'secret-password' },
        });
        fireEvent.click(screen.getByRole('button', { name: /connexion admin/i }));

        await waitFor(() => expect(loginAdmin).toHaveBeenCalledWith('admin@example.com', 'secret-password'));

        expect(localStorage.getItem(adminTokenStorageKey)).toBe('token-123');
        expect(localStorage.getItem(adminEmailStorageKey)).toBe('admin@example.com');
        expect(localStorage.getItem('adminPassword')).toBeNull();
        expect(onLogin).toHaveBeenCalledWith({
            token: 'token-123',
            email: 'admin@example.com',
        });
    });

    it('shows an error when login fails', async () => {
        loginAdmin.mockRejectedValue(new Error('bad credentials'));

        render(<AdminLogin adminSession={null} onLogin={jest.fn()} onLogout={jest.fn()} />);

        fireEvent.change(screen.getByLabelText(/^email admin/i), {
            target: { value: 'admin@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/^mot de passe admin/i), {
            target: { value: 'bad-password' },
        });
        fireEvent.click(screen.getByRole('button', { name: /connexion admin/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/identifiants admin invalides/i);
        expect(localStorage.getItem(adminTokenStorageKey)).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('logs an admin out and clears stored session', () => {
        const onLogout = jest.fn();
        localStorage.setItem(adminTokenStorageKey, 'token-123');
        localStorage.setItem(adminEmailStorageKey, 'admin@example.com');

        render(
            <AdminLogin
                adminSession={{ token: 'token-123', email: 'admin@example.com' }}
                onLogin={jest.fn()}
                onLogout={onLogout}
            />
        );

        expect(screen.getByRole('status')).toHaveTextContent(/connecté en tant que admin@example.com/i);

        fireEvent.click(screen.getByRole('button', { name: /déconnexion/i }));

        expect(localStorage.getItem(adminTokenStorageKey)).toBeNull();
        expect(localStorage.getItem(adminEmailStorageKey)).toBeNull();
        expect(onLogout).toHaveBeenCalled();
    });
});
