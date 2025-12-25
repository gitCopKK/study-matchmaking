# Study Match Maker

An intelligent study partner and group matching platform that connects students based on subjects, goals, schedules, learning styles, and compatibility.

## Features

### 🎯 Core Features
- **AI-Powered Matching**: Find study partners with Groq AI-enhanced compatibility scoring, semantic subject understanding, and personalized match explanations
- **Intelligent Fallback**: Rule-based matching with weighted scoring (subjects, schedule, learning style, exam goals) when AI is unavailable
- **Real-time Chat**: WebSocket-based messaging with typing indicators and read receipts
- **Study Tracker**: Track study time, maintain streaks, and view progress with heatmaps
- **Session Scheduler**: Schedule study sessions with partners using a calendar interface
- **Notifications**: Real-time alerts for matches, messages, and reminders

### 📱 User Experience
- **Dashboard**: Overview of stats, matches, and upcoming sessions
- **Profile Management**: Customize subjects, learning style, study times, and bio
- **Settings**: Account, notifications, privacy, and dark mode support
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Spring Boot 3.2 + Maven + Java 17
- **Database**: PostgreSQL 15
- **Real-time**: WebSocket (STOMP) for chat

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+
- PostgreSQL 15

### 1. Start PostgreSQL

**Option A: Using Docker**
```bash
docker-compose up -d
```

**Option B: Using Homebrew (macOS)**
```bash
brew install postgresql@15
brew services start postgresql@15
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql postgres -c "CREATE USER studymatch WITH PASSWORD 'studymatch123' CREATEDB;"
psql postgres -c "CREATE DATABASE studymatch OWNER studymatch;"
```

### 2. Run the Backend
```bash
cd backend
./mvnw spring-boot:run
```
API available at `http://localhost:8080`

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at `http://localhost:5173`

## Production Deployment

For a complete step-by-step deployment guide using free-tier services (Cloudflare Pages, Render, Neon PostgreSQL), see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

### Quick Overview

| Service | Cost | Purpose |
|---------|------|---------|
| Cloudflare Pages | Free | Frontend hosting |
| Render | Free | Backend hosting |
| Neon | Free | PostgreSQL database |
| Google OAuth | Free | Authentication |
| Groq AI | Free | AI-powered matching |

**Total cost: $0/month** for 5-50 users (with cold starts after 15min inactivity).

### Frontend Build
```bash
cd frontend
npm run build
# Output in dist/ folder - serve with nginx, Vercel, Netlify, etc.
```

### Backend Build
```bash
cd backend
./mvnw clean package -DskipTests
# JAR file in target/studymatch-0.0.1-SNAPSHOT.jar
```

### Environment Variables (Production)
```bash
# Database
DATABASE_URL=jdbc:postgresql://your-db-host:5432/studymatch
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password

# Security (REQUIRED - generate a secure 256-bit key)
JWT_SECRET=your-256-bit-secret-key-base64-encoded

# CORS
CORS_ORIGINS=https://your-frontend-domain.com

# Server
PORT=8080

# Frontend API URL (set in Cloudflare Pages)
VITE_API_URL=https://your-backend.onrender.com

# AI Matching (Optional - enables AI-powered matching)
GROQ_API_KEY=your-groq-api-key
```

### Enabling AI-Powered Matching

The app uses Groq's free API for AI-enhanced matching. To enable:

1. **Get a free API key** from [console.groq.com](https://console.groq.com)
2. **Set the environment variable**:
   ```bash
   export GROQ_API_KEY=gsk_your_key_here
   ```
3. **Restart the backend**

**AI Matching Features:**
- Semantic subject understanding (Physics ≈ Mechanics)
- Personalized match explanations
- Complementary skills matching (your weaknesses = their strengths)
- AI-suggested study topics

**Free Tier Limits:** 14,400 requests/day (supports ~100-200 active users)

**Fallback:** If no API key is set or quota is exceeded, the app gracefully falls back to rule-based matching.

### Run in Production
```bash
java -jar target/studymatch-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout |

### Users & Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update user |
| GET | `/api/profiles/me` | Get profile |
| PUT | `/api/profiles/me` | Update profile |

### Matching
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches/suggestions` | Get match suggestions |
| GET | `/api/matches` | Get accepted matches |
| POST | `/api/matches/{id}/accept` | Accept match |
| POST | `/api/matches/{id}/decline` | Decline match |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | Get conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/{id}/messages` | Get messages |
| POST | `/api/conversations/{id}/messages` | Send message |
| POST | `/api/conversations/{id}/read` | Mark as read |
| WS | `/ws` | Real-time messaging |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | Get all sessions |
| GET | `/api/sessions/upcoming` | Get upcoming sessions |
| POST | `/api/sessions` | Create session |
| PUT | `/api/sessions/{id}` | Update session |
| DELETE | `/api/sessions/{id}` | Delete session |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | Get activities (with date range) |
| POST | `/api/activities` | Log activity |
| GET | `/api/activities/stats` | Get statistics |
| GET | `/api/activities/streak` | Get streak info |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications (paginated) |
| POST | `/api/notifications/{id}/read` | Mark as read |
| POST | `/api/notifications/read-all` | Mark all as read |
| GET | `/api/notifications/unread-count` | Get unread count |

## Project Structure

```
study-matchmaking/
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/studymatch/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # JPA repositories
│   │   ├── service/         # Business logic
│   │   ├── security/        # JWT & authentication
│   │   └── websocket/       # WebSocket handlers
│   └── src/main/resources/
│       ├── application.yml       # Dev config
│       ├── application-prod.yml  # Production config
│       └── data.sql             # Sample data
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context (Auth, Theme, WebSocket)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   └── utils/           # Utility functions
│   ├── dist/                # Production build output
│   └── vite.config.js       # Vite configuration
└── docker-compose.yml       # PostgreSQL container
```

## Security Considerations

1. **JWT Secret**: Always use a strong, random 256-bit key in production
   ```bash
   # Generate a secure JWT secret:
   openssl rand -base64 32
   ```
2. **HTTPS**: Use HTTPS in production for all traffic
3. **CORS**: Configure `CORS_ORIGINS` to only allow your frontend domains
4. **Database**: Use strong passwords and restrict network access
5. **Environment Variables**: Never commit secrets to version control
6. **OAuth2 Credentials**: Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for production
7. **SSL Verification**: Never disable SSL verification in production (`SKIP_SSL_VERIFICATION` must be `false`)

### Production Security Validation

The application automatically validates security configuration on startup:
- **In Production (`--spring.profiles.active=prod`)**: Application will **fail to start** if:
  - JWT secret is weak or default
  - SSL verification is disabled
  - Required environment variables are missing
- **In Development**: Warnings are logged but application continues

## License

MIT
