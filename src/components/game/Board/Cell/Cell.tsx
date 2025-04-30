import { useCurrentGameStateQuery } from '../../hooks/useCurrentGameStateQuery';
import { DefinedCell } from './DefinedCell';
import { EmptyCell } from './EmptyCell';
import { CellData } from './types';

interface CellProps {
  row: number;
  col: number;
}

export function Cell({ row, col }: CellProps) {
  const { data: gameState } = useCurrentGameStateQuery();
  const cellIndex = row * 9 + col;

  if (!gameState?.current_state) {
    return <EmptyCell />;
  }

  const currentState =
    typeof gameState.current_state === 'string'
      ? JSON.parse(gameState.current_state)
      : gameState.current_state;

  const cell = (currentState as unknown as CellData[])[
    cellIndex
  ];

  if (!cell) {
    return <EmptyCell />;
  }

  return <DefinedCell cell={cell} row={row} col={col} />;
}
