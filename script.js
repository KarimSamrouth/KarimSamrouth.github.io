/* ----------------------------------------------------
   CITY LIST (Expanded 45 cities)
---------------------------------------------------- */
const cityList = [
    "America/Los_Angeles",
    "America/Chicago",
    "America/New_York",
    "America/Denver",
    "America/Toronto",
    "America/Vancouver",
    "America/Mexico_City",
    "America/Sao_Paulo",
    "America/Bogota",
  
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Amsterdam",
    "Europe/Rome",
    "Europe/Madrid",
    "Europe/Zurich",
    "Europe/Athens",
    "Europe/Stockholm",
    "Europe/Oslo",
  
    "Africa/Cairo",
    "Africa/Nairobi",
    "Africa/Johannesburg",
    "Africa/Accra",
  
    "Asia/Dubai",
    "Asia/Beirut",
    "Asia/Tokyo",
    "Asia/Hong_Kong",
    "Asia/Seoul",
    "Asia/Singapore",
    "Asia/Kuala_Lumpur",
    "Asia/Bangkok",
    "Asia/Kolkata",
    "Asia/Jakarta",
  
    "Australia/Sydney",
    "Australia/Melbourne",
  ];
  
  /* ----------------------------------------------------
     Populate dropdowns
  ---------------------------------------------------- */
  function populateDropdowns() {
    const citySelect = document.getElementById("citySelect");
    const eventCitySelect = document.getElementById("eventCitySelect");
  
    cityList.forEach(zone => {
      const label = zone.split("/")[1].replace("_", " ");
  
      const opt1 = document.createElement("option");
      opt1.value = zone;
      opt1.textContent = label;
      citySelect.appendChild(opt1);
  
      const opt2 = document.createElement("option");
      opt2.value = zone;
      opt2.textContent = label;
      eventCitySelect.appendChild(opt2);
    });
  }
  populateDropdowns();
  
  /* ----------------------------------------------------
     Add city clock
  ---------------------------------------------------- */
  let activeClocks = [];
  const container = document.getElementById("clocksContainer");
  
  document.getElementById("addCityBtn").addEventListener("click", () => {
    const zone = document.getElementById("citySelect").value;
    if (!zone || activeClocks.includes(zone)) return;
  
    activeClocks.push(zone);
  
    const card = document.createElement("div");
    card.className = "clock-card";
  
    const title = document.createElement("h3");
    title.textContent = zone.split("/")[1].replace("_", " ");
  
    const timeEl = document.createElement("div");
    timeEl.className = "clock-time";
  
    const remove = document.createElement("button");
    remove.textContent = "Remove";
    remove.onclick = () => {
      activeClocks = activeClocks.filter(z => z !== zone);
      card.remove();
    };
  
    card.append(title, timeEl, remove);
    container.appendChild(card);
  
    function updateTime() {
      timeEl.textContent = new Date().toLocaleTimeString("en-US", { timeZone: zone });
    }
    updateTime();
    setInterval(updateTime, 1000);
  });
  
  /* ----------------------------------------------------
     Event Converter
  ---------------------------------------------------- */
  document.getElementById("convertBtn").addEventListener("click", () => {
    const baseZone = document.getElementById("eventCitySelect").value;
    const time = document.getElementById("eventTimeInput").value;
    const list = document.getElementById("convertedList");
  
    if (!baseZone || !time) return;
  
    const [h, m] = time.split(":").map(Number);
    const baseDate = new Date();
    baseDate.setHours(h, m, 0, 0);
  
    list.innerHTML = "";
  
    cityList.forEach(zone => {
      const converted = new Date(baseDate.toLocaleString("en-US", { timeZone: zone }));
      const item = document.createElement("div");
      item.textContent = `${zone.split("/")[1].replace("_", " ")} – ${converted.toLocaleTimeString("en-US")}`;
      list.appendChild(item);
    });
  });
  
  /* ----------------------------------------------------
     World Map (Clickable dots)
  ---------------------------------------------------- */
  const mapDots = [
    { label: "Los Angeles", x: 32, y: 140, zone: "America/Los_Angeles" },
    { label: "New York", x: 120, y: 110, zone: "America/New_York" },
    { label: "London", x: 260, y: 85, zone: "Europe/London" },
    { label: "Paris", x: 275, y: 100, zone: "Europe/Paris" },
    { label: "Beirut", x: 320, y: 115, zone: "Asia/Beirut" },
    { label: "Dubai", x: 350, y: 130, zone: "Asia/Dubai" },
    { label: "Tokyo", x: 520, y: 140, zone: "Asia/Tokyo" },
    { label: "Sydney", x: 580, y: 210, zone: "Australia/Sydney" },
  ];
  
  const mapContainer = document.getElementById("mapDotsContainer");
  
  mapDots.forEach(dot => {
    const el = document.createElement("div");
    el.className = "map-city-dot";
    el.style.left = dot.x + "px";
    el.style.top = dot.y + "px";
    el.onclick = () => {
      document.getElementById("citySelect").value = dot.zone;
    };
    mapContainer.appendChild(el);
  
    const label = document.createElement("div");
    label.className = "map-city-label";
    label.style.left = (dot.x + 18) + "px";
    label.style.top = (dot.y - 4) + "px";
    label.textContent = dot.label;
    mapContainer.appendChild(label);
  });
  
  /* ----------------------------------------------------
     Theme toggle
  ---------------------------------------------------- */
  const themeSwitch = document.getElementById("themeSwitch");
  themeSwitch.addEventListener("change", () => {
    document.body.classList.toggle("dark");
  });
  
  /* ----------------------------------------------------
     Scroll helper
  ---------------------------------------------------- */
  function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  }
  