document.addEventListener("DOMContentLoaded", () => {

    // CITY DATA (one source of truth)

    const CITY_DATA = [
      { label: "Los Angeles", zone: "America/Los_Angeles", flag: "🇺🇸", gmt: "GMT-8/7" },
      { label: "Chicago", zone: "America/Chicago", flag: "🇺🇸", gmt: "GMT-6/5" },
      { label: "New York", zone: "America/New_York", flag: "🇺🇸", gmt: "GMT-5/4" },
      { label: "London", zone: "Europe/London", flag: "🇬🇧", gmt: "GMT±0/1" },
      { label: "Paris", zone: "Europe/Paris", flag: "🇫🇷", gmt: "GMT+1/2" },
      { label: "Beirut", zone: "Asia/Beirut", flag: "🇱🇧", gmt: "GMT+2/3" },
      { label: "Dubai", zone: "Asia/Dubai", flag: "🇦🇪", gmt: "GMT+4" },
      { label: "Tokyo", zone: "Asia/Tokyo", flag: "🇯🇵", gmt: "GMT+9" },
      { label: "Sydney", zone: "Australia/Sydney", flag: "🇦🇺", gmt: "GMT+10/11" }
    ];
  

    // ELEMENTS

    const addCityBtn = document.getElementById("addCityBtn");
    const citySelect = document.getElementById("citySelect");
    const clocksContainer = document.getElementById("clocksContainer");
    const themeSwitch = document.getElementById("themeSwitch");
  
    const baseCitySelect = document.getElementById("baseCitySelect");
    const eventTimeInput = document.getElementById("eventTime");
    const convertBtn = document.getElementById("convertBtn");
    const resultsList = document.getElementById("resultsList");
  
    const mapDots = document.querySelectorAll(".map-city-dot");
  
    const STORAGE_KEY_CITIES = "globalTimeApp_cities";
    const STORAGE_KEY_THEME = "globalTimeApp_theme";
  
    // Active clock objects: { zone, element }
    let activeClocks = [];
  

    // SELECT POPULATION

    function populateCitySelects() {
      // For dashboard select
      citySelect.innerHTML = `<option value="" disabled selected>Select a city</option>`;
      CITY_DATA.forEach(city => {
        const opt = document.createElement("option");
        opt.value = city.zone;
        opt.textContent = `${city.flag} ${city.label}`;
        citySelect.appendChild(opt);
      });
  
      // For converter base city
      baseCitySelect.innerHTML = `<option value="" disabled selected>Select event city</option>`;
      CITY_DATA.forEach(city => {
        const opt = document.createElement("option");
        opt.value = city.zone;
        opt.textContent = `${city.flag} ${city.label}`;
        baseCitySelect.appendChild(opt);
      });
    }
  
    populateCitySelects();
  

    // LOCAL STORAGE HELPERS

    function saveCities() {
      const zones = activeClocks.map(c => c.zone);
      localStorage.setItem(STORAGE_KEY_CITIES, JSON.stringify(zones));
    }
  
    function loadCities() {
      const raw = localStorage.getItem(STORAGE_KEY_CITIES);
      if (!raw) return;
      try {
        const zones = JSON.parse(raw);
        zones.forEach(zone => createClockCard(zone));
      } catch (e) {
        console.warn("Could not parse saved cities", e);
      }
    }
  

    // THEME SETUP (persisted)

    function applyTheme(theme) {
      if (theme === "dark") {
        document.body.classList.add("dark");
        themeSwitch.checked = true;
      } else {
        document.body.classList.remove("dark");
        themeSwitch.checked = false;
      }
    }
  
    // Load initial theme
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      applyTheme("light");
    }
  
    themeSwitch.addEventListener("change", () => {
      const theme = themeSwitch.checked ? "dark" : "light";
      applyTheme(theme);
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    });
  

    // CLOCK CARD CREATION

    function createClockCard(zone) {
      // Prevent duplicates
      if (activeClocks.some(c => c.zone === zone)) {
        alert("City is already on your dashboard.");
        return;
      }
  
      const cityInfo = CITY_DATA.find(c => c.zone === zone);
      const label = cityInfo ? cityInfo.label : zone.split("/")[1]?.replace("_", " ") || zone;
      const flag = cityInfo?.flag || "🌍";
      const gmt = cityInfo?.gmt || "";
  
      const card = document.createElement("div");
      card.className = "clock-card";
  
      const header = document.createElement("div");
      header.className = "clock-header";
  
      const titleGroup = document.createElement("div");
      titleGroup.className = "clock-title-group";
  
      const flagEl = document.createElement("span");
      flagEl.className = "city-flag";
      flagEl.textContent = flag;
  
      const title = document.createElement("div");
      title.className = "clock-title";
      title.textContent = label;
  
      const meta = document.createElement("div");
      meta.className = "clock-metadata";
      meta.textContent = gmt;
  
      titleGroup.appendChild(flagEl);
      titleGroup.appendChild(title);
  
      header.appendChild(titleGroup);
      header.appendChild(meta);
  
      const timeDisplay = document.createElement("div");
      timeDisplay.className = "clock-time";
  
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "Remove";
  
      removeBtn.addEventListener("click", () => {
        card.remove();
        activeClocks = activeClocks.filter(c => c.zone !== zone);
        saveCities();
      });
  
      card.appendChild(header);
      card.appendChild(timeDisplay);
      card.appendChild(removeBtn);
  
      clocksContainer.appendChild(card);
  
      activeClocks.push({
        zone,
        element: timeDisplay
      });
  
      saveCities();
    }
  

    // ADD CITY HANDLERS

    addCityBtn.addEventListener("click", () => {
      const zone = citySelect.value;
      if (!zone) return;
      createClockCard(zone);
    });
  
    // From map clicks
    mapDots.forEach(dot => {
      dot.addEventListener("click", () => {
        const zone = dot.getAttribute("data-zone");
        if (!zone) return;
        createClockCard(zone);
      });
    });
  

    // CLOCK TICK

    function updateClocks() {
      activeClocks.forEach(clock => {
        const nowString = new Date().toLocaleString("en-US", {
          timeZone: clock.zone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
        clock.element.textContent = nowString;
      });
    }
  
    updateClocks();
    setInterval(updateClocks, 1000);
  
    // Restore saved cities after everything is ready
    loadCities();
  

    // EVENT TIME CONVERTER

    function parseTimeToMinutes(timeStr) {
      const [h, m] = timeStr.split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    }
  
    function formatMinutesToTime(mins) {
      // Normalize to 0–1439
      let total = ((mins % 1440) + 1440) % 1440;
      const hours24 = Math.floor(total / 60);
      const minutes = total % 60;
  
      const period = hours24 >= 12 ? "PM" : "AM";
      const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  
      const paddedMin = minutes.toString().padStart(2, "0");
      const padded24h = hours24.toString().padStart(2, "0");
  
      return {
        display: `${hours12}:${paddedMin} ${period}`,
        debug24: `${padded24h}:${paddedMin}`
      };
    }
  
    function getOffsetMinutes(baseZone, targetZone) {
      const now = new Date();
  
      const baseString = now.toLocaleString("en-GB", {
        timeZone: baseZone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
      });
      const targetString = now.toLocaleString("en-GB", {
        timeZone: targetZone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
      });
  
      const [bh, bm] = baseString.split(":").map(Number);
      const [th, tm] = targetString.split(":").map(Number);
  
      const baseMinutes = bh * 60 + bm;
      const targetMinutes = th * 60 + tm;
  
      return targetMinutes - baseMinutes;
    }
  
    convertBtn.addEventListener("click", () => {
      const baseZone = baseCitySelect.value;
      const timeStr = eventTimeInput.value;
  
      resultsList.innerHTML = "";
  
      if (!baseZone || !timeStr) {
        const li = document.createElement("li");
        li.textContent = "Please select an event city and time.";
        resultsList.appendChild(li);
        return;
      }
  
      const baseMinutes = parseTimeToMinutes(timeStr);
      if (baseMinutes === null) {
        const li = document.createElement("li");
        li.textContent = "Invalid time format.";
        resultsList.appendChild(li);
        return;
      }
  
      CITY_DATA.forEach(city => {
        const li = document.createElement("li");
  
        const citySpan = document.createElement("div");
        citySpan.className = "results-city";
        citySpan.innerHTML = `<span>${city.flag}</span><span>${city.label}</span>`;
  
        const offset = getOffsetMinutes(baseZone, city.zone);
        const converted = formatMinutesToTime(baseMinutes + offset);
  
        const timeSpan = document.createElement("div");
        timeSpan.className = "results-time";
        timeSpan.textContent = converted.display;
  
        li.appendChild(citySpan);
        li.appendChild(timeSpan);
  
        resultsList.appendChild(li);
      });
    });
  });
  