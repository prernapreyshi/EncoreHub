import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating the returned value until `delay` ms
 * have passed without the input changing.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchQuery, 400);
 *   useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
