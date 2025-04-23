import { UseQueryResult } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { ErrorScreen } from './ErrorScreen';
import { LoadingScreen } from './LoadingScreen';

type QueryData<T, B extends boolean> = B extends true
  ? T
  : NonNullable<T>;

interface PageQueryLoaderProps<
  T,
  B extends boolean = false,
> {
  query: UseQueryResult<T>;
  children:
    | (({
        data,
        isLoading,
        error,
      }: {
        data: QueryData<T, B>;
        isLoading: boolean;
        error: Error | null;
      }) => ReactNode)
    | ReactNode;
  ignoreLoading?: B;
}

export function PageQueryLoader<
  T,
  B extends boolean = false,
>({
  children,
  query,
  ignoreLoading,
}: PageQueryLoaderProps<T, B>) {
  if (query.isLoading && !ignoreLoading) {
    return <LoadingScreen />;
  }

  if (query.error) {
    return <ErrorScreen message={query.error.message} />;
  }

  if (!query.data && !ignoreLoading) {
    return <ErrorScreen message="No data" />;
  }

  if (!children) {
    return null;
  }

  if (typeof children === 'function') {
    return children({
      data: query.data as QueryData<T, B>,
      isLoading: query.isLoading,
      error: query.error,
    });
  }

  return children;
}
