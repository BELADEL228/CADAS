import React, { useState } from 'react'
import { 
  View, 
  TextInput, 
  Text, 
  ViewStyle,
  TextStyle,
  Platform 
} from 'react-native'

export interface WRNCInputProps {
  label?: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  error?: string
  touched?: boolean
  multiline?: boolean
  numberOfLines?: number
  disabled?: boolean
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onBlur?: () => void
  style?: ViewStyle
  inputStyle?: TextStyle
  testID?: string
}

export const WRNCInput: React.FC<WRNCInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  touched,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  onBlur,
  style,
  inputStyle,
  testID
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const hasError = error && touched

  // Version Web
  if (Platform.OS === 'web') {
    return (
      <div style={{ marginBottom: 16, width: '100%', ...style }}>
        {label && (
          <label style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: '500',
            color: '#374151'
          }}>
            {label}
            {required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          {leftIcon && (
            <div style={{ 
              position: 'absolute', 
              left: 12, 
              top: '50%', 
              transform: 'translateY(-50%)',
              zIndex: 1
            }}>
              {leftIcon}
            </div>
          )}
          <input
            type={secureTextEntry ? 'password' : 'text'}
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false)
              onBlur?.()
            }}
            style={{
              width: '100%',
              padding: '12px',
              paddingLeft: leftIcon ? 40 : 12,
              paddingRight: rightIcon ? 40 : 12,
              borderWidth: 1,
              borderColor: hasError ? '#ef4444' : isFocused ? '#2563eb' : '#d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
              resize: multiline ? 'vertical' : 'none',
              minHeight: multiline ? 100 : 'auto',
              ...inputStyle
            }}
            data-testid={testID}
          />
          {rightIcon && (
            <div style={{ 
              position: 'absolute', 
              right: 12, 
              top: '50%', 
              transform: 'translateY(-50%)',
              zIndex: 1
            }}>
              {rightIcon}
            </div>
          )}
        </div>
        {hasError && (
          <p style={{ 
            color: '#ef4444', 
            fontSize: 14, 
            marginTop: 4,
            marginBottom: 0
          }}>
            {error}
          </p>
        )}
      </div>
    )
  }

  // Version Mobile (React Native)
  return (
    <View style={[{ marginBottom: 16, width: '100%' }, style]}>
      {label && (
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <Text style={{ fontWeight: '500', color: '#374151' }}>{label}</Text>
          {required && <Text style={{ color: '#ef4444', marginLeft: 4 }}>*</Text>}
        </View>
      )}
      <View style={{ position: 'relative' }}>
        {leftIcon && (
          <View style={{ 
            position: 'absolute', 
            left: 12, 
            top: multiline ? 12 : 12,
            zIndex: 1 
          }}>
            {leftIcon}
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            onBlur?.()
          }}
          style={[
            {
              width: '100%',
              padding: 12,
              paddingLeft: leftIcon ? 40 : 12,
              paddingRight: rightIcon ? 40 : 12,
              borderWidth: 1,
              borderColor: hasError ? '#ef4444' : isFocused ? '#2563eb' : '#d1d5db',
              borderRadius: 8,
              fontSize: 16,
              backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
              textAlignVertical: multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
          testID={testID}
        />
        {rightIcon && (
          <View style={{ 
            position: 'absolute', 
            right: 12, 
            top: multiline ? 12 : 12,
            zIndex: 1 
          }}>
            {rightIcon}
          </View>
        )}
      </View>
      {hasError && (
        <Text style={{ color: '#ef4444', fontSize: 14, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  )
}