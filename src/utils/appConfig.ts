// Configuration for iOS app redirection
export interface AppConfig {
  scheme: string
  appStoreUrl: string
  fallbackUrl?: string
  timeout?: number
}

// Default configuration - customize these values for your app
export const defaultAppConfig: AppConfig = {
  scheme: 'your-app-scheme', // Replace with your actual app's URL scheme
  appStoreUrl: 'https://apps.apple.com/app/your-app-id', // Replace with your App Store URL
  fallbackUrl: '/', // Where to redirect non-iOS users
  timeout: 2500 // How long to wait before redirecting to App Store
}

// Example configurations for different apps:
export const exampleConfigs = {
  // Example for a notes app
  notesApp: {
    scheme: 'mynotesapp',
    appStoreUrl: 'https://apps.apple.com/app/id123456789',
    fallbackUrl: '/',
    timeout: 2500
  },
  
  // Example for a messaging app
  messagingApp: {
    scheme: 'mymessenger',
    appStoreUrl: 'https://apps.apple.com/app/id987654321',
    fallbackUrl: '/web-version',
    timeout: 3000
  }
}

// Utility function to build deep link URLs with parameters
export const buildDeepLink = (scheme: string, path?: string, params?: Record<string, string>) => {
  let url = `${scheme}://`
  
  if (path) {
    url += path
  }
  
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString()
    url += (path ? '?' : '') + queryString
  }
  
  return url
}
