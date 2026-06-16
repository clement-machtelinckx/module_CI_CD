import { render, screen } from '@testing-library/react';
import App from './App';
import { getUsers } from './services/userService.js';

jest.mock('./services/userService.js', () => ({
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    getUsers: jest.fn(),
    updateUser: jest.fn(),
}));

test('renders the counter, API users count, documentation link and form', async () => {
    getUsers.mockResolvedValue([
        {
            id: 1,
            name: 'Machtelinckx',
            firstName: 'Clem',
            birthDate: '1990-05-05',
            email: 'clem@email.com',
            city: 'Cannes',
            postalCode: '06400',
        },
        {
            id: 2,
            name: 'Dupont',
            firstName: 'Jean',
            birthDate: '1988-10-10',
            email: 'jean@email.com',
            city: 'Paris',
            postalCode: '75001',
        },
    ]);

    render(<App />);

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /users manager/i })).toBeInTheDocument();
    expect(await screen.findByText(/2 utilisateur\(s\) récupéré\(s\) depuis l'api/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voir la documentation/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /formulaire/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/sauvegarder/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /liste des inscrits/i })).toBeInTheDocument();
});
