## API Specification

### Health Check

```http
GET /health
```

#### Response (200 OK):

```json
{
  "status": "ok",
  "timestamp": "2026-10-04T08:30:00.000Z",
  "uptime": 124.5,
  "environment": "development",
  "concurrency": 5,
  "model": "gemini-2.5-flash"
}
```

---

### Analyze Repository

```http
POST /api/analyze
Content-Type: application/json
```

#### Example Request:

```json
{
  "repository": "https://github.com/expressjs/express"
}
```

#### Example Response (200 OK):

```json
{
  "repository": {
    "owner": "expressjs",
    "name": "express"
  },
  "summary": {
    "totalFiles": 183,
    "analyzedFiles": 142,
    "skippedFiles": 41,
    "problems": 4,
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 1
  },
  "problems": [
    {
      "file": "lib/router/index.js",
      "line": 142,
      "severity": "high",
      "category": "security",
      "title": "Unvalidated redirect target",
      "description": "User supplied input from request query is forwarded directly without sanitization.",
      "suggestedFix": "Validate target URL against an allowlist of permitted domain hosts."
    },
    {
      "file": "lib/response.js",
      "line": 88,
      "severity": "medium",
      "category": "error-handling",
      "title": "Unhandled error callback",
      "description": "Callback error parameter is not checked before invoking handler.",
      "suggestedFix": "Add if (err) return next(err); at the start of the callback."
    }
  ],
  "skippedFiles": [
    {
      "file": "dist/bundle.js",
      "reason": "IGNORED_DIRECTORY"
    },
    {
      "file": "package-lock.json",
      "reason": "IGNORED_LOCKFILE"
    },
    {
      "file": "assets/logo.png",
      "reason": "IGNORED_MEDIA_OR_BINARY"
    },
    {
      "file": ".env",
      "reason": "SENSITIVE_FILE"
    }
  ],
  "failedFiles": []
}
```

### Mailer

```http
POST /mail
Content-Type: application/json
```

#### Example Request:

```json
{
  "name": "name of user",
  "subject": "subject user want to discuss",
  "body": "discussion"
}
```

#### Response (200 OK):

```json
{
  "message": "mail sended successfull"
}
```

#### Response (500 SERVER ERROR):

```json
{
  "message": "error.message"
}
```
