# FitLog — Full-Stack Personal Fitness & Calorie Tracker

FitLog is an end-to-end fitness management system built with **Spring Boot 4.1.1 (Java 21)** and **React 19 / Vite**, designed to give athletes and fitness enthusiasts comprehensive control over workouts, nutrition, weekly goals, and automated analytics.

---

## 🏗 Architecture Overview

```
                      +-----------------------------+
                      | React 19 Frontend (Vite)   |
                      | Lucide Icons, Recharts      |
                      +--------------+--------------+
                                     |
                                Axios (JWT)
                                     v
             +-----------------------------------------------+
             | Spring Boot 4.1.1 (Java 21) REST Backend      |
             +-----------------------+-----------------------+
                                     |
              +----------------------+----------------------+
              |                      |                      |
              v                      v                      v
     [ Security / JWT ]      [ REST Controllers ]   [ Exception Handler ]
     Stateless Bearer        /api/auth              Standard JSON
     BCrypt, JJWT 0.12.6     /api/workouts          RFC 7807 compliant
                             /api/meals
                             /api/goals
                             /api/summaries
                                     |
                                     v
                            [ Service Layer ]
                       Business Rules (BR8, BR9, BR10)
                       Strict Ownership Isolation
                                     |
                                     v
                          [ JPA Repositories ]
                          JPQL Filters, Pagination
                                     |
                                     v
                         [ MySQL 8.4 Database ]
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Java 21**
- **Maven 3.9+** (or included `./mvnw.cmd`)
- **MySQL 8.0+** running on `localhost:3306` with database `fitlog`
- **Node.js 18+** & `npm`

### 2. Backend Setup
1. Configure database credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/fitlog?createDatabaseIfNotExist=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
   app.jwt.expiration-ms=86400000
   server.port=8080
   ```
2. Build and start:
   ```powershell
   ./mvnw.cmd clean compile
   ./mvnw.cmd spring-boot:run
   ```

### 3. Frontend Setup
1. Navigate to frontend:
   ```powershell
   cd fitlog-frontend
   npm install
   npm run dev
   ```
2. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Postman & Automated Verification

The test collection is provided in `postman/FitLog.postman_collection.json`. It includes 38 test assertions covering:
- Authentication (`/register`, `/login`, `/me`, duplicate 409, wrong password 401, garbage token 401)
- Workouts (CRUD, search, pagination, validation, foreign record 404)
- Meals (CRUD, search, pagination, calories > 5000 400, foreign record 404)
- Goals (current, upsert 1-14 target, progress calculation, target 0 -> 400, target 15 -> 400)
- Summaries:
  - Daily calorie balance (`SURPLUS`, `DEFICIT`, `BALANCED`)
  - Weekly trend (8-week timeline with zero-workout weeks preserved)
  - **BR10:** Future week rejection (`400 Bad Request`)
  - **BR8:** Empty week rejection (`422 Unprocessable Entity`)
  - **BR9:** Weekly summary generation idempotency (First generation `201 Created`, duplicate call `200 OK` with identical ID)

Run the automated verification suite:
```powershell
python scratch/test_backend.py
```

---

## 🛡 Security & Authorization
- **Stateless JWT:** Bearer token authentication via JJWT 0.12.6.
- **Ownership Isolation:** All queries restrict by authenticated user ID. Accessing foreign user entities yields `404 Not Found`, preventing resource enumeration.
- **CORS:** Configured for `http://localhost:5173` with credentials and exposed headers.
