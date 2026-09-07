const $ = s => document.querySelector(s);

const state = {
  view: localStorage.getItem("elite-menu-view") || "today",
  anchorDate: todayISO(),
  selectedDate: todayISO(),
  data: null
};

function todayISO() {
  const parts = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const p = Object.fromEntries(
    parts.filter(x => x.type !== "literal").map(x => [x.type, x.value])
  );

  return `${p.year}-${p.month}-${p.day}`;
}

function parseLocalDate(s) {
  return new Date(`${s}T12:00:00`);
}

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(date, amount) {
  const d = parseLocalDate(date);
  d.setDate(d.getDate() + amount);
  return toISO(d);
}

function mondayOf(date) {
  const d = parseLocalDate(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return toISO(d);
}

function weekDates(anchor) {
  const monday = mondayOf(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

function fmt(date, options) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    ...options
  }).format(parseLocalDate(date));
}

function weekday(date) {
  return fmt(date, { weekday: "long" });
}

function dateLong(date) {
  return fmt(date, { day: "numeric", month: "long" });
}

function rangeLabel(a, b) {
  return `${fmt(a, { day: "numeric", month: "short" })} – ${fmt(b, {
    day: "numeric",
    month: "short",
    year: "numeric"
  })}`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[c]);
}

function sortMeals(meals) {
  return [...(meals || [])].sort((a, b) =>
    (Number(a.priority) || 999) - (Number(b.priority) || 999)
  );
}

function mealKind(mealName) {
  const name = String(mealName || "").toLowerCase();

  if (name.includes("ii śniad") || name.includes("ii sniad")) return "second";
  if (name.includes("śniad") || name.includes("sniad")) return "breakfast";
  if (name.includes("obiad")) return "lunch";
  if (name.includes("podwiecz")) return "snack";
  if (name.includes("kolac")) return "dinner";

  return "default";
}

function mealEmoji(mealName) {
  const kind = mealKind(mealName);
  return {
    breakfast: "☕",
    second: "🍎",
    lunch: "🍽️",
    snack: "🥤",
    dinner: "🌙",
    default: "✦"
  }[kind];
}

function mealHTML(meal) {
  const kind = mealKind(meal.mealName);

  return `
    <article class="meal" data-kind="${kind}">
      <div class="meal-top">
        <div class="meal-icon" aria-hidden="true">${mealEmoji(meal.mealName)}</div>
        <div class="meal-name">${esc(meal.mealName || "Posiłek")}</div>
      </div>
      <div class="meal-title">${esc(meal.menuMealName || "—")}</div>
    </article>
  `;
}

function emptyHTML(title, text) {
  return `
    <div class="empty">
      <strong>${esc(title)}</strong>
      ${esc(text)}
    </div>
  `;
}

function setLoading(on) {
  $("#loading").classList.toggle("hidden", !on);
}

function toast(text) {
  const el = $("#toast");
  el.textContent = text;
  el.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.add("hidden"), 4500);
}

async function fetchWeek(anchorDate, force = false) {
  setLoading(true);

  try {
    const url = `./menu-data.json${force ? `?t=${Date.now()}` : ""}`;
    const res = await fetch(url, { cache: force ? "no-store" : "default" });
    const json = await res.json();

    if (!res.ok) throw new Error("Nie udało się pobrać menu-data.json");

    state.data = json;
    state.anchorDate = anchorDate;

    render();
  } catch (err) {
    toast(err.message || "Nie udało się pobrać menu.");
    if (!state.data) {
      $("#todayContent").innerHTML = emptyHTML(
        "Nie udało się pobrać menu",
        "GitHub Actions mogło jeszcze nie wygenerować menu-data.json."
      );
      $("#weekContent").innerHTML = emptyHTML(
        "Nie udało się pobrać menu",
        "GitHub Actions mogło jeszcze nie wygenerować menu-data.json."
      );
    }
  } finally {
    setLoading(false);
  }
}

function relativeDayLabel(date) {
  const today = todayISO();
  if (date === today) return "Dziś";
  if (date === addDays(today, 1)) return "Jutro";
  if (date === addDays(today, 2)) return "Pojutrze";
  return weekday(date);
}

function ensureSelectedDateLoaded() {
  const dates = state.data?.dates || [];
  return dates.includes(state.selectedDate);
}

function renderDayStrip() {
  const today = todayISO();
  const start = addDays(state.selectedDate, -2);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  $("#dayStrip").innerHTML = dates.map(date => `
    <button
      class="day-chip ${date === state.selectedDate ? "is-selected" : ""} ${date === today ? "is-today" : ""}"
      data-date="${date}"
    >
      <strong>${esc(relativeDayLabel(date))}</strong>
      <span>${esc(fmt(date, { day: "2-digit", month: "2-digit" }))}</span>
    </button>
  `).join("");

  $("#dayStrip").querySelectorAll(".day-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      state.selectedDate = btn.dataset.date;
      state.anchorDate = state.selectedDate;
      renderToday();

      requestAnimationFrame(() => {
        btn.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest"
        });
      });
    });
  });
}

function renderToday() {
  if (!state.data) return;

  renderDayStrip();

  const date = state.selectedDate;
  const meals = sortMeals(state.data?.menu?.[date] || []);

  $("#todayContent").innerHTML = `
    <div class="today-head">
      <small>${esc(relativeDayLabel(date))} • ${esc(weekday(date))}</small>
      <strong>${esc(dateLong(date))}</strong>
    </div>
    ${
      meals.length
        ? `<div class="meals">${meals.map(mealHTML).join("")}</div>`
        : emptyHTML(
            date > todayISO() ? "Menu nie jest jeszcze dostępne" : "Brak menu",
            date > todayISO()
              ? "Elite Diet nie opublikowało jeszcze menu na ten dzień."
              : "Menu dla tego dnia nie jest dostępne."
          )
    }
  `;
}

function renderWeek() {
  if (!state.data) return;

  const dates = weekDates(state.anchorDate);
  const first = dates[0];
  const last = dates[dates.length - 1];

  $("#weekRange").textContent = rangeLabel(first, last);

  const totalMeals = dates.reduce(
    (sum, d) => sum + (state.data.menu?.[d]?.length || 0),
    0
  );

  if (!totalMeals) {
    const currentMonday = mondayOf(todayISO());
    const future = first > currentMonday;

    $("#weekContent").innerHTML = emptyHTML(
      future ? "Następny tydzień nie jest jeszcze dostępny" : "Menu nie jest dostępne",
      future
        ? "Elite Diet nie opublikowało jeszcze menu na ten tydzień."
        : "Brak opublikowanego menu dla wybranego tygodnia."
    );
    return;
  }

  const today = todayISO();

  $("#weekContent").innerHTML = `
    <div class="calendar-wrap">
      <div class="calendar-grid">
        ${dates.map(date => {
          const meals = sortMeals(state.data.menu?.[date] || []);
          const isToday = date === today;

          return `
            <section class="day ${isToday ? "is-today" : ""}">
              <header class="day-head">
                ${isToday ? `<span class="today-pill">Dziś</span>` : ""}
                <strong>${esc(weekday(date))}</strong>
                <span>${esc(dateLong(date))}</span>
              </header>

              <div class="day-meals">
                ${
                  meals.length
                    ? meals.map(mealHTML).join("")
                    : `<div class="empty"><strong>Brak menu</strong>Menu nie jest dostępne.</div>`
                }
              </div>
            </section>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function render() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.view === state.view);
  });

  $("#todayView").classList.toggle("hidden", state.view !== "today");
  $("#weekView").classList.toggle("hidden", state.view !== "week");

  renderToday();
  renderWeek();
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    state.view = tab.dataset.view;
    localStorage.setItem("elite-menu-view", state.view);

    if (state.view === "today") {
      state.selectedDate = todayISO();
      state.anchorDate = state.selectedDate;
      fetchWeek(state.anchorDate);
    } else {
      render();
    }
  });
});

$("#prevWeek").addEventListener("click", () => {
  state.anchorDate = addDays(mondayOf(state.anchorDate), -7);
  renderWeek();
});

$("#nextWeek").addEventListener("click", () => {
  state.anchorDate = addDays(mondayOf(state.anchorDate), 7);
  renderWeek();
});


async function moveSelectedDay(delta) {
  state.selectedDate = addDays(state.selectedDate, delta);
  state.anchorDate = state.selectedDate;
  renderToday();

  requestAnimationFrame(() => {
    const selected = $("#dayStrip .day-chip.is-selected");
    selected?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  });
}

$("#prevDay").addEventListener("click", () => moveSelectedDay(-1));
$("#nextDay").addEventListener("click", () => moveSelectedDay(1));

$("#refresh").addEventListener("click", () => fetchWeek(state.anchorDate, true));

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(console.error);
}

render();
fetchWeek(state.anchorDate);
