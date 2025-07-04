# Project Overview

## Project Description: Web-Based Text Annotation Tool

This project is a web-based annotation platform designed to facilitate the interactive markup of text excerpts. The platform consists of two main interfaces: a **User Page** for annotation and an **Admin Page** for content management.

---

## User Page Features

1. **Text Selection Interface**  
   Users can browse and select from a list of pre-uploaded text excerpts to annotate.

2. **Annotation Tools**  
   Users can highlight portions of the text and add comments associated with those highlights. An intuitive interface allows users to create, view, and manage their annotations in real-time.

---

## Admin Page Features

1. **Authentication System**  
   Access to the admin dashboard requires login credentials (username and password).  
   > For development and testing purposes, the system accepts any credentials entered and grants access.

2. **Admin Dashboard**  
   Admins can upload and manage text excerpts that will be made available on the user-facing page. Uploaded texts can be edited, deleted, or added to a queue for annotation.

---

## Tech Stack Recommendation

- **Frontend:** React (with Tailwind CSS for styling)  
- **Backend:** Node.js with Express or Python Flask  
- **Database:** MongoDB or PostgreSQL to store text excerpts and annotations  
- **Authentication:** Lightweight auth system with bypass for development
