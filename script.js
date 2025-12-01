const CITY_TIMEZONES = [
    { city: 'London', country: 'UK', timezone: 'Europe/London', flag: '🇬🇧' },
    { city: 'New York', country: 'USA', timezone: 'America/New_York', flag: '🇺🇸' },
    { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
    { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺' },
    { city: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷' },
    { city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', flag: '🇦🇪' },
    { city: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
    { city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
    { city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
    { city: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', flag: '🇷🇺' },
    { city: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City', flag: '🇲🇽' },
    { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', flag: '🇪🇬' },
];

let savedCities = JSON.parse(localStorage.getItem('chronoGlobeCities')) || [
    'Europe/London',
    'America/New_York',
    'Asia/Tokyo',
];

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
        <div class="flag-icon">${cityData.flag}</div>
        <div class="city-name">${cityData.city}</div>
        <div class="time-display" data-type="time">--:--:--</div>
        <div class="date-display" data-type="date">Loading...</div>
    `;

    cityClocksContainer.appendChild(card);
}

function updateClocks() {
    document.querySelectorAll('.time-card').forEach(card => {
        const timezone = card.dataset.timezone;
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

        card.querySelector('[data-type="time"]').textContent = timeString;
        card.querySelector('[data-type="date"]').textContent = `${dateString} | ${timezone.split('/')[1].replace('_', ' ')}`;
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
}


function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('chronoGlobeTheme', isLight ? 'light' : 'dark');
    
    themeToggleButton.innerHTML = isLight 
        ? '<i class="fas fa-moon"></i>' 
        : '<i class="fas fa-sun"></i>';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('chronoGlobeTheme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleButton.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    }
}


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
            li.textContent = `${city.flag} ${city.city}, ${city.country} (${city.timezone.split('/')[1].replace('_', ' ')})`;
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


function populateEventTimezoneSelect() {
    eventTimeFromSelect.innerHTML = ''; 
    
    const localOption = document.createElement('option');
    localOption.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    localOption.textContent = `Local Time (${localOption.value.split('/')[1]?.replace('_', ' ') || 'Local'})`;
    eventTimeFromSelect.appendChild(localOption);

    savedCities.forEach(timezone => {
        const cityData = CITY_TIMEZONES.find(c => c.timezone === timezone);
        if (cityData) {
            const option = document.createElement('option');
            option.value = timezone;
            option.textContent = `${cityData.flag} ${cityData.city} (${cityData.timezone.split('/')[1].replace('_', ' ')})`;
            eventTimeFromSelect.appendChild(option);
        }
    });
}

function convertEventTime() {
    const dateTimeString = eventDateTimeInput.value;
    const fromTimezone = eventTimeFromSelect.value;

    if (!dateTimeString || !fromTimezone) {
        conversionResultsDiv.innerHTML = '<p class="initial-message" style="color:red;">Please select both a date/time and a "From" city.</p>';
        return;
    }

    const eventTimeUTC = new Date(new Date(dateTimeString + 'Z').toLocaleString('en-US', { timeZone: fromTimezone, timeZoneName: 'short' }));

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
        
        const cityDisplay = CITY_TIMEZONES.find(c => c.timezone === targetTimezone)?.city || 'Local Time';
        const flag = CITY_TIMEZONES.find(c => c.timezone === targetTimezone)?.flag || '🌎';

        const resultItem = document.createElement('div');
        resultItem.className = 'conversion-result-item';
        resultItem.innerHTML = `
            ${flag} <strong>${cityDisplay} (${targetTimezone.split('/')[1]?.replace('_', ' ') || 'Local'}):</strong> 
            <span>${convertedTime}</span>
        `;
        conversionResultsDiv.appendChild(resultItem);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    initializeClocks();
    populateEventTimezoneSelect();

    addCityButton.addEventListener('click', () => {
        const timezone = addCityButton.dataset.timezone;
        if (timezone) {
            addCity(timezone);
        }
    });

    cityClocksContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-city-btn');
        if (removeBtn) {
            removeCity(removeBtn.dataset.timezone);
        }
    });
    
    themeToggleButton.addEventListener('click', toggleTheme);
    
    citySearchInput.addEventListener('input', handleSearchInput);

    suggestionsList.addEventListener('click', handleSuggestionClick);

    convertTimeButton.addEventListener('click', convertEventTime);

    worldMapDiv.addEventListener('click', () => {
        alert("Map clicked! In an advanced version, this would trigger city selection and display its time.");
    });
});