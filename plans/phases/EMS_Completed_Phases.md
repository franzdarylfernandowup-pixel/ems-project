# Employee Management System
## Completed Phases of the Project Plan

**Prepared by:** Franz Daryl F. Fernando | FND's Firm  
**Date:** October 6, 2026

---

## Phase Summary

| Phase | Scope | Status |
|---|---|---|
| **0. Design and documentation** | User manual, Figma mockups, review addendum | Complete |
| **1. Backend foundation** | Supabase auth, database, Edge Function, security rules | Complete |
| **2. Application build** | All 16 screens in the manual, for Employee and Department Manager | Complete |

---

## Phase 0: Design and Documentation

- **User manual v1.0 (July 28, 2026)** covering the overview, objectives, and feature lists for both roles, with how-to steps and validation rules for every screen.
- **Figma mockups** for the login, activation, and username screens, the employee screens, and the manager screens.
- **Design and build review addendum (September 28, 2026)** with screen-by-screen notes and a suggested build order.

---

## Phase 1: Backend Foundation

- Supabase project with authentication and tables for profiles, attendance, tasks, leave requests, and announcements.
- Edge Function for account activation, with CORS headers added so the browser can call it.
- Row Level Security that limits managers to their own department's data at the database level.
- Two narrow database functions, `get_login_email` and `is_username_taken`, so pre-login checks work without loosening table policies.
- File attachments for task submissions and leave requests, which managers can open from their screens.

---

## Phase 2: Application Build

**Stack:** React 19, Vite, Tailwind CSS 4, React Router 7, and Supabase JS.

Every screen below is implemented in code.

### Sign-in Screens

| Screen | What it does |
|---|---|
| **Login** | Validates username and password, shows error messages, and sends first-time users to Update Username and everyone else to their dashboard by role. |
| **Activate Account** | Takes Employee ID and company email, validates both fields, and creates the account through the Edge Function. |
| **Update Username** | One-time screen after first login. Requires at least 4 characters (letters, numbers, `_` and `.`), checks the username is unique, and confirms the current password. |

### Employee Screens

| Screen | What it does |
|---|---|
| **Dashboard** | Present days, pending tasks, latest leave request, total tasks, latest announcement, and a navigable monthly calendar, all from live data. |
| **Profile** | View and edit personal details and emergency contact, with employment details shown read-only. Includes a change-password form with an 8-character minimum. |
| **Attendance** | Monthly calendar colored by status, summary counts, recent attendance logs, and a working-days counter. |
| **Tasks** | Task totals by status, task list with due dates, and file upload for each task. |
| **Announcements** | Searchable list showing who posted each announcement, when, and whether it is company-wide or for a department. |
| **Leave** | Request form with leave type, dates, automatic day count, reason, and attachment. Shows reviewing, approved, and declined counts and recent requests. |

### Department Manager Screens

| Screen | What it does |
|---|---|
| **Dashboard** | Total employees, active tasks, pending leave, present today, and the list of pending leave requests, scoped to the manager's department. |
| **Employees** | Department list with search, position and status filters, pagination, and summary counts. Each row opens a profile popup or a weekly attendance popup. |
| **Attendance** | Department attendance table for the current day with time in, time out, and status. |
| **Tasks** | Create and assign tasks, change task status, and open files submitted by employees. |
| **Leave Requests** | Review requests, open attachments, approve or decline, and see total, approved, and declined counts. |
| **Announcements** | Post to the manager's department or company-wide, and view the list of announcements. |
| **Profile** | Same profile and change-password screen as employees, with the manager menu. |

### Shared Features

- Role-based sidebar menus for employees and managers, with logout.
- Responsive layout: a fixed sidebar on desktop and a drawer menu on mobile and tablet.
- Reusable authentication layout and input field on the sign-in screens, plus loading, empty, and error states on the data screens.

---

## Phase Completion Status

| Phase | Status |
|---|---|
| Phase 0 — Design and Documentation | Complete |
| Phase 1 — Backend Foundation | Complete |
| Phase 2 — Application Build | Complete |

> **Source note:** This document reflects the completed phases described in the original PDF. It does not add testing, deployment, maintenance, or other phases that were not included in the source document.
