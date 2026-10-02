# 🎓 MediLink — Faculty Viva Preparation Guide
**Author / Presenter:** Dhruv Gami  
**Assigned Project Modules:** Hospital Role Pages, Admin Role Pages & Core Data Architecture  
**Technology Stack:** React, Tailwind CSS, Node.js, Express.js, MongoDB (Mongoose ODM)  
**Academic Context:** Full Stack Development (FSD) Project  

---

## 1. Project Elevator Pitch (How to introduce in 30 seconds)
> *"Good morning, Professor. Our team is building **MediLink**, an emergency healthcare operating system designed to bridge the fatal communication gap between moving ambulances and emergency rooms (ER).*
>
> *While my teammates built the public reporter and EMT intake flows, **I was responsible for the receiving Hospital Role Pages, the Central Admin Governance Console, and the foundational Mongoose data architecture**.*
>
> *My module solves the real-world problem of 'ER Blindness': before the patient arrives, our system streams a **Patient Requirement Profile (PRP)** with real-time vitals directly to the hospital desk, enabling staff to allocate ICU beds, prepare blood units, and alert trauma teams with a single click."*

---

## 2. 3-Tier Architecture Explanation

When faculty ask: *"Explain the architecture of your application"*, describe this clean 3-tier model:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PRESENTATION TIER (Frontend Client)                      │
│    • React (SPA with React Router v7)                       │
│    • Tailwind CSS (Design System matching Curo Healthcare)  │
│    • Axios HTTP Client for REST API consumption             │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON via HTTP / REST
┌──────────────────────────────▼──────────────────────────────┐
│ 2. APPLICATION / LOGIC TIER (Backend Server)                │
│    • Node.js & Express.js (Modular Controllers & Routes)    │
│    • JWT Authentication & Role-Based Access Control (RBAC)  │
│    • Atomic Emergency Acceptance & Bed Decrement Logic      │
│    • Emergency Simulation Engine (for viva demonstration)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM Driver
┌──────────────────────────────▼──────────────────────────────┐
│ 3. DATA STORAGE TIER (Database)                             │
│    • MongoDB NoSQL Database (Port 27017)                    │
│    • 6 Collections: hospitals, ambulances, patients,        │
│      emergencies, users, auditlogs                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Design & Viva Concepts (Crucial! 🌟)

### Q: Why did you choose MongoDB instead of a SQL database like MySQL?
* **Answer:**
  1. **Dynamic Vital Signs:** In-transit vitals are captured as a dynamic, append-only time series (heart rate, SpO2, blood pressure changes every few minutes). Storing these as an **embedded array** inside the Emergency document in MongoDB is faster and more natural than creating a separate relational table with multiple JOIN queries.
  2. **Heterogeneous Patient Profiles:** Different emergencies require different equipment (cardiac monitors vs orthopedic splints). MongoDB's flexible schema handles varying medical attributes seamlessly.
  3. **High Write Throughput:** Emergency dispatch systems experience burst writes (telemetry updates), where MongoDB excels.

### Q: What is Embedding vs. Referencing? How did you decide?
* **Answer:**
  * **Referencing (`ref: 'Hospital'`, `ref: 'Ambulance'`):** Used for Hospitals, Ambulances, and Users. These are independent entities shared across many emergencies. Using `ObjectId` referencing prevents data duplication.
  * **Embedding (`prp.vitalSigns`, `timeline`):** Used for vitals and timeline events. A patient's heart rate readings during trip `ML-EMG-8921` only belong to that specific emergency. Storing them inside the document allows us to retrieve the complete triage file in **a single query** without JOINs.

---

## 4. Live Viva Demonstration Flow (Step-by-Step)

Follow this exact sequence to demonstrate your work smoothly to faculty:

### Step 1: Hospital ER Dashboard (`/hospital`)
1. Show the **ER Overview Card**: Trauma designation level, address, and live ER readiness mode.
2. Demonstrate the **ER Readiness Toggle**: Switch between **Normal**, **Trauma Standby**, and **Full Divert**. Explain that changing this alerts dispatchers whether the hospital can accept new trauma cases.
3. Show the **Resource Telemetry**: ICU bed occupancy bar, General bed occupancy bar, and ventilators.
4. Point out the **Low Blood Bank Banner**: Automatically alerts staff when units of any blood group drop to 5 or fewer.

### Step 2: Live PRP Feed & Inbound Ambulances (`/hospital/incoming`)
1. Explain the **Patient Requirement Profile (PRP)**:
   - Suspected Diagnosis (e.g. *Acute STEMI Heart Attack*)
   - Triage Badge (Red = Critical, Yellow = Urgent)
   - Equipment required (Ventilator, Defibrillator)
   - Blood standby requirement (e.g. 2 units of O+)
2. Point out the **In-Transit Vitals Stream**: Heart rate with heartbeat pulse, Blood Pressure, and SpO2.
3. **The Viva Highlight (Simulator):**
   - Click the **"⚡ Simulate Inbound"** button.
   - Choose **Triage RED (Acute STEMI)** and click **Dispatch Case**.
   - Watch the incoming case immediately appear on the screen with real-time ETA and vitals!

### Step 3: Accept Emergency & Bed Allocation Modal
1. On the incoming case, click **"Accept Case & Allocate Bed"**.
2. Allocate Bed (e.g., `ICU-04`) and assign Attending ER Doctor (e.g., `Dr. Dhruv Gami`).
3. Click **Confirm Reservation**.
4. **Faculty Viva Point:** Explain that this action executes an **atomic update**:
   - Decrements available ICU beds by 1.
   - Updates emergency status from `in_transit` to `accepted`.
   - Appends an entry to the immutable **Security Audit Log**.

### Step 4: Resource & Blood Bank Management (`/hospital/resources`)
1. Open the **Bed Allocation** tab: Use the `+` / `-` steppers to modify ICU or General bed capacity.
2. Open the **Blood Bank Inventory** tab: Show the 8 blood groups (A+, B+, O-, etc.). Increment or decrement units and click **Save & Publish Readiness**.

### Step 5: Patient Medical History Lookup (`/hospital/patients`)
1. In the search bar, search for `UHID-2026-0041` or `Ramesh`.
2. Show the instant medical profile:
   - **Known Drug Allergies** (e.g. *Penicillin, Sulfa Drugs* in red warning badges). Explain that this prevents the ER doctor from administering contraindicated medications before the patient arrives.
   - Chronic conditions (*Hypertension, Type 2 Diabetes*).
   - Past emergency timeline.

### Step 6: Central Admin Governance Console (`/admin`)
1. Click **"Switch to Admin ➔"** in the top navigation bar.
2. Review the **System KPIs**: Total registered hospitals, fleet availability, and average emergency response time.
3. Navigate to **Hospital Registry (`/admin/registry`)**: Show how new hospitals are onboarded.
4. Navigate to **Ambulance Fleet (`/admin/ambulances`)**: Explain the difference between **ALS** (Advanced Life Support) and **BLS** (Basic Life Support) vehicles.
5. Navigate to **User Management & RBAC (`/admin/users`)**: Change user roles via the dropdown and toggle account activation (*Active* / *Deactivated*).
6. Navigate to **Security Audit Logs (`/admin/audit`)**: Show the chronological audit trail proving every bed reservation and role modification is tracked.

---

## 5. Top 10 Faculty Viva Questions & Model Answers

### Q1: What is a Patient Requirement Profile (PRP)?
**Answer:** A PRP is a standardized clinical payload compiled while the patient is in transit. Instead of the hospital receiving just an ambulance arrival notice, the PRP contains the suspected condition, required bed tier (ICU vs General), specialized equipment (ventilator/defibrillator), blood units required, and live vital signs.

### Q2: How does Role-Based Access Control (RBAC) work in your application?
**Answer:** In [server/models/User.js](file:///d:/CSE_sem_5/FSD/medilink-emergency-care-os/server/models/User.js), users have an assigned `role` enum (`Hospital`, `Admin`, `EMT`, `Dispatcher`). On the backend, our `authMiddleware.js` uses an `authorize(...roles)` function to verify that only authorized roles can invoke sensitive endpoints (e.g., only Admin can modify user roles or onboard hospitals).

### Q3: How do you prevent two patients from reserving the same ICU bed simultaneously?
**Answer:** In [server/controllers/hospitalController.js](file:///d:/CSE_sem_5/FSD/medilink-emergency-care-os/server/controllers/hospitalController.js), the `acceptEmergencyCase` method performs a database check before decrementing `resources.icuBeds.available`. If available beds $\le 0$, the request is rejected with a `400 Bad Request` ("No available ICU beds at this hospital"), preventing double allocation.

### Q4: What password security practices did you implement?
**Answer:** Passwords are never stored in plaintext. In [server/models/User.js](file:///d:/CSE_sem_5/FSD/medilink-emergency-care-os/server/models/User.js), a Mongoose `pre('save')` hook intercepts the password and hashes it using **`bcryptjs`** with a salt factor of 10. During login, `bcrypt.compare()` verifies the user's password without ever decrypting the hash.

### Q5: What is the purpose of the AuditLog collection?
**Answer:** In healthcare and emergency systems, accountability is mandatory. The `AuditLog` collection records every critical state change (who accepted an emergency, which bed was assigned, who updated blood inventory, who modified user roles) along with timestamps.

### Q6: How did you ensure your UI matches your teammate's pages?
**Answer:** I adhered strictly to the unified Tailwind design system configured in [tailwind.config.js](file:///d:/CSE_sem_5/FSD/medilink-emergency-care-os/client/tailwind.config.js):
- Canvas background: `bg-theme-bg` (`#f4f4eb`)
- Primary typography and dark cards: `text-theme-dark` / `bg-theme-dark` (`#0a1d37`)
- Emergency / Action accents: `theme-accentYellow` (`#f5df75`) and `theme-accentBlue` (`#a9d6d5`)
- Card radii: `rounded-2xl` and `rounded-3xl` with clean 1px borders (`border-theme-dark/10`).

### Q7: What is the difference between ALS and BLS ambulances?
**Answer:**
- **ALS (Advanced Life Support):** Equipped with advanced airway equipment, mechanical ventilators, cardiac monitors, and defibrillators; staffed by certified paramedics for critical cases (STEMI, major trauma).
- **BLS (Basic Life Support):** Equipped with oxygen, stretchers, and basic first aid for non-life-threatening or stable transport.

### Q8: What REST API methods did you use and why?
**Answer:**
- **GET:** For idempotent reads (fetching dashboard metrics, searching patient UHIDs, retrieving audit logs).
- **POST:** For creating new entities (onboarding hospitals, registering ambulances, triggering simulations, accepting emergency bed reservations).
- **PUT:** For updating existing records (modifying blood inventory, toggling ER readiness status, changing user roles).

### Q9: Why did you build the Emergency Simulator?
**Answer:** In a distributed multi-role system, testing the receiving hospital's triage desk normally requires an EMT in a moving vehicle. The simulator allows instructors and evaluators to trigger realistic in-transit emergency packets on demand, ensuring 100% testability and demonstration readiness.

### Q10: How can this system scale in production?
**Answer:**
1. **WebSockets / Socket.IO:** For pushing sub-second GPS coordinates and vital sign spikes directly to the hospital screen without polling.
2. **Redis Caching:** For caching hospital bed availability counters and nearby ambulance locations to handle high-frequency queries.
3. **MongoDB Sharding:** Sharding the `emergencies` and `auditlogs` collections by geographic region or date.
