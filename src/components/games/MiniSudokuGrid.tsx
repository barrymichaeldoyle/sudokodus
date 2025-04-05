import { Text, View } from 'react-native';

interface MiniSudokuGridProps {
  puzzleString: string;
}

export function MiniSudokuGrid({
  puzzleString,
}: MiniSudokuGridProps) {
  return (
    <View className="aspect-square w-28 overflow-hidden rounded-l-md bg-white shadow-sm shadow-black/5">
      <View className="relative flex h-full flex-row">
        {/* Base border */}
        <View className="absolute inset-0 border-[0.5px] border-gray-200" />

        {/* Block divider lines */}
        <View className="absolute left-1/3 -ml-[0.5px] h-full w-[1px] bg-gray-300" />
        <View className="absolute left-2/3 -ml-[0.5px] h-full w-[1px] bg-gray-300" />
        <View className="absolute top-1/3 -mt-[0.5px] h-[1px] w-full bg-gray-300" />
        <View className="absolute top-2/3 -mt-[0.5px] h-[1px] w-full bg-gray-300" />

        {/* Grid content */}
        {[0, 1, 2].map(blockRow => (
          <View key={blockRow} className="flex-1">
            {[0, 1, 2].map(blockCol => (
              <View key={blockCol} className="flex-1">
                <View className="flex aspect-square flex-row flex-wrap">
                  {[0, 1, 2].map(cellRow => (
                    <View
                      key={cellRow}
                      className="h-1/3 w-full flex-row"
                    >
                      {[0, 1, 2].map(cellCol => {
                        const row = blockRow * 3 + cellRow;
                        const col = blockCol * 3 + cellCol;
                        const index = row * 9 + col;
                        const value = parseInt(
                          puzzleString[index]
                        );

                        const isLastInBlock = cellCol === 2;
                        const isLastRowInBlock =
                          cellRow === 2;

                        return (
                          <View
                            key={cellCol}
                            className="relative h-full flex-1 items-center justify-center"
                          >
                            {/* Cell borders */}
                            <View
                              className={`absolute inset-0 border-gray-100 ${
                                !isLastInBlock
                                  ? 'border-r-[0.5px]'
                                  : ''
                              } ${
                                !isLastRowInBlock
                                  ? 'border-b-[0.5px]'
                                  : ''
                              }`}
                            />
                            {!isNaN(value) && value > 0 && (
                              <Text className="mt-[1px] text-[8.5px] font-normal leading-[8.5px] text-gray-700">
                                {value}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
