import { fireEvent, render, screen } from '@testing-library/react';
import Form from './Form.jsx';

const fillRequiredFields = () => {
    fireEvent.change(screen.getByLabelText(/^nom/i), { target: { value: 'Dupont' } });
    fireEvent.change(screen.getByLabelText(/^prénom/i), { target: { value: 'Élodie' } });
    fireEvent.change(screen.getByLabelText(/^date de naissance/i), { target: { value: '1990-05-05' } });
    fireEvent.change(screen.getByLabelText(/^mail/i), { target: { value: 'elodie.dupont@example.com' } });
    fireEvent.change(screen.getByLabelText(/^ville/i), { target: { value: 'Saint-Étienne' } });
    fireEvent.change(screen.getByLabelText(/^code postal/i), { target: { value: '42000' } });
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
                name: 'Martin',
                firstName: 'Julie',
                birthDate: '1995-04-10',
                email: 'julie.martin@example.com',
                city: 'Lyon',
                postalCode: '69001',
            },
        ]));

        render(<Form />);

        expect(screen.getByText(/Julie Martin - julie\.martin@example\.com - Lyon - 69001/i)).toBeInTheDocument();
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

        fireEvent.change(screen.getByLabelText(/^nom/i), { target: { value: 'Dupont' } });
        fireEvent.change(screen.getByLabelText(/^prénom/i), { target: { value: 'Élodie' } });
        fireEvent.change(screen.getByLabelText(/^mail/i), { target: { value: 'elodie.dupont@example.com' } });
        fireEvent.change(screen.getByLabelText(/^ville/i), { target: { value: 'Paris' } });
        fireEvent.change(screen.getByLabelText(/^code postal/i), { target: { value: '75001' } });

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

        expect(screen.getByText(/le nom doit contenir uniquement des lettres/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/le prénom doit contenir uniquement des lettres/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/vous devez être majeur/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/l'email n'est pas valide/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/la ville doit contenir uniquement des lettres/i)).toHaveStyle({ color: 'red' });
        expect(screen.getByText(/le code postal n'est pas valide/i)).toHaveStyle({ color: 'red' });
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
        expect(screen.getByText(/Élodie Dupont - elodie\.dupont@example\.com - Saint-Étienne - 42000/i)).toBeInTheDocument();
        expect(localStorage.getItem('registeredUsers')).toContain('elodie.dupont@example.com');
    });
});
