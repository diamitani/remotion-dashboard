import { Composition } from 'remotion'
import { HelloWorld } from './HelloWorld'

export const defaultProps = {
  titleText: 'Welcome to Remotion',
  subtitleText: 'AI-Powered Video Creation'
}

export default function Root() {
  return (
    <Composition
      id="Main"
      component={HelloWorld}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
    />
  )
}
