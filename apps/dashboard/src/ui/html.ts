export function renderDashboardHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Master-Bot Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background: radial-gradient(1200px 800px at 20% -10%, rgba(88,101,242,0.25), transparent 60%),
                  radial-gradient(1000px 700px at 90% 10%, rgba(52,211,153,0.18), transparent 55%),
                  radial-gradient(900px 900px at 50% 110%, rgba(217,70,239,0.15), transparent 60%),
                  #0b0f19;
    }
    .glass {
      background: rgba(17, 24, 39, 0.72);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(148, 163, 184, 0.14);
    }
    .tab { transition: all .18s ease; }
    .tab.active { background: rgba(99, 102, 241, 0.18); color: #a5b4fc; border-color: rgba(129,140,248,0.35); }
    .stat-card { transition: transform .18s ease, box-shadow .18s ease; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -8px rgba(0,0,0,0.6); }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.25); border-radius: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  </style>
</head>
<body class="text-slate-200 font-sans min-h-screen">
  <div class="max-w-7xl mx-auto px-6 py-8">
    <!-- Header -->
    <header class="flex items-center justify-between mb-10">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-600/30">M</div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white">Master-Bot <span class="text-indigo-400">Dashboard</span></h1>
          <p class="text-sm text-slate-400">Command Center</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div id="bot-status" class="flex items-center gap-2 text-sm px-4 py-2 rounded-xl glass">
          <span id="status-dot" class="w-2.5 h-2.5 rounded-full bg-slate-500 animate-pulse"></span>
          <span id="status-text" class="mono">loading…</span>
        </div>
        <a href="/api/auth/signin/discord" id="login-btn" class="hidden px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30">Sign in with Discord</a>
        <a href="/api/auth/signout" id="logout-btn" class="hidden px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition border border-slate-700">Sign out</a>
      </div>
    </header>

    <!-- Tabs -->
    <nav class="flex gap-2 mb-8 flex-wrap">
      <button data-tab="overview" class="tab active px-4 py-2 rounded-xl text-sm font-medium border border-transparent">Overview</button>
      <button data-tab="guilds" class="tab px-4 py-2 rounded-xl text-sm font-medium border border-transparent">Guilds</button>
      <button data-tab="broadcast" class="tab px-4 py-2 rounded-xl text-sm font-medium border border-transparent">Broadcast</button>
    </nav>

    <!-- Overview -->
    <section id="tab-overview">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="overview-stats"></div>
      <div class="glass rounded-2xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Connected Guilds</h2>
        <div id="overview-guilds" class="space-y-2 max-h-80 overflow-y-auto pr-2"></div>
      </div>
    </section>

    <!-- Guilds -->
    <section id="tab-guilds" class="hidden">
      <div class="glass rounded-2xl p-6">
        <h2 class="text-lg font-semibold text-white mb-2">Guild Settings</h2>
        <p class="text-sm text-slate-400 mb-4">Select a guild to manage its server-side configuration.</p>
        <select id="guild-select" class="w-full mb-4 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"></select>
        <form id="guild-settings-form" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Welcome Message</label>
              <input type="text" id="set-welcomeMessage" name="welcomeMessage" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500" placeholder="Welcome {user}!">
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Welcome Channel ID</label>
              <input type="text" id="set-welcomeChannel" name="welcomeChannel" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500" placeholder="123456789012345678">
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Ticket Channel ID</label>
              <input type="text" id="set-ticketChannel" name="ticketChannel" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500" placeholder="123456789012345678">
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Ticket Transcript Channel ID</label>
              <input type="text" id="set-ticketTranscriptChannel" name="ticketTranscriptChannel" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500" placeholder="123456789012345678">
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Support Role ID</label>
              <input type="text" id="set-ticketRole" name="ticketRole" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500" placeholder="123456789012345678">
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Log Channel ID</label>
              <input type="text" id="set-logChannel" name="logChannel" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500" placeholder="123456789012345678">
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Default Volume (0-100)</label>
              <input type="number" id="set-volume" name="volume" min="0" max="100" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500" placeholder="100">
            </div>
          </div>
          <div class="flex items-center gap-6">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" id="set-welcomeEnabled" name="welcomeEnabled" class="rounded bg-slate-800 border-slate-600">
              Welcome enabled
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" id="set-ticketEnabled" name="ticketEnabled" class="rounded bg-slate-800 border-slate-600">
              Tickets enabled
            </label>
          </div>
          <button type="submit" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30">Save Settings</button>
          <span id="guild-save-status" class="text-sm text-emerald-400 ml-3"></span>
        </form>
      </div>
    </section>

    <!-- Broadcast -->
    <section id="tab-broadcast" class="hidden">
      <div class="glass rounded-2xl p-6">
        <h2 class="text-lg font-semibold text-white mb-2">Announcement Broadcast</h2>
        <p class="text-sm text-slate-400 mb-4">Send a message to any text channel the bot can reach.</p>
        <form id="broadcast-form" class="space-y-4">
          <div>
            <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Channel ID</label>
            <input type="text" id="broadcast-channel" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500" placeholder="123456789012345678">
          </div>
          <div>
            <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Message</label>
            <textarea id="broadcast-message" rows="4" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-indigo-500" placeholder="Hello everyone! Announcement here..."></textarea>
          </div>
          <button type="submit" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-emerald-600/30">Send Broadcast</button>
          <span id="broadcast-status" class="text-sm ml-3"></span>
        </form>
      </div>
    </section>
  </div>

  <script>
    async function api(url, options) {
      const res = await fetch(url, options);
      return { ok: res.ok, json: await res.json().catch(() => null) };
    }

    function el(tag, cls, text) {
      const node = document.createElement(tag);
      if (cls) node.className = cls;
      if (text !== undefined) node.textContent = text;
      return node;
    }

    // --- Auth state ---
    async function loadAuth() {
      const { json } = await api('/api/auth/session');
      const user = json?.user;
      document.getElementById('login-btn').classList.toggle('hidden', !!user);
      document.getElementById('logout-btn').classList.toggle('hidden', !user);
      return user;
    }

    // --- Tabs ---
    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        ['overview', 'guilds', 'broadcast'].forEach(name => {
          document.getElementById('tab-' + name).classList.toggle('hidden', name !== btn.dataset.tab);
        });
        if (btn.dataset.tab === 'guilds') loadGuilds();
        if (btn.dataset.tab === 'overview') loadOverview();
      });
    });

    // --- Overview ---
    async function loadOverview() {
      const { ok, json } = await api('/api/dashboard/stats');
      if (!ok) return;
      const statsBox = document.getElementById('overview-stats');
      const main = json.bot || {};
      const db = json.database || {};
      const cards = [
        { label: 'Bot Status', value: main.status || 'unknown' },
        { label: 'Latency', value: main.gatewayLatencyMs >= 0 ? main.gatewayLatencyMs + ' ms' : 'n/a' },
        { label: 'Guilds', value: String(main.guildCount || 0) },
        { label: 'Uptime', value: fmtUptime(main.uptimeSeconds) },
        { label: 'DB Songs', value: String(db.countSongs ?? 'n/a') },
        { label: 'DB Playlists', value: String(db.countPlaylists ?? 'n/a') },
        { label: 'DB Guilds', value: String(db.countGuilds ?? 'n/a') },
        { label: 'DB Reminders', value: String(db.countReminders ?? 'n/a') }
      ];
      statsBox.innerHTML = '';
      cards.forEach(c => {
        const card = el('div', 'glass stat-card rounded-2xl p-5');
        card.append(el('div', 'text-xs uppercase tracking-wider text-slate-400', c.label));
        card.append(el('div', 'mt-2 text-2xl font-bold text-white mono', c.value));
        statsBox.appendChild(card);
      });

      const statusDot = document.getElementById('status-dot');
      const statusText = document.getElementById('status-text');
      statusDot.className = 'w-2.5 h-2.5 rounded-full ' + (main.isReady ? 'bg-emerald-400' : 'bg-amber-400');
      statusDot.classList.add('animate-pulse');
      statusText.textContent = main.status || 'unknown';

      const guildBox = document.getElementById('overview-guilds');
      guildBox.innerHTML = '';
      (main.connectedGuilds || []).forEach(g => {
        const row = el('div', 'flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60');
        row.append(el('span', 'text-sm font-medium text-slate-200', g.name));
        row.append(el('span', 'text-xs mono text-slate-400', g.id));
        guildBox.appendChild(row);
      });
      if ((main.connectedGuilds || []).length === 0) {
        guildBox.append(el('p', 'text-sm text-slate-400', 'No guilds connected yet.'));
      }
    }

    function fmtUptime(sec) {
      if (sec == null) return 'n/a';
      const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
      return h + 'h ' + m + 'm ' + s + 's';
    }

    // --- Guilds ---
    async function loadGuilds() {
      const { ok, json } = await api('/api/dashboard/guilds');
      if (!ok) return;
      const select = document.getElementById('guild-select');
      select.innerHTML = '';
      (json.liveGuilds || []).forEach(g => {
        const opt = el('option', '', g.name + ' (' + g.id + ')');
        opt.value = g.id;
        select.appendChild(opt);
      });
      if ((json.liveGuilds || []).length > 0 && !select.value) {
        applyGuildSettings(json.liveGuilds[0].id, json.guildSettings);
        select.addEventListener('change', () => applyGuildSettings(select.value, json.guildSettings));
      }
      document.getElementById('guild-settings-form').dataset.guildId = select.value;
    }

    function applyGuildSettings(guildId, settingsMap) {
      const s = (settingsMap || {})[guildId] || {};
      setVal('welcomeMessage', s.welcomeMessage || '');
      setVal('welcomeChannel', s.welcomeMessageChannel || '');
      setVal('ticketChannel', s.ticketChannel || '');
      setVal('ticketTranscriptChannel', s.ticketTranscriptChannel || '');
      setVal('ticketRole', s.ticketManagerRole || '');
      setVal('logChannel', s.logChannel || '');
      setVal('volume', s.volume != null ? s.volume : 100);
      document.getElementById('set-welcomeEnabled').checked = !!s.welcomeMessageEnabled;
      document.getElementById('set-ticketEnabled').checked = !!s.ticketEnabled;
      document.getElementById('guild-settings-form').dataset.guildId = guildId;
    }

    function setVal(id, val) {
      const node = document.getElementById('set-' + id);
      if (node) node.value = val;
    }

    document.getElementById('guild-settings-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const guildId = form.dataset.guildId;
      const payload = {
        guildId,
        welcomeMessage: document.getElementById('set-welcomeMessage').value.trim(),
        welcomeChannel: document.getElementById('set-welcomeChannel').value.trim() || null,
        ticketChannel: document.getElementById('set-ticketChannel').value.trim() || null,
        ticketTranscriptChannel: document.getElementById('set-ticketTranscriptChannel').value.trim() || null,
        ticketRole: document.getElementById('set-ticketRole').value.trim() || null,
        logChannel: document.getElementById('set-logChannel').value.trim() || null,
        volume: parseInt(document.getElementById('set-volume').value, 10) || 100,
        welcomeEnabled: document.getElementById('set-welcomeEnabled').checked,
        ticketEnabled: document.getElementById('set-ticketEnabled').checked
      };
      const status = document.getElementById('guild-save-status');
      const { ok, json } = await api('/api/dashboard/guilds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      status.textContent = ok ? 'Saved ✓' : (json?.error || 'Error');
      status.className = 'text-sm ml-3 ' + (ok ? 'text-emerald-400' : 'text-red-400');
      setTimeout(() => { status.textContent = ''; }, 2500);
    });

    // --- Broadcast ---
    document.getElementById('broadcast-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('broadcast-status');
      const payload = {
        channelId: document.getElementById('broadcast-channel').value.trim(),
        message: document.getElementById('broadcast-message').value.trim()
      };
      const { ok, json } = await api('/api/dashboard/bot/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      status.textContent = ok ? 'Broadcast sent ✓' : (json?.error || 'Error');
      status.className = 'text-sm ml-3 ' + (ok ? 'text-emerald-400' : 'text-red-400');
    });

    loadAuth();
    loadOverview();
  </script>
</body>
</html>`;
}