# Google OAuth2 & Automatic Weekly Summary Email Guide

> **Developer-Facing Viva Documentation**  
> Written for 2nd-year Computer Science & Engineering students and evaluators.

---

## 1. How Google OAuth Works in FitLog

FitLog uses **Spring Security OAuth2 Client** to implement the standard OAuth2 authorization code grant flow.

1. **User clicks "Continue with Google"** on the React frontend.
2. The browser is directed to the backend endpoint:  
   `GET http://localhost:8080/oauth2/authorization/google`
3. Spring Security creates an `OAuth2AuthorizationRequest` (temporarily held in a secure, short-lived HTTP-only cookie by `HttpCookieOAuth2AuthorizationRequestRepository`) and redirects the user to Google's consent screen.
4. The user authenticates with Google and grants permission for `openid`, `profile`, and `email`.
5. Google redirects the user back to Spring Boot's callback endpoint:  
   `GET http://localhost:8080/login/oauth2/code/google?code=...&state=...`
6. Spring Security exchanges the authorization code for Google ID and access tokens, loading the authenticated `OAuth2User` principal.
7. Spring Security hands control to our `OAuth2AuthenticationSuccessHandler`.

---

## 2. How Google Users Become FitLog Users

Inside `OAuth2AuthService.processGoogleUser(sub, email, name)`, FitLog handles three distinct cases:

* **Case A — Brand New Google User**:
  * Neither Google subject ID (`sub`) nor email exists in FitLog's MySQL `users` table.
  * A new `User` entity is created with:
    * `fullName`: Google display name (or "Google Athlete" fallback)
    * `email`: verified email from Google
    * `provider`: `"GOOGLE"`
    * `providerId`: Google subject ID (`sub`)
    * `role`: `Role.USER`
    * `passwordHash`: a secure, unguessable random BCrypt hash (prevents empty password vulnerabilities while satisfying database column constraints)
  * The user is saved to MySQL.

* **Case B — Returning Google User**:
  * The user's Google subject ID (`providerId`) is found in the database.
  * The existing `User` entity is loaded directly. No duplicate record is created.

* **Case C — Existing Password User with Same Email**:
  * The user originally registered with email and password, and now logs in using Google with that same email.
  * FitLog safely **links** the Google account:
    * `user.setProviderId(sub)`
    * `user.setProvider("GOOGLE")`
  * The original `passwordHash` is **never overwritten or removed**. The user can still log in using either their password or Google in the future!

---

## 3. How Google Authentication Becomes a FitLog JWT

Once the `User` entity is located or created:

1. `JwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name())` issues a standard FitLog JWT signed with our HMAC-SHA256 secret.
2. `OAuth2AuthenticationSuccessHandler` cleans up the temporary OAuth2 authorization cookies.
3. The handler redirects the browser to the controlled frontend redirect URI with the token attached as a query parameter:  
   `http://localhost:5173/login?token=<JWT>`
4. The React `Login` component reads `?token=...`, stores it in `localStorage` under `fitlog_token`, calls `GET /api/auth/me` to populate `fitlog_user`, and redirects the athlete to `/dashboard`.

---

## 4. Why JWT is Still Used After Google Login

* **Single Uniform Authorization Layer**: The rest of the FitLog API (`/api/workouts/**`, `/api/meals/**`, `/api/goals/**`, `/api/summaries/**`) only checks for a valid `Bearer <FitLog_JWT>` in the HTTP `Authorization` header.
* **No Provider Coupling**: Protected endpoints do not care whether the token came from password authentication or Google OAuth2.
* **Stateless & Scalable**: No server session is stored in memory or database; every request is authenticated in microseconds by verifying the cryptographic signature.

---

## 5. How Weekly Summary Generation Works

1. The athlete or admin triggers:  
   `POST /api/summaries/weekly?weekOf=YYYY-MM-DD`
2. `SummaryService.generateWeeklySummary(weekOf)`:
   * **BR10**: Checks that `weekStart` is not in the future (rejects with `400 Bad Request`).
   * **BR9**: Checks if a `WeeklySummary` already exists for that user and week:
     * If found, returns the existing record with `created = false` (HTTP `200 OK`). **Does not send another email.**
   * Aggregates total workouts, logged meals, calories in, calories out, and goal progress from the repository queries.
   * **BR8**: If workouts = 0 and meals = 0, rejects with `422 Unprocessable Entity` (`BusinessRuleException`).
   * Saves the new `WeeklySummary` to MySQL (`created = true`, HTTP `201 Created`).

---

## 6. How the Email is Triggered

When `created == true` (a brand new summary was persisted to the database):

```text
SummaryService.generateWeeklySummary()
            │
            ▼ (summary saved to MySQL)
WeeklySummaryEmailService.sendWeeklySummaryEmail(email, name, summary)
            │
            ▼ (composes HTML + Plain Text MimeMessage)
JavaMailSender.send(mimeMessage)
            │
            ▼
SMTP Server ──► User's Inbox
```

If an existing summary is retrieved (Rule 19), no email is sent, preventing spamming users on duplicate requests.

---

## 7. Why Email Failure Does Not Invalidate the Generated Summary

* **Business Criticality**: The weekly summary computation and storage in the database is the primary business operation. Email delivery is a secondary notification.
* **Resilient Exception Handling**: Inside `WeeklySummaryEmailService`, the `mailSender.send()` call is wrapped in a `try ... catch (Exception ex)`.
* If the SMTP server is down, connection times out, or credentials are invalid:
  1. The error is logged (`log.error("Weekly summary email failed for user {}: {}", ...)`).
  2. The exception is **suppressed** and NOT allowed to bubble up.
  3. The database transaction completes and commits normally.
  4. The frontend receives the successful `201 Created` summary response without experiencing an internal server error.

---

## 8. Required Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GOOGLE_CLIENT_ID` | OAuth2 Client ID from Google Cloud Console | `xyz.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth2 Client Secret from Google Cloud Console | `GOCSPX-abc123...` |
| `OAUTH2_REDIRECT_URI` | Frontend redirect URI after Google login | `http://localhost:5173/login` |
| `MAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USERNAME` | SMTP username / email address | `athlete@gmail.com` |
| `MAIL_PASSWORD` | SMTP password or Google App Password | `abcd efgh ijkl mnop` |
| `MAIL_FROM` | Outgoing sender address | `noreply@fitlog.com` |

---

## 9. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project (e.g. `FitLog`).
2. Navigate to **APIs & Services > OAuth consent screen**:
   * User Type: **External**
   * App name: **FitLog**
   * Scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
   * Add test users (for development).
3. Navigate to **APIs & Services > Credentials > Create Credentials > OAuth client ID**:
   * Application type: **Web application**
   * Name: `FitLog Backend`
   * **Authorized redirect URIs**:
     * Local: `http://localhost:8080/login/oauth2/code/google`
     * Production: `https://api.yourdomain.com/login/oauth2/code/google`
4. Copy the **Client ID** and **Client Secret** into your environment or run configuration.

---

## 10. SMTP Setup (e.g., Gmail)

1. Enable 2-Step Verification on your Google Account.
2. Go to **Security > 2-Step Verification > App passwords**.
3. Generate an App Password for **Mail** on **Other (FitLog)**.
4. Set the environment variables:
   ```bash
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-16-char-app-password
   MAIL_FROM=your-email@gmail.com
   ```

---

## 11. Local Development vs. Production Redirect URIs

* **Local Development**:
  * Spring Boot OAuth2 Callback: `http://localhost:8080/login/oauth2/code/google`
  * Frontend Application Success Landing: `http://localhost:5173/login`
* **Production**:
  * Spring Boot OAuth2 Callback: `https://api.fitlog.com/login/oauth2/code/google`
  * Frontend Application Success Landing: `https://app.fitlog.com/login` (via `OAUTH2_REDIRECT_URI`)

---

## 12. Security Considerations

1. **No Open Redirects**: The redirect URI is strictly read from `app.oauth2.authorized-redirect-uri` on the server, never from arbitrary client request parameters.
2. **Stateless Request Storage**: The OAuth2 authorization request state is held in an encrypted, HTTP-only cookie with a 180-second TTL (`HttpCookieOAuth2AuthorizationRequestRepository`), protecting against CSRF in the OAuth flow.
3. **Password Protection**: Account linking (Case C) retains the user's existing BCrypt password hash. No password is overwritten, and Google users created without a password have a cryptographically random hash that cannot be matched via standard forms.
4. **Credential Privacy**: SMTP and OAuth2 credentials are read strictly from environment variables and never logged or exposed to the client.
