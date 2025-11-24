# Student Services Management System

A comprehensive web application for managing student services, requests, and administrative tasks in an educational institution.

**Backend:** Laravel 12  
**Frontend:** Vue 3 + TypeScript + Vite  
---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Testing Accounts](#testing-accounts)

---

## ✨ Features

### 1. **Authentication & Authorization**
- ✅ Role-based access control (Admin, Staff, Student)
- ✅ Secure authentication using Laravel Sanctum
- ✅ Protected routes with middleware and policies
- ✅ Session management and token-based API authentication

### 2. **Student Management**
- ✅ Complete CRUD operations for student records
- ✅ Student fields: Number, First Name, Last Name, Grade Level, Email, Status
- ✅ Form validation on both frontend and backend
- ✅ Search and filter functionality
- ✅ Bulk import support via Excel files

### 3. **Service Request Management**
- ✅ Three service types:
  - ID Replacement
  - Good Moral Certificate
  - Form 137
- ✅ Request workflow: Pending → Approved/Rejected
- ✅ Staff can approve or reject requests
- ✅ Admin has full control including deletion
- ✅ Filter by date range and status
- ✅ Request tracking with remarks and timestamps

### 4. **Excel Import System**
- ✅ Bulk upload service requests via Excel (.xlsx, .csv)
- ✅ Asynchronous processing using Laravel queues
- ✅ Intelligent validation:
  - Auto-create missing students
  - Skip inactive students
  - Duplicate detection
  - Service type normalization
- ✅ Import summary with detailed logs:
  - Total rows processed
  - Successful imports
  - New students created
  - Skipped rows with reasons
- ⚠️ Upload interface functional; notification UI in progress

### 5. **RESTful API**
- ✅ Well-structured API endpoints
- ✅ JSON responses with proper status codes
- ✅ Request validation and error handling
- ✅ API documentation ready

### 6. **User Interface**
- ✅ Responsive design
- ✅ Login and dashboard pages
- ✅ Student management interface
- ✅ Service request interface with actions
- ⚠️ UI improvements in progress/Validation error in UI not done

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Laravel 12
- **Database:** MySQL 8.0+
- **Queue:** Laravel Queue (Database driver)
- **Authentication:** Laravel Sanctum
- **Excel Processing:** Maatwebsite/Laravel-Excel
- **Date/Time:** Carbon

### Frontend
- **Framework:** Vue 3 (Composition API)
- **Language:** TypeScript
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **Routing:** Vue Router
- **State Management:** Pinia (if applicable)
- **Styling:** Tailwind CSS (or your CSS framework)

### Development Tools
- **Package Manager:** Composer (PHP), npm/yarn (JavaScript)
- **Version Control:** Git
- **Code Quality:** PHP CS Fixer, ESLint, Prettier

---

## 📦 System Requirements

- **PHP:** 8.2 or higher
- **Composer:** 2.x
- **Node.js:** 18.x or higher
- **npm/yarn:** Latest version
- **MySQL:** 8.0 or higher
- **Web Server:** Apache/Nginx with mod_rewrite enabled
---

## 🚀 Installation

### Quick Start Guide

Follow these steps to get the project running on your local machine:

### 1. Clone the Repository
### 2. Run npm Install
### 3. run "npm run dev" in console

## Testing Account

| Role    | Email                                             | Password |
| ------- | ------------------------------------------------- | -------- |
| Admin   | [admin@example.com](mailto:admin@example.com)     | password |
| Staff   | [staff@example.com](mailto:staff@example.com)     | password |
| Student | [student@example.com](mailto:student@example.com) | password |

## Axios Configuration

The frontend uses **Axios** to communicate with the backend API. The configuration is in `src/utils/axios.ts`:

```ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: 'http://service-management-backend.test/api' // Change this to your local backend URL
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();

  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

export default api;

## ⚠️ Make sure to update the baseURL to match your local backend, for example: http://localhost:8000/api