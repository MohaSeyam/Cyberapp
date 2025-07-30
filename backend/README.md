# 🚀 CyberPlan Backend

Backend API for CyberPlan - A comprehensive cybersecurity learning platform.

## 🏗️ Architecture

- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express-validator
- **Password Hashing**: bcryptjs

## 📋 Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based authorization
- Password hashing with bcrypt
- Token refresh mechanism

### 📝 Notes Management
- CRUD operations for notes
- Search and filtering
- Categories and tags
- Favorite and pin functionality
- Pagination support

### 📖 Journal Management
- Daily journal entries
- Rich text content
- Mood tracking
- Search and filtering

### 📊 Progress Tracking
- Task completion tracking
- Time spent tracking
- Progress analytics
- Achievement system

### 🔗 Resources Management
- Add/edit/delete resources
- Resource categorization
- Link validation
- File upload support

### 📈 Analytics
- User activity tracking
- Learning progress analytics
- Performance metrics
- Achievement tracking

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd cyberplan-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Initialize database**
```bash
npm run init-db
```

5. **Start development server**
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_PATH=./data/cyberplan.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

#### GET `/api/auth/profile`
Get current user profile (requires authentication)

#### POST `/api/auth/change-password`
Change user password (requires authentication)
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass123"
}
```

### Notes Endpoints

#### GET `/api/notes`
Get all notes with pagination and filtering
```
Query parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- category: Filter by category
- search: Search in title, content, tags
- weekId: Filter by week
- dayKey: Filter by day
- sortBy: Sort field (created_at, updated_at, title, category)
- sortOrder: Sort order (ASC, DESC)
```

#### POST `/api/notes`
Create new note
```json
{
  "title": "My Note",
  "content": "Note content...",
  "tags": ["important", "study"],
  "category": "study",
  "weekId": 1,
  "dayKey": "mon",
  "taskId": "w1d1t1"
}
```

#### PUT `/api/notes/:id`
Update note

#### DELETE `/api/notes/:id`
Delete note

#### PATCH `/api/notes/:id/favorite`
Toggle favorite status

#### PATCH `/api/notes/:id/pin`
Toggle pinned status

### Journal Endpoints

#### GET `/api/journal`
Get all journal entries

#### POST `/api/journal`
Create new journal entry
```json
{
  "title": "Today's Reflection",
  "content": "Today I learned...",
  "tags": ["reflection", "learning"],
  "mood": "happy"
}
```

### Progress Endpoints

#### GET `/api/progress`
Get user progress

#### POST `/api/progress`
Update task progress
```json
{
  "weekId": 1,
  "dayKey": "mon",
  "taskId": "w1d1t1",
  "isCompleted": true,
  "timeSpent": 60
}
```

### Resources Endpoints

#### GET `/api/resources`
Get all resources

#### POST `/api/resources`
Add new resource
```json
{
  "title": "Cybersecurity Guide",
  "url": "https://example.com/guide",
  "type": "article",
  "description": "A comprehensive guide"
}
```

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Token expiration
- Refresh token mechanism

### Authorization
- Role-based access control
- User-specific data isolation
- API endpoint protection

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation

### Data Protection
- SQL injection prevention
- XSS protection
- CSRF protection
- Input sanitization

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  avatar_url VARCHAR(255),
  preferences TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1,
  role VARCHAR(20) DEFAULT 'user'
);
```

### Notes Table
```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  week_id INTEGER,
  day_key VARCHAR(10),
  task_id VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  tags TEXT,
  category VARCHAR(50) DEFAULT 'general',
  is_favorite BOOLEAN DEFAULT 0,
  is_pinned BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```bash
docker build -t cyberplan-backend .
docker run -p 5000:5000 cyberplan-backend
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm run init-db`: Initialize database tables
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run build`: Build for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] File upload support
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Mobile API optimization
- [ ] Caching layer
- [ ] WebSocket support
- [ ] Multi-language support