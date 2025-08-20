# Email Setup Guide for Password Reset

## 📧 **Overview**

The password reset system uses nodemailer to send emails. You'll need to configure email credentials to enable this functionality.

## 🚀 **Setup Steps**

### **1. Install Dependencies**

On your Amazon Linux server:

```bash
cd /home/ec2-user/vrai.art
npm install nodemailer
```

### **2. Configure Email Credentials**

#### **Option A: Gmail (Recommended for testing)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Set environment variables**:

```bash
export EMAIL_USER=your-email@gmail.com
export EMAIL_PASS=your-app-password
```

#### **Option B: Other Email Services**

Update the email configuration in `server/index.js`:

```javascript
const transporter = nodemailer.createTransporter({
  service: 'outlook', // or 'yahoo', 'hotmail', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

#### **Option C: Custom SMTP Server**

```javascript
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### **3. Set Environment Variables**

Create a `.env` file in your project root (or set them in your shell):

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Backend Configuration
BACKEND_HOST=3.142.69.98
BACKEND_PORT=8000
```

### **4. Test the Setup**

1. **Restart your backend server**
2. **Go to**: `http://3.142.69.98:3000/forgot-password`
3. **Enter your email** and submit
4. **Check your email** for the reset link
5. **Click the link** to test the reset flow

## 🔒 **Security Features**

- **Reset tokens expire** after 1 hour
- **Tokens are single-use** (deleted after password reset)
- **Secure token generation** using crypto.randomBytes()
- **No user enumeration** (same response for existing/non-existing emails)

## 📱 **User Experience**

1. **User clicks "Forgot Password"** on login page
2. **Enters email address** and submits
3. **Receives email** with reset link
4. **Clicks link** to go to reset password page
5. **Enters new password** and confirms
6. **Redirected to login** with success message

## 🐛 **Troubleshooting**

### **Email not sending**
- Check email credentials
- Verify 2FA is enabled (for Gmail)
- Check server logs for errors
- Ensure ports 25, 587, or 465 are open

### **Reset link not working**
- Check if token is expired (1 hour limit)
- Verify frontend URL in email matches your server
- Check database for reset token

### **Database errors**
- Ensure password_reset_tokens table was created
- Check database permissions

## 🌐 **Production Considerations**

- **Use dedicated email service** (SendGrid, Mailgun, AWS SES)
- **Set up proper SPF/DKIM records**
- **Monitor email delivery rates**
- **Implement rate limiting** on reset requests
- **Use HTTPS** for all reset links

## 📋 **Environment Variables Summary**

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_USER` | Email address for sending | `your-email@gmail.com` |
| `EMAIL_PASS` | Email password/app password | `abcd efgh ijkl mnop` |
| `BACKEND_HOST` | Your server IP | `3.142.69.98` |
| `BACKEND_PORT` | Backend server port | `8000` |

The password reset system is now fully implemented and ready to use! 🎉
