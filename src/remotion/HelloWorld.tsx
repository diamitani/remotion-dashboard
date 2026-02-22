import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from 'remotion'
import { motion } from 'framer-motion'

interface HelloWorldProps {
  titleText?: string
  subtitleText?: string
}

export function HelloWorld({ titleText, subtitleText }: HelloWorldProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const titleOpacity = interpolate(frame, [0, 30, 270, 300], [0, 1, 1, 0])
  const titleScale = spring({ frame, from: 0.5, to: 1, fps })
  const subtitleY = interpolate(frame, [30, 60, 270, 300], [50, 0, 0, -50])
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: titleOpacity, scale: titleScale }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <h1 style={{ 
          fontSize: 120, 
          fontWeight: 'bold',
          color: '#00d4aa',
          marginBottom: 20,
          fontFamily: 'system-ui'
        }}>
          {titleText || 'Hello World'}
        </h1>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: titleOpacity, y: subtitleY }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <h2 style={{ 
          fontSize: 48, 
          color: '#a1a1a1',
          fontFamily: 'system-ui'
        }}>
          {subtitleText || 'Powered by Remotion'}
        </h2>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: interpolate(frame, [240, 270], [1, 0]) }}
        style={{ 
          position: 'absolute',
          bottom: 50,
          fontSize: 24,
          color: '#666'
        }}
      >
        Created with OpenCode + BigPickle
      </motion.div>
    </AbsoluteFill>
  )
}
