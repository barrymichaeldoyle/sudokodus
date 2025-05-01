import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
} from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useGameStore } from '../../store';
import { useBoardDimensions } from '../useBoardDimensions';
import { CellData } from './types';

interface DefinedCellProps {
  cell: CellData;
  row: number;
  col: number;
}

export function DefinedCell({
  cell,
  row,
  col,
}: DefinedCellProps) {
  const { value, isGiven, notes } = cell;

  const { cellSize } = useBoardDimensions();

  const selectedCell = useGameStore(
    state => state.selectedCell
  );
  const setSelectedCell = useGameStore(
    state => state.setSelectedCell
  );

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const notesScaleAnim = useRef(
    new Animated.Value(1)
  ).current;
  const notesOpacityAnim = useRef(
    new Animated.Value(1)
  ).current;
  const prevValue = useRef(value);
  const prevNotes = useRef(notes);
  const [showText, setShowText] = useState(
    value !== null && value !== 0
  );
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      if (value === 0 || value === null) {
        // Fade out animation
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowText(false);
        });
      } else {
        setShowText(true);
        setDisplayValue(value);
        // Bounce in animation
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
    prevValue.current = value;
  }, [value, scaleAnim, opacityAnim]);

  useEffect(() => {
    if (
      JSON.stringify(prevNotes.current) !==
      JSON.stringify(notes)
    ) {
      // Animate notes changes
      Animated.sequence([
        Animated.parallel([
          Animated.timing(notesScaleAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(notesOpacityAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(notesScaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(notesOpacityAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
    prevNotes.current = notes;
  }, [notes, notesScaleAnim, notesOpacityAnim]);

  const isRelatedCell = useMemo(() => {
    if (!selectedCell) {
      return false;
    }

    const { row: selectedRow, col: selectedCol } =
      selectedCell;
    if (row === selectedRow) {
      return true;
    }
    if (col === selectedCol) {
      return true;
    }

    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    const selectedBoxRow = Math.floor(selectedRow / 3);
    const selectedBoxCol = Math.floor(selectedCol / 3);

    return (
      boxRow === selectedBoxRow && boxCol === selectedBoxCol
    );
  }, [selectedCell, row, col]);

  const bgColorClass = useMemo(() => {
    const isSelected =
      selectedCell?.row === row &&
      selectedCell?.col === col;
    if (isSelected) {
      return 'bg-primary-100';
    }
    if (isRelatedCell) {
      return 'bg-gray-100';
    }
    return 'bg-white';
  }, [selectedCell, row, col, isRelatedCell]);

  return (
    <TouchableOpacity
      className={twMerge(
        'items-center justify-center',
        bgColorClass
      )}
      style={{ width: cellSize, height: cellSize }}
      onPress={() => setSelectedCell(row, col)}
    >
      {showText ? (
        <Animated.Text
          className={twMerge(
            'font-bold',
            isGiven ? 'text-black' : 'text-primary-500'
          )}
          style={{
            fontSize: cellSize * 0.55,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
          {displayValue}
        </Animated.Text>
      ) : (
        <Animated.View
          className="h-full w-full flex-row flex-wrap p-0.5"
          style={{
            transform: [{ scale: notesScaleAnim }],
            opacity: notesOpacityAnim,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <Text
              key={num}
              className={`text-center-vertical h-1/3 w-1/3 text-center text-xs ${
                notes.includes(num)
                  ? 'text-blue-600'
                  : 'text-transparent'
              }`}
            >
              {notes.includes(num) ? num : ''}
            </Text>
          ))}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}
