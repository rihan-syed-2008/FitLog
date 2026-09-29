# FitLog — Comprehensive Viva & Technical Defense Notes

---

## 1. System Architecture Walkthrough

```text
React 19 (Vite)
   │ (HTTP JSON Request with 'Authorization: Bearer <jwt>')
   ▼
Axios Interceptor
   │ (Network transport)
   ▼
Spring Security Filter Chain
   │ (JwtAuthenticationFilter -> SecurityContextHolder)
   ▼
REST Controller Layer
   │ (DTO validation via @Valid, PathVariable, RequestParam)
   ▼
Service Layer
   │ (Business Logic, Ownership Verification, Transaction Boundaries)
   ▼
Spring Data JPA Repository
   │ (JPQL Queries, Projections, Dynamic Filtering, Pagination)
   ▼
Hibernate ORM
   │ (SQL Generation, 1st Level Cache, Dirty Checking)
   ▼
MySQL 8.4 Relational Database
```

---

## 2. Authentication & Security Flow

1. **Registration Flow:**
   - Client sends `POST /api/auth/register` with `fullName`, `email`, and `password`.
   - `AuthService` queries `UserRepository.existsByEmail(email)`. If true, throws `DuplicateResourceException` (`409 Conflict`).
   - Password is encrypted using `BCryptPasswordEncoder` (salt generation + salted hash).
   - Role is strictly locked to `Role.USER`.
   - Record is persisted and `201 Created` is returned with `UserResponse` (password hash is **never** returned).

2. **Login Flow:**
   - Client sends `POST /api/auth/login` with `email` and `password`.
   - `AuthenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password))` is invoked.
   - Spring Security calls `CustomUserDetailsService.loadUserByUsername()`.
   - BCrypt verifies credentials. If invalid, `BadCredentialsException` is thrown (`401 Unauthorized`).
   - `JwtService` issues an HMAC-SHA256 signed JWT containing claims: `sub` (email), `userId`, `role`, `iat`, and `exp`.
   - Client receives token and stores it in browser `localStorage`.

3. **Subsequent Authenticated Requests:**
   - Axios request interceptor attaches `Authorization: Bearer <token>`.
   - `JwtAuthenticationFilter` intercepts request:
     - Extracts bearer header.
     - Calls `JwtService.isTokenValid(token)`.
     - Extracts email claim and loads user authorities into a `UsernamePasswordAuthenticationToken`.
     - Populates `SecurityContextHolder.getContext().setAuthentication(auth)`.
   - If invalid, expired, or missing on protected paths, `RestAuthenticationEntryPoint` writes standard JSON `401 Unauthorized`.

---

## 3. Deep Dive into Business Rules

| Rule Code | Rule Definition | Implementation Details |
|---|---|---|
| **BR8** | Empty Week Summary Guard | When generating a weekly summary, if `workoutsCount == 0 && mealsCount == 0`, throw `BusinessRuleException` (`422 Unprocessable Entity`). A summary cannot be calculated on zero activity. |
| **BR9** | Summary Idempotency | Weekly summary generation is unique per `(user_id, week_start)`. First generation returns `201 Created`. Subsequent generations return `200 OK` with the existing entity ID. Database table enforces this with a unique constraint `uk_weekly_summary_user_week`. |
| **BR10** | Future Week Guard | Generating a summary for a week whose Monday is after the current week's Monday throws `InvalidRequestException` (`400 Bad Request`). You cannot summarize future events. |
| **Ownership Isolation** | Resource Snooping Protection | When a user requests `/api/workouts/{id}` or `/api/meals/{id}` belonging to another user, the system returns `404 Not Found` rather than `403 Forbidden`. This prevents attackers from enumerating valid entity IDs. |
| **Weekly Trend Continuous Timeline** | Zero-Activity Continuity | `GET /api/summaries/weekly-trend?weeks=N` iterates back $N$ weeks. Weeks with no logged workouts return `workoutsCompleted = 0` and are **never omitted**, preserving time-series fidelity on line/bar charts. |
| **Daily Calorie Balance** | Net Calorie Calculation | Daily balance compares `Calories In (Meals)` against `Calories Out (Workouts)`: `SURPLUS` ($>0$), `DEFICIT` ($<0$), or `BALANCED` ($=0$). |

---

## 4. 20 Crucial Viva Questions & Master Answers

### Q1: Why did you choose Spring Boot instead of plain Spring MVC?
**Answer:** Spring Boot provides opinionated starter dependencies, automated classpath configuration, an embedded Tomcat web container, and production-ready monitoring. It eliminates boilerplate XML configuration and simplifies dependency management.

### Q2: What is the benefit of Spring Data JPA over direct JDBC?
**Answer:** Spring Data JPA abstracts database interactions through the Repository pattern. It automatically generates queries from method names, supports JPQL and pagination, handles object-relational impedance mismatch, manages database transactions, and shields the application from vendor-specific SQL dialect differences.

### Q3: Why are DTOs (Data Transfer Objects) mandatory instead of returning JPA Entities?
**Answer:** Exposing entities directly causes security vulnerabilities (over-posting, mass assignment), leaks sensitive columns like `passwordHash`, triggers accidental lazy loading exceptions (`LazyInitializationException`) during JSON serialization, creates infinite recursion with bidirectional relationships, and couples the internal database schema to the public API contract.

### Q4: Why have a Service layer instead of placing business logic in Controllers?
**Answer:** Controllers are only responsible for HTTP transport concerns (parsing request params, status codes, route mapping). The Service layer encapsulates business logic, applies validation rules, coordinates multiple repositories, and manages transactional boundaries (`@Transactional`). This ensures reusability and clean testability.

### Q5: What is the Repository pattern?
**Answer:** The repository mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects. It isolates domain logic from data access technologies.

### Q6: Why did you use JWT instead of HTTP Session cookies?
**Answer:** JWT allows stateless authentication. The server does not maintain server-side session state in memory or Redis, enabling effortless horizontal scaling across multiple instances without sticky sessions. Additionally, JWTs are resilient against Cross-Site Request Forgery (CSRF) when stored securely.

### Q7: How does BCrypt hashing protect passwords?
**Answer:** BCrypt uses a salted adaptive hash based on the Blowfish cipher. It incorporates a random 128-bit salt to defeat rainbow table attacks and features a configurable cost factor (work factor) to slow down brute-force attacks as hardware computation speeds increase.

### Q8: What does "stateless authentication" actually mean in Spring Security?
**Answer:** It means `SessionCreationPolicy.STATELESS` is set. The server never creates or stores an `HttpSession`. Every incoming request must self-authenticate by presenting credentials (the Bearer JWT), and the SecurityContext is populated only for the lifetime of that single request thread.

### Q9: What is `SecurityContextHolder` and `SecurityContext`?
**Answer:** `SecurityContextHolder` is where Spring Security stores details of the currently authenticated principal using a `ThreadLocal` strategy. The `SecurityContext` holds the `Authentication` token containing user identity and granted authorities.

### Q10: What does `JwtAuthenticationFilter` do on every request?
**Answer:** Inheriting from `OncePerRequestFilter`, it inspects the HTTP `Authorization` header. If a valid `Bearer <token>` is present, it validates token signature and expiration, retrieves the user details, creates an authenticated `UsernamePasswordAuthenticationToken`, and loads it into the `SecurityContext`.

### Q11: What is the difference between HTTP 401 Unauthorized and HTTP 403 Forbidden?
**Answer:** 
- `401 Unauthorized` means authentication is missing or invalid (the identity of the client is unknown).
- `403 Forbidden` means the client identity is authenticated and known, but the client does not possess the required privileges/roles to access the requested resource.

### Q12: Why use a `@RestControllerAdvice` Global Exception Handler?
**Answer:** It decouples exception-to-HTTP mapping from business logic. All controllers share consistent error responses matching RFC 7807 problem details (timestamp, status code, error type, message, path, field validation errors) without repetitive try-catch blocks.

### Q13: What is the difference between `@Valid` annotation and service-level validation?
**Answer:** 
- `@Valid` triggers declarative JSR-380 bean validation annotations (`@NotNull`, `@Size`, `@Min`, `@Max`) at the HTTP deserialization boundary.
- Service-level validation enforces complex multi-attribute, contextual, or database-dependent business logic (e.g., checking date range consistency, active weekly summaries, or duplicate records).

### Q14: Why do we use Database Pagination instead of fetching all records?
**Answer:** Fetching unpaginated tables risks OutOfMemory errors, network saturation, and long query response times as data scales. Spring Data's `Pageable` and `Page<T>` translate to SQL `LIMIT` and `OFFSET` clauses, querying only the necessary batch of rows.

### Q15: How does the search filter work without leaking other users' data?
**Answer:** The repository executes a JPQL query that pairs `LOWER(COALESCE(field, '')) LIKE LOWER(CONCAT('%', :search, '%'))` with a strict `WHERE user.id = :userId` clause. The search operates exclusively within the boundary of the authenticated user's records.

### Q16: How is ownership isolation enforced for entity lookup and deletion?
**Answer:** Instead of querying solely by `id`, queries always execute `findByIdAndUserId(id, currentUser.getId())`. If no matching row is returned, the application throws `ResourceNotFoundException` (`404`), ensuring foreign data is completely invisible.

### Q17: Why does generating a duplicate weekly summary return HTTP 200 instead of HTTP 409 or throwing an error?
**Answer:** By requirement **BR9**, the generation endpoint is idempotent. If a summary has already been computed for that week, returning `200 OK` with the existing resource allows clients to safely retry requests without error cascades or duplicate calculations.

### Q18: What are JPA Dirty Checking and `@Transactional`?
**Answer:** Within a `@Transactional` boundary, entities loaded into Hibernate's persistence context are monitored. When entity fields are updated during execution, Hibernate detects changes upon transaction commit and automatically executes an SQL `UPDATE` without requiring explicit calls to `repository.save()`.

### Q19: How does the React frontend communicate with the Spring Boot backend?
**Answer:** Through Axios HTTP client instances configured with a base URL (`http://localhost:8080/api`). A request interceptor reads the JWT from `localStorage` and appends `Authorization: Bearer <token>` to request headers. A response interceptor detects `401 Unauthorized` responses to automatically clear expired credentials and redirect to `/login`.

### Q20: How are CORS (Cross-Origin Resource Sharing) issues handled?
**Answer:** The Spring Boot backend registers a `CorsConfigurationSource` bean allowing origin `http://localhost:5173`, HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`), and headers (`Authorization`, `Content-Type`), while exposing the `Location` header so the frontend can read created resource URIs.
