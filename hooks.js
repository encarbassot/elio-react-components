import { useEffect, useRef, useState } from 'react';

export const useDebounce = (...args) => {
  let callback;
  let millis = 300;
  let instantCallback;


  //get values, their order can bary
  //useDebounce(  callback, millis   )
  //useDebounce(  millis,   callback )
  //useDebounce(  callback, instantCallback,  millis  )
  //useDebounce(  callback, millis,           instantCallback )
  //useDebounce(  millis,   callback,         instantCallback )
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (typeof arg === 'function') {
      if (!callback) {
        callback = arg;
      } else if (!instantCallback) {
        instantCallback = arg;
      }
    } else if (typeof arg === 'number') {
      millis = arg;
    }
  }




  const timeoutRef = useRef(null);

  const debouncedFunction = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (instantCallback) {
      instantCallback(...args);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, millis);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return debouncedFunction;
};











export function useStateDebounced(state,millis){
  const [instant,setInstant] = useState(state)
  const [debounced, setDebounced] = useState(state)

  const handleDebounce = useDebounce(millis,setDebounced,setInstant)

  return [instant,debounced,handleDebounce]
}













export function useLocalStorage(key, defaultValue) {
  // Check if the value exists in localStorage and parse it; if not, use the defaultValue
  const storedValue = localStorage.getItem(key);
  const initialValue = storedValue ? JSON.parse(storedValue) : defaultValue;

  // Use the initialValue for the state
  const [value, setValue] = useState(initialValue);

  // Whenever the value changes, update the localStorage
  useEffect(() => {
    if (value !== initialValue) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [value, key]);

  return [value, setValue];
}
