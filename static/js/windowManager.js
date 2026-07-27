class WindowManager {
  constructor() {
    this.desktop = document.getElementById('desktop');
    this.taskbar = document.getElementById('taskbar');
    this.windows = new Map();
    this.topZ = 20;
    this.labels = {
      calendar: 'Calendar', tasks: 'Tasks', notes: 'Notes', ai: 'AI Assistant',
      habits: 'Habits', finance: 'Finance', weather: 'Weather', settings: 'Settings', notifications: 'Notifications', music: 'Music'
    };
    this.themes = [
      ['midnight', 'Midnight', 'Deep blue and violet'],
      ['amethyst', 'Amethyst', 'Vibrant purple glow'],
      ['ocean', 'Ocean', 'Cool cyan horizon'],
      ['forest', 'Forest', 'Calm evergreen'],
      ['sunset', 'Sunset', 'Warm coral dusk'],
      ['rose', 'Rose', 'Soft pink bloom'],
      ['graphite', 'Graphite', 'Minimal monochrome'],
      ['aurora', 'Aurora', 'Northern lights']
    ];
    let savedTheme = 'midnight';
    try { savedTheme = localStorage.getItem('lifeos.theme') || savedTheme; } catch (_) {}
    this.applyTheme(savedTheme);
    let resizeFrame;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => this.keepWindowsInView());
    });
  }

  open(app) {
    let entry = this.windows.get(app);
    if (!entry) entry = this.create(app);
    const wasMinimized = entry.window.classList.contains('is-minimized');
    entry.window.classList.remove('is-minimized');
    if (wasMinimized) this.play(entry.window, 'is-restoring');
    entry.taskButton.hidden = true;
    this.focus(entry.window);
  }

  create(app) {
    const title = this.labels[app] || app;
    const windowEl = document.createElement('section');
    windowEl.className = `window is-opening${app === 'notes' ? ' window--notes' : ''}${app === 'habits' ? ' window--habits' : ''}${app === 'calendar' ? ' window--calendar' : ''}${app === 'settings' ? ' window--settings' : ''}${app === 'weather' ? ' window--weather' : ''}${app === 'tasks' ? ' window--tasks' : ''}${app === 'finance' ? ' window--finance' : ''}${app === 'notifications' ? ' window--notifications' : ''}${app === 'music' ? ' window--music' : ''}`;
    windowEl.addEventListener('animationend', event => {
      if (event.animationName === 'window-enter') windowEl.classList.remove('is-opening');
    });
    windowEl.setAttribute('role', 'dialog');
    windowEl.setAttribute('aria-label', title);
    windowEl.innerHTML = `
      <header class="titlebar">
        <span class="window-title">${title}</span>
        <div class="window-controls">
          <button class="window-control" type="button" aria-label="Minimize ${title}"><i class="fa-solid fa-minus"></i></button>
          <button class="window-control window-control--close" type="button" aria-label="Close ${title}"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </header>
      <div class="window-content">${app === 'notes' ? this.notesContent() : app === 'habits' ? this.habitsContent() : app === 'calendar' ? this.calendarContent() : app === 'settings' ? this.settingsContent() : app === 'weather' ? this.weatherContent() : app === 'tasks' ? this.tasksContent() : app === 'finance' ? this.financeContent() : app === 'notifications' ? this.notificationsContent() : app === 'music' ? this.musicContent() : `<h2>${title}</h2><div class="empty-state">${title} is ready for your content.</div>`}</div>`;
    const offset = this.windows.size * 28;

    const taskButton = document.createElement('button');
    taskButton.className = 'taskbar-window';
    taskButton.type = 'button';
    taskButton.textContent = title;
    taskButton.hidden = true;
    taskButton.addEventListener('click', () => this.open(app));
    this.taskbar.append(taskButton);
    this.desktop.append(windowEl);
    windowEl.style.left = `${Math.max(10, (window.innerWidth - windowEl.offsetWidth) / 2 + offset)}px`;
    windowEl.style.top = `${Math.max(10, (window.innerHeight - windowEl.offsetHeight) / 2 + offset)}px`;

    if (app === 'notes') this.bindNotes(windowEl);
    if (app === 'habits') this.bindHabits(windowEl);
    if (app === 'calendar') this.bindCalendar(windowEl);
    if (app === 'settings') this.bindSettings(windowEl);
    if (app === 'weather') this.bindWeather(windowEl);
    if (app === 'tasks') this.bindTasks(windowEl);
    if (app === 'finance') this.bindFinance(windowEl);
    if (app === 'notifications') this.bindNotifications(windowEl);
    if (app === 'music') this.bindMusic(windowEl);

    windowEl.addEventListener('pointerdown', () => this.focus(windowEl));
    const minimizeButton = windowEl.querySelector('.window-control');
    const closeButton = windowEl.querySelector('.window-control--close');
    const bindControl = (button, action) => button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      action();
    });
    bindControl(closeButton, () => {
      if (windowEl.classList.contains('is-closing')) return;
      windowEl.classList.add('is-closing');
      windowEl.addEventListener('animationend', () => {
        windowEl.remove();
        taskButton.remove();
        this.windows.delete(app);
      }, { once: true });
    });
    bindControl(minimizeButton, () => this.minimize(app));
    this.makeDraggable(windowEl, windowEl.querySelector('.titlebar'));
    const entry = { window: windowEl, taskButton };
    this.windows.set(app, entry);
    return entry;
  }

  notesContent() {
    return `
      <div class="notes-app">
        <div class="notes-watermark" aria-hidden="true">--:--</div>
        <h2 class="notes-heading">Notes</h2>
        <div class="notes-workspace">
          <nav class="notes-list" aria-label="Your notes">
            <div class="notes-list-items">
              <button class="note-item is-selected" type="button" data-note-title="Welcome" data-note-body="This is your private space.\n\nWrite down an idea, a reminder, or something worth keeping.">Welcome</button>
            </div>
            <div class="notes-actions">
              <button class="notes-action notes-action--new" type="button"><i class="fa-solid fa-plus"></i> New note</button>
              <button class="notes-action notes-action--save" type="button" aria-label="Save notes"><i class="fa-solid fa-floppy-disk"></i></button>
              <button class="notes-action notes-action--remove" type="button" aria-label="Remove selected note"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </nav>
          <article class="note-editor">
            <input class="note-title-input" aria-label="Note title" value="Welcome" readonly>
            <textarea class="note-body-input" aria-label="Note content" placeholder="Start writing...">This is your private space.

Write down an idea, a reminder, or something worth keeping.</textarea>
          </article>
        </div>
      </div>`;
  }

  habitsContent() {
    return `
      <div class="habits-app">
        <header class="habits-header">
          <p class="habits-eyebrow">Build your rhythm</p>
          <h2>Habits</h2>
          <p>Make small promises, then keep them.</p>
        </header>
        <form class="habit-form" action="/uploadhabits" method="post">
          <label class="habit-field habit-field--name"><span>Habit name</span><input name="name" required maxlength="60" placeholder="e.g. Morning walk"></label>
          <label class="habit-field habit-field--info"><span>Extra info</span><input name="info" maxlength="120" placeholder="A gentle start before work"></label>
          <label class="habit-field habit-field--frequency"><span>Frequency</span><input name="frequency" required maxlength="50" placeholder="e.g. Mon, Wed, Fri"></label>
          <button class="habit-add" type="submit"><i class="fa-solid fa-plus"></i> Add habit</button>
        </form>
        <section class="habit-list" aria-live="polite">
          <p class="habits-empty">Your habits will appear here.</p>
        </section>
      </div>`;
  }

  bindHabits(windowEl){

const form=windowEl.querySelector(".habit-form");
const list=windowEl.querySelector(".habit-list");
const button=form.querySelector(".habit-add");

const api=async(url,options={})=>{
const response=await fetch(url,options);
const payload=await response.json().catch(()=>({}));

if(!response.ok)
throw new Error(payload.detail||"Unable to save habit");

return payload;
};

const renderHabit=habit=>{

const card=document.createElement("article");
card.className="habit-card";

card.innerHTML=`
<h3>${habit.content}</h3>
<p>${habit.extra_info||"No extra details yet."}</p>
<span>${habit.frequency}</span>
`;

list.querySelector(".habits-empty")?.remove();

list.prepend(card);

};

const loadHabits=async()=>{

list.innerHTML="<p class='habits-empty'>Loading...</p>";

try{

const payload=await api("/api/habits");

list.innerHTML="";

if(payload.habits.length===0){

list.innerHTML="<p class='habits-empty'>Your habits will appear here.</p>";

return;

}

payload.habits.forEach(renderHabit);

}catch(err){

list.innerHTML=`<p class="habits-empty">${err.message}</p>`;

}

};

form.addEventListener("submit",async e=>{

e.preventDefault();

button.disabled=true;

button.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Saving';

try{

const payload=await api("/api/habits",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

title:form.elements.name.value,

extra_info:form.elements.info.value,

frequency:form.elements.frequency.value

})

});

renderHabit(payload.habit);

form.reset();

form.elements.name.focus();

}catch(err){

alert(err.message);

}

finally{

button.disabled=false;

button.innerHTML='<i class="fa-solid fa-plus"></i> Add habit';

}

});

loadHabits();

}

  calendarContent() {
    return `
      <div class="calendar-app">
        <header class="calendar-header">
          <div><h2>Calendar</h2></div>
          <div class="calendar-nav"><button type="button" class="calendar-nav-button calendar-previous" aria-label="Previous month"><i class="fa-solid fa-chevron-left"></i></button><strong class="calendar-month" aria-live="polite"></strong><button type="button" class="calendar-nav-button calendar-next" aria-label="Next month"><i class="fa-solid fa-chevron-right"></i></button></div>
        </header>
        <div class="calendar-layout">
          <section class="calendar-panel" aria-label="Calendar dates">
            <div class="calendar-weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
            <div class="calendar-grid"></div>
          </section>
        </div>
      </div>`;
  }

  bindCalendar(windowEl) {
    const monthLabel = windowEl.querySelector('.calendar-month');
    const grid = windowEl.querySelector('.calendar-grid');
    const today = new Date();
    let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const isToday = date => date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    const renderCalendar = () => {
      monthLabel.textContent = visibleMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      grid.replaceChildren();
      const firstWeekday = visibleMonth.getDay();
      const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
      for (let blank = 0; blank < firstWeekday; blank += 1) grid.append(document.createElement('span'));
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-day';
        button.textContent = day;
        if (isToday(date)) button.classList.add('is-today');
        button.disabled = true;
        grid.append(button);
      }
    };
    renderCalendar();
    windowEl.querySelector('.calendar-previous').addEventListener('click', () => {
      visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
      renderCalendar();
    });
    windowEl.querySelector('.calendar-next').addEventListener('click', () => {
      visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
      renderCalendar();
    });
  }

  settingsContent() {
    return `
      <div class="settings-app">
        <header class="settings-header"><p>Personalise LifeOS</p><h2>Settings</h2><span>Choose the atmosphere that feels right.</span></header>
        <section class="theme-section" aria-labelledby="theme-heading"><div class="theme-section-heading"><h3 id="theme-heading">OS theme</h3><span>8 available themes</span></div><div class="theme-grid">${this.themes.map(([id, name, detail]) => `<button class="theme-option" type="button" data-theme="${id}" aria-label="Use ${name} theme"><i class="theme-preview theme-preview--${id}"></i><strong>${name}</strong><small>${detail}</small></button>`).join('')}</div></section>
      </div>`;
  }

  bindSettings(windowEl) {
    const currentTheme = document.body.dataset.theme || 'midnight';
    const options = windowEl.querySelectorAll('.theme-option');
    const activate = theme => {
      this.applyTheme(theme);
      options.forEach(option => option.classList.toggle('is-selected', option.dataset.theme === theme));
    };
    options.forEach(option => {
      option.classList.toggle('is-selected', option.dataset.theme === currentTheme);
      option.addEventListener('click', () => activate(option.dataset.theme));
    });
  }

  applyTheme(theme) {
    const validTheme = this.themes?.some(([id]) => id === theme) ? theme : 'midnight';
    document.body.dataset.theme = validTheme;
    try { localStorage.setItem('lifeos.theme', validTheme); } catch (_) {}
  }

  weatherContent() {
    return `<div class="weather-app"><div class="weather-glow" aria-hidden="true"></div><header class="weather-header"><div><p>Local conditions</p><h2>Weather</h2></div><button class="weather-refresh" type="button"><i class="fa-solid fa-location-crosshairs"></i> Use my location</button></header><p class="weather-location" aria-live="polite">Requesting your location…</p><section class="weather-current"><div class="weather-icon"><i class="fa-solid fa-cloud-sun"></i></div><div><strong class="weather-temperature">--°</strong><p class="weather-summary">Finding the forecast…</p></div></section><section class="weather-stats"><div><i class="fa-solid fa-temperature-half"></i><span>Feels like</span><strong class="weather-feels">--°</strong></div><div><i class="fa-solid fa-droplet"></i><span>Humidity</span><strong class="weather-humidity">--%</strong></div><div><i class="fa-solid fa-wind"></i><span>Wind</span><strong class="weather-wind">-- km/h</strong></div></section></div>`;
  }

  bindWeather(windowEl) {
    const location = windowEl.querySelector('.weather-location');
    const temperature = windowEl.querySelector('.weather-temperature');
    const summary = windowEl.querySelector('.weather-summary');
    const feels = windowEl.querySelector('.weather-feels');
    const humidity = windowEl.querySelector('.weather-humidity');
    const wind = windowEl.querySelector('.weather-wind');
    const refresh = windowEl.querySelector('.weather-refresh');
    const labels = { 0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers', 95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail' };
    const load = () => {
      if (!navigator.geolocation) { location.textContent = 'Location is not supported by this browser.'; summary.textContent = 'Use a browser with location access.'; return; }
      location.textContent = 'Requesting your location…'; summary.textContent = 'Finding the forecast…'; refresh.disabled = true;
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        try {
          const params = new URLSearchParams({ latitude: coords.latitude, longitude: coords.longitude, current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code', timezone: 'auto' });
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
          if (!response.ok) throw new Error('Weather service unavailable');
          const current = (await response.json()).current;
          location.textContent = `Your location · ${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
          temperature.textContent = `${Math.round(current.temperature_2m)}°`;
          summary.textContent = labels[current.weather_code] || 'Current conditions';
          feels.textContent = `${Math.round(current.apparent_temperature)}°`; humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`; wind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
        } catch (_) { location.textContent = 'Unable to load weather right now.'; summary.textContent = 'Check your connection and try again.'; }
        finally { refresh.disabled = false; }
      }, () => { location.textContent = 'Location permission is needed for local weather.'; summary.textContent = 'Choose “Use my location” to try again.'; refresh.disabled = false; }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    };
    refresh.addEventListener('click', load);
    load();
  }

  notificationsContent() {
    return `<div class="notifications-app"><header class="notifications-header"><div><p>LifeOS alerts</p><h2>Notifications</h2></div><button class="notifications-refresh" type="button" aria-label="Refresh notifications" title="Refresh notifications"><i class="fa-solid fa-rotate-right"></i></button></header><section class="notifications-list" aria-live="polite"><p class="notifications-empty">Checking your day...</p></section></div>`;
  }

  bindNotifications(windowEl) {
    const list = windowEl.querySelector('.notifications-list');
    const refresh = windowEl.querySelector('.notifications-refresh');
    const render = alerts => {
      list.replaceChildren();
      if (!alerts.length) {
        const empty = document.createElement('p');
        empty.className = 'notifications-empty';
        empty.textContent = 'Nothing needs your attention right now.';
        list.append(empty);
        return;
      }
      alerts.forEach(alert => {
        const item = document.createElement('article');
        item.className = `notification-item notification-item--${alert.type}`;
        const icon = document.createElement('span');
        icon.className = 'notification-icon';
        const icons = { rain: 'cloud-rain', tasks: 'list-check', finance: 'wallet', habits: 'heart' };
        icon.innerHTML = `<i class="fa-solid fa-${icons[alert.type]}"></i>`;
        const copy = document.createElement('div');
        const heading = document.createElement('h3');
        const detail = document.createElement('p');
        heading.textContent = alert.title;
        detail.textContent = alert.detail;
        copy.append(heading, detail);
        item.append(icon, copy);
        list.append(item);
      });
    };
    const loadTasks = async () => {
      const response = await fetch('/api/tasks');
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Unable to check tasks');
      const openTasks = (payload.tasks || []).filter(task => !task.done);
      return openTasks.length ? [{ type: 'tasks', title: `${openTasks.length} task${openTasks.length === 1 ? '' : 's'} still open`, detail: openTasks.slice(0, 2).map(task => task.content).join(' · ') }] : [];
    };
    const loadFinance = async () => {
      const response = await fetch('/api/finance');
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Unable to check finance');
      const balance = (payload.finance || []).reduce((total, entry) => total + (Number(entry.amount) || 0), 0);
      return balance <= 1000 ? [{ type: 'finance', title: 'Low balance', detail: `Your current balance is Rs. ${balance.toFixed(2)}.` }] : [];
    };
    const loadHabits = async () => {
      const response = await fetch('/api/habits');
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Unable to check habits');
      const weekday = new Date().toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase();
      const shortWeekday = weekday.slice(0, 3);
      const dueToday = (payload.habits || []).filter(habit => {
        const frequency = (habit.frequency || '').toLowerCase();
        return frequency.includes('daily') || frequency.includes('every day') || frequency.includes(weekday) || frequency.includes(shortWeekday);
      });
      return dueToday.length ? [{ type: 'habits', title: `${dueToday.length} habit${dueToday.length === 1 ? '' : 's'} due today`, detail: dueToday.slice(0, 2).map(habit => habit.content).join(' · ') }] : [];
    };
    const loadRain = () => new Promise(resolve => {
      if (!navigator.geolocation) return resolve([]);
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        try {
          const params = new URLSearchParams({ latitude: coords.latitude, longitude: coords.longitude, hourly: 'precipitation_probability,weather_code', forecast_days: '2', timezone: 'auto' });
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
          if (!response.ok) throw new Error();
          const hourly = (await response.json()).hourly;
          const now = Date.now();
          const rainIndex = hourly.time.findIndex((time, index) => {
            const forecastTime = new Date(time).getTime();
            const code = hourly.weather_code[index];
            const rainCode = code >= 51 && code <= 82;
            return forecastTime >= now && forecastTime <= now + 6 * 60 * 60 * 1000 && (rainCode || hourly.precipitation_probability[index] >= 45);
          });
          if (rainIndex < 0) return resolve([]);
          const time = new Date(hourly.time[rainIndex]).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          resolve([{ type: 'rain', title: 'Rain may be incoming', detail: `Forecast suggests rain around ${time}.` }]);
        } catch (_) { resolve([]); }
      }, () => resolve([]), { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
    });
    const load = async () => {
      refresh.disabled = true;
      list.innerHTML = '<p class="notifications-empty">Checking your day...</p>';
      try {
        const [taskAlerts, financeAlerts, habitAlerts, rainAlerts] = await Promise.all([loadTasks(), loadFinance(), loadHabits(), loadRain()]);
        render([...rainAlerts, ...taskAlerts, ...financeAlerts, ...habitAlerts]);
      } catch (error) {
        list.innerHTML = `<p class="notifications-empty">${error.message}</p>`;
      } finally { refresh.disabled = false; }
    };
    refresh.addEventListener('click', load);
    load();
  }

  musicContent() {
    return `<div class="music-app"><header class="music-header"><div><p>Now playing</p><h2>Visualizer</h2></div><i class="fa-solid fa-wave-square" aria-hidden="true"></i></header><form class="music-link-form"><input name="media" type="url" required placeholder="Paste a Spotify or YouTube link" aria-label="Spotify or YouTube link"><button type="submit"><i class="fa-solid fa-play"></i><span>Load</span></button></form><section class="music-stage"><div class="music-placeholder"><i class="fa-solid fa-headphones"></i><strong>Ready to listen</strong><span>Load a public Spotify track, playlist, or YouTube video.</span></div><iframe class="music-embed" title="Now playing" allow="autoplay; encrypted-media; picture-in-picture" hidden></iframe><div class="music-bars" aria-hidden="true">${'<i></i>'.repeat(32)}</div></section><p class="music-source" aria-live="polite">Paste a link to begin.</p></div>`;
  }

  bindMusic(windowEl) {
    const form = windowEl.querySelector('.music-link-form');
    const input = form.elements.media;
    const embed = windowEl.querySelector('.music-embed');
    const placeholder = windowEl.querySelector('.music-placeholder');
    const source = windowEl.querySelector('.music-source');
    const stage = windowEl.querySelector('.music-stage');
    form.addEventListener('submit', event => {
      event.preventDefault();
      let url;
      try { url = new URL(input.value.trim()); } catch (_) { return; }
      let embedUrl = '';
      let label = '';
      if (/(^|\.)youtube\.com$/i.test(url.hostname) || url.hostname === 'youtu.be') {
        const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
        if (id) { embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1`; label = 'YouTube video loaded'; }
      } else if (/(^|\.)spotify\.com$/i.test(url.hostname)) {
        const match = url.pathname.match(/^\/(track|album|playlist|episode)\/([^/?]+)/);
        if (match) { embedUrl = `https://open.spotify.com/embed/${match[1]}/${match[2]}`; label = `Spotify ${match[1]} loaded`; }
      }
      if (!embedUrl) {
        input.setCustomValidity('Use a public Spotify track, album, playlist, episode, or YouTube link.');
        input.reportValidity();
        return;
      }
      input.setCustomValidity('');
      embed.src = embedUrl;
      embed.hidden = false;
      placeholder.hidden = true;
      stage.classList.add('is-playing');
      source.textContent = label;
    });
  }

  tasksContent() {
    return `<div class="tasks-app"><header class="tasks-header"><div><p>Stay focused</p><h2>To-do</h2></div><span class="tasks-count">0 tasks</span></header><form class="task-form"><input name="task" maxlength="120" required placeholder="What needs to be done?"><button type="submit"><i class="fa-solid fa-plus"></i> Add task</button></form><section class="task-list" aria-live="polite"></section></div>`;
  }

  bindTasks(windowEl) {
    const form = windowEl.querySelector('.task-form');
    const input = form.elements.task;
    const list = windowEl.querySelector('.task-list');
    const count = windowEl.querySelector('.tasks-count');
    let tasks = [];
    const api = async (url, options = {}) => {
      const response = await fetch(url, options);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Unable to update tasks');
      return payload;
    };
    const showError = message => {
      const error = document.createElement('p');
      error.className = 'tasks-empty tasks-error';
      error.textContent = message;
      list.replaceChildren(error);
    };
    const render = () => {
      list.replaceChildren();
      const openTasks = tasks.filter(task => !task.done).length;
      count.textContent = `${openTasks} ${openTasks === 1 ? 'task' : 'tasks'}`;
      if (!tasks.length) {
        const empty = document.createElement('p');
        empty.className = 'tasks-empty';
        empty.textContent = 'Nothing on your list. Enjoy the calm.';
        list.append(empty);
        return;
      }
      [...tasks].sort((one, two) => Number(one.done) - Number(two.done)).forEach(task => {
        const row = document.createElement('article');
        row.className = `task-item${task.done ? ' is-complete' : ''}`;
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'task-toggle';
        toggle.setAttribute('aria-label', task.done ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`);
        toggle.innerHTML = '<i class="fa-solid fa-check"></i>';
        const title = document.createElement('span');
        title.textContent = task.title;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'task-remove';
        remove.setAttribute('aria-label', `Remove ${task.title}`);
        remove.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        toggle.disabled = task.done;
        toggle.addEventListener('click', async () => {
          if (task.done) return;
          toggle.disabled = true;
          try {
            const formData = new FormData();
            formData.append('task_id', task.id);
            const payload = await api('/updatetaskdone', { method: 'POST', body: formData });
            tasks = tasks.map(item => item.id === task.id ? { ...item, ...payload.task, title: payload.task.content } : item);
            render();
          } catch (error) { toggle.disabled = false; showError(error.message); }
        });
        remove.addEventListener('click', async () => {
          remove.disabled = true;
          try {
            await api(`/api/tasks/${encodeURIComponent(task.id)}`, { method: 'DELETE' });
            tasks = tasks.filter(item => item.id !== task.id);
            render();
          } catch (error) { remove.disabled = false; showError(error.message); }
        });
        row.append(toggle, title, remove);
        list.append(row);
      });
    };
    const loadTasks = async () => {
      showError('Loading your tasks…');
      try {
        const payload = await api('/api/tasks');
        tasks = (payload.tasks || []).map(task => ({ ...task, title: task.content }));
        render();
      } catch (error) { showError(error.message); }
    };
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const title = input.value.trim();
      if (!title) return;
      const button = form.querySelector('button');
      button.disabled = true;
      try {
        const payload = await api('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: title }) });
        tasks.unshift({ ...payload.task, title: payload.task.content });
        input.value = '';
        render();
        input.focus();
      } catch (error) { showError(error.message); }
      finally { button.disabled = false; }
    });
    loadTasks();
  }

  financeContent() {
    return `<div class="finance-app"><header class="finance-header"><div><p>Personal ledger</p><h2>Finance</h2></div><div class="finance-balance"><span>Balance</span><strong class="finance-balance-value">Rs. 0.00</strong></div></header><section class="finance-summary" aria-label="Finance summary"><div><span>Income</span><strong class="finance-income">Rs. 0.00</strong></div><div><span>Expenses</span><strong class="finance-expenses">Rs. 0.00</strong></div></section><form class="finance-form"><label><span>Amount</span><input name="amount" type="number" step="0.01" required placeholder="Positive or negative"></label><label><span>Description</span><input name="reason" maxlength="120" required placeholder="e.g. Groceries"></label><button type="submit"><i class="fa-solid fa-plus"></i> Add entry</button></form><section class="finance-list" aria-live="polite"></section></div>`;
  }

  bindFinance(windowEl) {
    const form = windowEl.querySelector('.finance-form');
    const amountInput = form.elements.amount;
    const reasonInput = form.elements.reason;
    const list = windowEl.querySelector('.finance-list');
    const balance = windowEl.querySelector('.finance-balance-value');
    const income = windowEl.querySelector('.finance-income');
    const expenses = windowEl.querySelector('.finance-expenses');
    let entries = [];
    const formatMoney = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    const api = async (url, options = {}) => {
      const response = await fetch(url, options);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Unable to update finance');
      return payload;
    };
    const render = () => {
      const totals = entries.reduce((result, entry) => {
        const amount = Number(entry.amount) || 0;
        result.balance += amount;
        if (amount >= 0) result.income += amount;
        else result.expenses += Math.abs(amount);
        return result;
      }, { balance: 0, income: 0, expenses: 0 });
      balance.textContent = formatMoney(totals.balance);
      income.textContent = formatMoney(totals.income);
      expenses.textContent = formatMoney(totals.expenses);
      list.replaceChildren();
      if (!entries.length) {
        const empty = document.createElement('p');
        empty.className = 'finance-empty';
        empty.textContent = 'No entries yet. Add your first transaction.';
        list.append(empty);
        return;
      }
      entries.forEach(entry => {
        const amount = Number(entry.amount) || 0;
        const row = document.createElement('article');
        row.className = `finance-entry${amount < 0 ? ' is-expense' : ' is-income'}`;
        const marker = document.createElement('span');
        marker.className = 'finance-entry-marker';
        marker.innerHTML = `<i class="fa-solid fa-${amount < 0 ? 'arrow-down' : 'arrow-up'}"></i>`;
        const description = document.createElement('span');
        description.className = 'finance-entry-description';
        description.textContent = entry.reason;
        const value = document.createElement('strong');
        value.className = 'finance-entry-amount';
        value.textContent = `${amount < 0 ? '-' : '+'}${formatMoney(Math.abs(amount))}`;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'finance-entry-remove';
        remove.setAttribute('aria-label', `Delete ${entry.reason}`);
        remove.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        remove.addEventListener('click', async () => {
          remove.disabled = true;
          try {
            await api(`/api/finance/${encodeURIComponent(entry.id)}`, { method: 'DELETE' });
            entries = entries.filter(item => item.id !== entry.id);
            render();
          } catch (error) { remove.disabled = false; showError(error.message); }
        });
        row.append(marker, description, value, remove);
        list.append(row);
      });
    };
    const showError = message => {
      list.replaceChildren();
      const error = document.createElement('p');
      error.className = 'finance-empty finance-error';
      error.textContent = message;
      list.append(error);
    };
    const loadEntries = async () => {
      showError('Loading your entries...');
      try {
        const payload = await api('/api/finance');
        entries = payload.finance || [];
        render();
      } catch (error) { showError(error.message); }
    };
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const amount = Number(amountInput.value);
      const reason = reasonInput.value.trim();
      if (!Number.isFinite(amount) || !reason) return;
      const button = form.querySelector('button');
      button.disabled = true;
      try {
        const formData = new FormData();
        formData.append('amount', amount);
        formData.append('reason', reason);
        const payload = await api('/uploadfinance', { method: 'POST', body: formData });
        entries.unshift(payload.finance);
        form.reset();
        render();
        amountInput.focus();
      } catch (error) { showError(error.message); }
      finally { button.disabled = false; }
    });
    loadEntries();
  }

  bindNotes(windowEl) {
    const title = windowEl.querySelector('.note-title-input');
    const body = windowEl.querySelector('.note-body-input');
    const watermark = windowEl.querySelector('.notes-watermark');
    const list = windowEl.querySelector('.notes-list-items');
    const newButton = windowEl.querySelector('.notes-action--new');
    const saveButton = windowEl.querySelector('.notes-action--save');
    const removeButton = windowEl.querySelector('.notes-action--remove');
    let noteNumber = 1;

    const updateWatermark = () => {
      watermark.textContent = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', hour12: false
      });
    };
    updateWatermark();
    const clockTimer = window.setInterval(() => {
      if (!windowEl.isConnected) return window.clearInterval(clockTimer);
      updateWatermark();
    }, 1000);

    const saveActive = () => {
      const active = list.querySelector('.note-item.is-selected');
      if (!active) return;
      active.dataset.noteTitle = title.value || 'Untitled note';
      active.dataset.noteBody = body.value;
      active.textContent = active.dataset.noteTitle;
    };
    const selectNote = item => {
      saveActive();
      list.querySelectorAll('.note-item').forEach(note => note.classList.toggle('is-selected', note === item));
      title.value = item.dataset.noteTitle;
      body.value = item.dataset.noteBody;
      body.focus();
    };
    const bindNote = item => item.addEventListener('click', () => selectNote(item));
    const makeNote = note => {
      const item = document.createElement('button');
      item.className = 'note-item';
      item.type = 'button';
      if (note.id) item.dataset.noteId = note.id;
      item.dataset.noteTitle = note.title || 'Untitled note';
      item.dataset.noteBody = note.content || note.body || '';
      item.textContent = item.dataset.noteTitle;
      bindNote(item);
      return item;
    };
    const api = async (url, options = {}) => {
      const response = await fetch(url, options);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'Unable to update notes');
      return payload;
    };
    const clearEditor = () => {
      title.value = '';
      body.value = '';
    };
    const restore = async () => {
      list.innerHTML = '<p class="notes-empty">Loading notes...</p>';
      try {
        const payload = await api('/api/notes');
        const notes = payload.notes || [];
        list.replaceChildren(...notes.map(makeNote));
        noteNumber = notes.length;
        if (!notes.length) {
          clearEditor();
          return;
        }
        const active = list.firstElementChild;
        active.classList.add('is-selected');
        title.value = active.dataset.noteTitle;
        body.value = active.dataset.noteBody;
      } catch (error) {
        list.innerHTML = `<p class="notes-empty">${error.message}</p>`;
        clearEditor();
      }
    };
    const persist = async () => {
      saveActive();
      const active = list.querySelector('.note-item.is-selected');
      if (!active) return;
      saveButton.disabled = true;
      try {
        const note = { title: active.dataset.noteTitle, content: active.dataset.noteBody };
        const endpoint = active.dataset.noteId ? `/api/notes/${encodeURIComponent(active.dataset.noteId)}` : '/api/notes';
        const payload = await api(endpoint, {
          method: active.dataset.noteId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(note)
        });
        active.dataset.noteId = payload.note.id;
        saveButton.classList.add('is-saved');
        window.setTimeout(() => saveButton.classList.remove('is-saved'), 1200);
      } catch (error) {
        window.alert(error.message);
      } finally {
        saveButton.disabled = false;
      }
    };
    restore();

    title.addEventListener('input', saveActive);
    body.addEventListener('input', saveActive);
    saveButton.addEventListener('click', persist);
    newButton.addEventListener('click', () => {
      noteNumber += 1;
      const requestedName = window.prompt('Name your new note:', `Untitled note ${noteNumber}`);
      if (requestedName === null) {
        noteNumber -= 1;
        return;
      }
      const noteTitle = requestedName.trim() || `Untitled note ${noteNumber}`;
      saveActive();
      const item = makeNote({ title: noteTitle, body: '' });
      list.append(item);
      selectNote(item);
      body.focus();
    });
    removeButton.addEventListener('click', async () => {
      const active = list.querySelector('.note-item.is-selected');
      if (!active) return;
      const next = active.nextElementSibling || active.previousElementSibling;
      removeButton.disabled = true;
      try {
        if (active.dataset.noteId) await api(`/api/notes/${encodeURIComponent(active.dataset.noteId)}`, { method: 'DELETE' });
        active.remove();
      } catch (error) {
        window.alert(error.message);
        return;
      } finally {
        removeButton.disabled = false;
      }
      if (next) selectNote(next);
      else {
        clearEditor();
        title.focus();
      }
    });
  }

  minimize(app) {
    const entry = this.windows.get(app);
    if (!entry || entry.window.classList.contains('is-minimizing')) return;
    entry.window.classList.add('is-minimizing');
    entry.window.addEventListener('animationend', () => {
      entry.window.classList.remove('is-minimizing');
      entry.window.classList.add('is-minimized');
      entry.taskButton.hidden = false;
      this.play(entry.taskButton, 'is-appearing');
    }, { once: true });
  }

  focus(windowEl) {
    windowEl.style.zIndex = ++this.topZ;
    this.windows.forEach(({ window, taskButton }) => taskButton.classList.toggle('is-active', window === windowEl));
    if (!windowEl.classList.contains('is-opening')) this.play(windowEl, 'is-focused');
  }

  keepWindowsInView() {
    this.windows.forEach(({ window: windowEl }) => {
      if (windowEl.classList.contains('is-minimized')) return;
      const width = windowEl.offsetWidth;
      const height = windowEl.offsetHeight;
      const maxX = Math.max(10, window.innerWidth - width - 10);
      const maxY = Math.max(10, window.innerHeight - height - 10);
      const currentX = Number.parseFloat(windowEl.style.left) || 10;
      const currentY = Number.parseFloat(windowEl.style.top) || 10;
      windowEl.style.left = `${Math.min(Math.max(10, currentX), maxX)}px`;
      windowEl.style.top = `${Math.min(Math.max(10, currentY), maxY)}px`;
    });
  }

  play(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    element.addEventListener('animationend', () => element.classList.remove(className), { once: true });
  }

  makeDraggable(windowEl, handle) {
    handle.addEventListener('pointerdown', event => {
      if (event.target.closest('button')) return;
      event.preventDefault();
      this.focus(windowEl);
      const rect = windowEl.getBoundingClientRect();
      const startX = event.clientX - rect.left, startY = event.clientY - rect.top;
      const move = moveEvent => {
        const maxX = window.innerWidth - windowEl.offsetWidth;
        const maxY = window.innerHeight - windowEl.offsetHeight;
        windowEl.style.left = `${Math.min(Math.max(0, moveEvent.clientX - startX), maxX)}px`;
        windowEl.style.top = `${Math.min(Math.max(0, moveEvent.clientY - startY), maxY)}px`;
      };
      const stop = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', stop);
        document.removeEventListener('pointercancel', stop);
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', stop);
      document.addEventListener('pointercancel', stop);
    });
  }
}

window.windowManager = new WindowManager();
