# Authentication — User Guide

## Tenant Application

### Register

1. Open `/register`.
2. If registration is closed, you will see: **We are not currently accepting new registrations.**
3. Otherwise enter company name, your name, work email, password, and optional workspace domain.
4. After success you are signed in and taken to the workspace dashboard.

Registration creates your workspace, owner account, default roles, and default modules (Leads, Tasks, Communication Templates).

### Login

1. Open `/login`.
2. Enter your workspace, email, and password. The workspace is preselected when you open the application on its workspace domain.
3. Optionally enable **Remember me**.
4. Verify your email when prompted; unverified accounts cannot open protected workspace pages. On the verify-email gate, **Sign out** ends the session and returns you to `/login` (or `/central/login` for Central).
5. After success you land on `/dashboard`.

If a new member never receives the verification email, a workspace owner or admin can open **Administration → Users**, open that user’s row menu, and either **Resend verification** or **Mark as verified**.

Your browser does not save a workspace selection in local storage. Open the correct workspace host or enter the workspace again when using the shared login URL.

### Forgot password

1. Open `/forgot-password` (or use the link on the login page).
2. Enter your email and submit.
3. If an account exists, you receive a reset email.

### Reset password

1. Open the link from your email (`/reset-password/{token}?email=…`).
2. Enter and confirm a new password that meets platform password rules.
3. After success you are redirected to `/login`.

### Logout

Use **Sign out** on the tenant dashboard. Your session token is revoked.

---

## Central Application (platform admins)

Central auth lives under `/central/*`.

| Action | URL |
|--------|-----|
| Login | `/central/login` |
| Forgot password | `/central/forgot-password` |
| Reset password | `/central/reset-password/{token}?email=` |
| Admin console | `/central/dashboard` |

Central users are invited by administrators; there is no public Central registration page.

Central administrators must also verify their invited email address before accessing protected Central pages.
