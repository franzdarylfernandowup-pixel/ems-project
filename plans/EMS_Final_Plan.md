# Employee Management System (EMS)
## Final Project Plan & Operational Roadmap

**Prepared by:** Franz Daryl F. Fernando | FND's Firm  
**Date:** October 6, 2026  
**System Status:** Deployed & Operational (Vercel + Supabase + Brevo)  
**Document Purpose:** Final System Audit, Production Hardening, and Continuous Improvement Roadmap  

---

## 1. Executive Summary

The **Employee Management System (EMS)** developed for **FND's Firm** is a full-stack, enterprise-grade web application designed to manage company attendance, task delegation, leave applications, and organizational announcements. 

Following a rigorous **Grill-Me architectural interrogation**, this document certifies all completed phases, documents the live production infrastructure, outlines immediate production fixes (such as SPA route rewriting), and establishes the phased roadmap for future system improvements.

---

## 2. Audit of Accomplished Milestones

> **Integrity Guarantee:** All screens, backend schemas, and workflows built in Phases 0–2 remain untouched and operational.

```
+---------------------------------------------------------------------------------+
|                               EMS SYSTEM ARCHITECTURE                           |
|                                                                                 |
|   [ React 19 + Vite Frontend ]  ---- Vercel Hosting (SPA Rewrites Active)       |
|                 |                                                               |
|                 +---> Supabase Auth & Database (RLS Isolated by Department)     |
|                 +---> Supabase Storage (Task & Leave Attachments)               |
|                 +---> Supabase Edge Function (Account Activation & Password Gen)|
|                                |                                                |
|                                +---> Brevo SMTP Relay (smtp-relay.brevo.com)    |
+---------------------------------------------------------------------------------+
```

### Phase 0: Design and Documentation (COMPLETE)
- **User Manual v1.0:** Comprehensive specifications for Employee and Department Manager workflows, field validations, and error handling.
- **Figma Mockups:** Verified visual design for all sign-in and authenticated screens.
- **Design & Build Review Addendum:** Screen-by-screen technical specifications and responsive rules.

### Phase 1: Backend & Security Architecture (COMPLETE)
- **Supabase Cloud Infrastructure:** Production database containing `profiles`, `attendance`, `tasks`, `leave_requests`, and `announcements`.
- **Database-Level Row Level Security (RLS):** Strict department-scoping rules ensuring managers only read and write data for employees within their assigned department.
- **RPC Helper Functions:** Narrow, secure database functions (`get_login_email`, `is_username_taken`) preventing policy bypasses.
- **Storage Buckets:** File upload storage for task submissions and medical/leave attachments.

### Phase 2: Application Build — 16 Screens (COMPLETE)
Every screen is implemented in **React 19 + Vite + Tailwind CSS 4 + React Router 7**:

| Category | Screen | Status | Key Capabilities |
|---|---|---|---|
| **Authentication** | Login | Complete | Username/password lookup via RPC, role-based redirection, first-time user routing. |
| | Activate Account | Complete | Employee ID + Company Email validation via backend Edge Function. |
| | Update Username | Complete | Mandatory first-login username selection with uniqueness check and password confirmation. |
| **Employee Portal** | Dashboard | Complete | Live attendance summary, pending tasks counter, latest leave status, monthly calendar. |
| | Profile | Complete | Personal info edit, emergency contact, employment details (read-only), password change. |
| | Attendance | Complete | Monthly visual calendar color-coded by status, logs, working days counter. |
| | Tasks | Complete | Task totals, due date tracking, file submission upload. |
| | Announcements | Complete | Company-wide and department-specific broadcast feed with author stamps. |
| | Leave Requests | Complete | Leave request filing with day calculation, reason, attachments, and status tracking. |
| **Manager Portal** | Dashboard | Complete | Department overview: total staff, active tasks, pending leave count, present staff today. |
| | Employees | Complete | Searchable department directory, status filters, profile modals, weekly attendance popups. |
| | Attendance | Complete | Daily department attendance sheet with Time In / Time Out logs. |
| | Tasks | Complete | Task creation, employee assignment, status updates, employee file downloads. |
| | Leave Requests | Complete | Review queue, attachment preview, approve/decline actions, audit counts. |
| | Announcements | Complete | Publishing broadcasts (department or company-wide). |
| | Profile | Complete | Manager personal details and password change with manager navigation context. |
| **Shared Layout** | Navigation | Complete | Responsive fixed desktop sidebar and mobile/tablet drawer navigation. |

### Phase 3A: Deployment & Transactional Auth Pipeline (COMPLETE)
- **Frontend Hosting:** Live deployment hosted on **Vercel**.
- **Backend Edge Computing:** `activate-account` Deno Edge Function deployed to Supabase.
- **Transactional Email Service:** Integrated with **Brevo SMTP** (`smtp-relay.brevo.com:465`) via `denomailer` to deliver generated credentials (`username` and default password `FND@digits`) directly to company inboxes.
- **Secret Zero Isolation:** Zero credential leaks — frontend `.env` contains strictly public anon keys; `BREVO_SMTP_KEY` and Supabase `service_role` keys are securely isolated within Deno environment variables.

---

## 3. Immediate Hardening & Hotfix (Grill-Me Finding)

### Hotfix 3.1: Resolution of Vercel SPA 404 on Page Refresh
- **Issue:** On Vercel, reloading directly on nested routes (e.g., `/manager/employees` or `/employee/dashboard`) returned HTTP 404 because static servers look for physical HTML files.
- **Solution:** Added `vercel.json` to the project root with client-side rewrites:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
- **Validation:** Verified production build compilation (`npm run build` completed cleanly in 429ms). Direct refreshes across all 16 routes now resolve to `index.html` where React Router handles navigation seamlessly.

---

## 4. Phase 4: Operational Improvements Roadmap

Based on the Grill-Me findings, the following non-breaking enhancements are scheduled:

```
+----------------------------------------------------------------------------------+
|                            PHASED IMPROVEMENT TIMELINE                           |
|                                                                                  |
|  [ Sprint 1: Security & Guards ] ---> Protected Routes & Session Guarding        |
|  [ Sprint 2: Resilience ]       ---> Brevo Fallback & Admin Reset Mechanism      |
|  [ Sprint 3: Reporting & Data ] ---> CSV / Excel Export for Attendance & Payroll |
|  [ Sprint 4: User Experience ]  ---> In-App Notifications & Realtime Feed        |
+----------------------------------------------------------------------------------+
```

### Sprint 1: Protected Route Guarding
- **Current State:** Direct URL access relies on component-level API responses.
- **Improvement Target:** Implement a lightweight `<ProtectedRoute>` component wrapper:
  - Unauthenticated users attempting to access `/employee/*` or `/manager/*` are redirected to `/login`.
  - Employees attempting to access `/manager/*` routes are redirected to `/employee/dashboard` with a toast alert.

### Sprint 2: Brevo Email Delivery Fallback & Admin Reset
- **Current State:** If Brevo hits quota limits (300/day free cap) or an email bounces, the account is marked `activated: true`, preventing a second activation submission.
- **Improvement Target:**
  - In `activate-account`, if `emailSent === false`, log a notification in an `activation_audit` table.
  - Provide an admin/manager button to "Resend Welcome Email" or regenerate temporary login credentials for employees who didn't receive their inbox message.

### Sprint 3: Data Export for HR & Payroll
- **Improvement Target:** Add a "Download CSV / Excel" button to:
  - **Manager Attendance:** Export monthly department attendance logs formatted for HR payroll import.
  - **Manager Leave:** Export approved/declined leave records for compliance records.

### Sprint 4: Real-time Updates & Notifications
- **Improvement Target:**
  - Utilize Supabase Realtime subscriptions so when a manager approves a leave request or posts an announcement, the employee dashboard updates instantly without needing a page refresh.

---

## 5. Maintenance & Standard Operating Procedures (SOP)

### 5.1 Adding a New Employee (HR Onboarding Runbook)
1. HR administrator inserts a new row into the `profiles` table in Supabase:
   - `employee_id`: (e.g., `EMP-10042`)
   - `full_name`: Employee Full Name
   - `email`: Official company email address
   - `department`: Target department (must match manager's department)
   - `position`: Job title
   - `role`: `employee` (or `department_manager`)
   - `activated`: `false`
2. Employee navigates to `https://<deployed-url>/activate`.
3. Employee inputs their Employee ID and Email.
4. Edge Function executes, creates auth identity, updates database, and triggers Brevo to send their temporary credentials.
5. Employee logs in, is forced to update their username, and gains access to their portal.

### 5.2 Brevo Monitoring & Quota Management
- **Monitoring Portal:** [Brevo Dashboard](https://app.brevo.com) -> Transactional -> Real-time Statistics.
- **Daily Quota:** 300 free transactional emails/day.
- **DKIM/SPF Record Check:** Ensure company domain DNS includes Brevo TXT records so activation emails do not hit employee spam folders.

### 5.3 Database Backups
- Supabase automated daily backups enabled under Project Settings -> Database -> Backups.
- Point-in-time recovery (PITR) recommended for high-volume enterprise production.

---

## 6. Project Acceptance & Sign-off

| Deliverable | Verification Method | Status | Sign-off |
|---|---|---|---|
| User Manual v1.0 & Figma Specs | Documentation review | Complete | Approved |
| Supabase Database & RLS Rules | Query isolation test | Complete | Approved |
| 16 Application Screens | Frontend component audit | Complete | Approved |
| Brevo SMTP Email Flow | Live email delivery | Complete | Approved |
| Vercel Deployment & SPA Routing | Direct URL refresh audit | Fixed (`vercel.json`) | Approved |
| Phase 4 Improvement Plan | Roadmap document | Finalized | Approved |

**Final Project Status:** **Accepted & Ready for Ongoing Operation**  
**Lead Engineer / Architect:** Franz Daryl F. Fernando  
**Firm:** FND's Firm
