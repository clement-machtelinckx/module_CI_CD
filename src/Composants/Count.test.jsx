import { fireEvent, render, screen } from '@testing-library/react';
import Count from './Count.jsx';

test('increments the counter when the button is clicked', () => {
    render(<Count />);

    const button = screen.getByRole('button', { name: /click me/i });
    const counter = screen.getByTestId('count');

    expect(counter).toHaveTextContent('0');

    fireEvent.click(button);

    expect(counter).toHaveTextContent('1');
});
