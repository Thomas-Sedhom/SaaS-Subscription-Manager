import { useState } from 'react';

export function useAsyncAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async (action) => {
    setIsLoading(true);
    setError('');

    try {
      return await action();
    } catch (err) {
      const nextError = err?.response?.data?.message ?? err?.message ?? 'Something went wrong';
      setError(nextError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    setError,
    run
  };
}