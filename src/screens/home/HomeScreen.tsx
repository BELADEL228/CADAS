import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { supabase, Property } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Ionicons } from '@expo/vector-icons'

export function HomeScreen() {
  const navigation = useNavigation()
  const { profile } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])

  useEffect(() => {
    fetchProperties()
    fetchFeaturedProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('verification_status', 'verified')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Erreur chargement propriétés:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('verification_status', 'verified')
        .order('views', { ascending: false })
        .limit(5)

      if (error) throw error
      setFeaturedProperties(data || [])
    } catch (error) {
      console.error('Erreur chargement propriétés vedettes:', error)
    }
  }

  const PropertyCard = ({ property }: { property: Property }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PropertyDetail', { id: property.id })}
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
      }}
    >
      <Image
        source={{ uri: property.photos_url?.[0] || 'https://via.placeholder.com/400' }}
        style={{ width: '100%', height: 200 }}
        resizeMode="cover"
      />
      <View style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', flex: 1 }}>
            {property.title}
          </Text>
          <View style={{
            backgroundColor: property.legal_badge.includes('🟢') ? '#10b981' :
                             property.legal_badge.includes('🟡') ? '#f59e0b' : '#ef4444',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {property.legal_badge}
            </Text>
          </View>
        </View>

        <Text style={{ color: '#666', marginTop: 4 }}>
          {property.address}, {property.city}
        </Text>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 8,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2563eb' }}>
            {property.price.toLocaleString()} FCFA
          </Text>
          <Text style={{ color: '#666' }}>{property.surface_area} m²</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView>
        {/* Header */}
        <View style={{ padding: 16, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            Bonjour, {profile?.full_name || 'Utilisateur'} 👋
          </Text>
          <Text style={{ color: '#666', marginTop: 4 }}>
            Prêt à trouver votre bien immobilier ?
          </Text>
        </View>

        {/* Propriétés vedettes */}
        {featuredProperties.length > 0 && (
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✨ Propriétés vedettes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Properties')}>
                <Text style={{ color: '#2563eb' }}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={featuredProperties}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
                  style={{
                    width: 200,
                    marginRight: 12,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    source={{ uri: item.photos_url?.[0] || 'https://via.placeholder.com/200' }}
                    style={{ width: '100%', height: 120 }}
                  />
                  <View style={{ padding: 8 }}>
                    <Text numberOfLines={1} style={{ fontWeight: 'bold' }}>{item.title}</Text>
                    <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>
                      {item.price.toLocaleString()} FCFA
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Dernières annonces */}
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>📋 Dernières annonces</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Properties')}>
              <Text style={{ color: '#2563eb' }}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </View>

        {/* Bouton flottant pour ajouter une annonce (si vendeur) */}
        {profile?.user_type === 'seller' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AddProperty')}
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              backgroundColor: '#2563eb',
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}