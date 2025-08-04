import { Link } from 'react-router-dom'

const TestPage: React.FC = () => {
  return (
    <div style={{
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <h1>iOS App Redirect Test Page</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <p>Use these links to test the iOS app redirect functionality:</p>
      </div>

      <div style={{
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
      }}>
        {/* Basic redirect */}
        <div style={{
          padding: '20px',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{ marginTop: 0, color: '#2d3748' }}>Basic App Open</h3>
          <p style={{ color: '#4a5568', fontSize: '14px' }}>
            Opens the app with no specific path or parameters
          </p>
          <Link 
            to="kijiita-test://test" 
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#3182ce',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            Open App
          </Link>
        </div>

        {/* With parameters */}
        <div style={{
          padding: '20px',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{ marginTop: 0, color: '#2d3748' }}>With Parameters</h3>
          <p style={{ color: '#4a5568', fontSize: '14px' }}>
            Opens the app with query parameters (open specific post)
          </p>
          <Link 
            to="kijiita-test://post/1309821465953055520" 
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#38a169',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            Open with Params
          </Link>
        </div>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#fff5f5',
        borderRadius: '12px',
        border: '1px solid #fed7d7'
      }}>
        <h3 style={{ marginTop: 0, color: '#c53030' }}>⚠️ Before Testing</h3>
        <ol style={{ color: '#4a5568' }}>
          <li>Update the app scheme in <code>/src/utils/appConfig.ts</code></li>
          <li>Update the App Store URL in the same file</li>
          <li>Make sure your iOS app is configured to handle the URL scheme</li>
          <li>Test on an actual iOS device for best results</li>
        </ol>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f0fff4',
        borderRadius: '12px',
        border: '1px solid #c6f6d5'
      }}>
        <h3 style={{ marginTop: 0, color: '#2f855a' }}>📱 How It Works</h3>
        <ul style={{ color: '#4a5568' }}>
          <li><strong>iOS devices:</strong> Attempts to open your app, falls back to App Store</li>
          <li><strong>Other devices:</strong> Shows a message or redirects to fallback URL</li>
          <li><strong>Parameters:</strong> All query parameters are passed to your app</li>
          <li><strong>Timeout:</strong> Waits 2.5 seconds before App Store redirect</li>
        </ul>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link 
          to="/" 
          style={{
            color: '#3182ce',
            textDecoration: 'none'
          }}
        >
          ← Back to Editor
        </Link>
      </div>
    </div>
  )
}

export default TestPage
