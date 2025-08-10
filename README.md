# Vrai.art - Social Media Platform

A modern, full-stack social media application built with React, Node.js, and SQLite.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Profile Management**: User profiles with customizable profile photos
- **Social Posts**: Create, view, and interact with posts
- **Privacy Controls**: Public and private post visibility
- **User Connections**: Send and manage connection requests
- **Real-time Updates**: Dynamic content loading and updates
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing and navigation
- **Axios** - HTTP client for API communication
- **CSS3** - Custom styling with modern design principles

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **SQLite3** - Lightweight database
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Multer** - File upload handling

## Project Structure

```
vrai.art/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── services/      # API service layer
│   │   └── index.js       # App entry point
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                 # Node.js backend
│   ├── index.js           # Server entry point
│   ├── services/          # Business logic services
│   ├── uploads/           # File upload storage
│   └── package.json       # Backend dependencies
└── README.md              # This file
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vrai.art
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the backend server**
   ```bash
   cd ../server
   node index.js
   ```
   The server will run on `http://localhost:5000`

5. **Start the frontend development server**
   ```bash
   cd ../client
   npm start
   ```
   The app will open in your browser at `http://localhost:3000`

### Database Setup

The application automatically creates the SQLite database and required tables on first run. The database file (`database.db`) will be created in the server directory.

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### User Management
- `GET /api/profile` - Get current user profile
- `POST /api/profile/photo` - Upload profile photo
- `GET /api/users` - Get all users
- `GET /api/users/:username/posts` - Get user profile and posts

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post with comments
- `POST /api/posts/:id/comments` - Add comment to post

### Connections
- `GET /api/connections` - Get user connections
- `POST /api/connections` - Send connection request
- `PUT /api/connections/:id` - Update connection status

## Key Components

### Frontend Components
- **AuthContext**: Manages user authentication state
- **ProfilePhoto**: Handles profile photo display and upload
- **PostDetail**: Displays individual posts with comments
- **UserProfile**: Shows other users' profiles
- **Connections**: Manages user connections and requests

### Backend Services
- **Storage Service**: Handles file uploads and storage
- **Authentication Middleware**: JWT token validation
- **Database Operations**: SQLite queries and data management

## Features in Detail

### Profile Photos
- Support for image uploads (PNG, JPG, etc.)
- Automatic file size validation (5MB limit)
- Unique filename generation to prevent conflicts
- Old photo cleanup when updating

### Post Privacy
- Public posts visible to all users
- Private posts visible only to the author
- Visual indicators for post privacy status

### User Connections
- Send connection requests to other users
- Accept, reject, or cancel pending requests
- View connection status and manage relationships

## Development

### Building for Production
```bash
cd client
npm run build
```

### Code Quality
The project uses ESLint for code quality and consistency. Run the linter with:
```bash
cd client
npm run lint
```

## Troubleshooting

### Common Issues

1. **Profile photos not displaying**
   - Ensure the server is running
   - Check that the database has the `profile_photo` column
   - Verify file permissions in the uploads directory

2. **Authentication errors**
   - Clear browser local storage
   - Check JWT token expiration
   - Verify server is running on port 5000

3. **Database errors**
   - Delete `database.db` and restart server to recreate tables
   - Check SQLite installation and permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies
- Designed for scalability and maintainability
- Focus on user experience and performance 