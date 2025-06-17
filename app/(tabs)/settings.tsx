import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Bell, Palette, Clock, Volume2, Smartphone, Moon, Sun, ChevronRight, User, Shield, CircleHelp as HelpCircle, Star } from 'lucide-react-native';
import { useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SETTINGS_SECTIONS = [
  {
    title: 'Timer Settings',
    items: [
      { id: 'workDuration', label: 'Work Duration', value: '25 min', icon: Clock, type: 'value' },
      { id: 'shortBreak', label: 'Short Break', value: '5 min', icon: Clock, type: 'value' },
      { id: 'longBreak', label: 'Long Break', value: '15 min', icon: Clock, type: 'value' },
      { id: 'autoStart', label: 'Auto Start Breaks', value: true, icon: Clock, type: 'toggle' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { id: 'notifications', label: 'Push Notifications', value: true, icon: Bell, type: 'toggle' },
      { id: 'sounds', label: 'Sound Alerts', value: true, icon: Volume2, type: 'toggle' },
      { id: 'vibration', label: 'Vibration', value: false, icon: Smartphone, type: 'toggle' },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { id: 'theme', label: 'Theme', value: 'Dark', icon: Moon, type: 'value' },
      { id: 'accent', label: 'Accent Color', value: 'Purple', icon: Palette, type: 'value' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile Settings', icon: User, type: 'navigation' },
      { id: 'privacy', label: 'Privacy & Security', icon: Shield, type: 'navigation' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', label: 'Help & FAQ', icon: HelpCircle, type: 'navigation' },
      { id: 'rate', label: 'Rate App', icon: Star, type: 'navigation' },
    ],
  },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    autoStart: true,
    notifications: true,
    sounds: true,
    vibration: false,
  });

  const sectionAnimations = Array.from({ length: SETTINGS_SECTIONS.length }, () => useSharedValue(0));

  useEffect(() => {
    sectionAnimations.forEach((animation, index) => {
      animation.value = withDelay(index * 100, withSpring(1));
    });
  }, []);

  const createSectionStyle = (index: number) => useAnimatedStyle(() => ({
    opacity: sectionAnimations[index]?.value || 0,
    transform: [
      { translateY: (1 - (sectionAnimations[index]?.value || 0)) * 30 },
    ],
  }));

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSettingItem = (item: any) => {
    const IconComponent = item.icon;
    
    return (
      <Pressable key={item.id} style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <IconComponent size={20} color="#8B5CF6" strokeWidth={2} />
          </View>
          <Text style={styles.settingLabel}>{item.label}</Text>
        </View>
        
        <View style={styles.settingRight}>
          {item.type === 'toggle' ? (
            <Switch
              value={settings[item.id as keyof typeof settings]}
              onValueChange={() => toggleSetting(item.id)}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#334155', true: '#8B5CF6' }}
            />
          ) : item.type === 'value' ? (
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{item.value}</Text>
              <ChevronRight size={16} color="#64748B" strokeWidth={2} />
            </View>
          ) : (
            <ChevronRight size={16} color="#64748B" strokeWidth={2} />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <LinearGradient
      colors={['#0F0F23', '#1A1A2E', '#16213E']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom + 100, 120) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your experience</Text>
          </View>

          {SETTINGS_SECTIONS.map((section, sectionIndex) => (
            <Animated.View 
              key={section.title} 
              style={[styles.section, createSectionStyle(sectionIndex)]}
            >
              <BlurView intensity={20} style={styles.sectionBlur}>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <View style={styles.sectionItems}>
                    {section.items.map(renderSettingItem)}
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          ))}

          {/* App Info */}
          <Animated.View style={[styles.appInfo, createSectionStyle(SETTINGS_SECTIONS.length)]}>
            <Text style={styles.appVersion}>Pomodoro Timer v1.0.0</Text>
            <Text style={styles.appDescription}>
              Built with love for productivity enthusiasts
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  sectionBlur: {
    flex: 1,
  },
  sectionContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionItems: {
    gap: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appVersion: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#94A3B8',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
});