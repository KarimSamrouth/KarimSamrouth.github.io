// --- GLOBAL DATA & CONSTANTS ---
const CITY_TIMEZONES = [
    // Added Lat/Lng for map functionality
    { city: 'London', country: 'UK', timezone: 'Europe/London', flag: '🇬🇧', lat: 51.5, lng: 0.12 },
    { city: 'New York', country: 'USA', timezone: 'America/New_York', flag: '🇺🇸', lat: 40.71, lng: -74.00 },
    { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵', lat: 35.68, lng: 139.75 },
    { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺', lat: -33.86, lng: 151.20 },
    { city: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷', lat: 48.85, lng: 2.35 },
    { city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', flag: '🇦🇪', lat: 25.2, lng: 55.27 },
    { city: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai', flag: '🇨🇳', lat: 31.23, lng: 121.47 },
    { city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳', lat: 19.07, lng: 72.87 },
    { city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷', lat: -23.55, lng: -46.63 },
    { city: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City', flag: '🇲🇽', lat: 19.43, lng: -99.13 },
    { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', flag: '🇪🇬', lat: 30.04, lng: 31.23 },
];

let savedCities = JSON.parse(localStorage.getItem('chronoGlobeCities')) || [
    'Europe/London',
    'America/New_York',
    'Asia/Tokyo',
];

// --- DOM ELEMENTS ---
const cityClocksContainer = document.getElementById('city-clocks');
const themeToggleButton = document.getElementById('theme-toggle');
const citySearchInput = document.getElementById('city-search');
const suggestionsList = document.getElementById('suggestions-list');
const addCityButton = document.getElementById('add-city-btn');
const eventTimeFromSelect = document.getElementById('event-timezone-from');
const eventDateTimeInput = document.getElementById('event-datetime');
const convertTimeButton = document.getElementById('convert-time-btn');
const conversionResultsDiv = document.getElementById('conversion-results');
const worldMapDiv = document.getElementById('world-map');
let map; // Variable to hold the Leaflet map instance

// --- TIME FORMATTING UTILITIES ---

function formatTime(timezone) {
    const now = new Date();
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true, 
        timeZone: timezone 
    };
    const dateOptions = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        timeZone: timezone 
    };
    
    const timeString = now.toLocaleTimeString('en-US', timeOptions);
    const dateString = now.toLocaleDateString('en-US', dateOptions);
    const tzShort = timezone.split('/').pop().replace('_', ' ');

    return { timeString, dateString, tzShort };
}


// --- CORE FUNCTIONS (CITY CLOCKS) ---

function renderCityCard(timezone) {
    const cityData = CITY_TIMEZONES.find(c => c.timezone === timezone);
    if (!cityData) return;

    const card = document.createElement('div');
    card.className = 'time-card glass-card';
    card.dataset.timezone = timezone;

    card.innerHTML = `
        <button class="remove-city-btn" data-timezone="${timezone}" aria-label="Remove city">
            <i class="fas fa-times-circle"></i>
        </button>
        <div class="city-name"><span class="flag-icon">${cityData.flag}</span> ${cityData.city}, ${cityData.country}</div>
        <div class="time-display" data-type="time">--:--:--</div>
        <div class="date-display" data-type="date">Loading...</div>
    `;

    cityClocksContainer.appendChild(card);
}

function updateClocks() {
    document.querySelectorAll('.time-card').forEach(card => {
        const timezone = card.dataset.timezone;
        const { timeString, dateString, tzShort } = formatTime(timezone);

        card.querySelector('[data-type="time"]').textContent = timeString;
        card.querySelector('[data-type="date"]').textContent = `${dateString} | ${tzShort}`;
    });
}

function initializeClocks() {
    cityClocksContainer.innerHTML = '';
    savedCities.forEach(renderCityCard);
    updateClocks();
    setInterval(updateClocks, 1000); 
}

function addCity(timezone) {
    if (!savedCities.includes(timezone)) {
        savedCities.push(timezone);
        localStorage.setItem('chronoGlobeCities', JSON.stringify(savedCities));
        renderCityCard(timezone);
        updateClocks();
        populateEventTimezoneSelect();
        addMarkerToMap(CITY_TIMEZONES.find(c => c.timezone === timezone));
    }
    citySearchInput.value = '';
    suggestionsList.innerHTML = '';
    addCityButton.disabled = true;
    addCityButton.dataset.timezone = '';
}

function removeCity(timezone) {
    savedCities = savedCities.filter(tz => tz !== timezone);
    localStorage.setItem('chronoGlobeCities', JSON.stringify(savedCities));
    document.querySelector(`[data-timezone="${timezone}"]`).remove();
    populateEventTimezoneSelect();
    
    // Simple way to remove marker: re-initialize the map markers
    initializeMap(); 
}


// --- THEME TOGGLE ---

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('chronoGlobeTheme', isLight ? 'light' : 'dark');
    
    themeToggleButton.innerHTML = isLight 
        ? '<i class="fas fa-moon"></i>' 
        : '<i class="fas fa-sun"></i>';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('chronoGlobeTheme') || 'light';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleButton.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.remove('light-mode');
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    }
}


// --- CITY SEARCH AND AUTOCOMPLETE ---

function filterCities(query) {
    if (query.length < 2) return [];
    const lowerCaseQuery = query.toLowerCase();
    return CITY_TIMEZONES
        .filter(c => c.city.toLowerCase().includes(lowerCaseQuery) || c.country.toLowerCase().includes(lowerCaseQuery))
        .sort((a, b) => a.city.localeCompare(b.city));
}

function handleSearchInput() {
    const query = citySearchInput.value.trim();
    suggestionsList.innerHTML = '';
    addCityButton.disabled = true;

    if (query.length === 0) return;

    const results = filterCities(query);
    
    if (results.length > 0) {
        results.forEach(city => {
            const li = document.createElement('li');
            li.textContent = `${city.flag} ${city.city}, ${city.country} (${city.timezone.split('/').pop().replace('_', ' ')})`;
            li.dataset.timezone = city.timezone;
            suggestionsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No cities found.';
        li.style.opacity = 0.6;
        suggestionsList.appendChild(li);
    }
}

function handleSuggestionClick(event) {
    const li = event.target.closest('li');
    if (li && li.dataset.timezone) {
        const timezone = li.dataset.timezone;
        const cityData = CITY_TIMEZONES.find(c => c.timezone === timezone);

        citySearchInput.value = `${cityData.city}, ${cityData.country}`; 
        
        addCityButton.disabled = false;
        addCityButton.dataset.timezone = timezone;
        
        suggestionsList.innerHTML = ''; 
    }
}


// --- EVENT TIME CONVERSION ---

function populateEventTimezoneSelect() {
    eventTimeFromSelect.innerHTML = ''; 
    
    const localOption = document.createElement('option');
    localOption.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    localOption.textContent = `Local Time (${localOption.value.split('/').pop().replace('_', ' ') || 'Local'})`;
    eventTimeFromSelect.appendChild(localOption);

    savedCities.forEach(timezone => {
        const cityData = CITY_TIMEZONES.find(c => c.timezone === timezone);
        if (cityData) {
            const option = document.createElement('option');
            option.value = timezone;
            option.textContent = `${cityData.flag} ${cityData.city} (${cityData.timezone.split('/').pop().replace('_', ' ')})`;
            eventTimeFromSelect.appendChild(option);
        }
    });
}

function convertEventTime() {
    const dateTimeString = eventDateTimeInput.value;
    const fromTimezone = eventTimeFromSelect.value;

    if (!dateTimeString || !fromTimezone) {
        conversionResultsDiv.innerHTML = '<p class="initial-message" style="color:#ff3b30;">Please select both a date/time and a "From" location.</p>';
        return;
    }

    const eventDate = new Date(dateTimeString);
    if (isNaN(eventDate)) {
        conversionResultsDiv.innerHTML = '<p class="initial-message" style="color:#ff3b30;">Invalid date format.</p>';
        return;
    }

    // Convert the event time to UTC based on the 'fromTimezone'
    const eventTimeUTC = new Date(eventDate.toLocaleString('en-US', { timeZone: fromTimezone, timeZoneName: 'short' }));

    conversionResultsDiv.innerHTML = '<h4>Converted Times:</h4>';

    const targetTimezones = new Set([...savedCities, Intl.DateTimeFormat().resolvedOptions().timeZone]);

    targetTimezones.forEach(targetTimezone => {
        const timeOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: targetTimezone
        };

        const convertedTime = eventTimeUTC.toLocaleString('en-US', timeOptions);
        
        const cityData = CITY_TIMEZONES.find(c => c.timezone === targetTimezone);
        const cityDisplay = cityData?.city || 'Local Time';
        const flag = cityData?.flag || '🌎';
        const tzShort = targetTimezone.split('/').pop().replace('_', ' ');

        const resultItem = document.createElement('div');
        resultItem.className = 'conversion-result-item';
        resultItem.innerHTML = `
            ${flag} <strong>${cityDisplay} (${tzShort}):</strong> 
            <span>${convertedTime}</span>
        `;
        conversionResultsDiv.appendChild(resultItem);
    });
}


// --- INTERACTIVE MAP (LEAFLET) ---

function addMarkerToMap(cityData) {
    if (!cityData.lat || !cityData.lng) return;

    const marker = L.marker([cityData.lat, cityData.lng]).addTo(map);

    // Create a time-display popup
    const popup = L.popup({ closeButton: false, autoClose: false, className: 'time-popup' });
    let popupContent = L.DomUtil.create('div', 'time-popup-content');
    
    // Function to update the popup content every second
    const updatePopupTime = () => {
        const { timeString, dateString, tzShort } = formatTime(cityData.timezone);
        popupContent.innerHTML = `
            <div class="popup-title">${cityData.flag} ${cityData.city}</div>
            <div class="popup-time">${timeString}</div>
            <div class="popup-date">${dateString} | ${tzShort}</div>
        `;
        popup.setContent(popupContent);
    };

    updatePopupTime();
    setInterval(updatePopupTime, 1000); // Keep the popup time live

    marker.bindPopup(popup);

    // Custom hover logic for time display
    marker.on('mouseover', function (e) {
        this.openPopup();
    });
    marker.on('mouseout', function (e) {
        // Only close if the mouse leaves the marker
        // If you want it to close only when the mouse leaves the popup too, 
        // this logic would be more complex, but this covers the core requirement.
        this.closePopup();
    });
    
    marker.on('click', function(e) {
        // When clicked, add the city to the saved list if it's not already there
        if (!savedCities.includes(cityData.timezone)) {
            addCity(cityData.timezone);
        }
    });
}

function initializeMap() {
    // Check if map is already initialized and remove it to prevent errors
    if (map) {
        map.remove();
    }
    
    // Initialize the map centered on the world
    map = L.map('world-map').setView([20, 0], 2);

    // Add a tile layer (OpenStreetMap for light, clean aesthetic)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add markers for all saved cities
    savedCities.forEach(timezone => {
        const cityData = CITY_TIMEZONES.find(c => c.timezone === timezone);
        if (cityData) {
            addMarkerToMap(cityData);
        }
    });

    // Add markers for all other available cities, making them clickable
    CITY_TIMEZONES
        .filter(c => !savedCities.includes(c.timezone))
        .forEach(cityData => {
            addMarkerToMap(cityData);
        });
}


// --- EVENT LISTENERS & INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    initializeClocks();
    populateEventTimezoneSelect();
    initializeMap(); // Initialize the map on load

    // Event listener for adding cities
    addCityButton.addEventListener('click', () => {
        const timezone = addCityButton.dataset.timezone;
        if (timezone) {
            addCity(timezone);
        }
    });

    // Event listener for removing cities
    cityClocksContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-city-btn');
        if (removeBtn) {
            removeCity(removeBtn.dataset.timezone);
        }
    });
    
    // Theme Toggle
    themeToggleButton.addEventListener('click', toggleTheme);
    
    // Autocomplete input listener
    citySearchInput.addEventListener('input', handleSearchInput);

    // Suggestion click listener
    suggestionsList.addEventListener('click', handleSuggestionClick);

    // Event time conversion listener
    convertTimeButton.addEventListener('click', convertEventTime);
    
    // Map resizing fix for Leaflet
    setTimeout(() => {
        if (map) {
            map.invalidateSize();
        }
    }, 500);
});