/* ============================================
   LET'S BE READY — Interactive Classroom Map
   Leaflet.js + classrooms.json
   ============================================ */

(function () {
  'use strict';

  const MAP_CONTAINER_ID = 'classroomMap';
  const DATA_URL = 'classrooms.json';

  // Guatemala center + zoom to show all 5 departments
  const GUATEMALA_CENTER = [14.75, -91.05];
  const GUATEMALA_ZOOM = 9;
  const MIN_ZOOM = 8;
  const MAX_ZOOM = 14;

  // Department colors for pin variation
  const DEPT_COLORS = {
    'Quiché': '#146BF6',
    'Chimaltenango': '#0F52BF',
    'Sololá': '#1E88E5',
    'Totonicapán': '#3B82F6',
    'Sacatepéquez': '#2563EB'
  };

  let map = null;
  let markers = [];

  // --- Create custom pin icon ---
  function createPinIcon(color) {
    return L.divIcon({
      html: '<div class="lp-map__pin-dot" style="background:' + color + '"></div>',
      className: 'lp-map__pin',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -12]
    });
  }

  // --- Build popup HTML ---
  function buildPopup(classroom) {
    return `
      <div class="lp-map__popup">
        <div class="lp-map__popup-header">
          <div class="lp-map__popup-avatar">${classroom.teacher.split(' ').map(n => n[0]).join('')}</div>
          <div>
            <div class="lp-map__popup-teacher">${classroom.teacher}</div>
            <div class="lp-map__popup-role">Facilitator</div>
          </div>
        </div>
        <div class="lp-map__popup-body">
          <div class="lp-map__popup-community">${classroom.community}</div>
          <div class="lp-map__popup-dept">${classroom.department}</div>
          <div class="lp-map__popup-stats">
            <span><strong>${classroom.students}</strong> students</span>
            <span>Since <strong>${classroom.year}</strong></span>
          </div>
        </div>
        <a href="donate.html" class="lp-map__popup-cta">Sponsor this classroom &rarr;</a>
      </div>
    `;
  }

  // --- Initialize the map ---
  function initMap(data) {
    const container = document.getElementById(MAP_CONTAINER_ID);
    if (!container || !L) return;

    // Create map with restrained bounds
    map = L.map(MAP_CONTAINER_ID, {
      center: GUATEMALA_CENTER,
      zoom: GUATEMALA_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      scrollWheelZoom: false,
      attributionControl: false,
      zoomControl: true
    });

    // Muted/grayscale tiles for clean look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: MAX_ZOOM
    }).addTo(map);

    // Add small attribution
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    // Move zoom control to bottom-right
    map.zoomControl.setPosition('bottomright');

    // Add markers
    const classrooms = data.classrooms || [];
    classrooms.forEach(function (c) {
      const color = DEPT_COLORS[c.department] || '#146BF6';
      const marker = L.marker([c.lat, c.lng], {
        icon: createPinIcon(color),
        alt: c.community + ' classroom'
      });

      marker.bindPopup(buildPopup(c), {
        maxWidth: 260,
        minWidth: 220,
        className: 'lp-map__popup-wrapper',
        closeButton: true
      });

      marker.addTo(map);
      markers.push(marker);
    });

    // Fit bounds to show all markers with padding
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Enable scroll zoom only after user clicks on map
    map.on('click', function () {
      map.scrollWheelZoom.enable();
    });

    // Update the counter elements
    updateCounters(data);
  }

  // --- Update stat counters below map ---
  function updateCounters(data) {
    const classrooms = data.classrooms || [];
    const meta = data.meta || {};

    const communitiesEl = document.getElementById('mapCommunities');
    const teachersEl = document.getElementById('mapTeachers');
    const childrenEl = document.getElementById('mapChildren');

    if (communitiesEl) communitiesEl.textContent = classrooms.length;
    if (teachersEl) teachersEl.textContent = meta.total_teachers || classrooms.length;
    if (childrenEl) childrenEl.textContent = meta.total_students || 0;
  }

  // --- Lazy-load: only init map when section is visible ---
  function setupLazyLoad() {
    var section = document.getElementById('impact-map');
    if (!section) return;

    // Make the section visible immediately (remove reveal delay for map)
    // The reveal class hides it with opacity:0 which gives Leaflet a 0-size container
    var layout = section.querySelector('.lp-map__layout');
    if (layout && layout.classList.contains('reveal')) {
      layout.classList.add('visible');
    }

    if (!('IntersectionObserver' in window)) {
      loadAndInit();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadAndInit();
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '400px 0px',
      threshold: 0
    });

    observer.observe(section);
  }

  // --- Fetch data and init ---
  function loadAndInit() {
    fetch(DATA_URL)
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        // Small delay to ensure container has dimensions
        setTimeout(function () { initMap(data); }, 100);
      })
      .catch(function (err) {
        console.warn('Could not load classroom data via fetch:', err);
        console.info('If opening from file://, use a local server: python3 -m http.server 8080');
        // Try loading via script tag as fallback for file:// protocol
        tryScriptFallback();
      });
  }

  // Fallback for file:// protocol where fetch doesn't work
  function tryScriptFallback() {
    var script = document.createElement('script');
    script.textContent = 'window.__classroomData = ' + JSON.stringify(null);
    // Use XMLHttpRequest which has slightly better file:// support in some browsers
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', DATA_URL, true);
      xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 0) {
          var data = JSON.parse(xhr.responseText);
          setTimeout(function () { initMap(data); }, 100);
        }
      };
      xhr.onerror = function () {
        console.warn('Map requires a local server. Run: python3 -m http.server 8080');
      };
      xhr.send();
    } catch (e) {
      console.warn('Map requires a local server. Run: python3 -m http.server 8080');
    }
  }

  // --- Start ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLazyLoad);
  } else {
    setupLazyLoad();
  }

})();
