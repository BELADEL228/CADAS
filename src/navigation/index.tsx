import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import { useAuth } from '@/contexts/AuthContext'
import { LoginScreen } from '@/screens/auth/LoginScreen'
import { HomeScreen } from '@/screens/home/HomeScreen'
import { ProfileScreen } from '@/screens/profile/ProfileScreen'
import { PropertiesScreen } from '@/screens/properties/PropertiesScreen'
import { PropertyDetailScreen } from '@/screens/properties/PropertyDetailScreen'
import { AddPropertyScreen } from '@/screens/properties/AddPropertyScreen'

export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  PropertyDetail: { id: string }
  AddProperty: undefined
}

export type MainTabParamList = {
  Home: undefined
  Properties: undefined
  Favorites: undefined
  Profile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home'

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Properties') {
            iconName = focused ? 'search' : 'search-outline'
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Properties" component={PropertiesScreen} />
      <Tab.Screen name="Favorites" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return null // Tu peux mettre un écran de chargement ici
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen 
              name="PropertyDetail" 
              component={PropertyDetailScreen}
              options={{ headerShown: true, title: 'Détails du bien' }}
            />
            <Stack.Screen 
              name="AddProperty" 
              component={AddPropertyScreen}
              options={{ headerShown: true, title: 'Publier une annonce' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}