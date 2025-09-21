# 🚆 Smart Rail ID  
**A Unique Digital Passenger Verification System for Indian Railways**  
Submission for **Smart India Hackathon 2025**

---

## 📌 Problem Statement
- Ticketless travel causes **major revenue losses** for Indian Railways.  
- Manual ticket checking is **slow, error-prone, and vulnerable to fraud**.  
- Existing QR tickets can be **screenshot or reused**, leading to misuse.  

---

## 💡 Proposed Solution – Smart Rail ID
Smart Rail ID generates a **unique, encrypted, auto-expiring ID/QR** for every booked ticket.  
- **Auto-expiry** after journey → prevents ticket reuse.  
- **Encrypted QR** → tamper-proof & secure.  
- **Web & Mobile Verification Portal** → TTEs can validate tickets quickly.  
- **Offline Verification Mode** → works even in poor network areas.  

---

## ⚙️ Technical Approach
**Tech Stack**  
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Python (Flask) / Node.js (Express)  
- **Database:** MySQL / MongoDB  
- **Security:** AES encryption, hash-based verification, timestamped QR  
- **Hosting:** Cloud (AWS / Azure / NIC Cloud)  

**System Flow**  
1. Passenger books ticket (IRCTC/UTS).  
2. Smart Rail ID (QR + unique token) generated.  
3. Passenger shows QR to TTE.  
4. TTE scans via app/portal.  
5. System verifies & updates logs.  

---

## ✅ Feasibility & Viability
- **Technical:** Scalable cloud, proven QR + DB tech.  
- **Operational:** Easy for TTEs & passengers.  
- **Economic:** Low cost, prevents fraud → quick ROI.  
- **Aligned with Digital India & IRCTC modernization.**  

---

## 📊 Impact & Benefits
- **Railways:** Increased revenue, transparent audit logs.  
- **TTEs:** Faster verification, reduced workload.  
- **Passengers:** Convenience & trust.  

---



# Access in browser
http://localhost:3000   # (or your configured port)
