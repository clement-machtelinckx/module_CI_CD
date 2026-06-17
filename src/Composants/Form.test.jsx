import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import Form from './Form.jsx';
import {
    deleteAdminUser,
    getAdminUsers,
    updateAdminUser,
} from '../services/adminService.js';
import {
    createUser,
    getUsers,
} from '../services/userService.js';

jest.mock('../services/adminService.js', () => ({
    deleteAdminUser: jest.fn(),
    getAdminUsers: jest.fn(),
    updateAdminUser: jest.fn(),
}));

jest.mock('../services/userService.js', () => ({
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

const adminUsers = [
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
];

const validUserPayload = {
    name: 'Martin',
    firstName: 'Claire',
    birthDate: '1990-05-05',
    email: 'claire@email.com',
    city: 'Lyon',
    postalCode: '69002',
};

const fillRequiredFields = (values = validUserPayload) => {
    fireEvent.change(screen.getByLabelText(/^nom/i), { target: { value: values.name } });
    fireEvent.change(screen.getByLabelText(/^prénom/i), { target: { value: values.firstName } });
    fireEvent.change(screen.getByLabelText(/^date de naissance/i), { target: { value: values.birthDate } });
    fireEvent.change(screen.getByLabelText(/^mail/i), { target: { value: values.email } });
    fireEvent.change(screen.getByLabelText(/^ville/i), { target: { value: values.city } });
    fireEvent.change(screen.getByLabelText(/^code postal/i), { target: { value: values.postalCode } });
};

describe('Form', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        getUsers.mockResolvedValue([]);
        getAdminUsers.mockResolvedValue([]);
        createUser.mockResolvedValue({ id: 3, name: 'Martin', firstName: 'Claire', city: 'Lyon' });
        updateAdminUser.mockResolvedValue({ id: 1, ...validUserPayload });
        deleteAdminUser.mockResolvedValue({ deletedId: 1 });
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('shows a loading message while public users are loading', async () => {
        let resolveUsers;
        getUsers.mockReturnValue(new Promise((resolve) => {
            resolveUsers = resolve;
        }));

        render(<Form />);

        expect(screen.getByText(/chargement des utilisateurs/i)).toBeInTheDocument();

        resolveUsers([]);

        expect(await screen.findByText(/aucun inscrit pour le moment/i)).toBeInTheDocument();
    });

    it('loads a reduced public users list and hides private fields and delete buttons', async () => {
        const onUsersChange = jest.fn();
        getUsers.mockResolvedValue(publicUsers);

        render(<Form onUsersChange={onUsersChange} />);

        expect(await screen.findByText('Clem')).toBeInTheDocument();
        expect(screen.getByText('Machtelinckx')).toBeInTheDocument();
        expect(screen.getByText('Cannes')).toBeInTheDocument();
        expect(screen.getByText('Jean')).toBeInTheDocument();
        expect(screen.queryByText('clem@email.com')).not.toBeInTheDocument();
        expect(screen.queryByText('06400')).not.toBeInTheDocument();
        expect(screen.queryByText('1990-05-05')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /supprimer/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /modifier/i })).not.toBeInTheDocument();
        expect(onUsersChange).toHaveBeenCalledWith(2);
    });

    it('loads a full admin users list with private fields and action buttons', async () => {
        const onUsersChange = jest.fn();
        getAdminUsers.mockResolvedValue(adminUsers);

        render(<Form adminToken="token-123" isAdmin onUsersChange={onUsersChange} />);

        expect(await screen.findByText('Clem')).toBeInTheDocument();
        expect(screen.getByText('clem@email.com')).toBeInTheDocument();
        expect(screen.getByText('06400')).toBeInTheDocument();
        expect(screen.getByText('1990-05-05')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /supprimer/i })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: /modifier/i })).toHaveLength(2);
        expect(getAdminUsers).toHaveBeenCalledWith('token-123');
        expect(onUsersChange).toHaveBeenCalledWith(2);
    });

    it('shows an empty state when the API returns no user', async () => {
        render(<Form />);

        expect(await screen.findByText(/aucun inscrit pour le moment/i)).toBeInTheDocument();
    });

    it('shows an API error when loading users fails', async () => {
        getUsers.mockRejectedValue(new Error('API down'));

        render(<Form />);

        expect(await screen.findByText(/impossible de récupérer les utilisateurs/i)).toHaveStyle({ color: 'red' });
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('shows an API error when loading admin users fails', async () => {
        getAdminUsers.mockRejectedValue(new Error('admin API down'));

        render(<Form adminToken="token-123" isAdmin />);

        expect(await screen.findByText(/impossible de récupérer les utilisateurs/i)).toHaveStyle({ color: 'red' });
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('disables the submit button while required fields are empty', async () => {
        render(<Form />);

        await screen.findByText(/aucun inscrit pour le moment/i);

        const submitButton = screen.getByDisplayValue(/sauvegarder/i);

        expect(submitButton).toBeDisabled();

        fillRequiredFields();

        expect(submitButton).toBeEnabled();
    });

    it('shows a required error when the birth date is missing on submit', async () => {
        const { container } = render(<Form />);

        await screen.findByText(/aucun inscrit pour le moment/i);

        fireEvent.change(screen.getByLabelText(/^nom/i), { target: { value: 'Machtelinckx' } });
        fireEvent.change(screen.getByLabelText(/^prénom/i), { target: { value: 'Clément' } });
        fireEvent.change(screen.getByLabelText(/^mail/i), { target: { value: 'clem@email.com' } });
        fireEvent.change(screen.getByLabelText(/^ville/i), { target: { value: 'Cannes' } });
        fireEvent.change(screen.getByLabelText(/^code postal/i), { target: { value: '06400' } });

        fireEvent.submit(container.querySelector('form'));

        expect(screen.getByText(/la date de naissance est obligatoire/i)).toHaveStyle({ color: 'red' });
        expect(createUser).not.toHaveBeenCalled();
    });

    it('shows red validation errors for invalid inputs', async () => {
        render(<Form />);

        await screen.findByText(/aucun inscrit pour le moment/i);

        fillRequiredFields({
            name: 'Dupont1',
            firstName: 'Jean!',
            birthDate: '2010-05-05',
            email: 'invalid-email',
            city: 'Paris3',
            postalCode: '7500',
        });

        fireEvent.click(screen.getByDisplayValue(/sauvegarder/i));

        const alerts = screen.getAllByRole('alert');

        expect(screen.getByText(/le nom est invalide/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/le prénom est invalide/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/vous devez être majeur/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/l'email est invalide/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/la ville est invalide/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/le code postal est invalide/i)).toHaveStyle({ color: 'red' });
        expect(alerts).toHaveLength(6);
        expect(createUser).not.toHaveBeenCalled();
    });

    it('creates a public user, clears fields and refreshes the public list', async () => {
        const onUsersChange = jest.fn();
        const createdPublicUser = { id: 3, name: 'Martin', firstName: 'Claire', city: 'Lyon' };
        getUsers.mockResolvedValueOnce([]).mockResolvedValueOnce([createdPublicUser]);

        render(<Form onUsersChange={onUsersChange} />);

        await screen.findByText(/aucun inscrit pour le moment/i);

        fillRequiredFields();
        fireEvent.click(screen.getByDisplayValue(/sauvegarder/i));

        await waitFor(() => expect(createUser).toHaveBeenCalledWith(validUserPayload));

        expect(await screen.findByRole('status')).toHaveTextContent(/utilisateur enregistré avec succès/i);
        expect(screen.getByLabelText(/^nom/i)).toHaveValue('');
        expect(screen.getByLabelText(/^prénom/i)).toHaveValue('');
        expect(screen.getByLabelText(/^date de naissance/i)).toHaveValue('');
        expect(screen.getByLabelText(/^mail/i)).toHaveValue('');
        expect(screen.getByLabelText(/^ville/i)).toHaveValue('');
        expect(screen.getByLabelText(/^code postal/i)).toHaveValue('');
        expect(screen.getByDisplayValue(/sauvegarder/i)).toBeDisabled();
        expect(screen.getByText('Claire')).toBeInTheDocument();
        expect(screen.getByText('Martin')).toBeInTheDocument();
        expect(screen.queryByText('claire@email.com')).not.toBeInTheDocument();
        expect(onUsersChange).toHaveBeenLastCalledWith(1);
    });

    it('creates a user while admin is connected and refreshes the admin list', async () => {
        const createdAdminUser = { id: 3, ...validUserPayload };
        getAdminUsers.mockResolvedValueOnce([]).mockResolvedValueOnce([createdAdminUser]);

        render(<Form adminToken="token-123" isAdmin />);

        await screen.findByText(/aucun inscrit pour le moment/i);

        fillRequiredFields();
        fireEvent.click(screen.getByDisplayValue(/sauvegarder/i));

        await waitFor(() => expect(createUser).toHaveBeenCalledWith(validUserPayload));

        expect(await screen.findByText('claire@email.com')).toBeInTheDocument();
        expect(getAdminUsers).toHaveBeenLastCalledWith('token-123');
    });

    it('shows an API error when create fails', async () => {
        createUser.mockRejectedValue(new Error('duplicate email'));

        render(<Form />);

        await screen.findByText(/aucun inscrit pour le moment/i);

        fillRequiredFields();
        fireEvent.click(screen.getByDisplayValue(/sauvegarder/i));

        expect(await screen.findByText(/impossible d'enregistrer l'utilisateur/i)).toHaveStyle({ color: 'red' });
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('deletes a user through the admin API and updates the list', async () => {
        const onUsersChange = jest.fn();
        getAdminUsers.mockResolvedValue(adminUsers);

        render(<Form adminToken="token-123" isAdmin onUsersChange={onUsersChange} />);

        const row = (await screen.findByText('Clem')).closest('tr');

        fireEvent.click(within(row).getByRole('button', { name: /supprimer/i }));

        await waitFor(() => expect(deleteAdminUser).toHaveBeenCalledWith(1, 'token-123'));

        expect(await screen.findByRole('status')).toHaveTextContent(/utilisateur supprimé avec succès/i);
        expect(screen.queryByText('Clem')).not.toBeInTheDocument();
        expect(screen.getByText('Jean')).toBeInTheDocument();
        expect(onUsersChange).toHaveBeenLastCalledWith(1);
    });

    it('shows an API error when admin delete fails', async () => {
        getAdminUsers.mockResolvedValue(adminUsers);
        deleteAdminUser.mockRejectedValue(new Error('delete failed'));

        render(<Form adminToken="token-123" isAdmin />);

        const row = (await screen.findByText('Clem')).closest('tr');

        fireEvent.click(within(row).getByRole('button', { name: /supprimer/i }));

        expect(await screen.findByText(/impossible de supprimer l'utilisateur/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText('Clem')).toBeInTheDocument();
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('prefills the form, updates a user through admin PATCH and leaves edit mode', async () => {
        const updatedUser = {
            ...adminUsers[0],
            city: 'Lyon',
            postalCode: '69002',
        };
        getAdminUsers.mockResolvedValue(adminUsers);
        updateAdminUser.mockResolvedValue(updatedUser);

        render(<Form adminToken="token-123" isAdmin />);

        const row = (await screen.findByText('Clem')).closest('tr');

        fireEvent.click(within(row).getByRole('button', { name: /modifier/i }));

        expect(screen.getByLabelText(/^nom/i)).toHaveValue('Machtelinckx');
        expect(screen.getByLabelText(/^date de naissance/i)).toHaveValue('1990-05-05');
        expect(screen.getByDisplayValue(/mettre à jour/i)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/^ville/i), { target: { value: 'Lyon' } });
        fireEvent.change(screen.getByLabelText(/^code postal/i), { target: { value: '69002' } });
        fireEvent.click(screen.getByDisplayValue(/mettre à jour/i));

        await waitFor(() => expect(updateAdminUser).toHaveBeenCalledWith(1, {
            name: 'Machtelinckx',
            firstName: 'Clem',
            birthDate: '1990-05-05',
            email: 'clem@email.com',
            city: 'Lyon',
            postalCode: '69002',
        }, 'token-123'));

        expect(await screen.findByRole('status')).toHaveTextContent(/utilisateur mis à jour avec succès/i);
        expect(screen.getByText('Lyon')).toBeInTheDocument();
        expect(screen.getByText('69002')).toBeInTheDocument();
        expect(screen.queryByDisplayValue(/mettre à jour/i)).not.toBeInTheDocument();
        expect(screen.getByDisplayValue(/sauvegarder/i)).toBeDisabled();
    });

    it('can cancel admin edit mode', async () => {
        getAdminUsers.mockResolvedValue(adminUsers);

        render(<Form adminToken="token-123" isAdmin />);

        const row = (await screen.findByText('Clem')).closest('tr');

        fireEvent.click(within(row).getByRole('button', { name: /modifier/i }));
        fireEvent.click(screen.getByRole('button', { name: /annuler/i }));

        expect(screen.getByLabelText(/^nom/i)).toHaveValue('');
        expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeInTheDocument();
        expect(screen.getByDisplayValue(/sauvegarder/i)).toBeDisabled();
    });

    it('resets the form when the edited user is deleted by an admin', async () => {
        getAdminUsers.mockResolvedValue(adminUsers);

        render(<Form adminToken="token-123" isAdmin />);

        const row = (await screen.findByText('Clem')).closest('tr');

        fireEvent.click(within(row).getByRole('button', { name: /modifier/i }));
        fireEvent.click(within(row).getByRole('button', { name: /supprimer/i }));

        await waitFor(() => expect(deleteAdminUser).toHaveBeenCalledWith(1, 'token-123'));

        await waitFor(() => expect(screen.getByLabelText(/^nom/i)).toHaveValue(''));
        expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeInTheDocument();
    });
});
