import { type SFSymbol, SymbolView } from 'expo-symbols';
import { TouchableOpacity } from 'react-native';
import { primary } from '../../../../../colors';

interface ActionButtonProps {
  icon: SFSymbol;
  onPress: () => void;
}

export function ActionButton({
  icon,
  onPress,
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full bg-white active:bg-primary-100"
    >
      <SymbolView
        name={icon}
        size={24}
        tintColor={primary[500]}
      />
    </TouchableOpacity>
  );
}
