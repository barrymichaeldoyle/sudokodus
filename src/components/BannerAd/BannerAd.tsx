import {
  BannerAd as BannerAdNative,
  BannerAdSize,
} from 'react-native-google-mobile-ads';

const GAME_BANNER_UNIT_ID =
  'ca-app-pub-3482457944656598/8678181731';

export function BannerAd() {
  return (
    <BannerAdNative
      unitId={GAME_BANNER_UNIT_ID}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
    />
  );
}
