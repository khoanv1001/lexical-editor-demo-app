import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { type AppConfig, defaultAppConfig, buildDeepLink } from '../utils/appConfig'

interface AppRedirectProps {
  config?: Partial<AppConfig>
  path?: string // Optional path to append to the deep link
}

const AppRedirect: React.FC<AppRedirectProps> = ({ 
  config = {},
  path
}) => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'attempting' | 'redirecting' | 'error'>('attempting')
  
  // Merge provided config with defaults
  const appConfig: AppConfig = useMemo(() => ({ ...defaultAppConfig, ...config }), [config])

  useEffect(() => {
    // Get any query parameters to pass to the app
    const params = Object.fromEntries(searchParams.entries())
    
    // Construct the deep link URL
    const deepLinkUrl = buildDeepLink(appConfig.scheme, path, params)

    // Function to attempt opening the app
    const attemptAppOpen = () => {
      setStatus('attempting')
      
      // Try to open the app
      window.location.href = deepLinkUrl
      
      // Set a timeout to redirect to App Store if app doesn't open
      const timeoutId = setTimeout(() => {
        // If we're still on this page after the timeout, redirect to App Store
        if (document.hasFocus() || !document.hidden) {
          setStatus('redirecting')
          window.location.href = appConfig.appStoreUrl
        }
      }, appConfig.timeout || 2500)

      // Clear timeout if user navigates away
      const handleVisibilityChange = () => {
        if (document.hidden) {
          clearTimeout(timeoutId)
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      // Cleanup
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }

    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    if (isIOS) {
      attemptAppOpen()
    } else {
      // For non-iOS devices, redirect to fallback URL or show message
      if (appConfig.fallbackUrl) {
        setTimeout(() => {
          window.location.href = appConfig.fallbackUrl!
        }, 1000)
      } else {
        setStatus('error')
      }
    }
  }, [appConfig, path, searchParams])

  const getStatusMessage = () => {
    switch (status) {
      case 'attempting':
        return 'Opening App...'
      case 'redirecting':
        return 'Redirecting to App Store...'
      case 'error':
        return 'iOS Device Required'
      default:
        return 'Opening App...'
    }
  }

  const getStatusDescription = () => {
    switch (status) {
      case 'attempting':
        return "If the app doesn't open automatically, you'll be redirected to the App Store."
      case 'redirecting':
        return 'Taking you to the App Store to download the app.'
      case 'error':
        return 'This link is designed for iOS devices. Please open this link on your iPhone or iPad.'
      default:
        return "If the app doesn't open automatically, you'll be redirected to the App Store."
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      backgroundColor: status === 'error' ? '#fff5f5' : '#f8fafc'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '20px'
      }}>
        {status === 'error' ? '⚠️' : status === 'redirecting' ? '🏪' : '📱'}
      </div>
      
      <h2 style={{ 
        marginBottom: '10px',
        color: status === 'error' ? '#e53e3e' : '#2d3748'
      }}>
        {getStatusMessage()}
      </h2>
      
      <p style={{ 
        color: '#666',
        maxWidth: '400px',
        lineHeight: '1.5',
        marginBottom: '20px'
      }}>
        {getStatusDescription()}
      </p>

      {status === 'attempting' && (
        <div style={{
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#e6fffa',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#2c7a7b',
          border: '1px solid #b2f5ea'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: '500' }}>
            Deep Link URL:
          </div>
          <code style={{ 
            backgroundColor: '#ffffff', 
            padding: '6px 10px', 
            borderRadius: '6px',
            fontSize: '12px',
            wordBreak: 'break-all',
            display: 'block'
          }}>
            {buildDeepLink(appConfig.scheme, path, Object.fromEntries(searchParams.entries()))}
          </code>
        </div>
      )}

      {status === 'error' && appConfig.fallbackUrl && (
        <button
          onClick={() => window.location.href = appConfig.fallbackUrl!}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
        >
          Continue to Website
        </button>
      )}
    </div>
  )
}

export default AppRedirect
