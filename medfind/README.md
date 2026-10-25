# MedFind: Medicine Availability Network

MedFind is a decentralized medicine availability and verification network connecting patients with local participating pharmacies. Patients can search for medicines by brand or generic name, check real-time stock levels, view nearby pharmacies with accurate timestamps and travel distances, discover bioequivalent generic substitutes, and receive instant restock alerts. Participating pharmacies can manage their stock in real time, add new medicines, and publish availability.

---

## 🌟 Key Features

### 1. 🔍 Medicine Search & Availability Network
- **Instant Search**: Search across 48+ medicines and 350+ live listings by brand name (*Crocin 500*, *Augmentin 625*, *Pantop 40*), active generic salt (*Paracetamol*, *Amoxicillin + Clavulanic Acid*, *Atorvastatin*), or therapeutic category.
- **Real-time Stock Indicators**: High-contrast badges for **In Stock** (with exact available count), **Low Stock** (e.g. < 10 units), and **Out of Stock**.
- **Freshness Timestamps & Warnings**: Shows when the pharmacy last updated stock (e.g., `12m ago`, `2h ago`). Automatically flags listings older than 24 hours (⚠️ *Possibly outdated*) or older than 72 hours (⚠️ *Needs verification*).
- **Stock Audit History**: Click *"Stock History"* on any pharmacy card to view an immutable timeline log of past updates, quantity shifts, and status changes.
- **Smart Generic Alternatives**: Automatically detects medicines sharing the same active molecule/chemical composition. Displays one-click chips showing availability counts across other stores (e.g., searching *Crocin 500* suggests *Dolo 650*, *Calpol 500*, and *Pacimol 500*).

### 2. 🏥 Pharmacy Directory & Inventory Explorer (**NEW FEATURE**)
- **Dedicated Pharmacy Directory**: Search participating pharmacies by name, city neighborhood, or street address.
- **Filter by Attributes**: Filter by *Open 24/7*, *Home Delivery Available*, or *Verified Partners Only*.
- **Live Pharmacy Inventory Inspector**: Click any pharmacy to open its full profile and explore every medicine in its inventory.
- **Inventory Filters**: Search within the selected pharmacy's inventory by medicine name or generic salt, filter by category, or filter by stock status (In Stock / Low / Out).
- **Network Cross-Check**: Click *"Compare & Alternatives"* on any row to immediately see availability for that medicine across all other pharmacies in the network.

### 3. 🔔 Restock Watchlist & Instant Notifications
- Subscribe with an email on any medicine page (*"Notify me when restocked"*).
- Whenever a pharmacy updates their stock to **In Stock** in the portal, an alert triggers in real time.
- View active watches and restock notices under the **My Alerts** tab.

### 4. 💼 Participating Pharmacy Portal
- **Quick Demo Switcher**: Instant one-click login for 12 demo pharmacies (`demo1@medfind.test` to `demo12@medfind.test`, password `demo1234`).
- **Live Stock Management**: Search and filter your pharmacy's inventory, update stock status, available quantities, prices (₹), and pharmacist notes.
- **Add New Medicine**: Register new medicine formulations into the network catalogue with brand name, active salt, dosage form, strength, and prescription requirement.
- **Verification Guard**: Restricts publishing for unverified pharmacies until approved by an administrator.

### 5. 🛡️ Admin Verification Portal
- Protected with administrator access key: `admin123`.
- Network KPI overview: Total pharmacies, verified partners, pending approvals, active listings, and alert statistics.
- One-click **Approve Partner** / **Revoke** verification for registered pharmacies.

### 6. 📍 Geolocation & Distance Calculation
- Toggle between predefined city areas (*Downtown*, *South District*, *West Sector*, *East Enclave*, *North Campus*) or click **📍 Use GPS** for browser device geolocation.
- Uses the Haversine formula to compute and display driving distances (`0.8 km away`) and travel times.

---

## 🚀 How to Run

### Option A: Double-Click (Zero Setup)
Simply open [`index.html`](file:///C:/Users/Navaansh/.gemini/antigravity/scratch/medfind/index.html) directly in any web browser (Chrome, Edge, Firefox, Safari).

### Option B: Local PowerShell Server
Open PowerShell in this folder and run:
```powershell
.\start-server.ps1
```
This launches a lightweight HTTP server on `http://localhost:3000` and automatically opens your default browser.

---

## 📋 Demo Credentials

| Role | Email / Identifier | Password / Key |
| :--- | :--- | :--- |
| **Pharmacy 1 (Downtown 24/7)** | `demo1@medfind.test` | `demo1234` |
| **Pharmacy 2 (Green Cross)** | `demo2@medfind.test` | `demo1234` |
| **Pharmacy 3 (CityCare)** | `demo3@medfind.test` | `demo1234` |
| **Pharmacies 4 to 12** | `demo4@medfind.test` to `demo12@medfind.test` | `demo1234` |
| **Admin Portal** | Administrator | `admin123` |
| **Sample Alert User** | `patient.demo@gmail.com` | N/A |

---

## 📁 File Structure
```
medfind/
├── index.html          # Main application interface and modal dialogs
├── css/
│   └── styles.css      # Modern responsive styling, badge states, layouts
├── js/
│   ├── data.js         # Seed data (12+ pharmacies, 48 medicines, 350+ listings)
│   ├── store.js        # State management, localStorage persistence, alerts engine
│   └── app.js          # UI controller, search logic, pharmacy directory & inventory viewer
├── start-server.ps1    # Zero-dependency PowerShell HTTP server script
└── README.md           # Documentation and user guide
```
