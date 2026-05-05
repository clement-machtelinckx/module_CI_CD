import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the counter and the form', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /formulaire/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/sauvegarder/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /liste des inscrits/i })).toBeInTheDocument();
});
