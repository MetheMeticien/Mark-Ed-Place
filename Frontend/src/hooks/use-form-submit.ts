import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ApiResponse } from '@/types/api';
import { handleApiError, isApiError } from '@/lib/error-handler';

type FormSubmitHandler<T, R> = (data: T) => Promise<ApiResponse<R>>;

interface UseFormSubmitOptions<T, R> {
  onSuccess?: (data: R, formData: T) => void;
  onError?: (error: string, formData: T) => void;
  onFinally?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useFormSubmit<T = any, R = any>(
  submitFn: FormSubmitHandler<T, R>,
  options: UseFormSubmitOptions<T, R> = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<R | null>(null);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = useCallback(
    async (formData: T) => {
      if (!isMounted.current) return { success: false, error: { message: 'Component unmounted', statusCode: 0 } };
      
      setIsLoading(true);
      setError(null);

      try {
        const response = await submitFn(formData);

        if (!isMounted.current) return { success: false, error: { message: 'Component unmounted', statusCode: 0 } };

        if (response.success && response.data) {
          setData(response.data);
          options.onSuccess?.(response.data, formData);
          
          if (options.successMessage) {
            // You can integrate with a toast notification system here
            console.log(options.successMessage);
          }
        } else if (response.error) {
          const errorMessage = response.error.message || options.errorMessage || 'Submission failed';
          setError(errorMessage);
          options.onError?.(errorMessage, formData);
        }

        return response;
      } catch (err) {
        if (!isMounted.current) return { success: false, error: { message: 'Component unmounted', statusCode: 0 } };
        
        const error = isApiError(err) ? err : handleApiError(err);
        const errorMessage = error?.message || options.errorMessage || 'An error occurred';
        
        setError(errorMessage);
        options.onError?.(errorMessage, formData);
        
        return { 
          success: false, 
          error: { 
            message: errorMessage, 
            statusCode: error.statusCode 
          } 
        };
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          options.onFinally?.();
        }
      }
    },
    [options, submitFn]
  );

  const reset = useCallback(() => {
    if (!isMounted.current) return;
    setError(null);
    setData(null);
    setIsLoading(false);
  }, []);

  return {
    handleSubmit,
    isLoading,
    error,
    data,
    reset,
    isError: !!error,
    isSuccess: !!data && !error,
  };
}

export default useFormSubmit;
