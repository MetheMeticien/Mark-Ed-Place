import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { ApiResponse } from '@/types/api';
import { handleApiError } from '@/lib/error-handler';

type MutationResult<TData> = ApiResponse<TData>;

type UseApiMutationOptions<TData, TVariables, TError = Error> = {
  mutationFn: (variables: TVariables) => Promise<MutationResult<TData>>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
};

export function useApiMutation<TData = unknown, TVariables = void, TError = Error>(
  options: UseApiMutationOptions<TData, TVariables, TError>
): UseMutationResult<MutationResult<TData>, TError, TVariables> {
  const { onSuccess, onError, mutationFn } = options;

  return useMutation<MutationResult<TData>, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: (data, variables) => {
      if (data.data && onSuccess) {
        onSuccess(data.data, variables);
      }
    },
    onError: (error, variables) => {
      if (onError) {
        onError(error, variables);
      }
    },
  });
}
