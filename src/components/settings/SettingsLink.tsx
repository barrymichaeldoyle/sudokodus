import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { white } from '../../colors';

export function SettingsLink() {
  return (
    <Link href="/settings">
      <SymbolView
        name="gearshape.fill"
        size={24}
        tintColor={white}
      />
    </Link>
  );
}
