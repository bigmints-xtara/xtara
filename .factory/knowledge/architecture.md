# Architecture Knowledge Base

This document provides deep-dive context for anyone working on the xtara-web project.

## 1. Application Overview

**Xtara** is an AI-powered career discovery platform for Indian students (Grades 10–12). Students take an assessment, receive an AI-generated career path, and explore learning resources, internships, and communities related to their recommended career.

### Core User Journeys
1. **Assessment:** Anonymous user → Location step → Questionnaire → AI recommendations → Career Path.
2. **Career Exploration:** Browse careers → View details → Explore Learn/Connect/Grow tabs → Watch slideshow.
3. **Profile Management:** Sign up → Edit academic profile → View achievements → Track progress.
4. **Admin:** Manage stories, good reads, challenges, sparks, dream careers, analytics.

### Key Pages
| Route | Purpose | Auth Required? |
|-------|---------|----------------|
| `/` | Marketing home page | No |
| `/assessment` | Career assessment questionnaire | No (anonymous creates user) |
| `/assessment/results/{id}` | Show AI career path result | Yes |
| `/careers/{id}` | Career detail with Learn/Connect/Grow tabs | No |
| `/careers/{id}/learn/*` | Courses, scholarships, tools, training | No |
| `/careers/{id}/connect/*` | Communities, people | No |
| `/careers/{id}/grow/*` | Pathway, internships, exams, salary | No |
| `/dashboard` | User dashboard | Yes |
| `/profile` | User profile management | Yes |
| `/admin/*` | Admin CMS | Yes (admin role) |
| `/login` | Email login | No |
| `/signup` | New user registration | No |

---

## 2. Data Model

### Firestore Collections

#### `users`
```
users/{uid}
  - uid: string
  - email: string (nullable)
  - displayName: string (nullable)
  - isAnonymous: boolean
  - roles: { isAdmin, isEditor, isViewer, isStudent, isParent, isEducator }
  - pendingCareerPathId: string (nullable)
  - pursuingCareer: string (nullable)
  - assessmentCompleted: boolean
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

#### `assessments`
```
assessments/{userId}
  - userId: string
  - results: { assessment data }
  - timestamp: Timestamp
  - isAnonymous: boolean
  - isRetake: boolean
```

#### `career_paths`
```
career_paths/{docId}
  - userId: string
  - assessmentId: string
  - title: string
  - description: string
  - matchScore: number
  - archetypes: [string]
  - primaryCareer: { courses, careerCluster }
  - careerPathway: [step]
  - ragOutput: { learn, connect, grow }
  - createdAt: Timestamp
```

#### `stories`
```
stories/{docId}
  - title: string
  - description: string
  - image: string
  - career_clusters: [string]
  - slides: [{ title, description, image, hyperlink }]
  - published: boolean
  - publishedAt: Timestamp
  - publishedUntil: Timestamp (nullable)
```

#### `configurations`
```
configurations/{key}
  - value: string (JSON string)

# Key: 'questionnaire_json' → Full assessment questionnaire
```

---

## 3. Component Architecture

### Layout Hierarchy
```
RootLayout (async, server)
  └── AuthProvider (client)
      └── LanguageProvider (client)
          └── AnalyticsProvider (client, Suspense)
              └── Page Content
                  └── MarketingLayout / Navbar + Footer
```

### Component Categories

#### Marketing Components
- `Hero`, `FAQ`, `Benefits`, `CTA`, `Pricing`, `Testimonials`, `Logos`
- Used on homepage and marketing pages. Static data from `data/*` files.

#### Career Components
- `CareerTabs` — Tabbed navigation (Learn/Connect/Grow).
- `LearnSection` — Courses, scholarships, tools, training.
- `ConnectSection` — Communities and people.
- `GrowSection` — Pathway, internships, exams, salary.
- `CareerHubLayout` — Wrapper layout for career sub-pages.

#### Assessment Components
- `AssessmentEngine` — Full questionnaire renderer.
- `LocationStep` — State/District/City selection.

#### Admin Components
- `AdminSidebar` — Navigation sidebar.
- `AdminMasterDetail` — Master-list / detail-view pattern.
- `StoryEditor` — Rich-text editor for stories.

---

## 4. Firebase Integration

### Client SDK
```typescript
import { auth, db, storage, functions } from "@/lib/firebase/firebase";
```

### Service Layers
| Service File | Purpose |
|--------------|---------|
| `firebase.ts` | SDK initialization (App, Auth, Firestore, Storage, Functions) |
| `auth-helpers.ts` | Create/get users, anonymous conversion |
| `assessment.ts` | Save assessments, generate recommendations, poll career paths |
| `career-helpers.ts` | Get career paths, tools by cluster |
| `firestore-service.ts` | Stories, good reads, challenges, games, sparks |
| `profile-service.ts` | Update user profile, pursue career |
| `achievements-service.ts` | User achievements (badges, points) |
| `college-service.ts` | College data (list, detail) |
| `location.ts` | Location data (states, districts, cities) |

---

## 5. i18n Architecture

### Locale Files
```
src/content/en.json  # English (primary)
src/content/hi.json  # Hindi
src/content/ta.json  # Tamil
src/content/ml.json  # Malayalam
```

### Flow
1. `getLocaleFromCookie()` reads browser cookie (server-side, async).
2. `LanguageProvider` holds locale in React Context (client-side).
3. `getMessages(locale)` returns translation strings for the locale.
4. `translate(key)` helper accesses the current locale's messages.

---

## 6. Deployment Pipeline

### Current Flow
```
Local Machine → docker build → docker push → gcloud run deploy
```

### Docker Stages
1. **deps:** `npm install` (installs all packages).
2. **builder:** `npm run build` (Next.js standalone output).
3. **runner:** Copy `.next/standalone` + `.next/static` + `public`.

### Cloud Run Config
- Region: `us-central1`
- Memory: `512Mi`
- CPU: `1 vCPU`
- Scale: `0–10` instances
- Port: `8080`
- Service Account: `firebase-adminsdk-fbsvc@bigmints-xtara.iam.gserviceaccount.com`

---

## 7. Shared Context with Flutter

The web app mirrors the Flutter mobile app:

| Concept | Flutter | Web |
|---------|---------|-----|
| Auth | `firebase_auth` | `firebase/auth` |
| DB | `CloudFirestoreService` | `FirestoreService` |
| Stories | `Story` model | `Story` interface (firestore-service.ts) |
| Career Path | `CareerPath` model | `CareerPath` interface (career-helpers.ts) |
| Assessment | `AssessmentService` | `assessment.ts` |
| Data Format | JSON string in `configurations` | Same |

**Key Rule:** Firestore schema is shared — changes to `career_paths` or `users` affect both apps.
