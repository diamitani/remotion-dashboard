import { Player } from '@remotion/player';
import { BrandComposition } from './BrandComposition';

export const RemotionPreview: React.FC<{ promptText: string }> = ({ promptText }) => {
  return (
    <Player
      component={BrandComposition}
      inputProps={{ promptText }}
      durationInFrames={360}
      fps={30}
      compositionWidth={1280}
      compositionHeight={720}
      controls
      autoPlay={false}
      loop
      style={{ width: '100%', borderRadius: 18, overflow: 'hidden' }}
    />
  );
};
