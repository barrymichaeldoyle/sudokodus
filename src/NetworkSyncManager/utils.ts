import {
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY,
} from './constants';

export async function handleRetry(
  operation: () => Promise<void>,
  retryCount: number = 0
): Promise<void> {
  if (retryCount >= MAX_RETRY_ATTEMPTS) {
    console.error('Max retry attempts reached');
    throw new Error('Max retry attempts reached');
  }

  try {
    await operation();
  } catch (error) {
    console.error('Operation failed:', error);

    if (retryCount < MAX_RETRY_ATTEMPTS - 1) {
      await new Promise(resolve =>
        setTimeout(resolve, RETRY_DELAY)
      );
      return handleRetry(operation, retryCount + 1);
    }

    throw error;
  }
}
