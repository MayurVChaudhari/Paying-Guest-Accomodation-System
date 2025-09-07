# 🏠 Paying Guest (PG) Accommodation System

A **Single Page Application (SPA)** for booking and managing Paying Guest accommodations.  
Built **without frontend frameworks** – using **HTML, CSS, Bootstrap, JavaScript, jQuery, AJAX** – with a **Node.js, Express.js, MongoDB** backend.  

---

## 🚀 Features

### 👤 User Module
- Register/Login as a user.
- Explore available PGs (name, location, rent, amenities, images).
- Send booking requests to PG owners.
- Track request status (Pending ✅ / Approved 🟢 / Rejected ❌).
- View history of booked PGs.

### 🏘️ Owner Module
- Register/Login as an owner.
- Add new PG listings with details (name, location, rent, facilities, images).
- Edit or delete PG listings.
- Handle incoming booking requests:
  - **Approve** → User added to `customers`, PG added to user's bookings.
  - **Reject** → Request removed from pending list.

### 👨‍💼 Admin Module
- View all registered users and owners.
- (Future scope: Approve new owners, monitor PG activity.)

---

## 🛠️ Tech Stack

**Frontend:**  
- HTML, CSS, Bootstrap  
- JavaScript, jQuery, AJAX  

**Backend:**  
- Node.js, Express.js  

**Database:**  
- MongoDB  

---
