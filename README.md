# Campus-Lancer 🎓💼

## Project Overview
**Campus-Lancer** is a platform designed to connect students with real-world freelance tasks, turning academic skills into career milestones. It bridges the gap between classroom theory and industry needs by creating a structured marketplace.

---

## 🚀 Problem Statement & Objectives

### The Problem
- Students often graduate with theoretical knowledge but lack practical experience.  
- Businesses need affordable, skilled talent for short-term projects.  

### Project Objectives
- **Verifiable Milestones** → Provide students with career milestones that can be showcased.  
- **Task Management** → Enable businesses to post tasks and review submissions.  
- **AI Validation** → Integrate AI-driven validation for credibility.  
- **Robust Architecture** → Build a scalable, normalized PostgreSQL schema.  

---

## 🛠️ Methodology & Tech Stack
- **Backend**: Node.js with Express for routing and controllers  
- **Database**: PostgreSQL schema hosted on Supabase, normalized with enforced relationships  
- **Integration**: GitHub API combined with AI skill scoring  
- **Deployment**: Render and Supabase for hosting and migrations  

---

## ⚙️ System Overview

### Workflow
1. **Post** → Businesses post tasks  
2. **Apply** → Students apply and submit work  
3. **Validate** → AI validates submissions and checks eligibility  
4. **Review** → Businesses endorse or reject the work  
5. **Reward** → Students earn career milestones  

### Database Schema
The system relies on a normalized schema with dedicated tables for:  
- Users  
- Tasks  
- Applications  
- Endorsements  
- Milestones  

---

## 📈 Results
- Developed a functional prototype featuring student task browsing and application features.  
- Enabled businesses to seamlessly manage postings and review submissions.  
- Implemented AI integration to provide automated credibility scoring and eligibility checks.  
- Ensured secure, scalable data management via Supabase.  

---

## 💡 Discussion & Lessons Learned

### Strengths
- High real-world relevance  
- Scalable design  
- Significant academic impact  

### Challenges
- Navigating AI fairness  
- Authentication complexities  
- Managing the database schema under load  

### Lessons Learned
- Importance of normalization  
- Robust error handling  
- Thorough documentation  

---

## 🔮 Future Work
- 📱 Mobile app integration  
- 🤖 Enhanced AI skill assessment features  
- 🌐 Expansion into global student-business networks  
- 🎮 Gamification features for boosted user motivation  

---

## 🎯 Conclusion
**Campus-Lancer** is more than a student project—it is a vision for connecting academia and industry. By enabling students to transform tasks into career milestones, the platform empowers them to graduate with both knowledge and experience.

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

