# Restaurant Reservation System

## 1 Project Summary

This is a full-stack restaurant reservation system.

**Backend**: Spring Boot REST API, JPA/Hibernate, H2 in-memory database, Dockerized database
**Frontend**: Next.js 14 + React + TypeScript UI + Tailwind CSS + Framer Motion animations

**Main Features Implemented:**
- Table availability search by date/time/guest count/zone/preferences
- Intelligent table recommendation scoring
- Dynamic table combination for larger groups
- Reservation creation flow
- Admin authentication and password change
- Admin floor-plan layout editing
- Reservation management dashboard
- Automatic reservation expiration logic
- External API integration (TheMealDB meal suggestion)

---

## 2 Tech Stack

**Backend**
- Java 25
- Spring Boot 4.0.3
- Spring Data JPA
- H2 runtime DB (in-memory)

**Frontend**
- Next.js 14.0.4
- React 18
- TypeScript
- Framer Motion + Tailwind CSS

**Container**
- Multi-stage Docker build in Dockerfile

# 3. Feature Implementation

## 3.1 Reservation Search & Filtering

Users can search for available tables by:

* Date
* Time
* Guest count
* Zone selection
* Seating preferences

### Zones Implemented (4)

* Main Hall
* Patio (includes kid zone area)
* Terrace
* Private Room

### Preferences Implemented (3)

* Near window
* Quiet corner
* Near kid zone

### Preference Constraints

To reflect realistic restaurant logic:

* "Quiet Corner" and "Near Kids Zone" cannot be selected together.
* Selecting one disables the other.
* "Near Window" can be combined with both.

This avoids contradictory seating logic and improves recommendation quality.

![Search Result](./screenshots/filter-search.png)

---

## 3.2 Recommendation & Scoring System

Instead of simple filtering, a weighted scoring system is used.

Each table is evaluated based on:

* Guest count compatibility
* Zone match
* Preference match
* Seating efficiency
* Availability

### Efficiency Rule (Assignment Requirement)

Small groups are not seated at large tables when smaller tables are available.

Example:

* 1-3 guests will not be assigned an 8-10-seat table if a 2-seat table exists.

  ![Guest reservation restriction](./screenshots/guest-limit-error.png)

### Visual Recommendation System

Tables are displayed with different visual states:

* Available
* Occupied
* Recommended 
* Selected

Recommended tables:

* Have higher brightness
* Show star icon
* Appear visually prioritized

Not Suitable and Occupied tables remain visible but dimmed.
(near window checked in filter)
![Recommendations and status](./screenshots/occupied.png)

---

## 3.3 Dynamic Table Combination

If no single table matches a larger group:

* Adjacent tables in the same zone can be combined.
* Example: 4 guests on terrace → two 2-seat tables.
* Changing zone clears previous selection.

This implements the dynamic merging requirement from the assignment.

### Successful Combined Reservation Example

Reservation of two 2-seat tables on the terrace for 4 guests.

![Combined Tables](./screenshots/combined-tables.png.png)

---

## 3.4 Automatic Occupancy Simulation

To simulate real restaurant behavior:

* If no reservations exist for selected time,
* 1–2 tables may be randomly marked occupied.

Additionally:

* Reservations automatically expire after 2 hours.
* Expired reservations free the table.

---

## 3.5 Visual Floor Plan

The restaurant layout is fully interactive.

Hovering over a table displays:

* Zone
* Capacity
* Availability
* Window property
* Preference matches

Additional UI features:

* Windows are depicted as thin blue lines on the visual area
* Real-time availability counter:

  > "Showing 8 of 10 tables available"
  
### User Search & Visual Interface

Below is the search result view showing:

- Available tables
- Occupied tables
- Recommended tables
- Zone separation
- Table status panel

![Search Result](./screenshots/recommendation-status.png)

---

## 3.6 Admin Interface

Simplified admin system includes:

* Password-based authentication
* Password change
* Drag-and-drop table layout editing
* Reservation management:

  * Today
  * Last 7 days
  * Future bookings
* Reservation deletion

Note: Layout resets on full reload due to in-memory storage (evaluation scope).

![Admin Login](./screenshots/admin-login.png.png)

![Admin Dashboard](./screenshots/admin-dashboard.png.png)

![Admin Reservation Side](./screenshots/admin-reservations.png.png)

### Drag-and-Drop Table Editing

After repositioning tables:

![Layout After Admin Side](./screenshots/layout-drag2.png)

![Layout After User Side](./screenshots/layout-drag1.png)

---

## 3.7 External API Integration

The system integrates with TheMealDB public API.

On reservation confirmation:

* A daily meal suggestion is displayed.
* Different meals may appear per request.

This feature extends beyond the base assignment requirements.

### Daily Meal Suggestion (TheMealDB Integration)

Example of meal suggestion displayed after reservation:

![Meal Suggestion](./screenshots/meal-suggestion.png)

## 4 How to Launch (Evaluator-Friendly)

### Prerequisites
- Java 25 installed
- Maven installed (`mvn -v`)
- Node.js + npm installed
- Free ports: 8081 (backend), 3001 (frontend)

### A. Run Backend (Stable Path)
```bash
cd backend
mvn -DskipTests clean package
java -jar target/restaurant-booking-0.0.1-SNAPSHOT.jar
````

**Verify**

* [http://localhost:8081/tables](http://localhost:8081/tables)
* [http://localhost:8081/h2-console](http://localhost:8081/h2-console)

### B. Run Frontend

```bash
cd frontend
npm install
# PowerShell
$env:PORT=3001; npm run dev
```

**Verify**

* [http://localhost:3001](http://localhost:3001)
* [http://localhost:3001/admin](http://localhost:3001/admin)

### C. Admin Login

* Default password from backend config:

  * `ADMIN_PASSWORD` environment variable (if set)
  * Otherwise fallback: `RestoAdmin!2026`

### D. Optional Docker Backend

```bash
docker build -t restaurant-backend .
docker run --rm -p 8081:8081 restaurant-backend
```

**Verify:** [http://localhost:8081/tables](http://localhost:8081/tables)

---

## 5 Quick Verification Checklist

* [ ] Backend responds on `/tables` and `/api/search`
* [ ] Frontend loads reservation page on 3001
* [ ] Admin page loads and allows auth
* [ ] Layout save works and persists state flag
* [ ] Reservation create request succeeds from frontend
* [ ] `mvn -DskipTests compile` succeeds
* [ ] `npm run build` succeeds

---

## 6 Difficulties / Notes

### Next.js Dev Runtime Error

Error:

```
Cannot find module './73.js'
```

Cause:

* Stale `.next` chunk cache during hot reload.

Fix:

* Kill all Node processes
* Delete `.next`, `.turbo`, `.cache`
* Restart dev server

---

### Spring Boot Run Instability

`mvn spring-boot:run` was unreliable in this environment.

Stable workaround:

* Build JAR
* Run with `java -jar`

---

## 7 Help / References

* AI tools (GitHub Copilot / GPT-based workflow) were used for:

  * Next.js chunk cache issues
  * Refactors and bilingual code comments
  * Debugging runtime issues
  * Refactoring suggestions
  * Boilerplate generation
  * Documentation drafting
  * No long external sample-project snippets copied verbatim; external snippets marked in code comments

However:

  * System architecture was designed independently
  * Scoring logic and business rules were designed and refined manually
  * All AI-generated code was reviewed and modified
  * Final logic validation and testing were performed manually

  AI was used as a development assistant, not as a replacement for engineering decisions.
---

## 8 Unresolved / Risk Areas

* **Next.js chunk cache inconsistency** may reappear
  Suggested fix: one-command cleanup script, enforce single dev server

* **Spring Boot `run` failures**
  Suggested fix: pin verified JDK/Maven versions, provide fallback jar-run command

---

## 9 Assumptions

* Evaluator runs backend and frontend locally
* Ports: 8081 (backend), 3001 (frontend)
* H2 in-memory DB is acceptable
* Admin auth via configured password is sufficient

---

## 10 Time Spent (Estimated)

| Task                                    |  Time   |
| --------------------------------------- | ------  |
| Frontend/admin layout & parity          | ~16–18h |
| Backend test + API adjustments          | ~10–12h |
| Dockerization & run validation          | ~2h     |
| Runtime debugging (Next.js chunk/cache) | ~4h     |
| Bilingual code documentation            | ~1–2h   |
| README Documentation:                   | ~4–5h   |
| **Total:** 35–45 hours                  |         |

---

## 10 Development Process / Commit Practice

* Frequent commits recommended to show progress
* Milestone commits exist for Docker support, bilingual comments, stabilization
* Future: smaller scoped commits per feature/fix for traceability



## 11 Suggested Evaluation Log Template

**Environment:**
OS: …
Java/Maven/Node versions: …

**Steps Executed:**
Backend command(s): …
Frontend command(s): …
Docker command(s): …

**Results:**

* Which endpoints/pages opened successfully: …
* What failed & exact error: …
* Notes: …
* Time spent: …
* Workarounds used: …
* Remaining issues / recommendations: …

```
