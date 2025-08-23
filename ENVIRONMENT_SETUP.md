# Environment Variables Setup Guide

## 🔒 **Security First**

**Never commit real credentials to your code!** This guide shows you how to set up environment variables safely.

## 📁 **Create .env File**

Create a `.env` file in your project root (same directory as `package.json`):

```bash
# On your server, create the .env file
cd /home/ec2-user/vrai.art
nano .env
```

## 📝 **Add Your Credentials to .env**

```bash
# Email Configuration (Required for password reset emails)
EMAIL_USER=kylelf@gmail.com
EMAIL_PASS=thgl bloe cgwq egot

# Backend Configuration (Optional - uses defaults if not set)
BACKEND_HOST=3.142.69.98
BACKEND_PORT=8000

# Frontend Configuration (Optional - uses defaults if not set)
FRONTEND_HOST=3.142.69.98
FRONTEND_PORT=3000

# Database Configuration (Optional - uses default if not set)
DATABASE_PATH=./social.db

# JWT Configuration (Optional - uses default if not set)
JWT_SECRET=your-secret-key-change-in-production
```

## 🚫 **Important: Add .env to .gitignore**

Make sure your `.env` file is never committed to git:

```bash
# Check if .gitignore exists
ls -la .gitignore

# If it doesn't exist, create it
echo ".env" >> .gitignore
echo "*.env" >> .gitignore
echo "node_modules/" >> .gitignore
echo "social.db" >> .gitignore

# Verify .env is ignored
git status
# Should NOT show .env file
```

## 🚀 **Install dotenv Package**

The server now automatically loads the `.env` file, but you need to install the package:

```bash
cd /home/ec2-user/vrai.art
npm install dotenv
```

## ✅ **Test the Setup**

1. **Create .env file** with your credentials
2. **Install dotenv**: `npm install dotenv`
3. **Restart server**: `node server/index.js`
4. **Look for**: "✅ Email transporter configured successfully"

## 🔍 **What the Code Now Does**

- **Automatically loads** `.env` file when server starts
- **Validates email credentials** and tests connection
- **Provides clear feedback** about what's configured
- **Gracefully handles** missing or invalid credentials
- **Shows helpful messages** in server console

## 🎯 **Server Console Output**

### **When Email is Configured:**
```
✅ Email transporter configured successfully
📧 Server is ready to send emails
Server running on port 8000 and bound to all interfaces (0.0.0.0)
```

### **When Email is NOT Configured:**
```
⚠️  Email credentials not configured
   Set EMAIL_USER and EMAIL_PASS environment variables to enable password reset emails
   Password reset functionality will work but emails will not be sent
Server running on port 8000 and bound to all interfaces (0.0.0.0)
```

## 🧪 **Test Password Reset**

1. **Go to**: `http://3.142.69.98:3000/forgot-password`
2. **Enter email**: `kylelf@gmail.com`
3. **Submit** and check:
   - **Frontend response** (should work)
   - **Backend console** (should show email sent)
   - **Your Gmail** (should receive reset link)

## 🔒 **Security Benefits**

- ✅ **No passwords in code**
- ✅ **Safe for open-source**
- ✅ **Easy to change credentials**
- ✅ **Different configs for different environments**
- ✅ **Automatic .env loading**

## 🐛 **Troubleshooting**

### **Email not working:**
- Check `.env` file exists and has correct credentials
- Verify Gmail App Password is correct
- Check server console for error messages
- Ensure 2FA is enabled on Gmail

### **Server won't start:**
- Check `.env` file syntax (no spaces around `=`)
- Verify all required packages are installed
- Check file permissions on `.env`

Your password reset system is now properly configured with environment variables! 🎉
