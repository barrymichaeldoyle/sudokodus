import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from 'react-native';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary';
  label: string;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  label,
  isLoading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled || isLoading}
      className={twMerge(
        'h-16 w-full items-center justify-center rounded-2xl shadow-lg shadow-black/10',
        {
          primary: 'bg-primary-500',
          secondary: 'bg-white',
        }[variant],
        className
      )}
      {...props}
    >
      <Text
        className={twMerge(
          'font-base font-medium',
          {
            primary: 'text-white',
            secondary: 'text-black',
          }[variant]
        )}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          label
        )}
      </Text>
    </Pressable>
  );
}
