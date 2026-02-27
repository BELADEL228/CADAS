import React from 'react'
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native'
import { Property } from '../../types'
import { WRNCButton } from '../common/WRNCButton'
import { formatPrice } from '../../utils/formatters'

interface PropertyCardProps {
  property: Property
  onPress: (id: string) => void
  onFavoritePress?: (id: string) => void
  isFavorite?: boolean
  showFavoriteButton?: boolean
  variant?: 'grid' | 'list'
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onFavoritePress,
  isFavorite = false,
  showFavoriteButton = true,
  variant = 'list'
}) => {
  const isGrid = variant === 'grid'
  const mainImage = property.documents.photos[0] || 'https://via.placeholder.com/400'

  // Version Web
  if (Platform.OS === 'web') {
    return (
      <div
        onClick={() => onPress(property.id)}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '16px',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          width: isGrid ? 'calc(50% - 8px)' : '100%',
          animation: 'hover 0.2s ease-in-out',
        }}
      >
        <div style={{ position: 'relative' }}>
          <img
            src={mainImage}
            alt={property.title}
            style={{
              width: '100%',
              height: isGrid ? '150px' : '200px',
              objectFit: 'cover'
            }}
          />
          {showFavoriteButton && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFavoritePress?.(property.id)
              }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: property.legalBadge.includes('🔴') ? '#ef4444' :
                           property.legalBadge.includes('🟡') ? '#f59e0b' : '#10b981',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {property.legalBadge}
          </div>
        </div>
        
        <div style={{ padding: '12px' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: 'bold',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {property.title}
          </h3>
          
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#6b7280',
            marginBottom: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {property.location.address}
          </p>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: '#2563eb'
              }}>
                {formatPrice(property.price)}
              </span>
              <span style={{ 
                fontSize: '14px', 
                color: '#6b7280',
                marginLeft: '4px'
              }}>
                FCFA
              </span>
            </div>
            <span style={{ 
              fontSize: '14px', 
              color: '#6b7280'
            }}>
              {property.surfaceArea} m²
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Version Mobile (React Native)
  return (
    <TouchableOpacity
      onPress={() => onPress(property.id)}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 16,
        width: isGrid ? '48%' : '100%',
      }}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: mainImage }}
          style={{
            width: '100%',
            height: isGrid ? 150 : 200,
          }}
          resizeMode="cover"
        />
        
        {showFavoriteButton && (
          <TouchableOpacity
            onPress={() => onFavoritePress?.(property.id)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'white',
              borderRadius: 20,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 18 }}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{
          position: 'absolute',
          top: 8,
          left: 8,
          backgroundColor: property.legalBadge.includes('🔴') ? '#ef4444' :
                         property.legalBadge.includes('🟡') ? '#f59e0b' : '#10b981',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 4,
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {property.legalBadge}
          </Text>
        </View>
      </View>

      <View style={{ padding: 12 }}>
        <Text 
          style={{ 
            fontSize: 16, 
            fontWeight: 'bold',
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {property.title}
        </Text>

        <Text 
          style={{ 
            fontSize: 14, 
            color: '#6b7280',
            marginBottom: 8,
          }}
          numberOfLines={1}
        >
          {property.location.address}
        </Text>

        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2563eb' }}>
              {formatPrice(property.price)}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 4 }}>
              FCFA
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>
            {property.surfaceArea} m²
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}