import React from 'react'
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform, 
  View
} from 'react-native'

export interface WRNCButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  style?: ViewStyle
  textStyle?: TextStyle
  testID?: string
}

const variantStyles = {
  primary: {
    view: { backgroundColor: '#2563eb' },
    text: { color: '#ffffff' }
  },
  secondary: {
    view: { backgroundColor: '#6b7280' },
    text: { color: '#ffffff' }
  },
  outline: {
    view: { 
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#2563eb'
    },
    text: { color: '#2563eb' }
  },
  danger: {
    view: { backgroundColor: '#ef4444' },
    text: { color: '#ffffff' }
  },
  success: {
    view: { backgroundColor: '#10b981' },
    text: { color: '#ffffff' }
  }
}

const sizeStyles = {
  small: {
    view: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    text: { fontSize: 14 }
  },
  medium: {
    view: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    text: { fontSize: 16 }
  },
  large: {
    view: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10 },
    text: { fontSize: 18 }
  }
}

export const WRNCButton: React.FC<WRNCButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  testID
}) => {
  const isDisabled = disabled || loading

  // Version Web (rendu avec une balise button)
  if (Platform.OS === 'web') {
    return (
      <button
        onClick={onPress}
        disabled={isDisabled}
        style={{
          padding: sizeStyles[size].view.paddingHorizontal,
          backgroundColor: variantStyles[variant].view.backgroundColor,
          color: variantStyles[variant].text.color,
          border: variantStyles[variant].view.borderWidth 
            ? `1px solid ${variantStyles[variant].view.borderColor}` 
            : 'none',
          borderRadius: sizeStyles[size].view.borderRadius,
          fontSize: sizeStyles[size].text.fontSize,
          fontWeight: '600',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
          maxWidth: fullWidth ? '100%' : 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: iconPosition === 'left' ? 'row' : 'row-reverse',
          gap: 8,
          ...style
        }}
        data-testid={testID}
      >
        {loading ? (
          'Chargement...'
        ) : (
          <>
            {icon}
            {title}
          </>
        )}
      </button>
    )
  }

  // Version Mobile (React Native)
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        {
          borderRadius: sizeStyles[size].view.borderRadius,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.5 : 1,
          width: fullWidth ? '100%' : 'auto',
        },
        variantStyles[variant].view,
        sizeStyles[size].view,
        style,
      ]}
      testID={testID}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variantStyles[variant].text.color}
          style={{ marginRight: 8 }}
        />
      )}
      {icon && iconPosition === 'left' && !loading && (
        <View style={{ marginRight: 8 }}>{icon}</View>
      )}
      <Text
        style={[
          variantStyles[variant].text,
          sizeStyles[size].text,
          { fontWeight: '600' },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {icon && iconPosition === 'right' && !loading && (
        <View style={{ marginLeft: 8 }}>{icon}</View>
      )}
    </TouchableOpacity>
  )
}