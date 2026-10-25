/**
 * MedFind - Main Application Controller
 * Handles UI events, navigation, search filtering, pharmacy directory & inventory viewer,
 * alerts management, pharmacy portal operations and admin verification.
 */

(function () {
  'use strict';

  // --- State Variables ---
  let activeTab = 'search';
  let activeCategory = 'All Categories';
  let activeStockFilter = 'all'; // 'all' | 'in_stock_only'
  let selectedMedicineId = null;
  let selectedPharmacyId = null;

  // Pharmacy directory specific filters
  let pharmacySearchQuery = '';
  let pharmacyFilterType = 'all'; // 'all' | '24x7' | 'delivery' | 'verified'
  let pharmacyInventorySearch = '';
  let pharmacyInventoryCategory = 'All Categories';
  let pharmacyInventoryStock = 'all';

  // Admin access state
  let isAdminAuthenticated = false;

  // --- Helper: Format Relative Time ---
  function formatRelativeTime(isoString) {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((now - date) / 1000));

    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  function getFreshnessWarning(isoString) {
    if (!isoString) return null;
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 3600);

    if (diffHours >= 72) {
      return {
        severe: true,
        text: 'Needs pharmacy verification (>72h since last update)'
      };
    } else if (diffHours >= 24) {
      return {
        severe: false,
        text: 'Possibly outdated (>24h since last update)'
      };
    }
    return null;
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : (type === 'alert' ? 'toast-alert' : '')}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'alert') icon = '🔔';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // --- Tab Navigation ---
  function switchTab(tabName) {
    activeTab = tabName;
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });

    // Render corresponding view
    if (tabName === 'search') {
      renderSearchView();
    } else if (tabName === 'pharmacies') {
      renderPharmaciesView();
    } else if (tabName === 'alerts') {
      renderAlertsView();
    } else if (tabName === 'portal') {
      renderPortalView();
    } else if (tabName === 'admin') {
      renderAdminView();
    }
  }

  // --- Location Management ---
  function initLocationSelector() {
    const select = document.getElementById('locationSelect');
    const gpsBtn = document.getElementById('gpsBtn');
    if (!select) return;

    const locations = window.store.state.userLocations || [];
    select.innerHTML = locations
      .map(loc => `<option value="${loc.id}">${loc.name}</option>`)
      .join('');

    select.addEventListener('change', (e) => {
      const selected = locations.find(l => l.id === e.target.value);
      if (selected) {
        window.store.setUserLocation(selected.lat, selected.lng, selected.name, false);
        showToast(`Location set to ${selected.name}`);
      }
    });

    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          showToast('Geolocation is not supported by your browser.', 'alert');
          return;
        }

        gpsBtn.textContent = 'Locating...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            gpsBtn.textContent = '📍 GPS Active';
            window.store.setUserLocation(
              pos.coords.latitude,
              pos.coords.longitude,
              'My Current Location (GPS)',
              true
            );
            showToast('Using your current GPS location for pharmacy distances!', 'success');
          },
          (err) => {
            gpsBtn.textContent = '📍 Use GPS';
            console.warn('GPS location error:', err);
            showToast('Location permission denied or unavailable. Using selected area.', 'info');
          },
          { timeout: 8000 }
        );
      });
    }
  }

  // ==========================================================================
  // TAB 1: FIND MEDICINE
  // ==========================================================================
  function initSearchControls() {
    const searchInput = document.getElementById('mainSearchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    const chipsContainer = document.getElementById('categoryChips');
    const stockFilterToggle = document.getElementById('stockFilterToggle');

    // Populate category filter chips
    if (chipsContainer) {
      chipsContainer.innerHTML = window.store.state.categories
        .map(cat => `
          <button class="filter-chip ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
            ${cat}
          </button>
        `)
        .join('');

      chipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        activeCategory = chip.dataset.category;
        document.querySelectorAll('#categoryChips .filter-chip').forEach(c => {
          c.classList.toggle('active', c.dataset.category === activeCategory);
        });
        renderSearchView();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (searchInput.value.trim().length > 0) {
          clearBtn.style.display = 'flex';
        } else {
          clearBtn.style.display = 'none';
        }
        renderSearchView();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        selectedMedicineId = null;
        renderSearchView();
      });
    }

    if (stockFilterToggle) {
      stockFilterToggle.addEventListener('change', (e) => {
        activeStockFilter = e.target.checked ? 'in_stock_only' : 'all';
        renderSearchView();
      });
    }

    // Quick suggestion pills
    document.querySelectorAll('.suggest-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const term = e.target.dataset.search;
        if (term && searchInput) {
          searchInput.value = term;
          clearBtn.style.display = 'flex';
          renderSearchView();
        }
      });
    });
  }

  function renderSearchView() {
    const searchInput = document.getElementById('mainSearchInput');
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const resultsContainer = document.getElementById('searchResultsContainer');
    if (!resultsContainer) return;

    const medicines = window.store.getMedicines();

    // If a specific medicine is selected or exact match found
    let matchedMed = null;
    if (selectedMedicineId) {
      matchedMed = window.store.getMedicineById(selectedMedicineId);
    } else if (query.length > 0) {
      matchedMed = medicines.find(
        m => m.brandName.toLowerCase() === query || m.genericName.toLowerCase() === query
      );
    }

    // If we have a selected or explicitly matched medicine, show its detailed view with availability
    if (matchedMed) {
      renderMedicineDetailedView(matchedMed, resultsContainer);
      return;
    }

    // Otherwise show filtered catalog list
    let filtered = medicines.filter(m => {
      // Category filter
      if (activeCategory !== 'All Categories' && m.category !== activeCategory) {
        return false;
      }
      // Query filter
      if (query.length > 0) {
        const matchBrand = m.brandName.toLowerCase().includes(query);
        const matchGeneric = m.genericName.toLowerCase().includes(query);
        const matchDesc = (m.description || '').toLowerCase().includes(query);
        return matchBrand || matchGeneric || matchDesc;
      }
      return true;
    });

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">No medicines found matching "${query}"</h3>
          <p class="empty-text">Try searching for the active generic name (e.g., "Paracetamol", "Amoxicillin"), or check your spelling.</p>
          <button class="btn-primary" id="resetSearchBtn">Browse All Medicines</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetSearchBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          activeCategory = 'All Categories';
          document.querySelectorAll('#categoryChips .filter-chip').forEach(c => {
            c.classList.toggle('active', c.dataset.category === 'All Categories');
          });
          renderSearchView();
        });
      }
      return;
    }

    // Render medicines summary cards
    resultsContainer.innerHTML = `
      <div class="section-subheading">
        <span>Found <strong>${filtered.length}</strong> medicines across network</span>
        <span style="font-size: 0.85rem; font-weight: 500; color: var(--neutral-500)">
          Showing availability across 12 participating pharmacies
        </span>
      </div>
      <div class="listings-grid">
        ${filtered.map(med => {
          const listings = window.store.getListingsForMedicine(med.id);
          const inStockPharmacies = listings.filter(l => l.status === 'in_stock');
          const lowStockPharmacies = listings.filter(l => l.status === 'low_stock');
          const bestPrice = listings.length > 0 ? Math.min(...listings.map(l => l.price)) : null;

          return `
            <div class="pharmacy-card" style="cursor: pointer" data-med-id="${med.id}">
              <div>
                <div class="card-top-row">
                  <div>
                    <h3 class="card-pharm-name" style="color: var(--primary); font-size: 1.2rem">${med.brandName}</h3>
                    <div style="font-size: 0.85rem; color: var(--neutral-600); font-weight: 500">${med.genericName} • ${med.strength}</div>
                  </div>
                  <span class="badge ${med.rxRequired ? 'badge-rx' : 'badge-otc'}">${med.rxRequired ? 'Rx Required' : 'OTC'}</span>
                </div>
                <p style="font-size: 0.825rem; color: var(--neutral-600); margin: 0.5rem 0 0.85rem; line-height: 1.4">
                  ${med.description}
                </p>
                <div class="card-info-pills">
                  <span class="info-tag badge-category">${med.category}</span>
                  <span class="info-tag badge-form">${med.dosageForm}</span>
                  ${bestPrice ? `<span class="info-tag" style="background: #eef2ff; color: #3730a3; font-weight: 700">From ₹${bestPrice}</span>` : ''}
                </div>
              </div>
              <div class="card-footer">
                <div>
                  ${inStockPharmacies.length > 0 ? `
                    <span class="stock-pill in_stock" style="font-size: 0.7rem">
                      🟢 In stock at ${inStockPharmacies.length} pharmacies
                    </span>
                  ` : (lowStockPharmacies.length > 0 ? `
                    <span class="stock-pill low_stock" style="font-size: 0.7rem">
                      🟡 Low stock at ${lowStockPharmacies.length} pharmacies
                    </span>
                  ` : `
                    <span class="stock-pill out_of_stock" style="font-size: 0.7rem">
                      🔴 Currently out of stock
                    </span>
                  `)}
                </div>
                <button class="btn-outline-sm view-med-btn" data-med-id="${med.id}">
                  Check Stock & Stores →
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Click on card to view detailed availability
    resultsContainer.querySelectorAll('[data-med-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.dataset.medId;
        selectedMedicineId = id;
        renderSearchView();
      });
    });
  }

  function renderMedicineDetailedView(med, container) {
    const listings = window.store.getListingsForMedicine(med.id);
    const alternatives = window.store.getAlternativesForMedicine(med.id);

    // Apply in-stock filter if toggled
    const filteredListings = activeStockFilter === 'in_stock_only'
      ? listings.filter(l => l.status === 'in_stock' || l.status === 'low_stock')
      : listings;

    const inStockCount = listings.filter(l => l.status === 'in_stock').length;

    container.innerHTML = `
      <!-- Back Button -->
      <div style="margin-bottom: 1rem">
        <button class="btn-ghost-sm" id="backToCatalogBtn" style="display: inline-flex; align-items: center; gap: 0.35rem">
          ← Back to All Medicines
        </button>
      </div>

      <!-- Medicine Details Banner -->
      <div class="medicine-detail-banner">
        <div class="medicine-meta-top">
          <div>
            <h2 class="med-brand-title">${med.brandName}</h2>
            <div class="med-generic-subtitle">
              Generic Formula: <strong>${med.genericName}</strong> (${med.strength})
            </div>
          </div>
          <div class="med-badges">
            <span class="badge ${med.rxRequired ? 'badge-rx' : 'badge-otc'}">
              ${med.rxRequired ? 'Rx Prescription Required' : 'Over the Counter (OTC)'}
            </span>
            <span class="badge badge-category">${med.category}</span>
            <span class="badge badge-form">${med.dosageForm}</span>
          </div>
        </div>

        <p class="medicine-desc">
          ${med.description} <em>Manufacturer: ${med.manufacturer}</em>
        </p>

        <!-- Smart Alternatives Box -->
        ${alternatives.length > 0 ? `
          <div class="alternatives-container">
            <div class="alternatives-header">
              <span>✨</span>
              <span>Available Generic Substitutes & Equivalent Brands (Same Active Molecule):</span>
            </div>
            <div class="alternatives-chips-list">
              ${alternatives.map(alt => `
                <div class="alt-chip" data-alt-id="${alt.medicine.id}">
                  <span class="alt-name">${alt.medicine.brandName}</span>
                  <span style="font-size: 0.75rem; color: var(--neutral-500)">(${alt.medicine.strength})</span>
                  ${alt.inStockCount > 0 ? `
                    <span class="alt-stock-indicator alt-stock-in">${alt.inStockCount} in stock</span>
                  ` : `
                    <span class="alt-stock-indicator alt-stock-none">Out of stock</span>
                  `}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Restock Alert Subscription Box -->
        <div class="alert-subscribe-bar">
          <div class="alert-text-group">
            <span style="font-size: 1.25rem">🔔</span>
            <div>
              <strong>Get notified when restocked:</strong>
              <div style="font-size: 0.8rem; color: #1e3a8a">Receive an alert immediately when any pharmacy publishes fresh stock.</div>
            </div>
          </div>
          <form class="alert-form" id="restockAlertForm">
            <input
              type="email"
              class="alert-email-input"
              placeholder="Enter your email address"
              required
              id="alertEmailInput"
            />
            <button type="submit" class="alert-submit-btn">Notify Me</button>
          </form>
        </div>
      </div>

      <!-- Participating Pharmacies Stock Cards -->
      <div class="section-subheading">
        <span>Pharmacy Availability (${filteredListings.length} participating stores)</span>
        <span style="font-size: 0.85rem; color: var(--neutral-500)">
          Sorted by In-Stock first, then nearest to your selected area
        </span>
      </div>

      ${filteredListings.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">🏪</div>
          <h3 class="empty-title">No pharmacies currently carry ${med.brandName} with this filter</h3>
          <p class="empty-text">Try unchecking "In Stock Only" or click one of the suggested alternatives above.</p>
        </div>
      ` : `
        <div class="listings-grid">
          ${filteredListings.map(listing => {
            const pharm = listing.pharmacy;
            const freshness = getFreshnessWarning(listing.updatedAt);
            const dist = listing.distance != null ? `${listing.distance} km away` : 'Distance unknown';
            
            return `
              <div class="pharmacy-card">
                <div>
                  <div class="card-top-row">
                    <div>
                      <h4 class="card-pharm-name">
                        ${pharm.name}
                        ${pharm.verified ? '<span class="verified-icon" title="Verified Partner">✓</span>' : ''}
                      </h4>
                      <div class="card-address-block">
                        📍 ${pharm.address}
                      </div>
                    </div>
                    <span class="stock-pill ${listing.status}">
                      ${listing.status === 'in_stock' ? 'In Stock' : (listing.status === 'low_stock' ? 'Low Stock' : 'Out of Stock')}
                    </span>
                  </div>

                  <div class="stock-qty-text">
                    ${listing.status === 'in_stock' ? `📦 ${listing.quantity} units available` : (listing.status === 'low_stock' ? `⚠️ Only ${listing.quantity} units left` : '❌ 0 units available')}
                  </div>

                  <div class="card-info-pills" style="margin-top: 0.65rem">
                    <span class="info-tag info-tag-distance">🚗 ${dist}</span>
                    <span class="info-tag">🕒 ${pharm.hours}</span>
                    <span class="info-tag">📞 ${pharm.phone}</span>
                    <span class="info-tag" style="font-weight: 700; color: #1e293b">₹${listing.price}</span>
                  </div>

                  ${freshness ? `
                    <div class="freshness-warning ${freshness.severe ? 'severe' : ''}">
                      <span>⚠️</span>
                      <span>${freshness.text}</span>
                    </div>
                  ` : ''}

                  ${listing.notes ? `
                    <div style="font-size: 0.775rem; color: var(--neutral-600); background: var(--neutral-50); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); margin-bottom: 0.65rem">
                      💬 Pharmacist note: "${listing.notes}"
                    </div>
                  ` : ''}
                </div>

                <div class="card-footer">
                  <span class="timestamp-text">
                    Updated: ${formatRelativeTime(listing.updatedAt)}
                  </span>
                  <div class="card-action-btns">
                    <button class="btn-outline-sm history-btn" data-pharm-id="${pharm.id}" data-med-id="${med.id}">
                      Stock History
                    </button>
                    <button class="btn-primary-sm view-pharmacy-inv-btn" data-pharm-id="${pharm.id}">
                      Check This Pharmacy →
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    // Event listeners
    const backBtn = document.getElementById('backToCatalogBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        selectedMedicineId = null;
        renderSearchView();
      });
    }

    // Click on alternative chip
    container.querySelectorAll('.alt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        selectedMedicineId = chip.dataset.altId;
        renderSearchView();
      });
    });

    // Stock History modal button
    container.querySelectorAll('.history-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pharmId = btn.dataset.pharmId;
        const medId = btn.dataset.medId;
        openStockHistoryModal(pharmId, medId);
      });
    });

    // View this pharmacy's full inventory button (the requested feature!)
    container.querySelectorAll('.view-pharmacy-inv-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pharmId = btn.dataset.pharmId;
        selectedPharmacyId = pharmId;
        switchTab('pharmacies');
      });
    });

    // Restock alert submission
    const alertForm = document.getElementById('restockAlertForm');
    if (alertForm) {
      alertForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('alertEmailInput').value;
        try {
          const res = window.store.subscribeAlert(email, med.id);
          showToast(res.message, 'success');
          alertForm.reset();
        } catch (err) {
          showToast(err.message, 'alert');
        }
      });
    }
  }

  // ==========================================================================
  // TAB 2: PHARMACIES DIRECTORY & INVENTORY CHECKER (NEW FEATURE)
  // ==========================================================================
  function initPharmaciesControls() {
    const searchInput = document.getElementById('pharmacySearchInput');
    const filterSelect = document.getElementById('pharmacyFilterSelect');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        pharmacySearchQuery = e.target.value;
        renderPharmaciesList();
      });
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        pharmacyFilterType = e.target.value;
        renderPharmaciesList();
      });
    }
  }

  function renderPharmaciesView() {
    initPharmaciesControls();
    
    // Default to the first pharmacy if none selected
    if (!selectedPharmacyId) {
      const pharmacies = window.store.getPharmacies();
      if (pharmacies.length > 0) {
        selectedPharmacyId = pharmacies[0].id;
      }
    }

    renderPharmaciesList();
    renderSelectedPharmacyInventory();
  }

  function renderPharmaciesList() {
    const listContainer = document.getElementById('pharmaciesListContainer');
    if (!listContainer) return;

    let pharmacies = window.store.getPharmacies();
    const query = pharmacySearchQuery.trim().toLowerCase();

    // Filter pharmacies
    let filtered = pharmacies.filter(pharm => {
      // Filter by type
      if (pharmacyFilterType === '24x7' && !pharm.is24x7) return false;
      if (pharmacyFilterType === 'delivery' && !pharm.homeDelivery) return false;
      if (pharmacyFilterType === 'verified' && !pharm.verified) return false;

      // Filter by query (name, area, address, pharmacist)
      if (query) {
        const matchName = pharm.name.toLowerCase().includes(query);
        const matchArea = pharm.area.toLowerCase().includes(query);
        const matchAddr = pharm.address.toLowerCase().includes(query);
        return matchName || matchArea || matchAddr;
      }

      return true;
    });

    // Enrich with distance and sort nearest first
    filtered = filtered.map(pharm => {
      const distance = window.store.getPharmacyDistance(pharm);
      return { ...pharm, distance };
    }).sort((a, b) => {
      if (a.distance != null && b.distance != null) return a.distance - b.distance;
      return 0;
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--neutral-500); font-size: 0.875rem">
          No pharmacies found matching your criteria.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(pharm => {
      const isSelected = pharm.id === selectedPharmacyId;
      const dist = pharm.distance != null ? `${pharm.distance} km` : 'Near you';
      const listings = window.store.state.listings.filter(l => l.pharmacyId === pharm.id);
      const inStockCount = listings.filter(l => l.status === 'in_stock').length;

      return `
        <div class="pharmacy-list-item ${isSelected ? 'active' : ''}" data-pharmacy-id="${pharm.id}">
          <div class="pli-title">
            <span>${pharm.name}</span>
            ${pharm.verified ? '<span class="verified-icon" title="Verified Partner">✓</span>' : '<span style="font-size: 0.7rem; color: var(--warning)">Pending</span>'}
          </div>
          <div class="pli-address">📍 ${pharm.address}</div>
          <div class="pli-tags">
            <span class="info-tag info-tag-distance">🚗 ${dist}</span>
            <span class="info-tag">${pharm.hours}</span>
            <span class="info-tag" style="background: #e0f2fe; color: #0369a1; font-weight: 600">
              💊 ${inStockCount} in stock
            </span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers to select pharmacy
    listContainer.querySelectorAll('.pharmacy-list-item').forEach(el => {
      el.addEventListener('click', () => {
        selectedPharmacyId = el.dataset.pharmacyId;
        renderPharmaciesList();
        renderSelectedPharmacyInventory();
      });
    });
  }

  function renderSelectedPharmacyInventory() {
    const pane = document.getElementById('pharmacyInventoryPane');
    if (!pane) return;

    if (!selectedPharmacyId) {
      pane.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🏪</div>
          <h3 class="empty-title">Select a Pharmacy</h3>
          <p class="empty-text">Choose a pharmacy from the list on the left to inspect its live medicine inventory and stock levels.</p>
        </div>
      `;
      return;
    }

    const pharmacy = window.store.getPharmacyById(selectedPharmacyId);
    if (!pharmacy) return;

    const distance = window.store.getPharmacyDistance(pharmacy);
    const distText = distance != null ? `${distance} km away from your location` : 'Location verified';

    // Get inventory for this pharmacy
    const inventory = window.store.getListingsForPharmacy(
      pharmacy.id,
      pharmacyInventorySearch,
      pharmacyInventoryCategory,
      pharmacyInventoryStock
    );

    const allPharmacyListings = window.store.state.listings.filter(l => l.pharmacyId === pharmacy.id);
    const inStockTotal = allPharmacyListings.filter(l => l.status === 'in_stock').length;
    const lowStockTotal = allPharmacyListings.filter(l => l.status === 'low_stock').length;
    const outStockTotal = allPharmacyListings.filter(l => l.status === 'out_of_stock').length;

    pane.innerHTML = `
      <div class="pip-header">
        <div class="pip-title-row">
          <div>
            <h2 class="pip-name">
              ${pharmacy.name}
              ${pharmacy.verified ? '<span class="verified-icon" style="font-size: 1.25rem" title="Verified Pharmacy Partner">✓</span>' : ''}
            </h2>
            <div style="font-size: 0.9rem; color: var(--neutral-600); margin-top: 0.25rem">
              📍 ${pharmacy.address} • <strong>${distText}</strong>
            </div>
          </div>
          <div>
            ${pharmacy.verified ? `
              <span class="badge badge-otc" style="font-size: 0.8rem; padding: 0.35rem 0.75rem">
                ✓ Verified Network Partner
              </span>
            ` : `
              <span class="badge badge-rx" style="font-size: 0.8rem; padding: 0.35rem 0.75rem">
                ⚠️ Awaiting Admin Verification
              </span>
            `}
          </div>
        </div>

        <div class="pip-details-grid">
          <div class="pip-detail-item"><strong>📞 Phone:</strong> <a href="tel:${pharmacy.phone}" style="color: var(--primary); text-decoration: none">${pharmacy.phone}</a></div>
          <div class="pip-detail-item"><strong>🕒 Hours:</strong> ${pharmacy.hours}</div>
          <div class="pip-detail-item"><strong>👨‍⚕️ Pharmacist:</strong> ${pharmacy.pharmacistName}</div>
          <div class="pip-detail-item"><strong>📜 License No:</strong> ${pharmacy.licenseNo}</div>
          <div class="pip-detail-item"><strong>🚚 Home Delivery:</strong> ${pharmacy.homeDelivery ? 'Available' : 'Store pickup only'}</div>
          <div class="pip-detail-item"><strong>⭐ Rating:</strong> ${pharmacy.rating > 0 ? `${pharmacy.rating} / 5 (${pharmacy.reviewsCount} reviews)` : 'Newly joined'}</div>
        </div>

        <!-- Inventory Stats -->
        <div style="display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap">
          <div class="kpi-card" style="padding: 0.65rem 1rem; flex: 1">
            <span class="kpi-label">Total Catalogue</span>
            <span style="font-size: 1.25rem; font-weight: 800">${allPharmacyListings.length} medicines</span>
          </div>
          <div class="kpi-card" style="padding: 0.65rem 1rem; flex: 1">
            <span class="kpi-label" style="color: #15803d">In Stock</span>
            <span style="font-size: 1.25rem; font-weight: 800; color: #15803d">${inStockTotal}</span>
          </div>
          <div class="kpi-card" style="padding: 0.65rem 1rem; flex: 1">
            <span class="kpi-label" style="color: #b45309">Low Stock</span>
            <span style="font-size: 1.25rem; font-weight: 800; color: #b45309">${lowStockTotal}</span>
          </div>
          <div class="kpi-card" style="padding: 0.65rem 1rem; flex: 1">
            <span class="kpi-label" style="color: #b91c1c">Out of Stock</span>
            <span style="font-size: 1.25rem; font-weight: 800; color: #b91c1c">${outStockTotal}</span>
          </div>
        </div>
      </div>

      <!-- Inventory Controls inside Pharmacy -->
      <div style="margin-bottom: 1rem">
        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--neutral-900); margin-bottom: 0.75rem">
          Browse Medicines at this Pharmacy (${inventory.length} matches)
        </h3>
        <div class="inventory-controls">
          <input
            type="text"
            class="inv-search-input"
            id="pharmacyInvSearchInput"
            placeholder="Search medicine brand or generic salt at this pharmacy..."
            value="${pharmacyInventorySearch}"
          />
          <select class="pharmacy-filter-select" id="pharmacyInvCategorySelect">
            ${window.store.state.categories.map(c => `
              <option value="${c}" ${c === pharmacyInventoryCategory ? 'selected' : ''}>${c}</option>
            `).join('')}
          </select>
          <select class="pharmacy-filter-select" id="pharmacyInvStockSelect">
            <option value="all" ${pharmacyInventoryStock === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="in_stock" ${pharmacyInventoryStock === 'in_stock' ? 'selected' : ''}>In Stock Only</option>
            <option value="low_stock" ${pharmacyInventoryStock === 'low_stock' ? 'selected' : ''}>Low Stock Only</option>
            <option value="out_of_stock" ${pharmacyInventoryStock === 'out_of_stock' ? 'selected' : ''}>Out of Stock</option>
          </select>
        </div>
      </div>

      <!-- Inventory Table -->
      ${inventory.length === 0 ? `
        <div class="empty-state" style="padding: 2rem">
          <div class="empty-icon">📦</div>
          <h4 class="empty-title">No matching medicines found at ${pharmacy.name}</h4>
          <p class="empty-text">Try resetting filters or searching for another medicine.</p>
        </div>
      ` : `
        <div class="inv-table-wrapper">
          <table class="inv-table">
            <thead>
              <tr>
                <th>Medicine & Formulation</th>
                <th>Category</th>
                <th>Status</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${inventory.map(item => {
                const med = item.medicine;
                const freshness = getFreshnessWarning(item.updatedAt);

                return `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: var(--neutral-900)">${med.brandName}</div>
                      <div style="font-size: 0.8rem; color: var(--neutral-600)">${med.genericName} • ${med.strength}</div>
                      <div style="margin-top: 0.2rem">
                        <span class="badge ${med.rxRequired ? 'badge-rx' : 'badge-otc'}" style="font-size: 0.65rem">
                          ${med.rxRequired ? 'Rx' : 'OTC'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span class="info-tag badge-category" style="font-size: 0.75rem">${med.category}</span>
                    </td>
                    <td>
                      <span class="stock-pill ${item.status}">
                        ${item.status === 'in_stock' ? 'In Stock' : (item.status === 'low_stock' ? 'Low' : 'Out')}
                      </span>
                    </td>
                    <td>
                      <strong style="color: var(--neutral-800)">${item.quantity}</strong>
                      <span style="font-size: 0.75rem; color: var(--neutral-500)">packs</span>
                    </td>
                    <td>
                      <strong style="font-size: 0.95rem; color: var(--neutral-900)">₹${item.price}</strong>
                    </td>
                    <td>
                      <div style="font-size: 0.8rem; color: var(--neutral-600)">${formatRelativeTime(item.updatedAt)}</div>
                      ${freshness ? `<span style="font-size: 0.7rem; color: var(--warning); font-weight: 600">⚠️ >24h</span>` : ''}
                    </td>
                    <td>
                      <div style="display: flex; gap: 0.35rem">
                        <button class="btn-outline-sm view-across-net-btn" data-med-id="${med.id}" title="Compare availability across other pharmacies and see alternatives">
                          Compare & Alternatives
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;

    // Filter input handlers
    const invSearch = document.getElementById('pharmacyInvSearchInput');
    const invCat = document.getElementById('pharmacyInvCategorySelect');
    const invStock = document.getElementById('pharmacyInvStockSelect');

    if (invSearch) {
      invSearch.addEventListener('input', (e) => {
        pharmacyInventorySearch = e.target.value;
        renderSelectedPharmacyInventory();
      });
    }

    if (invCat) {
      invCat.addEventListener('change', (e) => {
        pharmacyInventoryCategory = e.target.value;
        renderSelectedPharmacyInventory();
      });
    }

    if (invStock) {
      invStock.addEventListener('change', (e) => {
        pharmacyInventoryStock = e.target.value;
        renderSelectedPharmacyInventory();
      });
    }

    // View across network button (jump to Find Medicine tab with this medicine)
    pane.querySelectorAll('.view-across-net-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedMedicineId = btn.dataset.medId;
        switchTab('search');
      });
    });
  }

  // ==========================================================================
  // TAB 3: MY ALERTS
  // ==========================================================================
  function renderAlertsView() {
    const container = document.getElementById('tab-alerts');
    if (!container) return;

    const emailInput = document.getElementById('alertsEmailQuery');
    const targetEmail = (emailInput ? emailInput.value : 'patient.demo@gmail.com').trim().toLowerCase();

    const userAlerts = window.store.getUserAlerts(targetEmail);
    const activeAlerts = userAlerts.filter(a => !a.notified);
    const triggeredAlerts = userAlerts.filter(a => a.notified);

    container.innerHTML = `
      <div class="portal-card">
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem">🔔 Restock Alerts & Watchlist</h2>
        <p style="font-size: 0.9rem; color: var(--neutral-600); margin-bottom: 1.25rem">
          Monitor out-of-stock medicines and receive instant restock updates when participating pharmacies publish new inventory.
        </p>

        <div style="display: flex; gap: 0.75rem; align-items: center; max-width: 500px; margin-bottom: 1.5rem">
          <input
            type="email"
            id="alertsEmailQuery"
            class="form-control"
            value="${targetEmail}"
            placeholder="Enter your email to view your alerts"
          />
          <button class="btn-primary" id="refreshAlertsBtn">Search Alerts</button>
        </div>

        <div class="kpi-row">
          <div class="kpi-card">
            <span class="kpi-label">Active Watches</span>
            <span class="kpi-value" style="color: var(--primary)">${activeAlerts.length}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Restocked Notifications</span>
            <span class="kpi-value" style="color: #15803d">${triggeredAlerts.length}</span>
          </div>
        </div>
      </div>

      <!-- Restock Notifications Received -->
      <div class="section-subheading">
        <span>✅ Restock Notifications (${triggeredAlerts.length})</span>
      </div>

      ${triggeredAlerts.length === 0 ? `
        <div class="empty-state" style="margin-bottom: 1.75rem">
          <div class="empty-icon">📭</div>
          <h4 class="empty-title">No Restock Notifications Yet</h4>
          <p class="empty-text">When a participating pharmacy marks an item back in stock, your restock notification will appear here.</p>
        </div>
      ` : `
        <div class="listings-grid" style="margin-bottom: 1.75rem">
          ${triggeredAlerts.map(a => `
            <div class="pharmacy-card" style="border-left: 4px solid #16a34a">
              <div>
                <div class="card-top-row">
                  <h4 class="card-pharm-name" style="color: #15803d">
                    Restocked: ${a.medicine ? a.medicine.brandName : 'Medicine'}
                  </h4>
                  <span class="stock-pill in_stock">Available Now</span>
                </div>
                <div style="font-size: 0.9rem; font-weight: 600; color: var(--neutral-800); margin: 0.5rem 0">
                  ${a.message}
                </div>
                <div style="font-size: 0.8rem; color: var(--neutral-500)">
                  Restocked by <strong>${a.pharmacyName || 'Partner Pharmacy'}</strong> at ${formatRelativeTime(a.notifiedAt)}
                </div>
              </div>
              <div class="card-footer">
                <button class="btn-primary-sm alert-view-med-btn" data-med-id="${a.medicineId}">
                  View Pharmacy Stock →
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      <!-- Active Watchlist -->
      <div class="section-subheading">
        <span>⏳ Pending Stock Watches (${activeAlerts.length})</span>
      </div>

      ${activeAlerts.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">🔔</div>
          <h4 class="empty-title">No Active Watches</h4>
          <p class="empty-text">Search for any medicine in the "Find Medicine" tab and click "Notify Me" to add it to your watchlist.</p>
        </div>
      ` : `
        <div class="listings-grid">
          ${activeAlerts.map(a => `
            <div class="pharmacy-card">
              <div>
                <div class="card-top-row">
                  <h4 class="card-pharm-name">${a.medicine ? a.medicine.brandName : 'Medicine'}</h4>
                  <span class="stock-pill low_stock">Watching</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--neutral-600); margin-top: 0.35rem">
                  ${a.medicine ? a.medicine.genericName : ''} • Subscribed ${formatRelativeTime(a.createdAt)}
                </div>
                <p style="font-size: 0.8rem; color: var(--neutral-500); margin-top: 0.5rem">
                  We are monitoring all 12 pharmacies. As soon as any pharmacy updates stock to "In Stock", an alert is triggered.
                </p>
              </div>
              <div class="card-footer">
                <button class="btn-outline-sm alert-view-med-btn" data-med-id="${a.medicineId}">
                  Check Current Availability
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;

    const refreshBtn = document.getElementById('refreshAlertsBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', renderAlertsView);
    }

    container.querySelectorAll('.alert-view-med-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedMedicineId = btn.dataset.medId;
        switchTab('search');
      });
    });
  }

  // ==========================================================================
  // TAB 4: PHARMACY PORTAL
  // ==========================================================================
  function renderPortalView() {
    const container = document.getElementById('tab-portal');
    if (!container) return;

    const currentPharm = window.store.currentPharmacyUser;

    if (!currentPharm) {
      // Login view with quick demo switcher
      const allPharmacies = window.store.getPharmacies();

      container.innerHTML = `
        <div class="portal-card" style="max-width: 540px; margin: 2rem auto">
          <div style="text-align: center; margin-bottom: 1.5rem">
            <div class="brand-icon" style="margin: 0 auto 0.75rem">🏪</div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--neutral-900)">Pharmacy Management Portal</h2>
            <p style="font-size: 0.875rem; color: var(--neutral-500)">
              Publish stock levels, update prices, add new medicines, and manage inventory in real time.
            </p>
          </div>

          <!-- Quick Demo Pharmacy Switcher -->
          <div style="background: var(--primary-light); border: 1px solid #bae6fd; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem">
            <label class="form-label" style="color: var(--primary-dark); font-weight: 700">
              ⚡ Quick Demo Login (Select any pharmacy):
            </label>
            <div style="display: flex; gap: 0.5rem">
              <select class="form-control" id="quickDemoPharmSelect">
                ${allPharmacies.map(p => `
                  <option value="${p.email}">${p.name} (${p.email})</option>
                `).join('')}
              </select>
              <button class="btn-primary" id="quickLoginBtn" style="white-space: nowrap">Login</button>
            </div>
          </div>

          <form id="pharmacyLoginForm">
            <div class="form-group">
              <label class="form-label">Pharmacy Email Address</label>
              <input type="email" id="loginEmail" class="form-control" placeholder="e.g. demo3@medfind.test" required value="demo3@medfind.test" />
            </div>
            <div class="form-group">
              <label class="form-label">Password (Demo: demo1234)</label>
              <input type="password" id="loginPassword" class="form-control" value="demo1234" required />
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem">
              Log In to Pharmacy Dashboard
            </button>
          </form>

          <div style="text-align: center; margin-top: 1.5rem; border-top: 1px solid var(--neutral-200); padding-top: 1rem">
            <span style="font-size: 0.85rem; color: var(--neutral-600)">New pharmacy looking to join the network?</span>
            <button class="btn-ghost-sm" id="openRegisterPharmacyBtn" style="margin-top: 0.5rem">
              Register New Pharmacy
            </button>
          </div>
        </div>
      `;

      // Handlers
      const quickLoginBtn = document.getElementById('quickLoginBtn');
      if (quickLoginBtn) {
        quickLoginBtn.addEventListener('click', () => {
          const email = document.getElementById('quickDemoPharmSelect').value;
          try {
            window.store.loginPharmacy(email, 'demo1234');
            showToast(`Logged in as ${email}`, 'success');
            renderPortalView();
          } catch (err) {
            showToast(err.message, 'alert');
          }
        });
      }

      const loginForm = document.getElementById('pharmacyLoginForm');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('loginEmail').value;
          const pass = document.getElementById('loginPassword').value;
          try {
            window.store.loginPharmacy(email, pass);
            showToast('Logged in successfully', 'success');
            renderPortalView();
          } catch (err) {
            showToast(err.message, 'alert');
          }
        });
      }

      const regBtn = document.getElementById('openRegisterPharmacyBtn');
      if (regBtn) {
        regBtn.addEventListener('click', openRegisterPharmacyModal);
      }
      return;
    }

    // Pharmacy Dashboard View
    const listings = window.store.state.listings.filter(l => l.pharmacyId === currentPharm.id);
    const inStock = listings.filter(l => l.status === 'in_stock').length;
    const lowStock = listings.filter(l => l.status === 'low_stock').length;
    const outOfStock = listings.filter(l => l.status === 'out_of_stock').length;

    container.innerHTML = `
      <!-- Pharmacy Dashboard Banner -->
      <div class="portal-card">
        <div class="pip-title-row">
          <div>
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase">
              Pharmacy Partner Portal
            </div>
            <h2 style="font-size: 1.65rem; font-weight: 800; color: var(--neutral-900)">
              ${currentPharm.name}
              ${currentPharm.verified ? '<span class="verified-icon" title="Verified Partner">✓</span>' : ''}
            </h2>
            <div style="font-size: 0.875rem; color: var(--neutral-600); margin-top: 0.25rem">
              Logged in as <strong>${currentPharm.email}</strong> • Pharmacist: ${currentPharm.pharmacistName}
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem">
            <button class="btn-primary" id="openAddMedicineModalBtn">
              + Add New Medicine
            </button>
            <button class="btn-secondary" id="logoutPharmacyBtn">
              Log Out
            </button>
          </div>
        </div>

        ${!currentPharm.verified ? `
          <div class="unverified-alert" style="margin-top: 1.25rem">
            <span style="font-size: 1.25rem">⚠️</span>
            <div>
              <strong>Awaiting Administrative Verification</strong>
              <div>
                Your pharmacy registration is pending verification by an administrator. Stock publishing is restricted until approved.
                (Go to <em>Admin Portal</em> with key <code>admin123</code> to approve this pharmacy).
              </div>
            </div>
          </div>
        ` : ''}

        <div class="kpi-row" style="margin-top: 1.5rem">
          <div class="kpi-card">
            <span class="kpi-label">Active Listings</span>
            <span class="kpi-value">${listings.length}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label" style="color: #15803d">In Stock</span>
            <span class="kpi-value" style="color: #15803d">${inStock}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label" style="color: #b45309">Low Stock</span>
            <span class="kpi-value" style="color: #b45309">${lowStock}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label" style="color: #b91c1c">Out of Stock</span>
            <span class="kpi-value" style="color: #b91c1c">${outOfStock}</span>
          </div>
        </div>
      </div>

      <!-- Inventory Management Table -->
      <div class="section-subheading">
        <span>Pharmacy Inventory Management</span>
        <input
          type="text"
          id="portalInventorySearchInput"
          class="inv-search-input"
          placeholder="Search this pharmacy's medicines..."
          style="max-width: 300px"
        />
      </div>

      <div class="inv-table-wrapper" id="portalTableWrapper">
        ${renderPortalInventoryRows(currentPharm.id, '')}
      </div>
    `;

    // Logout
    const logoutBtn = document.getElementById('logoutPharmacyBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.store.logoutPharmacy();
        showToast('Logged out');
        renderPortalView();
      });
    }

    // Add new medicine
    const addMedBtn = document.getElementById('openAddMedicineModalBtn');
    if (addMedBtn) {
      addMedBtn.addEventListener('click', () => {
        openAddMedicineModal(currentPharm.id);
      });
    }

    // Portal search
    const portalSearch = document.getElementById('portalInventorySearchInput');
    if (portalSearch) {
      portalSearch.addEventListener('input', (e) => {
        const wrapper = document.getElementById('portalTableWrapper');
        if (wrapper) {
          wrapper.innerHTML = renderPortalInventoryRows(currentPharm.id, e.target.value);
          attachPortalTableActions(currentPharm.id);
        }
      });
    }

    attachPortalTableActions(currentPharm.id);
  }

  function renderPortalInventoryRows(pharmacyId, query = '') {
    const inventory = window.store.getListingsForPharmacy(pharmacyId, query);

    if (inventory.length === 0) {
      return `
        <div style="padding: 2rem; text-align: center; color: var(--neutral-500)">
          No medicines found in your inventory matching "${query}".
        </div>
      `;
    }

    return `
      <table class="inv-table">
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Generic Composition</th>
            <th>Status</th>
            <th>Available Quantity</th>
            <th>Price</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${inventory.map(item => `
            <tr>
              <td>
                <strong>${item.medicine.brandName}</strong>
                <div style="font-size: 0.75rem; color: var(--neutral-500)">${item.medicine.dosageForm} • ${item.medicine.strength}</div>
              </td>
              <td>
                <span style="font-size: 0.85rem; color: var(--neutral-700)">${item.medicine.genericName}</span>
              </td>
              <td>
                <span class="stock-pill ${item.status}">
                  ${item.status === 'in_stock' ? 'In Stock' : (item.status === 'low_stock' ? 'Low' : 'Out')}
                </span>
              </td>
              <td>
                <strong>${item.quantity}</strong> units
              </td>
              <td>
                ₹${item.price}
              </td>
              <td>
                ${formatRelativeTime(item.updatedAt)}
              </td>
              <td>
                <button class="btn-primary-sm update-stock-btn" data-pharm-id="${pharmacyId}" data-med-id="${item.medicine.id}">
                  Update Stock
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function attachPortalTableActions(pharmacyId) {
    document.querySelectorAll('.update-stock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const medId = btn.dataset.medId;
        openUpdateStockModal(pharmacyId, medId);
      });
    });
  }

  // ==========================================================================
  // TAB 5: ADMIN VERIFICATION
  // ==========================================================================
  function renderAdminView() {
    const container = document.getElementById('tab-admin');
    if (!container) return;

    if (!isAdminAuthenticated) {
      container.innerHTML = `
        <div class="portal-card" style="max-width: 440px; margin: 2rem auto; text-align: center">
          <div class="brand-icon" style="margin: 0 auto 0.75rem; background: linear-gradient(135deg, #475569 0%, #1e293b 100%)">🛡️</div>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--neutral-900); margin-bottom: 0.5rem">
            Admin Verification Portal
          </h2>
          <p style="font-size: 0.85rem; color: var(--neutral-500); margin-bottom: 1.5rem">
            Verify participating pharmacies and manage network authorization.
          </p>

          <form id="adminAuthForm">
            <div class="form-group" style="text-align: left">
              <label class="form-label">Administrator Access Key</label>
              <input type="password" id="adminKeyInput" class="form-control" placeholder="Enter admin key (default: admin123)" required value="admin123" />
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center">
              Authorize Admin Session
            </button>
          </form>
        </div>
      `;

      const form = document.getElementById('adminAuthForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const key = document.getElementById('adminKeyInput').value;
          if (key === 'admin123') {
            isAdminAuthenticated = true;
            showToast('Admin session authorized', 'success');
            renderAdminView();
          } else {
            showToast('Invalid admin key. Use admin123', 'alert');
          }
        });
      }
      return;
    }

    // Authorized Admin Dashboard
    const stats = window.store.getNetworkStats();
    const pharmacies = window.store.getPharmacies();

    container.innerHTML = `
      <div class="portal-card">
        <div class="pip-title-row">
          <div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #0f172a; text-transform: uppercase">
              Network Governance
            </div>
            <h2 style="font-size: 1.65rem; font-weight: 800; color: var(--neutral-900)">
              Platform Administration
            </h2>
          </div>
          <button class="btn-secondary" id="adminLogoutBtn">
            Lock Session
          </button>
        </div>

        <div class="kpi-row" style="margin-top: 1.25rem">
          <div class="kpi-card">
            <span class="kpi-label">Total Pharmacies</span>
            <span class="kpi-value">${stats.totalPharmacies}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label" style="color: #15803d">Verified Partners</span>
            <span class="kpi-value" style="color: #15803d">${stats.verifiedCount}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label" style="color: #b45309">Pending Approval</span>
            <span class="kpi-value" style="color: #b45309">${stats.pendingCount}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Active Listings</span>
            <span class="kpi-value">${stats.totalListings}</span>
          </div>
        </div>
      </div>

      <!-- Pharmacies Approval Table -->
      <div class="section-subheading">
        <span>Pharmacy Licensing & Verification</span>
      </div>

      <div class="inv-table-wrapper">
        <table class="inv-table">
          <thead>
            <tr>
              <th>Pharmacy Name</th>
              <th>Contact & Location</th>
              <th>License Number</th>
              <th>Registered Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${pharmacies.map(p => `
              <tr>
                <td>
                  <strong>${p.name}</strong>
                  <div style="font-size: 0.75rem; color: var(--neutral-500)">${p.email}</div>
                </td>
                <td>
                  <div style="font-size: 0.825rem">${p.address}</div>
                  <div style="font-size: 0.75rem; color: var(--neutral-500)">${p.phone}</div>
                </td>
                <td>
                  <code>${p.licenseNo}</code>
                </td>
                <td>
                  ${formatRelativeTime(p.registeredAt)}
                </td>
                <td>
                  ${p.verified ? `
                    <span class="stock-pill in_stock">Verified</span>
                  ` : `
                    <span class="stock-pill low_stock">Pending Review</span>
                  `}
                </td>
                <td>
                  ${p.verified ? `
                    <button class="btn-outline-sm toggle-verify-btn" data-pharm-id="${p.id}" data-action="revoke" style="color: #b91c1c; border-color: #fca5a5">
                      Revoke
                    </button>
                  ` : `
                    <button class="btn-primary-sm toggle-verify-btn" data-pharm-id="${p.id}" data-action="approve" style="background: #15803d; border-color: #15803d">
                      Approve Partner
                    </button>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const adminLogout = document.getElementById('adminLogoutBtn');
    if (adminLogout) {
      adminLogout.addEventListener('click', () => {
        isAdminAuthenticated = false;
        renderAdminView();
      });
    }

    container.querySelectorAll('.toggle-verify-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pharmId = btn.dataset.pharmId;
        const action = btn.dataset.action;
        try {
          window.store.setPharmacyVerification(pharmId, action === 'approve');
          showToast(`Pharmacy ${action === 'approve' ? 'approved' : 'verification revoked'} successfully!`, 'success');
          renderAdminView();
        } catch (err) {
          showToast(err.message, 'alert');
        }
      });
    });
  }

  // ==========================================================================
  // MODALS
  // ==========================================================================

  // --- Modal 1: Stock History Modal ---
  function openStockHistoryModal(pharmacyId, medicineId) {
    const modal = document.getElementById('historyModal');
    const content = document.getElementById('historyModalBody');
    if (!modal || !content) return;

    const pharmacy = window.store.getPharmacyById(pharmacyId);
    const medicine = window.store.getMedicineById(medicineId);
    const listing = window.store.state.listings.find(
      l => l.pharmacyId === pharmacyId && l.medicineId === medicineId
    );

    if (!pharmacy || !medicine || !listing) {
      showToast('No history record found for this listing.');
      return;
    }

    const historyItems = listing.history || [];

    content.innerHTML = `
      <div style="margin-bottom: 1.25rem">
        <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--neutral-900)">
          ${medicine.brandName} at ${pharmacy.name}
        </h4>
        <div style="font-size: 0.85rem; color: var(--neutral-600)">
          Current status: <span class="stock-pill ${listing.status}">${listing.status} (${listing.quantity} units)</span>
        </div>
      </div>

      <ul class="history-timeline">
        ${historyItems.map(item => `
          <li class="history-item">
            <div class="history-dot"></div>
            <div class="history-time">${new Date(item.timestamp).toLocaleString()} (${formatRelativeTime(item.timestamp)})</div>
            <div class="history-desc">${item.action}</div>
            <div style="font-size: 0.775rem; color: var(--neutral-600); margin-top: 0.15rem">
              Quantity: ${item.quantity} • Status: ${item.status} ${item.price ? `• ₹${item.price}` : ''}
            </div>
          </li>
        `).join('')}
      </ul>
    `;

    modal.classList.add('active');
  }

  // --- Modal 2: Quick Update Stock Modal (For Pharmacy Portal) ---
  function openUpdateStockModal(pharmacyId, medicineId) {
    const modal = document.getElementById('updateStockModal');
    const content = document.getElementById('updateStockModalBody');
    if (!modal || !content) return;

    const pharmacy = window.store.getPharmacyById(pharmacyId);
    const medicine = window.store.getMedicineById(medicineId);
    const listing = window.store.state.listings.find(
      l => l.pharmacyId === pharmacyId && l.medicineId === medicineId
    ) || { status: 'in_stock', quantity: 20, price: 45, notes: '' };

    content.innerHTML = `
      <div style="margin-bottom: 1.25rem">
        <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--neutral-900)">
          Update ${medicine.brandName}
        </h4>
        <div style="font-size: 0.85rem; color: var(--neutral-600)">
          ${medicine.genericName} (${medicine.strength}) • ${pharmacy.name}
        </div>
      </div>

      <form id="updateStockForm">
        <div class="form-group">
          <label class="form-label">Stock Status</label>
          <select id="updateStatusSelect" class="form-control">
            <option value="in_stock" ${listing.status === 'in_stock' ? 'selected' : ''}>In Stock</option>
            <option value="low_stock" ${listing.status === 'low_stock' ? 'selected' : ''}>Low Stock (e.g. &lt; 10 units)</option>
            <option value="out_of_stock" ${listing.status === 'out_of_stock' ? 'selected' : ''}>Out of Stock</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Available Units / Quantity</label>
          <input type="number" id="updateQuantityInput" class="form-control" min="0" value="${listing.quantity}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Selling Price per Pack (₹)</label>
          <input type="number" id="updatePriceInput" class="form-control" min="1" step="0.5" value="${listing.price}" required />
        </div>

        <div class="form-group">
          <label class="form-label">Pharmacist Internal / Public Note</label>
          <input type="text" id="updateNotesInput" class="form-control" placeholder="e.g. Fresh stock arrived from distributor" value="${listing.notes || ''}" />
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; background: transparent">
          <button type="button" class="btn-secondary close-modal-btn">Cancel</button>
          <button type="submit" class="btn-primary">Publish to Network</button>
        </div>
      </form>
    `;

    modal.classList.add('active');

    const form = document.getElementById('updateStockForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const status = document.getElementById('updateStatusSelect').value;
        const quantity = document.getElementById('updateQuantityInput').value;
        const price = document.getElementById('updatePriceInput').value;
        const notes = document.getElementById('updateNotesInput').value;

        try {
          const res = window.store.updateListingStock(pharmacyId, medicineId, {
            status,
            quantity,
            price,
            notes
          });

          showToast(`Stock updated! ${res.triggeredAlerts > 0 ? `Triggered ${res.triggeredAlerts} restock alerts!` : ''}`, 'success');
          modal.classList.remove('active');
          renderPortalView();
        } catch (err) {
          showToast(err.message, 'alert');
        }
      });
    }
  }

  // --- Modal 3: Add New Medicine Modal ---
  function openAddMedicineModal(pharmacyId) {
    const modal = document.getElementById('addMedicineModal');
    const content = document.getElementById('addMedicineModalBody');
    if (!modal || !content) return;

    content.innerHTML = `
      <form id="addMedicineForm">
        <div class="form-group">
          <label class="form-label">Brand Name *</label>
          <input type="text" id="newBrandName" class="form-control" placeholder="e.g. Benadryl Cough Formula" required />
        </div>

        <div class="form-group">
          <label class="form-label">Generic / Active Salt Composition *</label>
          <input type="text" id="newGenericName" class="form-control" placeholder="e.g. Diphenhydramine + Ammonium Chloride" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem">
          <div class="form-group">
            <label class="form-label">Strength / Dosage *</label>
            <input type="text" id="newStrength" class="form-control" placeholder="e.g. 100 ml or 500 mg" required />
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="newCategory" class="form-control">
              ${window.store.state.categories.filter(c => c !== 'All Categories').map(c => `
                <option value="${c}">${c}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem">
          <div class="form-group">
            <label class="form-label">Dosage Form</label>
            <select id="newDosageForm" class="form-control">
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup / Liquid">Syrup / Liquid</option>
              <option value="Inhaler">Inhaler</option>
              <option value="Ointment / Gel">Ointment / Gel</option>
              <option value="Drops">Drops</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Prescription</label>
            <select id="newRxRequired" class="form-control">
              <option value="0">Over the Counter (OTC)</option>
              <option value="1">Rx Required</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Manufacturer</label>
          <input type="text" id="newManufacturer" class="form-control" placeholder="e.g. Johnson & Johnson" />
        </div>

        <div class="form-group">
          <label class="form-label">Short Description / Indication</label>
          <textarea id="newDescription" class="form-control" rows="2" placeholder="e.g. Relief from dry cough and throat irritation"></textarea>
        </div>

        <div style="background: var(--neutral-50); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--neutral-200); margin-bottom: 1rem">
          <strong style="font-size: 0.85rem; color: var(--neutral-800)">Initial Pharmacy Stock:</strong>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem">
            <div>
              <label class="form-label">Quantity</label>
              <input type="number" id="newInitialQuantity" class="form-control" value="25" min="1" />
            </div>
            <div>
              <label class="form-label">Price (₹)</label>
              <input type="number" id="newInitialPrice" class="form-control" value="85" min="1" />
            </div>
          </div>
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; background: transparent">
          <button type="button" class="btn-secondary close-modal-btn">Cancel</button>
          <button type="submit" class="btn-primary">Add Medicine & Publish</button>
        </div>
      </form>
    `;

    modal.classList.add('active');

    const form = document.getElementById('addMedicineForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const newMed = window.store.addNewMedicine({
            brandName: document.getElementById('newBrandName').value,
            genericName: document.getElementById('newGenericName').value,
            strength: document.getElementById('newStrength').value,
            category: document.getElementById('newCategory').value,
            dosageForm: document.getElementById('newDosageForm').value,
            rxRequired: document.getElementById('newRxRequired').value === '1',
            manufacturer: document.getElementById('newManufacturer').value,
            description: document.getElementById('newDescription').value,
            pharmacyId: pharmacyId,
            initialQuantity: document.getElementById('newInitialQuantity').value,
            initialPrice: document.getElementById('newInitialPrice').value,
            initialStatus: 'in_stock'
          });

          showToast(`Added ${newMed.brandName} to catalogue!`, 'success');
          modal.classList.remove('active');
          renderPortalView();
        } catch (err) {
          showToast(err.message, 'alert');
        }
      });
    }
  }

  // --- Modal 4: Register Pharmacy Modal ---
  function openRegisterPharmacyModal() {
    const modal = document.getElementById('registerPharmacyModal');
    const content = document.getElementById('registerPharmacyModalBody');
    if (!modal || !content) return;

    content.innerHTML = `
      <form id="registerPharmacyForm">
        <div class="form-group">
          <label class="form-label">Pharmacy Name *</label>
          <input type="text" id="regPharmName" class="form-control" placeholder="e.g. CareFirst Medicos" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem">
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input type="email" id="regPharmEmail" class="form-control" placeholder="owner@carefirst.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Contact Phone *</label>
            <input type="text" id="regPharmPhone" class="form-control" placeholder="+91 98100 12345" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Street Address *</label>
          <input type="text" id="regPharmAddress" class="form-control" placeholder="Shop 5, Ground Floor, Sector 12 Market" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem">
          <div class="form-group">
            <label class="form-label">Region / Area</label>
            <select id="regPharmArea" class="form-control">
              ${window.store.state.userLocations.map(l => `
                <option value="${l.name}">${l.name}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Drug License Number *</label>
            <input type="text" id="regPharmLicense" class="form-control" placeholder="e.g. DL-PH-2026-9901" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem">
          <div class="form-group">
            <label class="form-label">Registered Pharmacist Name *</label>
            <input type="text" id="regPharmPharmacist" class="form-control" placeholder="e.g. Dr. Alok Mathur, B.Pharm" required />
          </div>
          <div class="form-group">
            <label class="form-label">Operating Hours</label>
            <input type="text" id="regPharmHours" class="form-control" placeholder="e.g. 8:00 AM - 11:00 PM" value="8:00 AM - 11:00 PM" />
          </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-bottom: 1rem">
          <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; cursor: pointer">
            <input type="checkbox" id="regPharmIs24x7" /> Open 24/7
          </label>
          <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; cursor: pointer">
            <input type="checkbox" id="regPharmDelivery" checked /> Home Delivery Available
          </label>
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; background: transparent">
          <button type="button" class="btn-secondary close-modal-btn">Cancel</button>
          <button type="submit" class="btn-primary">Register Pharmacy</button>
        </div>
      </form>
    `;

    modal.classList.add('active');

    const form = document.getElementById('registerPharmacyForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const newPharm = window.store.registerPharmacy({
            name: document.getElementById('regPharmName').value,
            email: document.getElementById('regPharmEmail').value,
            phone: document.getElementById('regPharmPhone').value,
            address: document.getElementById('regPharmAddress').value,
            area: document.getElementById('regPharmArea').value,
            licenseNo: document.getElementById('regPharmLicense').value,
            pharmacistName: document.getElementById('regPharmPharmacist').value,
            hours: document.getElementById('regPharmHours').value,
            is24x7: document.getElementById('regPharmIs24x7').checked,
            homeDelivery: document.getElementById('regPharmDelivery').checked
          });

          showToast(`Pharmacy "${newPharm.name}" registered! Pending verification in Admin tab.`, 'success');
          modal.classList.remove('active');
          renderPortalView();
        } catch (err) {
          showToast(err.message, 'alert');
        }
      });
    }
  }

  // --- Modal Close Button Delegation ---
  function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('.modal-close-btn') || e.target.closest('.close-modal-btn')) {
          overlay.classList.remove('active');
        }
      });
    });
  }

  // --- Reset Demo Data Confirmation ---
  function initResetButton() {
    const btn = document.getElementById('resetDataBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (confirm('Reset MedFind demo data to initial defaults? All custom edits will reset.')) {
          window.store.resetToDefaults();
          showToast('Data reset to original seed state', 'success');
          renderSearchView();
        }
      });
    }
  }

  // --- Global Initialization ---
  function init() {
    initLocationSelector();
    initSearchControls();
    initModals();
    initResetButton();

    // Tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
      });
    });

    // Reactive listener from store
    window.store.subscribe((event, payload) => {
      if (event === 'STOCK_UPDATED') {
        if (activeTab === 'search') renderSearchView();
        if (activeTab === 'pharmacies') renderSelectedPharmacyInventory();
        if (activeTab === 'alerts') renderAlertsView();
      } else if (event === 'LOCATION_CHANGED') {
        if (activeTab === 'search') renderSearchView();
        if (activeTab === 'pharmacies') {
          renderPharmaciesList();
          renderSelectedPharmacyInventory();
        }
      } else if (event === 'ALERTS_TRIGGERED') {
        showToast(`🔔 Restock Alert: ${payload.medicine.brandName} is now in stock at ${payload.pharmacy.name}!`, 'alert');
      }
    });

    // Initial render
    renderSearchView();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
