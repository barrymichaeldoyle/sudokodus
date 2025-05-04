import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface NoteProps {
  number: number;
  isVisible: boolean;
}

export function Note({ number, isVisible }: NoteProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const prevIsVisible = useRef(isVisible);

  useEffect(() => {
    if (!prevIsVisible.current && isVisible) {
      // Only animate when becoming visible
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (prevIsVisible.current && !isVisible) {
      // Reset animations when becoming invisible
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
    prevIsVisible.current = isVisible;
  }, [isVisible, scaleAnim, opacityAnim]);

  return (
    <Animated.Text
      className={twMerge(
        `text-center-vertical h-1/3 w-1/3 text-center text-xs ${
          isVisible ? 'text-blue-600' : 'text-transparent'
        }`
      )}
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      {isVisible ? number : ''}
    </Animated.Text>
  );
}
