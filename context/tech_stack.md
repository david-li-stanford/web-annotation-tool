# Tech Stack Documentation

This document outlines the core technologies used in the Web-Based Text Annotation Tool project. The stack is chosen to support a lightweight, responsive, and easily testable application for text annotation with user and admin interfaces.

---

## 🖥️ Frontend

**Framework:** [React.js](https://reactjs.org/)  
A fast, component-based JavaScript library for building user interfaces.

**Styling:** [Tailwind CSS](https://tailwindcss.com/)  
Utility-first CSS framework for building custom designs directly in your markup.

**Routing:** [React Router](https://reactrouter.com/)  
Handles navigation between the User and Admin pages.

**State Management:** React Hooks  
Simple local state handling (e.g. `useState`, `useEffect`) will be sufficient for this scale of application.

---

## ⚙️ Backend

[Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)  
A minimalist web framework for creating RESTful APIs and handling server logic.

---

## 🗄️ Database

**Database Options:**

- **[PostgreSQL](https://www.postgresql.org/):** Relational database suitable for more structured data requirements (e.g. user tables, comment relationships). The database is hosted locally through localhost port 5432. 

---

## 🔐 Authentication

**For Testing/Development:**
- Any username/password combination is accepted to access the admin dashboard.

**For Future Production:**
- Implement secure authentication using:
  - [JWT (JSON Web Tokens)](https://jwt.io/)

---

## 📁 File Storage

**Text Uploads:** Stored directly in the database or filesystem, depending on backend choice.  
Text excerpts are managed by the admin and retrieved by users for annotation.

---

## 🧪 Testing

- **Frontend:** React Testing Library, Jest
- **Backend:** Supertest (for Express), Pytest (for Flask)
