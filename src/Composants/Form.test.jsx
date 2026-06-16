import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import Form from './Form.jsx';
import {
    createUser,
    deleteUser,
    getUsers,
    updateUser,
} from '../services/userService.js';

jest.mock('../services/userService.js', () => ({
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    getUsers: jest.fn(),
    updateUser: jest.fn(),
}));

const apiUsers = [
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
        createUser.mockResolvedValue({ id: 3, ...validUserPayload });
        updateUser.mockResolvedValue({ id: 1, ...validUserPayload });
        deleteUser.mockResolvedValue({ deletedId: 1 });
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('shows a loading message while users are loading', async () => {
        let resolveUsers;
        getUsers.mockReturnValue(new Promise((resolve) => {
            resolveUsers = resolve;
        }));

        render(<Form />);

        expect(screen.getByText(/chargement des utilisateurs/i)).toBeInTheDocument();

        resolveUsers([]);

        expect(await screen.findByText(/aucun inscrit pour le moment/i)).toBeInTheDocument();
    });

    it('loads users from the API and notifies the users count', async () => {
        const onUsersChange = jest.fn();
        getUsers.mockResolvedValue(apiUsers);

        render(<Form onUsersChange={onUsersChange} />);

        expect(await screen.findByText('Clem')).toBeInTheDocument();
        expect(screen.getByText('Machtelinckx')).toBeInTheDocument();
        expect(screen.getByText('clem@email.com')).toBeInTheDocument();
        expect(screen.getByText('Cannes')).toBeInTheDocument();
        expect(screen.getByText('06400')).toBeInTheDocument();
        expect(screen.getByText('Jean')).toBeInTheDocument();
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

    it('creates a user through the API, clears fields and updates the list', async () => {
        const onUsersChange = jest.fn();
        const createdUser = { id: 3, ...validUserPayload };
        createUser.mockResolvedValue(createdUser);

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
        expect(screen.getByText('claire@email.com')).toBeInTheDocument();
        expect(onUsersChange).toHaveBeenLastCalledWith(1);
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

    it('deletes a user through the API and updates the list', async () => {
        const onUsersChange = jest.fn();
        getUsers.mockResolvedValue(apiUsers);

        render(<Form onUsersChange={onUsersChange} />);

        const row = (await screen.findByText('Clem')).closest('tr');

        fireEvent.click(within(row).getByRole('button', { name: /supprimer/i }));

        await waitFor(() => expect(deleteUser).toHaveBeenCalledWith(1));

        expect(await screen.findByRole('status')).toHaveTextContent(/utilisateur supprimé avec succès/i);
        expect(screen.queryByText('Clem')).not.toBeInTheDocument();
        expect(screen.getByText('Jean')).toBeInTheDocument();
        expect(onUsersChange).toHaveBeenLastCalledWith(1);
    });

    it('shows an API error when delete fails', async () => {
        getUsers.mockResolvedValue(apiUsers);
        deleteUser.mockRejectedValue(new Error('delete failed'));

        render(<Form />);

        const row = (await screen.findByText('Clem')).closest('tr');

        fireEvent.click(within(row).getByRole('button', { name: /supprimer/i }));

        expect(await screen.findByText(/impossible de supprimer l'utilisateur/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText('Clem')).toBeInTheDocument();
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('prefills the form, updates a user through PATCH and leaves edit mode', async () => {
        const updatedUser = {
            ...apiUsers[0],
            city: 'Lyon',
            postalCode: '69002',
        };
        getUsers.mockResolvedValue(apiUsers);
        updateUser.mockResolvedValue(updatedUser);

        render(<Form />);

        const row = (await screen.findByText('Clem')).closest('tr');

        fireEvent.click(within(row).getByRole('button', { name: /modifier/i }));

        expect(screen.getByLabelText(/^nom/i)).toHaveValue('Machtelinckx');
        expect(screen.getByLabelText(/^date de naissance/i)).toHaveValue('1990-05-05');
        expect(screen.getByDisplayValue(/mettre à jour/i)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/^ville/i), { target: { value: 'Lyon' } });
        fireEvent.change(screen.getByLabelText(/^code postal/i), { target: { value: '69002' } });
        fireEvent.click(screen.getByDisplayValue(/mettre à jour/i));

        await waitFor(() => expect(updateUser).toHaveBeenCalledWith(1, {
            name: 'Machtelinckx',
            firstName: 'Clem',
            birthDate: '1990-05-05',
            email: 'clem@email.com',
            city: 'Lyon',
            postalCode: '69002',
        }));

        expect(await screen.findByRole('status')).toHaveTextContent(/utilisateur mis à jour avec succès/i);
        expect(screen.getByText('Lyon')).toBeInTheDocument();
        expect(screen.getByText('69002')).toBeInTheDocument();
        expect(screen.queryByDisplayValue(/mettre à jour/i)).not.toBeInTheDocument();
        expect(screen.getByDisplayValue(/sauvegarder/i)).toBeDisabled();
    });

    it('can cancel edit mode', async () => {
        getUsers.mockResolvedValue(apiUsers);

        render(<Form />);

        const row = (await screen.findByText('Clem')).closest('tr');

        fireEvent.click(within(row).getByRole('button', { name: /modifier/i }));
        fireEvent.click(screen.getByRole('button', { name: /annuler/i }));

        expect(screen.getByLabelText(/^nom/i)).toHaveValue('');
        expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeInTheDocument();
        expect(screen.getByDisplayValue(/sauvegarder/i)).toBeDisabled();
    });

    it('resets the form when the edited user is deleted', async () => {
        getUsers.mockResolvedValue(apiUsers);

        render(<Form />);

        const row = (await screen.findByText('Clem')).closest('tr');

        fireEvent.click(within(row).getByRole('button', { name: /modifier/i }));
        fireEvent.click(within(row).getByRole('button', { name: /supprimer/i }));

        await waitFor(() => expect(deleteUser).toHaveBeenCalledWith(1));

        await waitFor(() => expect(screen.getByLabelText(/^nom/i)).toHaveValue(''));
        expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeInTheDocument();
    });
});
