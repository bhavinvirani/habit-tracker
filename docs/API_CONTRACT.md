# Habit Tracker API Contract

> Base URL: `http://localhost:8080/api`  
> All endpoints (except auth) require `Authorization: Bearer <token>` header

---

## Authentication

### POST `/auth/register`

Create a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token"
  }
}
```

---

### POST `/auth/login`

Authenticate and receive JWT token.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token"
  }
}
```

---

## Habits

### GET `/habits`

Get all habits for the authenticated user.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `isActive` | boolean | - | Filter by active status |
| `category` | string | - | Filter by category |
| `frequency` | string | - | Filter by frequency (DAILY, WEEKLY) |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "habits": [
      {
        "id": "uuid",
        "name": "Morning Exercise",
        "description": "30 min workout",
        "category": "Health",
        "frequency": "DAILY",
        "frequencyConfig": {
          "type": "DAILY",
          "daysOfWeek": null,
          "timesPerWeek": null
        },
        "habitType": "BOOLEAN",
        "targetValue": null,
        "unit": null,
        "color": "#10B981",
        "icon": "🏃",
        "isActive": true,
        "currentStreak": 5,
        "longestStreak": 12,
        "totalCompletions": 42,
        "createdAt": "2026-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### POST `/habits`

Create a new habit.

**Request:**

```json
{
  "name": "Morning Exercise",
  "description": "30 min workout every morning",
  "category": "Health",
  "frequency": "DAILY",
  "frequencyConfig": {
    "type": "DAILY",
    "daysOfWeek": null,
    "timesPerWeek": null
  },
  "habitType": "BOOLEAN",
  "targetValue": null,
  "unit": null,
  "color": "#10B981",
  "icon": "🏃"
}
```

**Frequency Config Examples:**

```json
// Daily habit
{ "type": "DAILY", "daysOfWeek": null, "timesPerWeek": null }

// Weekly - specific days (Mon, Wed, Fri)
{ "type": "WEEKLY", "daysOfWeek": [1, 3, 5], "timesPerWeek": null }

// Weekly - X times per week (any days)
{ "type": "WEEKLY", "daysOfWeek": null, "timesPerWeek": 3 }
```

**Habit Types:**

- `BOOLEAN` - Yes/No (did you do it?)
- `NUMERIC` - Count (glasses of water: 8)
- `DURATION` - Minutes (meditation: 20 min)

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "habit": {
      "id": "uuid",
      "name": "Morning Exercise",
      "...": "..."
    }
  }
}
```

---

### GET `/habits/:id`

Get a single habit with stats.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "habit": {
      "id": "uuid",
      "name": "Morning Exercise",
      "description": "30 min workout",
      "category": "Health",
      "frequency": "DAILY",
      "frequencyConfig": { "type": "DAILY" },
      "habitType": "BOOLEAN",
      "color": "#10B981",
      "icon": "🏃",
      "isActive": true,
      "currentStreak": 5,
      "longestStreak": 12,
      "totalCompletions": 42,
      "completionRate": 85.5,
      "lastCompletedAt": "2026-01-29T08:00:00Z",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-29T08:00:00Z"
    }
  }
}
```

---

### PATCH `/habits/:id`

Update a habit.

**Request:** (partial update)

```json
{
  "name": "Evening Exercise",
  "isActive": false
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "habit": { "...": "updated habit" }
  }
}
```

---

### DELETE `/habits/:id`

Delete a habit and all its logs.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Habit deleted successfully"
}
```

---

## Tracking (Daily Check-ins)

### GET `/tracking/today`

Get today's check-in status for all habits.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "date": "2026-01-29",
    "habits": [
      {
        "habitId": "uuid",
        "name": "Morning Exercise",
        "category": "Health",
        "habitType": "BOOLEAN",
        "targetValue": null,
        "color": "#10B981",
        "icon": "🏃",
        "isCompleted": true,
        "value": null,
        "logId": "log-uuid",
        "completedAt": "2026-01-29T08:00:00Z",
        "notes": "Felt great!",
        "currentStreak": 6
      },
      {
        "habitId": "uuid-2",
        "name": "Drink Water",
        "category": "Health",
        "habitType": "NUMERIC",
        "targetValue": 8,
        "unit": "glasses",
        "color": "#3B82F6",
        "icon": "💧",
        "isCompleted": false,
        "value": 5,
        "logId": "log-uuid-2",
        "currentStreak": 0
      }
    ],
    "summary": {
      "total": 5,
      "completed": 3,
      "completionRate": 60
    }
  }
}
```

---

### POST `/tracking/check-in`

Log a habit completion (tick the checkbox).

**Request:**

```json
{
  "habitId": "uuid",
  "date": "2026-01-29",
  "completed": true,
  "value": null,
  "notes": "Morning run completed!"
}
```

**For numeric/duration habits:**

```json
{
  "habitId": "uuid",
  "date": "2026-01-29",
  "completed": true,
  "value": 8,
  "notes": "Drank 8 glasses of water"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "log": {
      "id": "log-uuid",
      "habitId": "uuid",
      "date": "2026-01-29",
      "completed": true,
      "value": null,
      "notes": "Morning run completed!",
      "createdAt": "2026-01-29T08:00:00Z"
    },
    "streak": {
      "current": 6,
      "longest": 12,
      "isNewRecord": false
    },
    "milestone": null
  }
}
```

**When milestone is reached:**

```json
{
  "success": true,
  "data": {
    "log": { "...": "..." },
    "streak": { "current": 7, "longest": 12 },
    "milestone": {
      "type": "STREAK",
      "value": 7,
      "title": "1 Week Streak! 🔥",
      "message": "You've completed this habit 7 days in a row!"
    }
  }
}
```

---

### DELETE `/tracking/check-in`

Undo a check-in (untick).

**Request:**

```json
{
  "habitId": "uuid",
  "date": "2026-01-29"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Check-in removed"
}
```

---

### GET `/tracking/history`

Get tracking history for calendar/heatmap.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | string | yes | Start date (YYYY-MM-DD) |
| `endDate` | string | yes | End date (YYYY-MM-DD) |
| `habitId` | string | no | Filter by specific habit |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "date": "2026-01-29",
        "totalHabits": 5,
        "completedHabits": 4,
        "completionRate": 80,
        "logs": [
          {
            "habitId": "uuid",
            "habitName": "Morning Exercise",
            "completed": true,
            "value": null
          }
        ]
      },
      {
        "date": "2026-01-28",
        "totalHabits": 5,
        "completedHabits": 5,
        "completionRate": 100,
        "logs": ["..."]
      }
    ]
  }
}
```

---

### GET `/tracking/date/:date`

Get all habits and their status for a specific date.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "date": "2026-01-25",
    "habits": [
      {
        "habitId": "uuid",
        "name": "Morning Exercise",
        "isCompleted": true,
        "value": null,
        "notes": "30 min run",
        "completedAt": "2026-01-25T08:30:00Z"
      }
    ]
  }
}
```

---

## Analytics

### GET `/analytics/overview`

Get dashboard overview stats.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalHabits": 5,
      "activeHabits": 4,
      "completedToday": 3,
      "pendingToday": 1,
      "overallCompletionRate": 78.5,
      "currentBestStreak": {
        "habitId": "uuid",
        "habitName": "Morning Exercise",
        "streak": 12
      },
      "totalCompletionsAllTime": 342,
      "thisWeek": {
        "completed": 18,
        "total": 28,
        "rate": 64.3
      },
      "thisMonth": {
        "completed": 85,
        "total": 112,
        "rate": 75.9
      }
    }
  }
}
```

---

### GET `/analytics/weekly`

Get weekly breakdown for charts.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `weeks` | number | 4 | Number of weeks to include |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "weekly": [
      {
        "weekStart": "2026-01-27",
        "weekEnd": "2026-02-02",
        "days": [
          { "date": "2026-01-27", "day": "Mon", "completed": 4, "total": 5, "rate": 80 },
          { "date": "2026-01-28", "day": "Tue", "completed": 5, "total": 5, "rate": 100 },
          { "date": "2026-01-29", "day": "Wed", "completed": 3, "total": 5, "rate": 60 }
        ],
        "summary": {
          "completed": 12,
          "total": 15,
          "rate": 80
        }
      }
    ]
  }
}
```

---

### GET `/analytics/monthly`

Get monthly breakdown.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `months` | number | 6 | Number of months to include |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "monthly": [
      {
        "month": "2026-01",
        "monthName": "January 2026",
        "completed": 85,
        "total": 112,
        "rate": 75.9,
        "byCategory": [
          { "category": "Health", "completed": 50, "total": 60, "rate": 83.3 },
          { "category": "Productivity", "completed": 35, "total": 52, "rate": 67.3 }
        ]
      }
    ]
  }
}
```

---

### GET `/analytics/heatmap`

Get heatmap data for GitHub-style calendar.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `year` | number | current | Year to get data for |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "year": 2026,
    "heatmap": [
      { "date": "2026-01-01", "count": 5, "level": 4 },
      { "date": "2026-01-02", "count": 3, "level": 2 },
      { "date": "2026-01-03", "count": 0, "level": 0 }
    ],
    "legend": {
      "0": "No activity",
      "1": "1-2 habits",
      "2": "3-4 habits",
      "3": "5-6 habits",
      "4": "7+ habits"
    }
  }
}
```

---

### GET `/analytics/habit/:habitId`

Get detailed stats for a specific habit.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "habit": {
      "id": "uuid",
      "name": "Morning Exercise"
    },
    "stats": {
      "totalCompletions": 42,
      "currentStreak": 6,
      "longestStreak": 12,
      "averagePerWeek": 5.2,
      "completionRate": {
        "allTime": 85.5,
        "thisWeek": 100,
        "thisMonth": 90,
        "last30Days": 87
      },
      "bestDay": "Monday",
      "worstDay": "Sunday",
      "byDayOfWeek": [
        { "day": "Mon", "rate": 95 },
        { "day": "Tue", "rate": 88 },
        { "day": "Wed", "rate": 82 },
        { "day": "Thu", "rate": 85 },
        { "day": "Fri", "rate": 78 },
        { "day": "Sat", "rate": 70 },
        { "day": "Sun", "rate": 65 }
      ]
    },
    "milestones": [
      { "type": "STREAK", "value": 7, "achievedAt": "2026-01-15" },
      { "type": "STREAK", "value": 14, "achievedAt": "2026-01-22" },
      { "type": "COMPLETIONS", "value": 50, "achievedAt": "2026-01-20" }
    ]
  }
}
```

---

### GET `/analytics/streaks`

Get all streak information.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "streaks": [
      {
        "habitId": "uuid",
        "habitName": "Morning Exercise",
        "color": "#10B981",
        "icon": "🏃",
        "currentStreak": 6,
        "longestStreak": 12,
        "lastCompletedAt": "2026-01-29T08:00:00Z",
        "isActiveToday": true
      }
    ],
    "summary": {
      "totalActiveStreaks": 3,
      "longestCurrentStreak": 12,
      "habitsAtRisk": [
        {
          "habitId": "uuid-2",
          "habitName": "Read Book",
          "currentStreak": 5,
          "lastCompleted": "2026-01-28"
        }
      ]
    }
  }
}
```

---

## Milestones

### GET `/milestones`

Get all achieved milestones.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `habitId` | string | - | Filter by habit |
| `limit` | number | 50 | Max results |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "milestones": [
      {
        "id": "uuid",
        "habitId": "habit-uuid",
        "habitName": "Morning Exercise",
        "type": "STREAK",
        "value": 30,
        "title": "30 Day Streak! 🔥",
        "description": "You've completed this habit 30 days in a row!",
        "achievedAt": "2026-01-29T08:00:00Z"
      },
      {
        "id": "uuid-2",
        "habitId": "habit-uuid",
        "habitName": "Morning Exercise",
        "type": "COMPLETIONS",
        "value": 100,
        "title": "100 Completions! 💯",
        "description": "You've completed this habit 100 times total!",
        "achievedAt": "2026-01-20T08:00:00Z"
      }
    ]
  }
}
```

---

## Categories

### GET `/categories`

Get all categories with habit counts.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "categories": [
      { "name": "Health", "habitCount": 3, "color": "#10B981" },
      { "name": "Productivity", "habitCount": 2, "color": "#3B82F6" },
      { "name": "Learning", "habitCount": 1, "color": "#8B5CF6" }
    ],
    "defaultCategories": [
      "Health",
      "Productivity",
      "Learning",
      "Fitness",
      "Mindfulness",
      "Finance",
      "Social",
      "Other"
    ]
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Human readable error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

**Common Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Not allowed to access resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Milestone Types & Values

**Streak Milestones:**

- 7 days (1 week)
- 14 days (2 weeks)
- 30 days (1 month)
- 60 days (2 months)
- 90 days (3 months)
- 180 days (6 months)
- 365 days (1 year)

**Completion Milestones:**

- 10 completions
- 25 completions
- 50 completions
- 100 completions
- 250 completions
- 500 completions
- 1000 completions

---

## Habit Templates

### GET `/templates`

Get all available habit templates.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | - | Filter by category |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "name": "Morning Exercise",
        "description": "30 minutes of exercise every morning",
        "category": "Health",
        "icon": "🏃",
        "color": "#10B981",
        "habitType": "BOOLEAN",
        "targetValue": null,
        "unit": null,
        "frequency": "DAILY",
        "isSystem": true
      },
      {
        "id": "uuid-2",
        "name": "Drink Water",
        "description": "Stay hydrated throughout the day",
        "category": "Health",
        "icon": "💧",
        "color": "#3B82F6",
        "habitType": "NUMERIC",
        "targetValue": 8,
        "unit": "glasses",
        "frequency": "DAILY",
        "isSystem": true
      }
    ]
  }
}
```

---

### POST `/templates/:id/use`

Create a habit from a template.

**Request:** (optional overrides)

```json
{
  "name": "Custom Name",
  "color": "#FF5733"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "habit": {
      "id": "new-habit-uuid",
      "templateId": "template-uuid",
      "...": "habit object"
    }
  }
}
```

---

## Habit Ordering

### PATCH `/habits/reorder`

Update the sort order of habits.

**Request:**

```json
{
  "habitIds": ["uuid-1", "uuid-3", "uuid-2", "uuid-4"]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Habits reordered successfully"
}
```

---

## Habit Archiving

### POST `/habits/:id/archive`

Archive a habit (keeps history, hides from daily view).

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "habit": {
      "id": "uuid",
      "isArchived": true
    }
  }
}
```

---

### POST `/habits/:id/unarchive`

Restore an archived habit.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "habit": {
      "id": "uuid",
      "isArchived": false
    }
  }
}
```

---

### GET `/habits/archived`

Get all archived habits.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "habits": [
      {
        "id": "uuid",
        "name": "Old Habit",
        "isArchived": true,
        "archivedAt": "2026-01-15T00:00:00Z",
        "totalCompletions": 45,
        "longestStreak": 14
      }
    ]
  }
}
```

---

## Books (Reading Tracker)

### GET `/books`

Get all books for the user.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | - | Filter: WANT_TO_READ, READING, FINISHED, ABANDONED |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "books": [
      {
        "id": "uuid",
        "title": "Atomic Habits",
        "author": "James Clear",
        "coverUrl": "https://...",
        "totalPages": 320,
        "currentPage": 150,
        "progress": 47,
        "status": "READING",
        "rating": null,
        "startedAt": "2026-01-15T00:00:00Z",
        "finishedAt": null
      },
      {
        "id": "uuid-2",
        "title": "Deep Work",
        "author": "Cal Newport",
        "totalPages": 296,
        "currentPage": 296,
        "progress": 100,
        "status": "FINISHED",
        "rating": 5,
        "startedAt": "2025-12-01T00:00:00Z",
        "finishedAt": "2025-12-20T00:00:00Z"
      }
    ],
    "stats": {
      "totalBooks": 15,
      "reading": 2,
      "finished": 10,
      "wantToRead": 3,
      "booksThisYear": 8,
      "pagesThisYear": 2450
    }
  }
}
```

---

### POST `/books`

Add a new book.

**Request:**

```json
{
  "title": "Atomic Habits",
  "author": "James Clear",
  "coverUrl": "https://...",
  "totalPages": 320,
  "status": "WANT_TO_READ"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "book": {
      "id": "uuid",
      "title": "Atomic Habits",
      "author": "James Clear",
      "status": "WANT_TO_READ",
      "...": "..."
    }
  }
}
```

---

### PATCH `/books/:id`

Update a book (progress, status, rating, notes).

**Request:**

```json
{
  "currentPage": 200,
  "status": "READING",
  "notes": "Great insights on habit formation"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "book": { "...": "updated book" }
  }
}
```

---

### POST `/books/:id/log`

Log reading progress for today.

**Request:**

```json
{
  "pagesRead": 25,
  "notes": "Finished chapter 5"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "log": {
      "id": "uuid",
      "date": "2026-01-29",
      "pagesRead": 25,
      "notes": "Finished chapter 5"
    },
    "book": {
      "currentPage": 175,
      "progress": 55
    }
  }
}
```

---

### DELETE `/books/:id`

Delete a book and its reading logs.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

---

### GET `/books/stats`

Get reading statistics.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "allTime": {
      "booksFinished": 45,
      "pagesRead": 14500,
      "averageRating": 4.2
    },
    "thisYear": {
      "booksFinished": 8,
      "pagesRead": 2450,
      "goal": 12,
      "onTrack": true
    },
    "thisMonth": {
      "booksFinished": 1,
      "pagesRead": 450
    },
    "byMonth": [
      { "month": "2026-01", "books": 1, "pages": 450 },
      { "month": "2025-12", "books": 2, "pages": 620 }
    ],
    "topAuthors": [
      { "author": "James Clear", "books": 2 },
      { "author": "Cal Newport", "books": 3 }
    ]
  }
}
```

---

## Challenges

### GET `/challenges`

Get all challenges.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | - | Filter: ACTIVE, COMPLETED, FAILED, CANCELLED |

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "id": "uuid",
        "name": "30-Day Exercise Challenge",
        "description": "Exercise every day for 30 days",
        "duration": 30,
        "startDate": "2026-01-01",
        "endDate": "2026-01-30",
        "status": "ACTIVE",
        "daysCompleted": 25,
        "daysRemaining": 5,
        "currentStreak": 10,
        "completionRate": 83.3,
        "habits": [
          {
            "habitId": "uuid",
            "name": "Morning Exercise",
            "completedDays": 25
          }
        ]
      }
    ]
  }
}
```

---

### POST `/challenges`

Create a new challenge.

**Request:**

```json
{
  "name": "30-Day Exercise Challenge",
  "description": "Exercise every day for 30 days",
  "duration": 30,
  "startDate": "2026-02-01",
  "habitIds": ["habit-uuid-1", "habit-uuid-2"]
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "challenge": {
      "id": "uuid",
      "name": "30-Day Exercise Challenge",
      "duration": 30,
      "startDate": "2026-02-01",
      "endDate": "2026-03-02",
      "status": "ACTIVE",
      "habits": ["..."]
    }
  }
}
```

---

### GET `/challenges/:id`

Get challenge details with daily progress.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "challenge": {
      "id": "uuid",
      "name": "30-Day Exercise Challenge",
      "status": "ACTIVE",
      "duration": 30,
      "startDate": "2026-01-01",
      "endDate": "2026-01-30",
      "habits": [
        {
          "habitId": "uuid",
          "name": "Morning Exercise",
          "icon": "🏃",
          "color": "#10B981"
        }
      ],
      "progress": [
        {
          "date": "2026-01-01",
          "day": 1,
          "habitsCompleted": 2,
          "habitsTotal": 2,
          "isComplete": true
        },
        {
          "date": "2026-01-02",
          "day": 2,
          "habitsCompleted": 1,
          "habitsTotal": 2,
          "isComplete": false
        }
      ],
      "stats": {
        "daysCompleted": 25,
        "daysTotal": 30,
        "currentStreak": 10,
        "longestStreak": 15,
        "completionRate": 83.3
      }
    }
  }
}
```

---

### DELETE `/challenges/:id`

Cancel/delete a challenge.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Challenge cancelled"
}
```

---

## API Access (Future)

### POST `/user/api-key`

Generate or regenerate API key for external integrations.

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "apiKey": "ht_live_xxxxxxxxxxxxxxxxxxxx",
    "createdAt": "2026-01-29T00:00:00Z",
    "note": "Store this key securely. It won't be shown again."
  }
}
```

---

### DELETE `/user/api-key`

Revoke API key.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "API key revoked"
}
```

---

### External API Usage (Future)

When API key is implemented, external apps can use:

```
Authorization: Bearer ht_live_xxxxxxxxxxxxxxxxxxxx
```

**Endpoints available via API key:**

- `POST /api/external/check-in` - Quick habit check-in
- `GET /api/external/today` - Get today's habits status

**Example WhatsApp Integration (Future):**

```
You: "done exercise"
Bot: ✅ Morning Exercise marked complete! 🔥 Streak: 7 days
```
