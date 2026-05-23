# GhostStudent - Focus & Learning App

**A collaborative focus tracking app that helps students monitor their concentration while studying with others.**

## Project Overview

GhostStudent is a full-stack web application designed to:
- Track student focus levels during study sessions with YouTube videos
- Detect distractions (tab switching) and penalize score
- Award XP/levels for staying focused
- Enable multiplayer "study rooms" where friends can compete and support each other
- Provide teachers a real-time dashboard to monitor multiple students

## Architecture

### Backend Stack
- **Framework**: ASP.NET Core (.NET 10.0)
- **Database**: SQL Server (via Entity Framework Core 10.0.7)
- **API Style**: RESTful
- **Documentation**: Swagger/OpenAPI

### Frontend Stack
- **Framework**: React 19.2.5
- **Build Tool**: Vite 8.0.10
- **Icons**: react-icons 5.6.0
- **Styling**: Inline CSS (dark theme, Tailwind-inspired colors)

## Project Structure

```
ghost-student-app/
├── GhostStudentBackend/          # ASP.NET Core API
│   ├── Controllers/
│   │   ├── HeartbeatController.cs  # Session tracking (POST /api/heartbeat)
│   │   ├── RoomController.cs       # Room management (GET /api/room/{roomId})
│   │   ├── RadarController.cs      # Teacher dashboard (GET /api/radar)
│   │   └── WeatherForecastController.cs  # (placeholder)
│   ├── Models/
│   │   └── StudentSession.cs       # DB model for student sessions
│   ├── Data/
│   │   └── AppDbContext.cs         # EF Core DbContext
│   ├── Migrations/                 # DB version control
│   ├── Program.cs                  # App configuration & startup
│   └── appsettings.json            # Config (DB connection, CORS)
│
└── GhostStudentFrontend/           # React SPA
    ├── src/
    │   ├── App.jsx                 # Main router (3 modes: student, teacher, rooms)
    │   ├── StudentView.jsx         # Single student focus tracking (main feature)
    │   ├── TeacherDashboard.jsx    # Real-time student radar
    │   ├── StudyRoom.jsx           # Multiplayer study room view
    │   ├── RoomLobby.jsx           # Create/join rooms interface
    │   ├── index.css               # Global styles
    │   └── main.jsx                # React entry point
    ├── vite.config.js
    └── package.json
```

## Key Features Implemented

### 1. Student Focus Tracking (StudentView.jsx)
**Main game loop:**
- User pastes YouTube link → plays video with embed ID extraction
- **Focus Score**: Starts at 100, decreases when tab is hidden (distracted)
- **Tab Detection**: Monitors `visibilitychange` event → triggers alarm & penalty
- **XP System**: Gain 1 XP every 3 seconds while focused AND video playing → Level up at 100 XP
- **Pop Quizzes**: First quiz at 15s (demo), then every 15 min → +10 for success, -20 for miss
- **Session Stats**: Tracks total time, time distracted, final grade
- **Audio Alerts**: Web Audio API beeps when distracted

### 2. Multiplayer Study Rooms (StudyRoom.jsx + RoomLobby.jsx)
- Generate 6-char room code (e.g., "ABC123")
- Join via code → real-time score comparison with friends
- Heartbeat updates every 5s → synced scores on backend
- "You're winning/losing" competitive messages

### 3. Teacher Radar (TeacherDashboard.jsx)
- Real-time grid of all active students
- Color-coded by focus score: green (>80), yellow (50-80), red (<50)
- Shows distraction status (✅ Focused / 👻 Distracted)
- Auto-refreshes every 5 seconds

### 4. Backend API

#### POST /api/heartbeat
Keeps student session alive and syncs score.
```json
{
  "sessionId": "Student-429",
  "score": 85,
  "isPresent": true,
  "roomId": "ABC123"
}
```

#### GET /api/room/{roomId}
Fetches all active students in a room (last 1 min active).
```json
[
  { "id": 1, "sessionId": "Student-429", "score": 85, "isPresent": true, "roomId": "ABC123" },
  { "id": 2, "sessionId": "Student-512", "score": 70, "isPresent": false, "roomId": "ABC123" }
]
```

#### GET /api/radar
Fetches all active students globally (teacher dashboard).
Same response format as /api/room.

## Session Lifecycle

1. **User lands on homepage** → Chooses "I'm a Student"
2. **StudentView mounts** → `sessionId` generated (e.g., "Student-429")
3. **Paste YouTube URL** → Extracts embed ID, starts video
4. **Heartbeat loop** (every 5s):
   - Sends current score + presence to backend
   - Backend creates/updates StudentSession in DB
5. **Tab switches** → `visibilitychange` fires:
   - Triggers alarm sound
   - Starts draining score (-1/sec)
   - Counts distraction time
6. **Tab returns** → Alarm stops, score stabilizes
7. **Session ends** → User clicks end button → Shows results (grade, stats)

## Database Model

**StudentSession**
```csharp
public int Id { get; set; }                    // Primary key
public string SessionId { get; set; }           // e.g. "Student-429"
public int Score { get; set; }                  // 0-100 focus score
public bool IsPresent { get; set; }             // Tab visible?
public DateTime LastUpdated { get; set; }       // Last heartbeat time
public string RoomId { get; set; }              // Room ID (nullable, for multiplayer)
```

**Active sessions** = `LastUpdated >= DateTime.UtcNow.AddMinutes(-1)`

## CORS & Integration

Frontend (http://localhost:5173) → Backend (http://localhost:5126)

**CORS Policy** (in Program.cs):
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", builder =>
    {
        builder.WithOrigins("http://localhost:5173")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});
```

## Running Locally

### Backend
```bash
cd GhostStudentBackend
dotnet run --urls "http://localhost:5126"
```

### Frontend
```bash
cd GhostStudentFrontend
npm run dev  # Vite dev server on http://localhost:5173
```

Open http://localhost:5173 in browser.

## Known Issues & TODOs

- [ ] sessionId generation in StudentView (lines 5, 85) → moves outside component to prevent re-creation on re-render
- [ ] Inline CSS → refactor to CSS modules or styled-components for maintainability
- [ ] Error handling for API failures → add retry logic & user feedback
- [ ] Quiz modal timing → currently uses setTimeout, could use Backend-driven scheduling
- [ ] Room cleanup → no automatic deletion of inactive rooms
- [ ] Authentication → no user login, anyone can join/see rooms

## Tech Debt

1. **State Management**: StudentView has 16+ state vars + 8 refs → could extract to useReducer or Zustand for clarity
2. **Component Size**: StudentView.jsx is ~436 lines → split into sub-components (FocusRing, QuizModal, Sidebar)
3. **Magic Numbers**: Quiz interval (15s demo, 15min prod), XP interval (3s), heartbeat (5s) → move to constants
4. **Tests**: No test suite currently

## GitHub

Project pushed to GitHub. See repo for latest commits.

---

**Last Updated**: 2026-05-24  
**API Status**: ✅ Working (heartbeat, room, radar endpoints functional)  
**Frontend Status**: ✅ Working (all 3 modes: student, teacher, multiplayer)
