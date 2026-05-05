import { fireEvent, render, screen } from '@testing-library/react';
import Form from './Form.jsx';

const fillRequiredFields = () => {
    fireEvent.change(screen.getByLabelText(/^nom/i), { target: { value: 'Machtelinckx' } });
    fireEvent.change(screen.getByLabelText(/^prénom/i), { target: { value: 'Clem' } });
    fireEvent.change(screen.getByLabelText(/^date de naissance/i), { target: { value: '1990-05-05' } });
    fireEvent.change(screen.getByLabelText(/^mail/i), { target: { value: 'clem@email.com' } });
    fireEvent.change(screen.getByLabelText(/^ville/i), { target: { value: 'Cannes' } });
    fireEvent.change(screen.getByLabelText(/^code postal/i), { target: { value: '06400' } });
};

describe('Form', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('shows an empty state when there is no registered user', () => {
        render(<Form />);

        expect(screen.getByText(/aucun inscrit pour le moment/i)).toBeInTheDocument();
    });

    it('loads the registered users from localStorage', () => {
        localStorage.setItem('registeredUsers', JSON.stringify([
            {
                name: 'Machtelinckx',
                firstName: 'Clem',
                birthDate: '1995-04-10',
                email: 'clem@email.com',
                city: 'Cannes',
                postalCode: '06400',
            },
        ]));

        render(<Form />);

        expect(screen.getByText(/Clem Machtelinckx - clem@email\.com - Cannes - 06400/i)).toBeInTheDocument();
    });

    it('ignores invalid data in localStorage', () => {
        localStorage.setItem('registeredUsers', '{bad json');
        const { unmount } = render(<Form />);
        expect(screen.getByText(/aucun inscrit pour le moment/i)).toBeInTheDocument();

        unmount();

        localStorage.setItem('registeredUsers', JSON.stringify({ name: 'bad format' }));
        render(<Form />);
        expect(screen.getByText(/aucun inscrit pour le moment/i)).toBeInTheDocument();
    });

    it('disables the submit button while required fields are empty', () => {
        render(<Form />);

        const submitButton = screen.getByDisplayValue(/sauvegarder/i);

        expect(submitButton).toBeDisabled();

        fillRequiredFields();

        expect(submitButton).toBeEnabled();
    });

    it('shows a required error when the birth date is missing on submit', () => {
        const { container } = render(<Form />);

        fireEvent.change(screen.getByLabelText(/^nom/i), { target: { value: 'Machtelinckx' } });
        fireEvent.change(screen.getByLabelText(/^prénom/i), { target: { value: 'Clément' } });
        fireEvent.change(screen.getByLabelText(/^mail/i), { target: { value: 'clem@email.com' } });
        fireEvent.change(screen.getByLabelText(/^ville/i), { target: { value: 'Cannes' } });
        fireEvent.change(screen.getByLabelText(/^code postal/i), { target: { value: '06400' } });

        fireEvent.submit(container.querySelector('form'));

        expect(screen.getByText(/la date de naissance est obligatoire/i)).toHaveStyle({ color: 'red' });
    });

    it('shows red validation errors for invalid inputs', () => {
        render(<Form />);

        fireEvent.change(screen.getByLabelText(/^nom/i), { target: { value: 'Dupont1' } });
        fireEvent.change(screen.getByLabelText(/^prénom/i), { target: { value: 'Jean!' } });
        fireEvent.change(screen.getByLabelText(/^date de naissance/i), { target: { value: '2010-05-05' } });
        fireEvent.change(screen.getByLabelText(/^mail/i), { target: { value: 'invalid-email' } });
        fireEvent.change(screen.getByLabelText(/^ville/i), { target: { value: 'Paris3' } });
        fireEvent.change(screen.getByLabelText(/^code postal/i), { target: { value: '7500' } });

        fireEvent.click(screen.getByDisplayValue(/sauvegarder/i));

        const alerts = screen.getAllByRole('alert');

        expect(screen.getByText(/le nom est invalide/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/le prénom est invalide/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/vous devez être majeur/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/l'email est invalide/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/la ville est invalide/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/le code postal est invalide/i)).toHaveStyle({ color: 'red' });
        expect(alerts).toHaveLength(6);
    });

    it('shows a success message, clears fields and adds the user in the list', () => {
        render(<Form />);

        fillRequiredFields();
        fireEvent.click(screen.getByDisplayValue(/sauvegarder/i));

        expect(screen.getByRole('status')).toHaveTextContent(/utilisateur enregistré avec succès/i);
        expect(screen.getByLabelText(/^nom/i)).toHaveValue('');
        expect(screen.getByLabelText(/^prénom/i)).toHaveValue('');
        expect(screen.getByLabelText(/^date de naissance/i)).toHaveValue('');
        expect(screen.getByLabelText(/^mail/i)).toHaveValue('');
        expect(screen.getByLabelText(/^ville/i)).toHaveValue('');
        expect(screen.getByLabelText(/^code postal/i)).toHaveValue('');
        expect(screen.getByDisplayValue(/sauvegarder/i)).toBeDisabled();
        expect(screen.getByText(/Clem Machtelinckx - clem@email\.com - Cannes - 06400/i)).toBeInTheDocument();
        expect(localStorage.getItem('registeredUsers')).toContain('clem@email.com');
    });
});