// ==========================
// FLAG + CITY DATA
// ==========================
const allCities = {
    "Los Angeles": { zone: "America/Los_Angeles", flag: "🇺🇸" },
    "New York": { zone: "America/New_York", flag: "🇺🇸" },
    "London": { zone: "Europe/London", flag: "🇬🇧" },
    "Paris": { zone: "Europe/Paris", flag: "🇫🇷" },
    "Beirut": { zone: "Asia/Beirut", flag: "🇱🇧" },
    "Dubai": { zone: "Asia/Dubai", flag: "🇦🇪" },
    "Tokyo": { zone: "Asia/Tokyo", flag: "🇯🇵" },
    "Sydney": { zone: "Australia/Sydney", flag: "🇦🇺" },
  
    // Extra dropdown cities
    "Toronto": { zone: "America/Toronto", flag: "🇨🇦" },
    "Chicago": { zone: "America/Chicago", flag: "🇺🇸" },
    "Mexico City": { zone: "America/Mexico_City", flag: "🇲🇽" },
    "São Paulo": { zone: "America/Sao_Paulo", flag: "🇧🇷" },
    "Cairo": { zone: "Africa/Cairo", flag: "🇪🇬" },
    "Johannesburg": { zone: "Africa/Johannesburg", flag: "🇿🇦" },
    "Istanbul": { zone: "Europe/Istanbul", flag: "🇹🇷" },
    "Singapore": { zone: "Asia/Singapore", flag: "🇸🇬" },
    "Hong Kong": { zone: "Asia/Hong_Kong", flag: "🇭🇰" },
    "Seoul": { zone: "Asia/Seoul", flag: "🇰🇷" }
  };
  
  // ==========================
  // POPULATE DROPDOWNS
  // ==========================
  const citySelect = document.getElementById("citySelect");
  const baseCitySelect = document.getElementById("baseCitySelect");
  
  for (const city in allCities) {
    const zone = allCities[city].zone;
    const flag = allCities[city].flag;
  
    const op1 = document.createElement("option");
    op1.value = zone;
    op1.textContent = `${flag} ${city}`;
    citySelect.appendChild(op1);
  
    const op2 = document.createElement("option");
    op2.value = zone;
    op2.textContent = `${flag} ${city}`;
    baseCitySelect.appendChild(op2);
  }
  
  // ==========================
  // CLOCK CARDS
  // ==========================
  function addClock(zone) {
    const city = Object.keys(allCities).find(c => allCities[c].zone === zone);
    const { flag } = allCities[city];
  
    const card = document.createElement("div");
    card.className = "clock-card";
    card.innerHTML = `
      <div class="clock-header">
        <div class="clock-title-group">
          <span class="clock-title">${flag} ${city}</span>
        </div>
        <span class="clock-metadata">${zone}</span>
      </div>
      <div class="clock-time" data-zone="${zone}">--:--</div>
      <button class="remove-btn">Remove</button>
    `;
  
    card.querySelector(".remove-btn").onclick = () => card.remove();
    document.getElementById("clocksContainer").appendChild(card);
  }
  
  document.getElementById("addCityBtn").onclick = () => {
    addClock(citySelect.value);
  };
  
  setInterval(() => {
    document.querySelectorAll(".clock-time").forEach(div => {
      div.textContent = new Date().toLocaleTimeString("en-US", {
        timeZone: div.dataset.zone,
        hour: "2-digit",
        minute: "2-digit"
      });
    });
  }, 1000);
  
  // ==========================
  // EVENT CONVERTER
  // ==========================
  document.getElementById("convertBtn").onclick = () => {
    const baseZone = baseCitySelect.value;
    const time = document.getElementById("eventTime").value;
    const out = document.getElementById("resultsList");
    out.innerHTML = "";
    if (!time) return;
  
    const [h, m] = time.split(":");
    const baseDate = new Date();
    baseDate.setHours(h);
    baseDate.setMinutes(m);
  
    for (const city in allCities) {
      const { zone, flag } = allCities[city];
  
      const converted = baseDate.toLocaleTimeString("en-US", {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit"
      });
  
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="results-city">${flag} ${city}</span>
        <span class="results-time">${converted}</span>
      `;
      out.appendChild(li);
    }
  };
  
  // ==========================
  // MAP TOOLTIP + CLICK
  // ==========================
  const tooltip = document.getElementById("mapTooltip");
  
  document.querySelectorAll(".map-city-dot").forEach(dot => {
    dot.addEventListener("mousemove", e => {
      const zone = dot.dataset.zone;
      const city = Object.keys(allCities).find(c => allCities[c].zone === zone);
      const flag = allCities[city].flag;
  
      const now = new Date().toLocaleTimeString("en-US", {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
  
      tooltip.style.left = e.pageX + "px";
      tooltip.style.top = e.pageY - 15 + "px";
      tooltip.style.opacity = 1;
      tooltip.textContent = `${flag} ${city}: ${now}`;
    });
  
    dot.addEventListener("mouseleave", () => {
      tooltip.style.opacity = 0;
    });
  
    dot.addEventListener("click", () => {
      addClock(dot.dataset.zone);
    });
  });
  
  // ==========================
  // THEME SWITCH
  // ==========================
  document.getElementById("themeSwitch").onchange = e => {
    document.documentElement.classList.toggle("dark", e.target.checked);
  };
  