import { useState } from 'react';

/**
 * Affiche un compteur simple avec incrementation au clic.
 * @returns {JSX.Element} Composant compteur.
 */
export default function Count() {
  const [count, setCount] = useState(0);

  /**
   * Incremente la valeur du compteur.
   * @returns {void}
   */
  const handleClick = () => {
    setCount((currentCount) => currentCount + 1);
  };

  return (
    <>
      <button className='button' onClick={handleClick}>Click me</button>
      <span data-testid="count">{count}</span>
    </>
  );
}
