// ==========================
// GLOBAL CITIES LIST
// ==========================
const allCities = {
    "Los Angeles": "America/Los_Angeles",
    "New York": "America/New_York",
    "London": "Europe/London",
    "Paris": "Europe/Paris",
    "Beirut": "Asia/Beirut",
    "Dubai": "Asia/Dubai",
    "Tokyo": "Asia/Tokyo",
    "Sydney": "Australia/Sydney",
  
    // EXTRA DROPDOWN CITIES (NOT ON MAP)
    "Toronto": "America/Toronto",
    "Chicago": "America/Chicago",
    "Mexico City": "America/Mexico_City",
    "São Paulo": "America/Sao_Paulo",
    "Cairo": "Africa/Cairo",
    "Johannesburg": "Africa/Johannesburg",
    "Istanbul": "Europe/Istanbul",
    "Singapore": "Asia/Singapore",
    "Hong Kong": "Asia/Hong_Kong",
    "Seoul": "Asia/Seoul"
  };
  
  // Inject cities into dropdowns
  const citySelect = document.getElementById("citySelect");
  const baseCitySelect = document.getElementById("baseCitySelect");
  
  Object.entries(allCities).forEach(([city, zone]) => {
    let op1 = document.createElement("option");
    op1.value = zone;
    op1.textContent = city;
    citySelect.appendChild(op1);
  
    let op2 = document.createElement("option");
    op2.value = zone;
    op2.textContent = city;
    baseCitySelect.appendChild(op2);
  });
  
  // ==========================
  // ADD CLOCK CARD
  // ==========================
  const clocksContainer = document.getElementById("clocksContainer");
  
  function addClock(zone) {
    const city = Object.keys(allCities).find(c => allCities[c] === zone);
  
    const card = document.createElement("div");
    card.className = "clock-card";
  
    card.innerHTML = `
      <div class="clock-header">
        <div class="clock-title-group">
          <span class="clock-title">${city}</span>
        </div>
        <span class="clock-metadata">${zone}</span>
      </div>
      <div class="clock-time" data-zone="${zone}">--:--</div>
      <button class="remove-btn">Remove</button>
    `;
  
    card.querySelector(".remove-btn").addEventListener("click", () => card.remove());
    clocksContainer.appendChild(card);
  }
  
  document.getElementById("addCityBtn").addEventListener("click", () => {
    const zone = citySelect.value;
    addClock(zone);
  });
  
  // Update clocks every second
  setInterval(() => {
    document.querySelectorAll(".clock-time").forEach(div => {
      const zone = div.dataset.zone;
      div.textContent = new Date().toLocaleTimeString("en-US", {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit"
      });
    });
  }, 1000);
  
  // ==========================
  // EVENT CONVERTER
  // ==========================
  document.getElementById("convertBtn").addEventListener("click", () => {
    const baseZone = baseCitySelect.value;
    const time = document.getElementById("eventTime").value;
    const list = document.getElementById("resultsList");
    list.innerHTML = "";
  
    if (!time) return;
  
    const [h, m] = time.split(":");
    const baseDate = new Date();
    baseDate.setHours(h);
    baseDate.setMinutes(m);
  
    Object.entries(allCities).forEach(([city, zone]) => {
      let converted = baseDate.toLocaleTimeString("en-US", {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit"
      });
  
      const li = document.createElement("li");
      li.innerHTML = `<span class="results-city">${city}</span>
                      <span class="results-time">${converted}</span>`;
      list.appendChild(li);
    });
  });
  
  // ==========================
  // WORLD MAP TOOLTIP + CLICK
  // ==========================
  const tooltip = document.getElementById("mapTooltip");
  
  document.querySelectorAll(".map-city-dot").forEach(dot => {
    dot.addEventListener("mousemove", e => {
      const zone = dot.dataset.zone;
      const city = Object.keys(allCities).find(c => allCities[c] === zone);
  
      const now = new Date().toLocaleTimeString("en-US", {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
  
      tooltip.style.opacity = 1;
      tooltip.style.left = `${e.pageX}px`;
      tooltip.style.top = `${e.pageY}px`;
      tooltip.textContent = `${city}: ${now}`;
    });
  
    dot.addEventListener("mouseleave", () => {
      tooltip.style.opacity = 0;
    });
  
    dot.addEventListener("click", () => {
      addClock(dot.dataset.zone);
    });
  });
  
  // ==========================
  // THEME TOGGLE
  // ==========================
  document.getElementById("themeSwitch").addEventListener("change", e => {
    document.documentElement.classList.toggle("dark", e.target.checked);
  });
  