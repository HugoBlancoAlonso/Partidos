import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ISLAND_MARGIN = 20;
const ISLAND_PADDING = 6;
const GAP = 4;
const TAB_COUNT = 3;

const ISLAND_WIDTH = width - (ISLAND_MARGIN * 2);
const TAB_WIDTH = (ISLAND_WIDTH - (ISLAND_PADDING * 2) - (GAP * (TAB_COUNT - 1))) / TAB_COUNT;

function SearchIcon({ color }: { color: string }) {
  return (
    <View style={styles.svgPlaceholder}>
      <MaterialIcons name="search" size={24} color={color} />
    </View>
  );
}

function StarIcon({ color }: { color: string }) {
  return (
    <View style={styles.svgPlaceholder}>
      <MaterialIcons name="star" size={24} color={color} />
    </View>
  );
}

function UserIcon({ color }: { color: string }) {
  return (
    <View style={styles.svgPlaceholder}>
      <MaterialIcons name="person" size={24} color={color} />
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const translateX = useRef(new Animated.Value(state.index * (TAB_WIDTH + GAP))).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * (TAB_WIDTH + GAP),
      useNativeDriver: true,
      bounciness: 8,
      speed: 12
    }).start();
  }, [state.index]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.island}>
        <Animated.View style={[styles.indicator, { transform: [{ translateX }] }]} />

        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const color = isFocused ? '#fff' : '#aaa';

          let Icon = StarIcon;
          if (route.name === 'explore') Icon = SearchIcon;
          if (route.name === 'profile') Icon = UserIcon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabBtn}
              activeOpacity={0.8}
            >
              <Icon color={color} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mis Partidos',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: ISLAND_MARGIN,
    right: ISLAND_MARGIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  island: {
    width: ISLAND_WIDTH,
    backgroundColor: '#000',
    borderRadius: 999,
    padding: ISLAND_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: GAP,
  },
  indicator: {
    position: 'absolute',
    top: ISLAND_PADDING,
    left: ISLAND_PADDING,
    width: TAB_WIDTH,
    height: 48,
    backgroundColor: '#222',
    borderRadius: 999,
  },
  tabBtn: {
    width: TAB_WIDTH,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  svgPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
