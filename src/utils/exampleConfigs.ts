// Example configuration for your iOS app redirect
// Copy this and modify the values for your specific app

import { type AppConfig } from './appConfig'

// Example 1: Notes/Writing App
export const notesAppConfig: AppConfig = {
  scheme: 'mynotesapp',
  appStoreUrl: 'https://apps.apple.com/app/id123456789',
  fallbackUrl: '/',
  timeout: 2500
}

// Example 2: Social Media App
export const socialAppConfig: AppConfig = {
  scheme: 'mysocialapp',
  appStoreUrl: 'https://apps.apple.com/app/id987654321',
  fallbackUrl: '/web-version',
  timeout: 3000
}

// Example 3: Business/Productivity App
export const businessAppConfig: AppConfig = {
  scheme: 'mybusinessapp',
  appStoreUrl: 'https://apps.apple.com/app/id456789123',
  fallbackUrl: '/features',
  timeout: 2000
}

// Your actual app configuration - UPDATE THESE VALUES!
export const myAppConfig: AppConfig = {
  scheme: 'your-app-scheme',           // ⚠️ CHANGE THIS to your app's URL scheme
  appStoreUrl: 'https://apps.apple.com/app/your-app-id', // ⚠️ CHANGE THIS to your App Store URL
  fallbackUrl: '/',                   // Where non-iOS users should go
  timeout: 2500                       // How long to wait before App Store redirect
}

// Usage examples for different routes:

/*
// Basic app opening
<Route path="/open-app" element={
  <AppRedirect config={myAppConfig} />
} />

// Open specific feature
<Route path="/open-profile" element={
  <AppRedirect 
    config={myAppConfig} 
    path="profile" 
  />
} />

// Open with custom timeout
<Route path="/open-premium" element={
  <AppRedirect 
    config={{
      ...myAppConfig,
      timeout: 5000  // Wait longer for premium features
    }}
    path="premium"
  />
} />
*/
