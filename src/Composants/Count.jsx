import { useState } from 'react';

export default function Count() {
  const [count, setCount] = useState(0);

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
