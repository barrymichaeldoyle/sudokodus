import { UseQueryResult } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { ErrorScreen } from './ErrorScreen';
import { LoadingScreen } from './LoadingScreen';

interface PageQueryLoaderProps<T> {
  query: UseQueryResult<T>;
  children:
    | ((data: NonNullable<T>) => ReactNode)
    | ReactNode;
}

export function PageQueryLoader<T>({
  children,
  query,
}: PageQueryLoaderProps<T>) {
  if (query.isLoading) {
    return <LoadingScreen />;
  }

  if (query.error) {
    return <ErrorScreen message={query.error.message} />;
  }

  if (!query.data) {
    return <ErrorScreen message="No data" />;
  }

  if (!children) {
    return null;
  }

  if (typeof children === 'function') {
    return children(query.data as NonNullable<T>);
  }

  return children;
}
