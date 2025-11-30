document.addEventListener("DOMContentLoaded", () => {


    // GLOBAL TIME APP FUNCTIONALITY

    
    // Elements
    const addCityBtn = document.getElementById("addCityBtn");
    const citySelect = document.getElementById("citySelect");
    const clocksContainer = document.getElementById("clocksContainer");
    const themeSwitch = document.getElementById("themeSwitch");

    // Store active clocks
    let activeClocks = [];

//
    // ADD CITY CLOCK

    addCityBtn.addEventListener("click", () => {
        const selectedZone = citySelect.value;
        if (!selectedZone) return;

        // Check duplication
        if (activeClocks.some(c => c.zone === selectedZone)) {
            alert("City already added!");
            return;
        }

        // Create card
        const card = document.createElement("div");
        card.className = "clock-card";

        const title = document.createElement("div");
        title.className = "clock-title";
        title.textContent = selectedZone.split("/")[1].replace("_", " ");

        const timeDisplay = document.createElement("div");
        timeDisplay.className = "clock-time";

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "Remove";

        removeBtn.addEventListener("click", () => {
            card.remove();
            activeClocks = activeClocks.filter(c => c.zone !== selectedZone);
        });

        card.appendChild(title);
        card.appendChild(timeDisplay);
        card.appendChild(removeBtn);

        clocksContainer.appendChild(card);

        activeClocks.push({
            zone: selectedZone,
            element: timeDisplay
        });
    });


    // UPDATE CLOCKS EVERY SECOND

    setInterval(() => {
        activeClocks.forEach(clock => {
            const now = new Date().toLocaleString("en-US", {
                timeZone: clock.zone,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
            clock.element.textContent = now;
        });
    }, 1000);


    // THEME TOGGLE (LIGHT / DARK)

    themeSwitch.addEventListener("change", () => {
        document.body.classList.toggle("dark");
    });

});
