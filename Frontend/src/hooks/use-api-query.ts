import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ApiResponse } from '@/types/api';
import { handleApiError } from '@/lib/error-handler';

interface UseApiQueryOptions<TData, TError = Error>
  extends Omit<
    UseQueryOptions<ApiResponse<TData>, TError>,
    'queryKey' | 'queryFn'
  > {
  queryKey: (string | number)[];
  queryFn: () => Promise<ApiResponse<TData>>;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}

export function useApiQuery<TData = unknown, TError = Error>({
  queryKey,
  queryFn,
  onSuccess,
  onError,
  ...options
}: UseApiQueryOptions<TData, TError>) {
  return useQuery<ApiResponse<TData>, TError>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await queryFn();
        if (response.data && onSuccess) {
          onSuccess(response.data);
        }
        return response;
      } catch (error) {
        const apiError = handleApiError(error);
        if (onError) {
          onError(apiError as TError);
        }
        throw apiError;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        typeof (error as any).statusCode === 'number' &&
        (error as any).statusCode >= 400 &&
        (error as any).statusCode < 500
      ) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    ...options,
  });
}
