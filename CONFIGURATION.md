# Configuration Guide

## 🎯 Single Location Configuration

**Good news!** You now have **one place** to change your backend URL and port. All changes are automatically applied to both frontend and backend.

## 📁 Configuration Files

- **`config.js`** (root) - **MAIN CONFIG FILE** - Change backend settings here
- **`client/src/config.js`** - Frontend config (self-contained, uses environment variables)

## 🚀 Quick Configuration Changes

### Option 1: Use the update script (Recommended)
```bash
# Change both host and port
./update-config.sh localhost 8000

# Change just host (port defaults to 8000)
./update-config.sh my-server.com

# Change to production server
./update-config.sh api.myapp.com 443
```

### Option 2: Edit config.js directly
Edit the `config.js` file in the root directory:
```javascript
backend: {
  host: process.env.BACKEND_HOST || 'localhost',  // ← Change this
  port: process.env.BACKEND_PORT || 8000,         // ← Change this
  // ... rest is automatic
}
```

### Option 3: Environment variables
```bash
export BACKEND_HOST=my-server.com
export BACKEND_PORT=8080
```

## 🔧 What Gets Updated Automatically

When you change the config, these are automatically updated:

✅ **Backend server port**  
✅ **Frontend API calls**  
✅ **File upload URLs**  
✅ **Package.json proxy**  
✅ **All component URLs**  

## 📋 Configuration Options

| Setting | Default | Environment Variable | Description |
|---------|---------|---------------------|-------------|
| `BACKEND_HOST` | `localhost` | `BACKEND_HOST` | Backend server hostname/IP |
| `BACKEND_PORT` | `8000` | `BACKEND_PORT` | Backend server port |
| `FRONTEND_HOST` | `localhost` | `FRONTEND_HOST` | Frontend server hostname |
| `FRONTEND_PORT` | `3000` | `FRONTEND_PORT` | Frontend server port |
| `DATABASE_PATH` | `./social.db` | `DATABASE_PATH` | SQLite database location |
| `JWT_SECRET` | `your-secret-key...` | `JWT_SECRET` | JWT signing secret |

## 🌍 Environment-Specific Examples

### Development
```bash
BACKEND_HOST=localhost
BACKEND_PORT=8000
```

### Staging
```bash
BACKEND_HOST=staging-api.myapp.com
BACKEND_PORT=80
```

### Production
```bash
BACKEND_HOST=api.myapp.com
BACKEND_PORT=443
```

### Local Network
```bash
BACKEND_HOST=192.168.1.100
BACKEND_PORT=5000
```

## 📝 How It Works

1. **Root config** (`config.js`) contains all settings
2. **Backend** imports and uses the config for port and JWT secret
3. **Frontend** has its own config that can be overridden with environment variables
4. **Changes in one place** automatically update everywhere

## 🚨 Important Notes

- **Restart required**: After changing config, restart both servers
- **Environment variables override defaults**: Set `BACKEND_HOST` and `BACKEND_PORT` to override config.js
- **Frontend proxy**: Package.json proxy is updated to match backend port
- **No more hardcoded URLs**: All components now use the shared config
- **Frontend config**: Uses `REACT_APP_` prefixed environment variables

## 🔍 Troubleshooting

### Port already in use
```bash
# Check what's using the port
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Configuration not taking effect
1. Restart backend server
2. Restart frontend development server
3. Check browser console for errors
4. Verify config.js was updated

### Environment variables not working
- Make sure you're setting them before starting the servers
- Check that the variable names match exactly
- Try setting them in the same terminal session
- For frontend, use `REACT_APP_BACKEND_HOST` and `REACT_APP_BACKEND_PORT`
