/**
 * MedFind Store & State Manager
 * Handles local persistence, stock updates, restock notification dispatch,
 * geo-distance calculations, and reactive event listeners.
 */

class MedFindStore {
  constructor() {
    this.STORAGE_KEY = 'medfind_network_state_v1';
    this.currentUserLocation = null;
    this.currentPharmacyUser = null;
    this.listeners = [];
    this.init();
  }

  init() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
      } else {
        this.resetToDefaults();
      }
    } catch (e) {
      console.warn('Failed to load from localStorage, resetting to seed data', e);
      this.resetToDefaults();
    }

    // Default active user location to Downtown
    const defaultLoc = this.state.userLocations[0];
    this.currentUserLocation = {
      lat: defaultLoc.lat,
      lng: defaultLoc.lng,
      name: defaultLoc.name,
      isGps: false
    };

    // Check if there is an active logged-in pharmacy in session
    const savedLogin = sessionStorage.getItem('medfind_active_pharmacy_id');
    if (savedLogin) {
      this.currentPharmacyUser = this.getPharmacyById(savedLogin);
    }
  }

  resetToDefaults() {
    this.state = {
      pharmacies: JSON.parse(JSON.stringify(SEED_DATA.pharmacies)),
      medicines: JSON.parse(JSON.stringify(SEED_DATA.medicines)),
      listings: JSON.parse(JSON.stringify(SEED_DATA.listings)),
      alerts: JSON.parse(JSON.stringify(SEED_DATA.initialAlerts)),
      userLocations: JSON.parse(JSON.stringify(SEED_DATA.userLocations)),
      categories: [...SEED_DATA.categories],
      lastSaved: new Date().toISOString()
    };
    this.saveState();
    this.notify('DATA_RESET');
  }

  saveState() {
    try {
      this.state.lastSaved = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Could not save to localStorage', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, payload = {}) {
    this.listeners.forEach(fn => {
      try {
        fn(event, payload);
      } catch (err) {
        console.error('Listener error', err);
      }
    });
  }

  // --- Location & Haversine Distance ---
  setUserLocation(lat, lng, name, isGps = false) {
    this.currentUserLocation = { lat, lng, name, isGps };
    this.notify('LOCATION_CHANGED', this.currentUserLocation);
  }

  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of Earth in KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10; // Round to 1 decimal place
  }

  getPharmacyDistance(pharmacy) {
    if (!this.currentUserLocation || !pharmacy.lat || !pharmacy.lng) return null;
    return this.calculateDistanceKm(
      this.currentUserLocation.lat,
      this.currentUserLocation.lng,
      pharmacy.lat,
      pharmacy.lng
    );
  }

  // --- Medicines & Listings Retrieval ---
  getMedicines() {
    return this.state.medicines || [];
  }

  getMedicineById(medId) {
    return (this.state.medicines || []).find(m => m.id === medId) || null;
  }

  getPharmacies() {
    return this.state.pharmacies || [];
  }

  getPharmacyById(pharmId) {
    return (this.state.pharmacies || []).find(p => p.id === pharmId) || null;
  }

  getListings() {
    return this.state.listings || [];
  }

  // Find all listings for a specific medicine across all verified pharmacies
  getListingsForMedicine(medId) {
    const rawListings = (this.state.listings || []).filter(l => l.medicineId === medId);
    
    return rawListings
      .map(listing => {
        const pharmacy = this.getPharmacyById(listing.pharmacyId);
        if (!pharmacy) return null;
        const distance = this.getPharmacyDistance(pharmacy);
        return {
          ...listing,
          pharmacy,
          distance
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Sort verified pharmacies: In-stock first, then lowest distance
        const stockPriority = { in_stock: 1, low_stock: 2, out_of_stock: 3 };
        const pDiff = (stockPriority[a.status] || 9) - (stockPriority[b.status] || 9);
        if (pDiff !== 0) return pDiff;
        if (a.distance != null && b.distance != null) return a.distance - b.distance;
        return 0;
      });
  }

  // NEW FEATURE: Search for a pharmacy and check all medicines there
  getListingsForPharmacy(pharmacyId, searchQuery = '', category = 'All Categories', stockFilter = 'all') {
    const pharmacy = this.getPharmacyById(pharmacyId);
    if (!pharmacy) return [];

    const rawListings = (this.state.listings || []).filter(l => l.pharmacyId === pharmacyId);

    const queryLower = (searchQuery || '').trim().toLowerCase();

    return rawListings
      .map(listing => {
        const medicine = this.getMedicineById(listing.medicineId);
        if (!medicine) return null;
        return {
          ...listing,
          medicine,
          pharmacy
        };
      })
      .filter(item => {
        if (!item) return false;
        
        // Category filter
        if (category && category !== 'All Categories' && item.medicine.category !== category) {
          return false;
        }

        // Stock filter
        if (stockFilter === 'in_stock' && item.status !== 'in_stock') return false;
        if (stockFilter === 'low_stock' && item.status !== 'low_stock') return false;
        if (stockFilter === 'out_of_stock' && item.status !== 'out_of_stock') return false;

        // Search query filter (matches brand name, generic name, strength, category)
        if (queryLower) {
          const matchBrand = item.medicine.brandName.toLowerCase().includes(queryLower);
          const matchGeneric = item.medicine.genericName.toLowerCase().includes(queryLower);
          const matchCat = item.medicine.category.toLowerCase().includes(queryLower);
          const matchDesc = (item.medicine.description || '').toLowerCase().includes(queryLower);
          return matchBrand || matchGeneric || matchCat || matchDesc;
        }

        return true;
      })
      .sort((a, b) => {
        const stockPriority = { in_stock: 1, low_stock: 2, out_of_stock: 3 };
        const pDiff = (stockPriority[a.status] || 9) - (stockPriority[b.status] || 9);
        if (pDiff !== 0) return pDiff;
        return a.medicine.brandName.localeCompare(b.medicine.brandName);
      });
  }

  // Get smart alternatives with availability count across the network
  getAlternativesForMedicine(medId) {
    const med = this.getMedicineById(medId);
    if (!med) return [];

    let altIds = [...(med.alternatives || [])];

    // Also find any medicine that shares the generic active compound
    this.state.medicines.forEach(m => {
      if (m.id !== medId && m.genericName.toLowerCase() === med.genericName.toLowerCase()) {
        if (!altIds.includes(m.id)) {
          altIds.push(m.id);
        }
      }
    });

    return altIds
      .map(id => this.getMedicineById(id))
      .filter(Boolean)
      .map(altMed => {
        // Calculate how many pharmacies have this alternative in stock
        const listings = this.getListingsForMedicine(altMed.id);
        const inStockCount = listings.filter(l => l.status === 'in_stock').length;
        const lowStockCount = listings.filter(l => l.status === 'low_stock').length;
        const bestPrice = listings.length > 0 ? Math.min(...listings.map(l => l.price)) : null;

        return {
          medicine: altMed,
          inStockCount,
          lowStockCount,
          totalListings: listings.length,
          bestPrice
        };
      });
  }

  // --- Stock Update & Restock Alerts Dispatch ---
  updateListingStock(pharmacyId, medicineId, { status, quantity, price, notes }) {
    const pharmacy = this.getPharmacyById(pharmacyId);
    if (!pharmacy) throw new Error('Pharmacy not found');
    if (!pharmacy.verified) {
      throw new Error('This pharmacy is pending verification by an administrator. Stock cannot be published until approved.');
    }

    const medicine = this.getMedicineById(medicineId);
    if (!medicine) throw new Error('Medicine not found');

    let listing = this.state.listings.find(
      l => l.pharmacyId === pharmacyId && l.medicineId === medicineId
    );

    const oldStatus = listing ? listing.status : null;
    const nowIso = new Date().toISOString();

    if (!listing) {
      listing = {
        id: `list-${pharmacyId}-${medicineId}`,
        pharmacyId,
        medicineId,
        status,
        quantity: parseInt(quantity, 10) || 0,
        price: parseFloat(price) || 50,
        batchNo: `B${Math.floor(Math.random() * 90000 + 10000)}`,
        updatedAt: nowIso,
        notes: notes || 'Updated via portal',
        history: []
      };
      this.state.listings.push(listing);
    } else {
      listing.status = status;
      listing.quantity = parseInt(quantity, 10) || 0;
      if (price !== undefined) listing.price = parseFloat(price);
      if (notes !== undefined) listing.notes = notes;
      listing.updatedAt = nowIso;
      if (!listing.history) listing.history = [];
    }

    // Append to audit history
    listing.history.unshift({
      timestamp: nowIso,
      status: status,
      quantity: listing.quantity,
      price: listing.price,
      action: oldStatus ? `Status changed from ${oldStatus} to ${status}` : 'Listing created'
    });

    // Check restock alerts
    let triggeredAlerts = 0;
    if (status === 'in_stock' && oldStatus !== 'in_stock') {
      triggeredAlerts = this.dispatchRestockAlerts(medicineId, pharmacy, listing.quantity);
    }

    this.saveState();
    this.notify('STOCK_UPDATED', { listing, pharmacy, medicine, triggeredAlerts });
    return { success: true, listing, triggeredAlerts };
  }

  dispatchRestockAlerts(medicineId, pharmacy, quantity) {
    const medicine = this.getMedicineById(medicineId);
    if (!medicine) return 0;

    let count = 0;
    const nowIso = new Date().toISOString();

    (this.state.alerts || []).forEach(alert => {
      if (alert.medicineId === medicineId && !alert.notified) {
        alert.notified = true;
        alert.notifiedAt = nowIso;
        alert.pharmacyName = pharmacy.name;
        alert.pharmacyId = pharmacy.id;
        alert.message = `${medicine.brandName} (${medicine.genericName}) is now in stock at ${pharmacy.name} (${quantity} units available)!`;
        count++;
      }
    });

    if (count > 0) {
      this.notify('ALERTS_TRIGGERED', { count, medicine, pharmacy });
    }
    return count;
  }

  // --- Add Medicine to Catalogue ---
  addNewMedicine({
    brandName,
    genericName,
    strength,
    category,
    dosageForm,
    rxRequired,
    manufacturer,
    description,
    pharmacyId,
    initialPrice,
    initialQuantity,
    initialStatus
  }) {
    // Generate new unique ID
    const newId = `med-${Date.now()}`;
    const newMed = {
      id: newId,
      brandName: brandName.trim(),
      genericName: genericName.trim(),
      strength: strength.trim(),
      category: category || 'Pain & Fever',
      dosageForm: dosageForm || 'Tablet',
      rxRequired: Boolean(rxRequired),
      manufacturer: manufacturer.trim() || 'Generic Formulations',
      description: description.trim() || 'Recently registered medicine formulation in the network.',
      alternatives: []
    };

    // Automatically link alternatives with existing medicines of same generic name
    this.state.medicines.forEach(existing => {
      if (existing.genericName.toLowerCase() === newMed.genericName.toLowerCase()) {
        if (!newMed.alternatives.includes(existing.id)) newMed.alternatives.push(existing.id);
        if (!existing.alternatives.includes(newId)) existing.alternatives.push(newId);
      }
    });

    this.state.medicines.push(newMed);

    // If a pharmacy added this, also create their listing
    if (pharmacyId) {
      const nowIso = new Date().toISOString();
      const listing = {
        id: `list-${pharmacyId}-${newId}`,
        pharmacyId,
        medicineId: newId,
        status: initialStatus || 'in_stock',
        quantity: parseInt(initialQuantity, 10) || 20,
        price: parseFloat(initialPrice) || 45,
        batchNo: `B${Math.floor(Math.random() * 90000 + 10000)}`,
        updatedAt: nowIso,
        notes: 'Published when adding new medicine',
        history: [
          {
            timestamp: nowIso,
            status: initialStatus || 'in_stock',
            quantity: parseInt(initialQuantity, 10) || 20,
            price: parseFloat(initialPrice) || 45,
            action: 'Medicine registered & added to pharmacy catalogue'
          }
        ]
      };
      this.state.listings.push(listing);
    }

    this.saveState();
    this.notify('MEDICINE_ADDED', newMed);
    return newMed;
  }

  // --- Pharmacy Registration & Admin Verification ---
  registerPharmacy({
    name,
    email,
    phone,
    address,
    area,
    hours,
    is24x7,
    licenseNo,
    homeDelivery,
    pharmacistName
  }) {
    const existing = this.state.pharmacies.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('A pharmacy with this email is already registered.');
    }

    const newId = `pharm-${Date.now()}`;
    // Assign coordinates near the selected area or random offset in Delhi/NCR
    let lat = 28.6328;
    let lng = 77.2197;
    const locMatch = this.state.userLocations.find(l => l.name === area);
    if (locMatch) {
      lat = locMatch.lat + (Math.random() - 0.5) * 0.015;
      lng = locMatch.lng + (Math.random() - 0.5) * 0.015;
    }

    const newPharmacy = {
      id: newId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      area: area || 'Downtown / Central Market',
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
      hours: is24x7 ? 'Open 24/7' : (hours || '9:00 AM - 10:00 PM'),
      is24x7: Boolean(is24x7),
      licenseNo: licenseNo.trim(),
      rating: 0,
      reviewsCount: 0,
      verified: false, // Must be verified by admin
      registeredAt: new Date().toISOString(),
      homeDelivery: Boolean(homeDelivery),
      pharmacistName: pharmacistName.trim()
    };

    this.state.pharmacies.push(newPharmacy);
    this.saveState();
    this.notify('PHARMACY_REGISTERED', newPharmacy);
    return newPharmacy;
  }

  setPharmacyVerification(pharmacyId, verified) {
    const pharm = this.getPharmacyById(pharmacyId);
    if (!pharm) throw new Error('Pharmacy not found');

    pharm.verified = Boolean(verified);
    this.saveState();
    this.notify('PHARMACY_VERIFIED', pharm);
    return pharm;
  }

  // --- Restock Alerts Subscription ---
  subscribeAlert(email, medicineId) {
    if (!email || !email.includes('@')) throw new Error('Valid email address required');
    const medicine = this.getMedicineById(medicineId);
    if (!medicine) throw new Error('Medicine not found');

    const cleanEmail = email.trim().toLowerCase();

    // Check if duplicate alert already pending
    const existing = (this.state.alerts || []).find(
      a => a.userEmail === cleanEmail && a.medicineId === medicineId && !a.notified
    );

    if (existing) {
      return { success: true, message: 'You are already subscribed to alerts for this medicine.', alert: existing };
    }

    const newAlert = {
      id: `alert-${Date.now()}`,
      userEmail: cleanEmail,
      medicineId,
      createdAt: new Date().toISOString(),
      notified: false,
      notifiedAt: null,
      pharmacyName: null,
      message: 'Active watch: Notification will trigger when restocked.'
    };

    this.state.alerts.unshift(newAlert);
    this.saveState();
    this.notify('ALERT_SUBSCRIBED', newAlert);
    return { success: true, message: `Subscribed! You will be notified when ${medicine.brandName} is back in stock.`, alert: newAlert };
  }

  getUserAlerts(email) {
    if (!email) return [];
    const cleanEmail = email.trim().toLowerCase();
    return (this.state.alerts || [])
      .filter(a => a.userEmail === cleanEmail)
      .map(a => {
        const medicine = this.getMedicineById(a.medicineId);
        return {
          ...a,
          medicine
        };
      });
  }

  // --- Auth & Session Simulation ---
  loginPharmacy(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const pharmacy = this.state.pharmacies.find(p => p.email.toLowerCase() === cleanEmail);

    if (!pharmacy) {
      throw new Error('No pharmacy registered with this email.');
    }

    if (password !== 'demo1234') {
      throw new Error('Invalid password. Demo password is "demo1234".');
    }

    this.currentPharmacyUser = pharmacy;
    sessionStorage.setItem('medfind_active_pharmacy_id', pharmacy.id);
    this.notify('PHARMACY_LOGGED_IN', pharmacy);
    return pharmacy;
  }

  logoutPharmacy() {
    this.currentPharmacyUser = null;
    sessionStorage.removeItem('medfind_active_pharmacy_id');
    this.notify('PHARMACY_LOGGED_OUT');
  }

  // --- Stats for Admin & Network ---
  getNetworkStats() {
    const pharmacies = this.state.pharmacies || [];
    const verifiedPharmacies = pharmacies.filter(p => p.verified);
    const listings = this.state.listings || [];
    const inStockListings = listings.filter(l => l.status === 'in_stock');
    const lowStockListings = listings.filter(l => l.status === 'low_stock');
    const outOfStockListings = listings.filter(l => l.status === 'out_of_stock');
    const alerts = this.state.alerts || [];
    const activeAlerts = alerts.filter(a => !a.notified);
    const triggeredAlerts = alerts.filter(a => a.notified);

    return {
      totalPharmacies: pharmacies.length,
      verifiedCount: verifiedPharmacies.length,
      pendingCount: pharmacies.length - verifiedPharmacies.length,
      totalMedicines: (this.state.medicines || []).length,
      totalListings: listings.length,
      inStockListingsCount: inStockListings.length,
      lowStockListingsCount: lowStockListings.length,
      outOfStockListingsCount: outOfStockListings.length,
      totalAlerts: alerts.length,
      activeAlertsCount: activeAlerts.length,
      triggeredAlertsCount: triggeredAlerts.length
    };
  }
}

// Global store instance
window.store = new MedFindStore();
