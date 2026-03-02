# Nutikas Restorani Reserveerimissüsteem / Smart Restaurant Reservation System


## 1 Projekti kokkuvõte / Project Summary



See on täisstack restoranide broneerimissüsteem.

This is a full-stack restaurant reservation system.

**Backend**: Spring Boot REST API, JPA/Hibernate, H2 in-memory andmebaas

**Backend**: Spring Boot REST API, JPA/Hibernate, H2 in-memory database


**Frontend**: Next.js 14 + React + TypeScript UI + Tailwind CSS + Framer Motion animatsioonid

**Frontend**: Next.js 14 + React + TypeScript UI + Tailwind CSS + Framer Motion animations

---

**Peamised funktsioonid / Main Features:**


* Laudade saadavuse otsing kuupäeva/kellaaja/inimeste arvu/tsooni/eelistuste järgi
* Table availability search by date/time/guest count/zone/preferences
  
* Intelligente soovitus- ja skoorimissüsteem laudadele
* Intelligent table recommendation & scoring system
  
* Dünaamiline laudade liitmine suurematele seltskondadele
* Dynamic table combination for larger groups
  
* Broneeringu loomise voog
* Reservation creation flow
  
* Admini autentimine ja parooli muutmine
* Admin authentication & password change
  
* Admini saaliplaani redigeerimine
* Admin floor-plan layout editing
  
* Broneeringute haldusarmatuurlaud
* Reservation management dashboard
  
* Automaatne broneeringute aegumine
* Automatic reservation expiration logic
  
* Välise API integratsioon (TheMealDB päevaprae soovitus)
* External API integration (TheMealDB meal suggestion)

**Tarkvara kvaliteet ja infrastruktuur / Infrastructure & Quality:**

* Backend API testimine (unit- ja integratsioonitestid)
* Backend API testing (unit & integration tests)
* Backend Docker-konteiner (ainult backend teenus)
* Backend Docker containerization (backend only)
* Osaline keskkonnapõhine konfiguratsioon (.env)
* Partial environment-based configuration (.env support)
* Täisstack Docker orchestration puudub (frontend + backend + DB)
* No full-stack Docker orchestration
* Ei ole tootmisvalmis konteineriseeritud lahendus (hindamise kontekst)
* Not production-ready containerized deployment (evaluation scope)

---

## 2 Tehnoloogiad / Tech Stack

**Backend**

* Java 25
* Spring Boot 4.0.3
* Spring Data JPA
* H2 in-memory DB

**Frontend**

* Next.js 14.0.4
* React 18
* TypeScript
* Framer Motion + Tailwind CSS

**Konteiner / Container**

* Multi-stage Docker build Dockerfile’is

---

## 3 Funktsioonide rakendamine / Feature Implementation

### 3.1 Broneeringu otsing ja filtreerimine / Reservation Search & Filtering

Kasutajad saavad otsida vabu laudu:
Users can search for available tables by:

* Kuupäeva järgi / By date
* Kellaaja järgi / By time
* Inimeste arvu järgi / By guest count
* Tsooni valiku järgi / By zone selection
* Eelistuste järgi / By seating preferences

#### Rakendatud tsoonid (4) / Zones Implemented (4)

* Peasaal / Main Hall
* Terrass (sisaldab laste mängunurka) / Patio (includes kid zone)
* Veranda / Terrace
* Privaatruum / Private Room

#### Rakendatud eelistused (3) / Preferences Implemented (3)

* Akna all / Near Window
* Vaikne nurk / Quiet Corner
* Laste mängunurga lähedal / Near Kids Zone

#### Eelistuste piirangud / Preference Constraints

* "Vaikne nurk" ja "Laste mängunurga lähedal" ei saa olla valitud samaaegselt / "Quiet Corner" and "Near Kids Zone" cannot be selected together
* Ühe valimine keelab teise / Selecting one disables the other
* "Akna all" saab kombineerida mõlema eelistusega / "Near Window" can combine with both

See vältab vastuolulisi paigutusi ja parandab soovituste kvaliteeti / This avoids contradictory seating logic and improves recommendation quality.

![Otsingutulemus / Search Result](./screenshots/filter-search.png)

---

### 3.2 Soovitussüsteem ja skoorimine / Recommendation & Scoring System

Kaalutud skoorimissüsteem hinnangute jaoks:

* Inimeste arvu sobivus / Guest count compatibility
* Tsooni vastavus / Zone match
* Eelistuste sobivus / Preference match
* Paigutuse efektiivsus / Seating efficiency
* Saadavus / Availability

#### Efektiivsuse reegel / Efficiency Rule

Väikesed seltskonnad ei istutata suurtele laudadele, kui väiksemaid laudu on vaba.
Small groups are not seated at large tables when smaller tables are available.

Näide / Example:

* 1-3 inimest ei saa 8-10 kohalisele lauale, kui 2-kohaline laud on vaba.
  1-3 guests will not be assigned an 8-10-seat table if a 2-seat table exists.

![Guest reservation restriction](./screenshots/guest-limit-error.png)

#### Visuaalne soovitussüsteem / Visual Recommendation System

* Saadaval / Available
* Hõivatud / Occupied
* Soovitatud / Recommended
* Valitud / Selected

Soovitatud lauad on eredamad ja esiletõstetud / Recommended tables are brighter, show a star icon, and visually prioritized

![Recommendations and status](./screenshots/occupied.png)

---

### 3.3 Dünaamiline laudade liitmine / Dynamic Table Combination

* Kõrvuti lauad samas tsoonis saab liita / Adjacent tables in the same zone can be combined
* Näide: 4 inimest terrassil → kaks 2-kohalist lauda / Example: 4 guests on terrace → two 2-seat tables
* Tsooni vahetus tühistab valiku / Changing zone clears previous selection

![Combined Tables](./screenshots/combined-tables.png.png)

---

### 3.4 Automaatne hõivatussimulatsioon / Automatic Occupancy Simulation

* Kui valitud ajal broneeringuid pole, 1–2 lauda märgitakse juhuslikult hõivatuks / If no reservations exist, 1-2 tables may be randomly marked occupied
* Broneeringud aeguvad automaatselt 2 tunni pärast / Reservations automatically expire after 2 hours
* Aegunud broneering vabastab laua / Expired reservations free the table

---

### 3.5 Visuaalne saaliplaan / Visual Floor Plan

* Hiirega laua kohal olles kuvatakse tsoon, kohti, saadavust, aknapõhiseid omadusi, eelistuste sobivust / Hovering over a table shows zone, capacity, availability, window property, preference matches
* Aknajooned on kujutatud õhukeste siniste joontega / Windows are thin blue lines
* Reaalajas saadavuse loendur / Real-time availability counter

![Search Result](./screenshots/recommendation-status.png)

---

### 3.6 Admini liides / Admin Interface

* Parooli-põhine autentimine / Password-based authentication
* Parooli muutmine / Password change
* Laudade lohistamine / Drag-and-drop table editing
* Broneeringute haldus: tänased, viimase 7 päeva, tulevased / Reservation management: today, last 7 days, future
* Broneeringute kustutamine / Reservation deletion

![Admin Login](./screenshots/admin-login.png.png)
![Admin Dashboard](./screenshots/admin-dashboard.png.png)
![Admin Reservation Side](./screenshots/admin-reservations.png.png)

---

### 3.7 Välise API integratsioon / External API Integration

* TheMealDB API: päevaprae soovitus broneeringu kinnitamisel / Meal suggestion via TheMealDB on reservation confirmation
* Erinevad soovitused võivad ilmuda / Different meals may appear per request

![Meal Suggestion](./screenshots/meal-suggestion.png)

---

## 4 Käivitamine / How to Launch

### Eeltingimused / Prerequisites

* Java 25
* Maven (`mvn -v`)
* Node.js + npm
* Vabad pordid: 8081 (backend), 3001 (frontend) / Free ports: 8081, 3001

### Backend käivitamine / Run Backend

```bash
cd backend
mvn -DskipTests clean package
java -jar target/restaurant-booking-0.0.1-SNAPSHOT.jar
```

**Kontrolli / Verify:**

* [http://localhost:8081/tables](http://localhost:8081/tables)
* [http://localhost:8081/h2-console](http://localhost:8081/h2-console)

### Frontendi käivitamine / Run Frontend

```bash
cd frontend
npm install
$env:PORT=3001; npm run dev
```

**Kontrolli / Verify:**

* [http://localhost:3001](http://localhost:3001)
* [http://localhost:3001/admin](http://localhost:3001/admin)

### Admini sisselogimine / Admin Login

* `ADMIN_PASSWORD` keskkonnamuutuja või fallback `RestoAdmin!2026` / `ADMIN_PASSWORD` env variable or fallback

### Valikuline Docker / Optional Docker Backend

```bash
docker build -t restaurant-backend .
docker run --rm -p 8081:8081 restaurant-backend
```

---

## 5 Probleemid / Difficulties

### Next.js käivituse viga / Runtime Error

```
Cannot find module './73.js'
```

* Stale `.next` chunk cache
* Lahendus / Fix: kill all Node processes, delete `.next`, `.turbo`, `.cache`, restart

### Spring Boot ebastabiilsus / Spring Boot Run Instability

* `mvn spring-boot:run` ei olnud stabiilne / not reliable
* Lahendus / Fix: build JAR & run with `java -jar`

**Märked keerukustest / Notes on difficulties:**

* Algne laudade paigutus oli väga segane – tähistatud screenshotidel / Initial table layout was chaotic – see screenshots
* Lahendus ja skeem parandatud käsitsi / Layout fixed manually

---

## 6 AI tööriistade kasutus / AI Tools Usage

* GitHub Copilot / GPT-workflow kasutatud refaktorimiseks, kommentaaride lisamiseks, dokumentatsiooni koostamiseks / Used for refactoring, bilingual comments, documentation drafting
* Väliseid näiteid ei kopeeritud otse, kõik on märgitud / No long external snippets copied, all marked
* Lõplik loogika ja testimine tehtud käsitsi / Final logic and testing done manually

---

## 7 Lahendamata / Risk Areas

* Next.js chunk cache probleemid võivad uuesti ilmneda / may reappear
* Spring Boot `run` vead / may reoccur – kinnita JDK/Maven või JAR fallback

---

## 8 Eeldused / Assumptions

* Backend ja frontend töötavad lokaalselt / Evaluator runs backend and frontend locally
* Pordid: 8081 (backend), 3001 (frontend)
* H2 DB sobib hindamiseks / H2 DB is acceptable
* Admin autentimine konfiguratsiooniparooliga / Admin auth via config password is sufficient

---

## 9 Kulutatud aeg / Time Spent

| Ülesanne / Task                        | Aeg / Time |
| -------------------------------------- | ---------- |
| Frontend/admin layout & parity         | ~16–18h    |
| Backend testid + API kohandused        | ~10–12h    |
| Docker ja käivitamise kontroll         | ~2h        |
| Runtime silumine (Next.js chunk/cache) | ~4h        |
| Kahekeelne dokumentatsioon             | ~1–2h      |
| Projekti dokumentatsioon               | ~4–5h      |
| **Kokku / Total**                      | 35–45h     |

---

## 10 Arendusprotsess / Development Process

* Iteratiivne funktsioonipõhine arendus / Iterative feature-based development
* Milestone commit’id peamiste arhitektuurimuudatuste jaoks (Docker, testikihi loomine, UI stabiliseerimine) / Milestone commits for major architectural changes
* Refaktorimiscommit’id eraldi funktsioonidest / Refactoring commits separated from features
* Git on peamine versioonikontroll / Git used as primary version control


