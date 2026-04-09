# CampusLancer — Setup Guide

## What you need installed
- Node.js (v18+)
- MySQL (v8+)
- A terminal / command prompt

---

## Step 1 — Set up the database
1. Open MySQL Workbench or your terminal
2. Run the database script:
   ```
   mysql -u root -p < campus_lancer.sql
   ```

---

## Step 2 — Install dependencies
Open a terminal in this project folder and run:
```
npm install
```

---

## Step 3 — Configure your environment
Open the `.env` file and update:
```
DB_PASSWORD=your_actual_mysql_password
```
Everything else can stay the same for local development.

---

## Step 4 — Start the server
```
npm start
```
Or for auto-restart during development:
```
npm run dev
```

The app will be available at: http://localhost:3000

---

## Connecting to a teammate's database (3-tier setup)
When you link up with teammates, the person running MySQL should:
1. Open MySQL and run: `CREATE USER 'campus'@'%' IDENTIFIED BY 'password123';`
2. Run: `GRANT ALL ON campus_lancer_db.* TO 'campus'@'%';`
3. Share their laptop's IP address (run `ipconfig` on Windows or `ifconfig` on Mac/Linux)

Then update your `.env`:
```
DB_HOST=192.168.x.x   ← teammate's IP address
DB_USER=campus
DB_PASSWORD=password123
```
Both laptops must be on the same WiFi network.

---

## Project structure
```
campus_lancer/
├── server.js              ← entry point, starts Express
├── .env                   ← your config (never commit this)
├── config/
│   └── db.js              ← database connection
├── controllers/
│   ├── authController.js  ← login, register, logout
│   ├── studentController.js
│   └── businessController.js
├── routes/
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── businessRoutes.js
│   └── taskRoutes.js
├── views/                 ← EJS HTML templates (build these)
└── public/                ← CSS, JS, images
```

---

