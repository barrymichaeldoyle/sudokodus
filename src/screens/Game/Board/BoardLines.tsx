import { StyleSheet, View } from 'react-native';

import { black, primary } from '../../../colors';
import { useBoardDimensions } from './useBoardDimensions';

const thinLineColor = primary[200];
const thickLineColor = black;
const thinLineWidth = StyleSheet.hairlineWidth;
const thickLineWidth = 2;

const tenItems = Array.from({ length: 10 }, (_, i) => i);

export function BoardLines() {
  const { boardSize, cellSize } = useBoardDimensions();

  function getLineStyle(
    index: number,
    orientation: 'horizontal' | 'vertical'
  ) {
    const isThick = index % 3 === 0;
    const thickness = isThick
      ? thickLineWidth
      : thinLineWidth;
    const color = isThick ? thickLineColor : thinLineColor;
    const position =
      index * cellSize - (isThick ? thickness / 2 : 0);

    const baseStyle = {
      position: 'absolute' as const,
      backgroundColor: color,
    };

    if (orientation === 'horizontal') {
      return {
        ...baseStyle,
        top: position,
        left: -thickLineWidth / 2,
        width: boardSize + thickLineWidth,
        height: thickness,
      };
    }
    return {
      ...baseStyle,
      top: -thickLineWidth / 2,
      left: position,
      width: thickness,
      height: boardSize + thickLineWidth,
    };
  }

  return (
    <>
      {tenItems.map(i =>
        i % 3 !== 0 ? (
          <View
            key={`h-thin-line-${i}`}
            style={{
              ...getLineStyle(i, 'horizontal'),
              zIndex: 1,
            }}
          />
        ) : null
      )}
      {tenItems.map(i =>
        i % 3 !== 0 ? (
          <View
            key={`v-thin-line-${i}`}
            style={{
              ...getLineStyle(i, 'vertical'),
              zIndex: 1,
            }}
          />
        ) : null
      )}

      {tenItems.map(i =>
        i % 3 === 0 ? (
          <View
            key={`h-thick-line-${i}`}
            style={{
              ...getLineStyle(i, 'horizontal'),
              zIndex: 2,
            }}
          />
        ) : null
      )}
      {tenItems.map(i =>
        i % 3 === 0 ? (
          <View
            key={`v-thick-line-${i}`}
            style={{
              ...getLineStyle(i, 'vertical'),
              zIndex: 2,
            }}
          />
        ) : null
      )}
    </>
  );
}
