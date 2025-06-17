import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const TIMER_STATES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

const TIMER_CONFIGS = {
  [TIMER_STATES.WORK]: { duration: 25 * 60, label: 'Focus Time', color: '#8B5CF6' },
  [TIMER_STATES.SHORT_BREAK]: { duration: 5 * 60, label: 'Short Break', color: '#3B82F6' },
  [TIMER_STATES.LONG_BREAK]: { duration: 15 * 60, label: 'Long Break', color: '#10B981' },
};

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const [currentState, setCurrentState] = useState(TIMER_STATES.WORK);
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIGS[TIMER_STATES.WORK].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progress = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const timerScale = useSharedValue(1);

  const currentConfig = TIMER_CONFIGS[currentState];
  const progressValue = 1 - (timeLeft / currentConfig.duration);

  useEffect(() => {
    progress.value = withTiming(progressValue, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progressValue]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setCompletedSessions(prev => prev + 1);
    
    // Auto-switch to next state
    if (currentState === TIMER_STATES.WORK) {
      const nextState = (completedSessions + 1) % 4 === 0 
        ? TIMER_STATES.LONG_BREAK 
        : TIMER_STATES.SHORT_BREAK;
      switchState(nextState);
    } else {
      switchState(TIMER_STATES.WORK);
    }
  };

  const switchState = (newState: string) => {
    setCurrentState(newState);
    setTimeLeft(TIMER_CONFIGS[newState].duration);
    setIsRunning(false);
    
    timerScale.value = withSpring(0.95, {}, () => {
      timerScale.value = withSpring(1);
    });
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    buttonScale.value = withSpring(0.9, {}, () => {
      buttonScale.value = withSpring(1);
    });
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(currentConfig.duration);
    progress.value = withTiming(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const animatedTimerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: timerScale.value }],
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const animatedProgressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(progress.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const getStateIcon = () => {
    switch (currentState) {
      case TIMER_STATES.WORK:
        return <Brain size={32} color="#8B5CF6" strokeWidth={2} />;
      case TIMER_STATES.SHORT_BREAK:
      case TIMER_STATES.LONG_BREAK:
        return <Coffee size={32} color="#3B82F6" strokeWidth={2} />;
      default:
        return <Brain size={32} color="#8B5CF6" strokeWidth={2} />;
    }
  };

  return (
    <LinearGradient
      colors={['#0F0F23', '#1A1A2E', '#16213E']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pomodoro Timer</Text>
          <View style={styles.sessionCounter}>
            <Text style={styles.sessionText}>Session {completedSessions + 1}</Text>
            <View style={styles.sessionDots}>
              {[...Array(4)].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.sessionDot,
                    index < (completedSessions % 4) && styles.sessionDotActive
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* State Selector */}
        <View style={styles.stateSelector}>
          {Object.entries(TIMER_STATES).map(([key, value]) => (
            <Pressable
              key={key}
              onPress={() => switchState(value)}
              style={[
                styles.stateButton,
                currentState === value && styles.stateButtonActive
              ]}
            >
              <Text style={[
                styles.stateButtonText,
                currentState === value && styles.stateButtonTextActive
              ]}>
                {TIMER_CONFIGS[value].label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Timer Circle */}
        <Animated.View style={[styles.timerContainer, animatedTimerStyle]}>
          <BlurView intensity={20} style={styles.timerBlur}>
            <View style={styles.timerCircle}>
              <Animated.View style={[styles.progressRing, animatedProgressStyle]} />
              <View style={styles.timerInner}>
                <View style={styles.stateIcon}>
                  {getStateIcon()}
                </View>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.stateLabel}>{currentConfig.label}</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={resetTimer} style={styles.secondaryButton}>
            <RotateCcw size={24} color="#64748B" strokeWidth={2} />
          </Pressable>

          <Animated.View style={animatedButtonStyle}>
            <Pressable onPress={toggleTimer} style={styles.playButton}>
              <LinearGradient
                colors={['#8B5CF6', '#3B82F6']}
                style={styles.playButtonGradient}
              >
                {isRunning ? (
                  <Pause size={32} color="#FFFFFF" strokeWidth={2} />
                ) : (
                  <Play size={32} color="#FFFFFF" strokeWidth={2} />
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <View style={styles.secondaryButton} />
        </View>

        {/* Progress Info */}
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {Math.round(progressValue * 100)}% Complete
          </Text>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                { width: `${progressValue * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sessionCounter: {
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    marginBottom: 8,
  },
  sessionDots: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  sessionDotActive: {
    backgroundColor: '#8B5CF6',
  },
  stateSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
  },
  stateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  stateButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  stateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  stateButtonTextActive: {
    color: '#FFFFFF',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerBlur: {
    borderRadius: 160,
    overflow: 'hidden',
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#8B5CF6',
  },
  timerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateIcon: {
    marginBottom: 16,
  },
  timerText: {
    fontSize: 42,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stateLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  playButtonGradient: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
});