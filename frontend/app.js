const API_BASE = window.TAG_CONFIG?.apiBase || 'http://localhost:3050/api/v1';
const API_ORIGIN = API_BASE.replace(/\/api\/v1$/, '');

const state = {
  page: 'dashboard',
  query: '',
  token: localStorage.getItem('tag_token') || null,
  currentUser: JSON.parse(localStorage.getItem('tag_user') || 'null'),
  loginError: '',
  live: null,
  session: null,
  worldIntention: null,
  flambeau: null,
  apiOnline: false,
  liveRequests: null,
  liveMeetings: null,
  liveCampaigns: null,
  liveTeams: null,
  liveTestimonies: null,
  liveStats: null,
  liveUsers: null,
  liveCommunities: null,
  liveActions: null,
  liveProgram: null,
  liveIntentions: null,
  liveNotifications: null,
  liveHistory: null,
  waPhone: '+243900000099',
  waMessages: [{ from: 'veilleur', text: "Tapez \"menu\" pour parler avec Le Veilleur." }],
  prayers: [
    ['Jean B.', 'Guérison complète', 'NEW'],
    ['Marie L.', 'Protection pour ma famille', 'IN_PROGRESS'],
    ['Pierre K.', 'Percée financière', 'ASSIGNED'],
    ['Sarah T.', 'Délivrance et paix', 'ANSWERED'],
    ['David R.', 'Réussite aux examens', 'ARCHIVED'],
  ],
  campaigns: [
    ['21 jours de jeûne et de prière', 65, 320],
    ['Le mois de la faveur divine', 40, 180],
    ['Campagne pour les nations', 25, 220],
  ],
  chronicles: [
    ['Témoignage : Délivrance miraculeuse', 'Marie L.', 'Il y a 1 h'],
    ['Dieu a pourvu pendant la campagne', 'Paul K.', 'Il y a 3 h'],
    ['Ce que le Seigneur a fait', 'Sarah T.', 'Il y a 5 h'],
    ['Réunion spéciale de prières', 'David R.', 'Il y a 1 j'],
  ],
};

const nav = [
  ['dashboard', '⌂', 'Tableau de bord'],
  ['prayer', '♧', 'Demandes de prière'],
  ['whatsapp', '💬', 'Simulateur WhatsApp'],
  ['campaigns', '⚑', 'Campagnes'],
  ['groups', '♙', 'Groupes'],
  ['meetings', '▣', 'Réunions'],
  ['chronicles', '▤', 'Chroniques'],
  ['community', '◉', 'Communauté'],
  ['actions', '✧', 'Actes de foi'],
  ['program', '◷', 'Programme du jour'],
  ['intentions', '◎', 'Intentions mondiales'],
  ['notifications', '♢', 'Notifications'],
  ['messages', '✉', 'Messages'],
  ['resources', '▦', 'Ressources'],
  ['stats', '◔', 'Statistiques'],
  ['admin', '⚙', 'Administration', 'RESPONSABLE'],
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

function badge(s) {
  let c = s === 'NEW' ? 'b-new' : s === 'IN_PROGRESS' ? 'b-progress' : s === 'ASSIGNED' ? 'b-assigned' : s === 'ANSWERED' ? 'b-done' : 'b-arch';
  let t = { NEW: 'NOUVELLE', IN_PROGRESS: 'EN COURS', ASSIGNED: 'ASSIGNÉE', ANSWERED: 'EXAUCÉE', ARCHIVED: 'ARCHIVÉE' }[s] || s;
  return `<span class="badge ${c}">${t}</span>`;
}

function fmtTime(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined) return '--:--';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function isResponsable() {
  return state.currentUser?.role === 'RESPONSABLE';
}

function userInitials() {
  const name = state.currentUser?.fullName || '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function shell() {
  const name = state.currentUser?.fullName || 'Utilisateur';
  const role = state.currentUser?.role || '—';
  return `<div class="layout"><aside class="sidebar"><div class="brand"><div class="brand-mark">✦</div><div><strong>TOUR D'AVANT-GARDE</strong><small>TAG${state.apiOnline ? ' · en ligne' : ' · hors ligne'}</small></div></div><nav class="nav">${nav
    .filter(([, , , requiredRole]) => !requiredRole || state.currentUser?.role === requiredRole)
    .map(([id, ic, t]) => `<button class="${state.page === id ? 'active' : ''}" onclick="go('${id}')"><span>${ic}</span>${t}</button>`)
    .join(
      '',
    )}</nav><div class="userbox"><div class="user"><div class="avatar">${userInitials()}</div><div><b>${esc(name)}</b><div class="online">● ${esc(role)}</div></div></div><button class="secondary logout-btn" onclick="logout()">Se déconnecter</button></div></aside><main class="main"><header class="topbar"><input class="search" placeholder="Rechercher..." value="${esc(state.query)}" oninput="state.query=this.value;render()"><div class="top-actions"><button class="iconbtn" onclick="toast('12 notifications')">♧</button><button class="iconbtn" onclick="toast('5 messages')">✉</button><div class="user"><div class="avatar">${userInitials()}</div><b>${esc(name)}</b></div></div></header><section class="content">${pageContent()}</section></main></div>`;
}

function loginScreen() {
  return `
    <div class="landing-shell">
      <header class="landing-header">
        <div class="brand-login">
          <div class="brand-mark">✦</div>
          <div>
            <strong>TOUR D'AVANT-GARDE</strong>
            <small>TAG</small>
          </div>
        </div>
        <nav class="landing-nav">
          <a href="#mission">Mission</a>
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <div class="landing-body">
        <section class="hero-copy">
          <span class="eyebrow">Communauté • Prière • Intercession</span>
          <h1>Une prière s’élève à chaque instant.</h1>
          <p>
            Tour d’Avant-Garde réunit les membres autour d’un espace de prière,
            d’écoute, de témoignages et d’action collective pour vivre la foi en communauté.
          </p>
          <div class="hero-actions">
            <button class="primary" onclick="document.getElementById('loginEmail').focus()">Se connecter</button>
            <button class="secondary ghost" onclick="document.querySelector('.login-card').scrollIntoView({behavior:'smooth'})">Découvrir le dashboard</button>
          </div>
          <ul class="hero-stats">
            <li><strong>220+</strong><span>participants</span></li>
            <li><strong>12</strong><span>demandes</span></li>
            <li><strong>24/7</strong><span>suivi</span></li>
          </ul>
        </section>

        <aside class="login-card">
          <form onsubmit="event.preventDefault();doLogin()">
            <div class="brand-mark" style="margin:0 auto 14px">✦</div>
            <h1>Tour d'Avant-Garde</h1>
            <p class="login-sub">Connexion responsable</p>
            ${state.loginError ? `<p class="login-error">${esc(state.loginError)}</p>` : ''}
            <label>Email</label>
            <input id="loginEmail" type="email" placeholder="responsable@tourdavantgarde.org" value="responsable@tourdavantgarde.org" required>
            <label>Mot de passe</label>
            <input id="loginPassword" type="password" placeholder="••••••••" required>
            <button class="primary" type="submit" style="width:100%;margin-top:14px">Se connecter</button>
            <p class="login-hint">Compte de démonstration : responsable@tourdavantgarde.org / password123</p>
          </form>
        </aside>
      </div>

      <section id="mission" class="info-strip">
        <div class="info-item">
          <span class="icon">✦</span>
          <div>
            <h3>Mission</h3>
            <p>Rassembler une communauté dans la prière, la fidélité et le soutien spirituel.</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">◎</span>
          <div>
            <h3>Accès</h3>
            <p>Simple et rapide grâce au canal WhatsApp, au web et au tableau de bord.</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">✧</span>
          <div>
            <h3>Suivi</h3>
            <p>Chaque requête, rencontre et témoignage est suivi pour rester encouragé.</p>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" class="feature-grid">
        <article class="feature-card">
          <span class="feature-icon">💬</span>
          <h3>WhatsApp intelligent</h3>
          <p>Un assistant IA accompagne les membres pour guider les prières et les demandes.</p>
        </article>
        <article class="feature-card">
          <span class="feature-icon">🕊️</span>
          <h3>Demandes de prière</h3>
          <p>Chaque besoin trouve une réponse, un accompagnement et un suivi clair.</p>
        </article>
        <article class="feature-card">
          <span class="feature-icon">📅</span>
          <h3>Rencontres & programmes</h3>
          <p>Programme du jour, réunions et moments de communion organisés simplement.</p>
        </article>
        <article class="feature-card">
          <span class="feature-icon">📊</span>
          <h3>Dashboard responsable</h3>
          <p>Le leadership voit les demandes, les statistiques et les activités en temps réel.</p>
        </article>
      </section>

      <section class="cta-strip" id="contact">
        <div>
          <span class="eyebrow">Une communauté qui prie ensemble</span>
          <h2>Votre prochaine étape commence ici.</h2>
        </div>
        <button class="primary" onclick="document.getElementById('loginEmail').focus()">Accéder au tableau de bord</button>
      </section>
    </div>
  `;
}

function intentionBanner() {
  const intention = state.worldIntention;
  if (!intention) return '';
  return `<div class="intention-banner"><b>🌍 ${esc(intention.title)}</b><ul>${intention.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`;
}

function flambeauCard() {
  const f = state.flambeau;
  if (!f) return '';
  const items = [
    ['programmeLance', 'Programme lancé'],
    ['intercesseursEncourages', 'Intercesseurs encouragés'],
    ['situationsImportantesTraitees', 'Situations importantes traitées'],
    ['messagePublie', "Message d'encouragement publié"],
  ];
  const canManage = isResponsable();
  const checklistHtml = canManage
    ? `<ul class="checklist editable">${items
        .map(
          ([k, label]) =>
            `<li class="${f.checklist?.[k] ? 'done' : ''}"><label><input type="checkbox" ${f.checklist?.[k] ? 'checked' : ''} onchange="toggleFlambeauItem('${k}',this.checked)"> ${label}</label></li>`,
        )
        .join('')}</ul>`
    : `<ul class="checklist">${items.map(([k, label]) => `<li class="${f.checklist?.[k] ? 'done' : ''}">${f.checklist?.[k] ? '✔' : '○'} ${label}</li>`).join('')}</ul>`;
  const encouragementHtml = f.encouragementMessage
    ? `<p class="encouragement">"${esc(f.encouragementMessage)}"</p>`
    : canManage
      ? `<div class="encouragement-form"><textarea id="flambeauMsg" rows="2" placeholder="Publier un message d'encouragement..."></textarea><button class="secondary" onclick="publishEncouragement()">Publier</button></div>`
      : '';
  return `<div class="card flambeau-card"><h3>🔥 Flambeau de la journée</h3><div class="flambeau-guardian"><div class="avatar">${esc((f.guardian?.fullName || '?')[0])}</div><div><b>${esc(f.guardian?.fullName || 'Non désigné')}</b><small>Gardien du Flambeau</small></div></div>${checklistHtml}${encouragementHtml}</div>`;
}

function dashboard() {
  const live = state.live || {};
  const participants = live.participants ?? 218;
  const demandes = live.demandesRecues ?? 12;
  const urgentes = live.urgentes ?? 2;
  const connectes = live.intercesseursConnectes ?? 18;
  const session = state.session;
  const recentRequests = state.liveRequests || state.prayers.map(([authorName, subject, status]) => ({ authorName, subject, status }));

  return `
    <div class="dashboard-shell">
      ${intentionBanner()}

      <div class="dashboard-header">
        <div>
          <p class="section-kicker">Tableau de bord</p>
          <h1>Suivi spirituel & opérationnel</h1>
        </div>
        <button class="primary" onclick="openPrayer()">+ Déposer une prière</button>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card accent-purple">
          <div class="kpi-label">Participants</div>
          <div class="kpi-value">${participants}</div>
          <small>aujourd'hui</small>
        </div>
        <div class="kpi-card accent-blue">
          <div class="kpi-label">Demandes reçues</div>
          <div class="kpi-value">${demandes}</div>
          <small>dans la journée</small>
        </div>
        <div class="kpi-card accent-gold">
          <div class="kpi-label">Urgentes</div>
          <div class="kpi-value">${urgentes}</div>
          <small>à traiter</small>
        </div>
        <div class="kpi-card accent-green">
          <div class="kpi-label">Intercesseurs</div>
          <div class="kpi-value">${connectes}</div>
          <small>en ligne</small>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card large">
          <div class="panel-head">
            <h3>Demandes de prière récentes</h3>
            <button class="mini-btn" onclick="go('prayer')">Voir tout</button>
          </div>
          <div class="request-list">
            ${recentRequests.slice(0, 5).map((p) => `
              <div class="request-item">
                <div class="request-main">
                  <div class="avatar small">${esc((p.authorName || '?').charAt(0))}</div>
                  <div>
                    <strong>${esc(p.authorName || 'Anonyme')}</strong>
                    <small>${esc(p.subject || 'Demande')}</small>
                  </div>
                </div>
                ${badge(p.status)}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="dashboard-card session-panel">
          <div class="panel-head">
            <h3>Session active</h3>
            <span class="live-pill">LIVE</span>
          </div>
          ${session ? `
            <div class="session-value">${fmtTime(session.remainingSeconds)}</div>
            <div class="session-title">${esc(session.step)}</div>
            <div class="session-meta">Étape ${session.stepIndex}/${session.totalSteps} · ${esc(session.program)}</div>
            <div class="progress-track"><i style="width:${((session.stepIndex / Math.max(session.totalSteps, 1)) * 100)}%"></i></div>
          ` : `
            <div class="session-value">02:16</div>
            <div class="session-title">Prière 4</div>
            <div class="session-meta">Aucune session live — backend non connecté</div>
            <div class="progress-track"><i style="width:65%"></i></div>
          `}
        </div>
      </div>

      <div class="dashboard-grid secondary-grid">
        <div class="dashboard-card">
          <div class="panel-head">
            <h3>Prochains événements</h3>
            <button class="mini-btn" onclick="go('meetings')">Agenda</button>
          </div>
          <div class="mini-list">
            ${(state.liveMeetings || []).slice(0, 3).map((m) => `
              <div class="mini-item">
                <div class="mini-dot"></div>
                <div>
                  <strong>${esc(m.title)}</strong>
                  <small>${fmtMeetingDate(m.startAt)}</small>
                </div>
              </div>
            `).join('') || `
              <div class="mini-item">
                <div class="mini-dot"></div>
                <div><strong>Réunion de prière générale</strong><small>Aujourd'hui · 19:00</small></div>
              </div>
              <div class="mini-item">
                <div class="mini-dot"></div>
                <div><strong>Veillée d'intercession</strong><small>Demain · 22:00</small></div>
              </div>
              <div class="mini-item">
                <div class="mini-dot"></div>
                <div><strong>Réunion des intercesseurs</strong><small>Vendredi · 18:00</small></div>
              </div>
            `}
          </div>
        </div>

        <div class="dashboard-card">
          <div class="panel-head">
            <h3>Chroniques récentes</h3>
            <button class="mini-btn" onclick="go('chronicles')">Tous</button>
          </div>
          <div class="mini-list">
            ${state.chronicles.slice(0, 3).map((c) => `
              <div class="mini-item">
                <div class="mini-thumb"></div>
                <div>
                  <strong>${esc(c[0])}</strong>
                  <small>${esc(c[1])} · ${esc(c[2])}</small>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        ${flambeauCard() || `
          <div class="dashboard-card">
            <div class="panel-head">
              <h3>Campagne en cours</h3>
              <span class="live-pill alt">21 jours</span>
            </div>
            <div class="campaign-block">
              <small>Jeûne & prière</small>
              <h2>320 / 500</h2>
              <div class="progress-track"><i style="width:65%"></i></div>
              <p>Objectif spirituel · 65% atteint</p>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
}

const STATUS_OPTIONS = ['NEW', 'IN_PROGRESS', 'ASSIGNED', 'ANSWERED', 'ARCHIVED'];

function prayerPage() {
  let q = state.query.toLowerCase();
  const source = state.liveRequests || state.prayers.map(([authorName, subject, status], i) => ({ id: `mock-${i}`, authorName, subject, status, isUrgent: false }));
  let rows = source.filter((p) => `${p.authorName} ${p.subject}`.toLowerCase().includes(q));
  return `<div class="page-title"><div><h1>Demandes de prière</h1><p>Déposez, suivez et accompagnez les sujets de prière.${state.liveRequests ? '' : ' (données de démonstration — backend hors ligne)'}</p></div><button class="primary" onclick="openPrayer()">+ Nouvelle demande</button></div><div class="card"><div class="toolbar"><input placeholder="Filtrer les demandes" value="${esc(state.query)}" oninput="state.query=this.value;render()"></div><table class="table"><thead><tr><th>Auteur</th><th>Sujet</th><th>Statut</th><th>Action</th></tr></thead><tbody>${rows
    .map(
      (p) =>
        `<tr><td>${esc(p.authorName)}${p.isUrgent ? ' 🔴' : ''}</td><td>${esc(p.subject)}</td><td>${badge(p.status)}</td><td><select onchange="updateRequestStatus('${p.id}',this.value)">${STATUS_OPTIONS.map((s) => `<option value="${s}" ${s === p.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`,
    )
    .join('')}</tbody></table></div>`;
}

function campaigns() {
  const source =
    state.liveCampaigns ||
    state.campaigns.map(([title, pct, participants]) => ({ title, currentParticipants: participants, targetParticipants: Math.round((participants / pct) * 100) }));

  const cards = source.map((c) => {
    const pct = c.targetParticipants ? Math.round((c.currentParticipants / c.targetParticipants) * 100) : 0;
    return `
      <div class="campaign-card">
        <div class="campaign-topline">
          <span class="campaign-tag">En cours</span>
          <span class="campaign-progress-badge">${pct}%</span>
        </div>
        <h2>${esc(c.title)}</h2>
        <p>${esc(c.description || 'Objectif spirituel')}</p>
        <div class="progress-track"><i style="width:${Math.min(pct, 100)}%"></i></div>
        <div class="campaign-meta">
          <strong>${c.currentParticipants}</strong>
          <span>participants</span>
          <small>${c.targetParticipants ? '/' + c.targetParticipants : ''}</small>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="campaign-shell">
      <div class="dashboard-header">
        <div>
          <p class="section-kicker">Campagnes</p>
          <h1>Mobilisation collective</h1>
        </div>
        ${isResponsable() ? '<button class="primary" onclick="openCampaign()">+ Créer une campagne</button>' : '<button class="secondary" disabled title="Réservé aux responsables">+ Créer une campagne</button>'}
      </div>

      <div class="kpi-grid">
        <div class="kpi-card accent-purple">
          <div class="kpi-label">Campagnes actives</div>
          <div class="kpi-value">${source.length}</div>
          <small>en cours</small>
        </div>
        <div class="kpi-card accent-blue">
          <div class="kpi-label">Participants</div>
          <div class="kpi-value">${source.reduce((sum, item) => sum + (item.currentParticipants || 0), 0)}</div>
          <small>total</small>
        </div>
        <div class="kpi-card accent-green">
          <div class="kpi-label">Objectif moyen</div>
          <div class="kpi-value">${Math.round(source.reduce((sum, item) => sum + (item.targetParticipants ? Math.round((item.currentParticipants / item.targetParticipants) * 100) : 0), 0) / Math.max(source.length, 1))}%</div>
          <small>de progression</small>
        </div>
        <div class="kpi-card accent-gold">
          <div class="kpi-label">Engagement</div>
          <div class="kpi-value">${source.length > 0 ? 'Très bon' : 'N/A'}</div>
          <small>dans la communauté</small>
        </div>
      </div>

      <div class="campaign-grid">
        ${cards}
      </div>
    </div>
  `;
}

function openCampaign() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-box"><h2>Créer une campagne</h2><label>Titre</label><input id="campaignTitle" placeholder="Ex. 7 jours de prière"><label>Description</label><textarea id="campaignDescription" rows="3" placeholder="Décrivez l'objectif de la campagne..."></textarea><label>Objectif de participants</label><input id="campaignTarget" type="number" min="0" placeholder="Ex. 100"><div class="modal-actions"><button class="secondary" onclick="this.closest('.modal').remove()">Annuler</button><button class="primary" onclick="saveCampaign()">Créer la campagne</button></div></div>`;
  document.body.appendChild(modal);
}

async function saveCampaign() {
  const title = document.getElementById('campaignTitle').value.trim();
  const description = document.getElementById('campaignDescription').value.trim();
  const targetValue = document.getElementById('campaignTarget').value;
  const targetParticipants = targetValue ? Number(targetValue) : undefined;
  if (!title) return toast('Le titre est obligatoire');
  if (targetValue && (!Number.isInteger(targetParticipants) || targetParticipants < 0)) return toast('L’objectif doit être un nombre positif');

  try {
    const res = await authFetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || undefined, targetParticipants, currentParticipants: 0 }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(error.message) ? error.message[0] : error.message || 'Création impossible');
    }
    document.querySelector('.modal')?.remove();
    await loadCampaigns();
    render();
    toast('Campagne créée');
  } catch (error) {
    if (error.message !== 'unauthorized') toast(error.message || 'Impossible de joindre le backend');
  }
}

function chronicles() {
  const testimonies = state.liveTestimonies;
  const canUpload = isResponsable() || state.currentUser?.role === 'INTERCESSEUR';
  const items = testimonies
    ? testimonies.map((t) => {
        const photoUrl = t.photoPath ? (/^https?:\/\//.test(t.photoPath) ? t.photoPath : `${API_ORIGIN}${t.photoPath}`) : null;
        const thumb = photoUrl ? `<div class="thumb" style="background-image:url('${photoUrl}');background-size:cover;background-position:center"></div>` : `<div class="thumb"></div>`;
        const uploadControl =
          canUpload && !t.photoPath
            ? `<div class="photo-upload"><input type="file" id="photo-${t.id}" accept="image/jpeg,image/png,image/webp"><button class="secondary" onclick="uploadTestimonyPhoto('${t.id}')">Ajouter une photo</button></div>`
            : '';
        return `<div class="chronicle">${thumb}<div style="flex:1"><b>${esc(t.title)}</b><small>${esc(t.authorName)} · ${fmtMeetingDate(t.createdAt)}</small><p style="margin:7px 0;color:var(--muted)">${esc(t.content)}</p>${uploadControl}</div></div>`;
      }).join('')
    : state.chronicles
        .map((c) => `<div class="chronicle"><div class="thumb"></div><div style="flex:1"><b>${c[0]}</b><small>${c[1]} · ${c[2]}</small><p style="margin:7px 0;color:var(--muted)">Une chronique de Tour d'Avant-Garde conservant la mémoire de ce que le Seigneur a accompli.</p></div></div>`)
        .join('');
  return `<div class="page-title"><div><h1>Chroniques de Tour d'Avant-Garde</h1><p>La mémoire vivante des prières, témoignages et campagnes.${testimonies ? '' : ' (données de démonstration — backend hors ligne)'}</p></div></div><div class="card"><div class="toolbar"><input placeholder="Rechercher une chronique" value="${esc(state.query)}" oninput="state.query=this.value;render()"></div>${items}</div>`;
}

function simple(title, sub, items) {
  return `<div class="page-title"><div><h1>${title}</h1><p>${sub}</p></div><button class="primary" onclick="toast('Action créée')">+ Ajouter</button></div><div class="card"><div class="list">${items
    .map((x) => `<div class="row"><div><b>${x}</b><small>Activité récente</small></div><button class="secondary" onclick="toast('Élément ouvert')">Voir</button></div>`)
    .join('')}</div></div>`;
}

function fmtMeetingDate(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return iso;
  }
}

function meetingsPage() {
  const meetings = state.liveMeetings || [
    { title: 'Réunion de prière générale', startAt: '2026-08-15T19:00:00', location: 'Salle principale + WhatsApp' },
    { title: 'Veillée spéciale', startAt: '2026-08-20T20:00:00', location: 'En ligne + salle' },
    { title: 'Veillée spéciale de fin de mois', startAt: '2026-08-25T20:00:00', location: 'Maison commune' },
  ];

  const addBtn = isResponsable()
    ? `<button class="primary" onclick="openMeeting()">+ Ajouter</button>`
    : `<button class="secondary" disabled title="Réservé aux responsables">+ Ajouter</button>`;

  const eventCards = meetings.map((m, index) => `
    <article class="meeting-card ${index === 0 ? 'featured' : ''}">
      <div class="meeting-date">
        <span>${new Date(m.startAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).replace('.', '')}</span>
      </div>
      <div class="meeting-body">
        <div class="meeting-tag">${index === 0 ? 'À venir' : 'Agenda'}</div>
        <h2>${esc(m.title)}</h2>
        <p>${fmtMeetingDate(m.startAt)}</p>
        <small>${esc(m.location || 'Lieu à confirmer')}</small>
      </div>
      <button class="secondary" onclick="toast('Détails de réunion')">Voir</button>
    </article>
  `).join('');

  return `
    <div class="meeting-shell">
      <div class="dashboard-header">
        <div>
          <p class="section-kicker">Réunions</p>
          <h1>Agenda de prière</h1>
        </div>
        ${addBtn}
      </div>

      <div class="kpi-grid">
        <div class="kpi-card accent-purple">
          <div class="kpi-label">Total</div>
          <div class="kpi-value">${meetings.length}</div>
          <small>événements</small>
        </div>
        <div class="kpi-card accent-blue">
          <div class="kpi-label">À venir</div>
          <div class="kpi-value">${meetings.length}</div>
          <small>dans le mois</small>
        </div>
        <div class="kpi-card accent-green">
          <div class="kpi-label">En ligne</div>
          <div class="kpi-value">2</div>
          <small>sessions</small>
        </div>
        <div class="kpi-card accent-gold">
          <div class="kpi-label">Participation</div>
          <div class="kpi-value">92%</div>
          <small>moyenne</small>
        </div>
      </div>

      <div class="meeting-grid">
        ${eventCards}
      </div>
    </div>
  `;
}

function whatsappPage() {
  return `<div class="page-title"><div><h1>Simulateur WhatsApp</h1><p>Testez Le Veilleur comme le ferait un membre depuis WhatsApp.</p></div></div><div class="card wa-card"><div class="wa-chat" id="waChat">${state.waMessages
    .map((m) => `<div class="wa-msg ${m.from}">${esc(m.text).replace(/\n/g, '<br>')}</div>`)
    .join('')}</div><div class="wa-inputbar"><input id="waInput" placeholder="Écrire un message... (ex: menu)" onkeydown="if(event.key==='Enter')sendWa()"><button class="primary" onclick="sendWa()">Envoyer</button></div><small>Numéro simulé : ${state.waPhone} ${state.apiOnline ? '' : '· backend hors ligne, réponses indisponibles'}</small></div>`;
}

function groupsPage() {
  const teams = state.liveTeams || [
    { name: 'Intercesseurs du matin' },
    { name: 'Jeunesse en prière' },
    { name: 'Groupe des femmes' },
    { name: 'Veilleurs de nuit' },
  ];
  const addBtn = isResponsable()
    ? `<button class="primary" onclick="openTeam()">+ Ajouter</button>`
    : `<button class="secondary" disabled title="Réservé aux responsables">+ Ajouter</button>`;
  const items = teams.map((t) => `<div class="admin-user-row"><div class="admin-user-main"><div class="avatar">${esc((t.name || '?')[0])}</div><div><strong>${esc(t.name)}</strong><small>${t.leader ? 'Responsable : ' + esc(t.leader.fullName) : 'Aucun responsable désigné'}</small></div></div><span class="badge b-progress">ACTIF</span></div>`).join('');

  return `<div class="admin-shell"><div class="dashboard-header"><div><p class="section-kicker">Communauté</p><h1>Groupes d'intercession</h1></div>${addBtn}</div><div class="kpi-grid"><div class="kpi-card accent-purple"><div class="kpi-label">Groupes actifs</div><div class="kpi-value">${teams.length}</div><small>équipes enregistrées</small></div><div class="kpi-card accent-green"><div class="kpi-label">Organisation</div><div class="kpi-value">100%</div><small>suivi disponible</small></div></div><div class="admin-panel"><div class="panel-head"><h3>Annuaire des groupes</h3><span class="panel-note">${state.liveTeams ? 'Données synchronisées' : 'Mode démonstration'}</span></div><div class="admin-list">${items}</div></div></div>`;
}

function openTeam() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-box"><h2>Ajouter un groupe</h2><label>Nom du groupe</label><input id="teamName" placeholder="Ex. Veilleurs du soir"><div class="modal-actions"><button class="secondary" onclick="this.closest('.modal').remove()">Annuler</button><button class="primary" onclick="saveTeam()">Créer le groupe</button></div></div>`;
  document.body.appendChild(modal);
}

async function saveTeam() {
  const name = document.getElementById('teamName').value.trim();
  if (!name) return toast('Le nom du groupe est obligatoire');
  try {
    const res = await authFetch(`${API_BASE}/intercession-teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(error.message) ? error.message[0] : error.message || 'Création impossible');
    }
    document.querySelector('.modal')?.remove();
    await loadTeams();
    render();
    toast('Groupe ajouté');
  } catch (error) {
    if (error.message !== 'unauthorized') toast(error.message || 'Impossible de joindre le backend');
  }
}

function statsPage() {
  const s = state.liveStats;
  const items = s
    ? [`${s.totalPrayerRequests} demandes reçues`, `${s.totalTestimonies} témoignages`, `${s.totalIntercessors} intercesseurs actifs`, `${s.totalPrayerHours} heures de prière programmées`]
    : ['1 248 demandes reçues', '342 témoignages', '256 intercesseurs actifs', '1 842 heures de prière'];
  const history = state.liveHistory;
  const historyCard = history
    ? `<div class="card"><h3>Historique (instantanés quotidiens)</h3>${
        history.length
          ? `<table class="table"><thead><tr><th>Date</th><th>Participants</th><th>Demandes reçues</th><th>Urgentes</th><th>Intercesseurs</th></tr></thead><tbody>${history
              .map((h) => `<tr><td>${h.date}</td><td>${h.participants}</td><td>${h.demandesRecues}</td><td>${h.urgentes}</td><td>${h.intercesseursConnectes}</td></tr>`)
              .join('')}</tbody></table>`
          : `<p style="color:var(--muted)">Aucun instantané encore enregistré (capture automatique chaque jour à 23h55).${isResponsable() ? '' : ''}</p>`
      }${isResponsable() ? `<button class="secondary" style="margin-top:12px" onclick="captureSnapshotNow()">Capturer un instantané maintenant</button>` : ''}</div>`
    : '';
  return `<div class="page-title"><div><h1>Statistiques</h1><p>Vue globale de l'activité de Tour d'Avant-Garde.${s ? '' : ' (données de démonstration — backend hors ligne)'}</p></div></div><div class="card"><div class="list">${items
    .map((x) => `<div class="row"><div><b>${x}</b></div></div>`)
    .join('')}</div></div>${historyCard}`;
}

function communityPage() {
  const communities = state.liveCommunities || [
    { name: 'Tour de Kinshasa', city: 'Kinshasa' },
    { name: 'Communauté en ligne', city: 'Tous les fuseaux horaires' },
  ];
  const addBtn = isResponsable()
    ? `<button class="primary" onclick="openCommunity()">+ Ajouter</button>`
    : `<button class="secondary" disabled title="Réservé aux responsables">+ Ajouter</button>`;
  const items = communities.map((community) => `<div class="admin-user-row"><div class="admin-user-main"><div class="avatar">${esc((community.name || '?')[0])}</div><div><strong>${esc(community.name)}</strong><small>${esc(community.city || 'Ville non renseignée')}${community.timezone ? ' · ' + esc(community.timezone) : ''}</small></div></div><span class="badge b-progress">ACTIVE</span></div>`).join('');
  return `<div class="admin-shell"><div class="dashboard-header"><div><p class="section-kicker">Réseau TAG</p><h1>Communautés</h1><p>Les communautés locales et en ligne de Tour d'Avant-Garde.</p></div>${addBtn}</div><div class="kpi-grid"><div class="kpi-card accent-purple"><div class="kpi-label">Communautés</div><div class="kpi-value">${communities.length}</div><small>espaces actifs</small></div><div class="kpi-card accent-blue"><div class="kpi-label">Portée</div><div class="kpi-value">24/7</div><small>prière continue</small></div></div><div class="admin-panel"><div class="panel-head"><h3>Annuaire des communautés</h3><span class="panel-note">${state.liveCommunities ? 'Données synchronisées' : 'Mode démonstration'}</span></div><div class="admin-list">${items}</div></div></div>`;
}

function actionsPage() {
  const actions = state.liveActions || [
    { authorName: 'Marie L.', description: 'J’ai repris un temps de prière quotidien avec ma famille.' },
    { authorName: 'Pierre K.', description: 'Je vais accompagner un nouveau membre cette semaine.' },
  ];
  const items = actions.map((action) => `<div class="message-row"><div class="avatar">${esc((action.authorName || '?')[0])}</div><div class="activity-copy"><b>${esc(action.authorName || 'Anonyme')}</b><small>Acte de foi partagé</small><p>${esc(action.description)}</p></div></div>`).join('');
  return `<div class="admin-shell"><div class="dashboard-header"><div><p class="section-kicker">Engagement</p><h1>Actes de foi</h1><p>Des décisions concrètes qui prolongent la prière dans la vie quotidienne.</p></div><button class="primary" onclick="openAction()">+ Déposer un acte</button></div><div class="kpi-grid"><div class="kpi-card accent-purple"><div class="kpi-label">Actes partagés</div><div class="kpi-value">${actions.length}</div><small>dans la communauté</small></div><div class="kpi-card accent-gold"><div class="kpi-label">Aujourd’hui</div><div class="kpi-value">${actions.length > 0 ? 'Actif' : 'Calme'}</div><small>mouvement communautaire</small></div></div><div class="admin-panel"><div class="panel-head"><h3>Derniers engagements</h3><span class="panel-note">${state.liveActions ? 'Données synchronisées' : 'Mode démonstration'}</span></div><div class="message-list">${items || '<div class="empty-state">Aucun acte de foi pour le moment.</div>'}</div></div></div>`;
}

function openAction() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-box"><h2>Déposer un acte de foi</h2><label>Votre nom</label><input id="actionAuthor" value="${esc(state.currentUser?.fullName || '')}" placeholder="Ex. Marie L."><label>Votre engagement</label><textarea id="actionDescription" rows="5" placeholder="Décrivez une action concrète..." ></textarea><div class="modal-actions"><button class="secondary" onclick="this.closest('.modal').remove()">Annuler</button><button class="primary" onclick="saveAction()">Partager</button></div></div>`;
  document.body.appendChild(modal);
}

async function saveAction() {
  const authorName = document.getElementById('actionAuthor').value.trim();
  const description = document.getElementById('actionDescription').value.trim();
  if (!authorName || !description) return toast('Nom et engagement sont obligatoires');
  try {
    const res = await authFetch(`${API_BASE}/action-of-faith`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, description }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(error.message) ? error.message[0] : error.message || 'Envoi impossible');
    }
    document.querySelector('.modal')?.remove();
    await loadActions();
    render();
    toast('Acte de foi partagé');
  } catch (error) {
    if (error.message !== 'unauthorized') toast(error.message || 'Impossible de joindre le backend');
  }
}

function programPage() {
  const program = state.liveProgram || {
    title: 'Programme de prière du jour',
    date: new Date().toISOString(),
    description: 'Un temps de prière structuré pour avancer ensemble dans la présence de Dieu.',
    steps: [
      { orderIndex: 1, title: 'Louange et adoration', durationMinutes: 15, description: 'Entrer dans la présence de Dieu.' },
      { orderIndex: 2, title: 'Confession et repentance', durationMinutes: 10, description: 'Prier avec un coeur humble.' },
      { orderIndex: 3, title: 'Intercession pour les nations', durationMinutes: 20, description: 'Porter les besoins du monde.' },
      { orderIndex: 4, title: 'Action de grâce', durationMinutes: 10, description: 'Terminer dans la reconnaissance.' },
    ],
  };
  const steps = (program.steps || []).slice().sort((a, b) => a.orderIndex - b.orderIndex);
  const totalMinutes = steps.reduce((sum, step) => sum + (step.durationMinutes || 0), 0);
  const stepCards = steps.map((step, index) => `<div class="program-step"><div class="program-step-number">${index + 1}</div><div class="activity-copy"><b>${esc(step.title)}</b><small>${step.durationMinutes || 0} minutes</small>${step.description ? `<p>${esc(step.description)}</p>` : ''}</div><span class="badge ${index === 0 ? 'b-progress' : 'b-new'}">${index === 0 ? 'EN COURS' : 'À VENIR'}</span></div>`).join('');
  const addButton = isResponsable() ? `<button class="primary" onclick="openProgram()">+ Nouveau programme</button>` : '';
  return `<div class="admin-shell"><div class="dashboard-header"><div><p class="section-kicker">Rythme collectif</p><h1>${esc(program.title)}</h1><p>${esc(program.description || 'Programme de prière structuré pour la communauté.')}</p></div>${addButton}</div><div class="kpi-grid"><div class="kpi-card accent-purple"><div class="kpi-label">Étapes</div><div class="kpi-value">${steps.length}</div><small>au programme</small></div><div class="kpi-card accent-blue"><div class="kpi-label">Durée totale</div><div class="kpi-value">${totalMinutes}</div><small>minutes de prière</small></div><div class="kpi-card accent-green"><div class="kpi-label">Statut</div><div class="kpi-value">Actif</div><small>${new Date(program.date).toLocaleDateString('fr-FR')}</small></div></div><div class="admin-panel"><div class="panel-head"><h3>Déroulé du jour</h3><span class="panel-note">${state.liveProgram ? 'Données synchronisées' : 'Mode démonstration'}</span></div><div class="program-list">${stepCards || '<div class="empty-state">Aucune étape programmée.</div>'}</div></div></div>`;
}

function resourcesPage() {
  const resources = [
    ['Guide de prière', 'Parcours simple pour structurer un temps personnel de prière.', 'PDF'],
    ['Programme d’intercession', 'Repères pour porter les familles, les nations et la communauté.', 'GUIDE'],
    ['Carnet du veilleur', 'Questions et pratiques pour accompagner une demande avec attention.', 'FICHE'],
    ['Déclaration de la Tour', 'Les fondements et la vision de Tour d’Avant-Garde.', 'DOC'],
  ];
  const cards = resources.map(([title, description, type]) => `<article class="resource-card"><div class="resource-icon">✦</div><span class="resource-type">${type}</span><h2>${title}</h2><p>${description}</p><button class="mini-btn" onclick="toast('Ressource bientôt disponible')">Consulter</button></article>`).join('');
  return `<div class="admin-shell"><div class="dashboard-header"><div><p class="section-kicker">Bibliothèque</p><h1>Ressources pour la Tour</h1><p>Des repères pour prier, servir et accompagner la communauté.</p></div></div><div class="resource-grid">${cards}</div></div>`;
}

function intentionsPage() {
  const intentions = state.liveIntentions || [{ title: 'La paix dans les nations', date: new Date().toISOString().slice(0, 10), items: ['Les familles', 'Les malades', 'Les missionnaires', 'Les autorités', 'Les jeunes'] }];
  const current = intentions[0];
  const history = intentions.slice(1).map((intention) => `<div class="activity-row"><div class="activity-icon">◎</div><div class="activity-copy"><b>${esc(intention.title)}</b><small>${esc(intention.date || '')}</small></div></div>`).join('');
  const items = (current.items || []).map((item) => `<li>${esc(item)}</li>`).join('');
  return `<div class="admin-shell"><div class="dashboard-header"><div><p class="section-kicker">Prière collective</p><h1>Intentions mondiales</h1><p>Chaque jour, la Tour porte une intention commune pour le monde.</p></div><span class="live-pill">Aujourd’hui</span></div><div class="intention-feature"><div class="intention-orbit">◎</div><div><span class="eyebrow">Intention du jour · ${esc(current.date || '')}</span><h2>${esc(current.title)}</h2><ul>${items}</ul></div></div><div class="admin-panel"><div class="panel-head"><h3>Intentions précédentes</h3><span class="panel-note">${state.liveIntentions ? 'Données synchronisées' : 'Mode démonstration'}</span></div><div class="activity-list">${history || '<div class="empty-state">Aucune intention précédente.</div>'}</div></div></div>`;
}

function openProgram() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-box"><h2>Nouveau programme</h2><label>Titre</label><input id="programTitle" placeholder="Ex. Programme du samedi"><label>Date</label><input id="programDate" type="date" value="${new Date().toISOString().slice(0, 10)}"><label>Description</label><textarea id="programDescription" rows="3" placeholder="Décrivez le temps de prière..."></textarea><label>Première étape</label><input id="programStepTitle" placeholder="Ex. Louange et adoration"><label>Durée de l’étape (minutes)</label><input id="programStepDuration" type="number" min="1" value="15"><div class="modal-actions"><button class="secondary" onclick="this.closest('.modal').remove()">Annuler</button><button class="primary" onclick="saveProgram()">Créer</button></div></div>`;
  document.body.appendChild(modal);
}

async function saveProgram() {
  const title = document.getElementById('programTitle').value.trim();
  const date = document.getElementById('programDate').value;
  const description = document.getElementById('programDescription').value.trim();
  const stepTitle = document.getElementById('programStepTitle').value.trim();
  const durationMinutes = Number(document.getElementById('programStepDuration').value);
  if (!title || !date || !stepTitle) return toast('Titre, date et première étape sont obligatoires');
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1) return toast('La durée doit être un entier positif');
  try {
    const res = await authFetch(`${API_BASE}/prayer-programs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, date, description: description || undefined, steps: [{ orderIndex: 1, title: stepTitle, durationMinutes }] }) });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(error.message) ? error.message[0] : error.message || 'Création impossible');
    }
    document.querySelector('.modal')?.remove();
    await loadProgram();
    render();
    toast('Programme créé');
  } catch (error) {
    if (error.message !== 'unauthorized') toast(error.message || 'Impossible de joindre le backend');
  }
}

function openCommunity() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-box"><h2>Ajouter une communauté</h2><label>Nom</label><input id="communityName" placeholder="Ex. Tour de Lubumbashi"><label>Ville</label><input id="communityCity" placeholder="Ex. Lubumbashi"><label>Fuseau horaire</label><input id="communityTimezone" placeholder="Ex. Africa/Kinshasa"><div class="modal-actions"><button class="secondary" onclick="this.closest('.modal').remove()">Annuler</button><button class="primary" onclick="saveCommunity()">Créer</button></div></div>`;
  document.body.appendChild(modal);
}

async function saveCommunity() {
  const name = document.getElementById('communityName').value.trim();
  const city = document.getElementById('communityCity').value.trim();
  const timezone = document.getElementById('communityTimezone').value.trim();
  if (!name) return toast('Le nom est obligatoire');
  try {
    const res = await authFetch(`${API_BASE}/communities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city: city || undefined, timezone: timezone || undefined }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(error.message) ? error.message[0] : error.message || 'Création impossible');
    }
    document.querySelector('.modal')?.remove();
    await loadCommunities();
    render();
    toast('Communauté ajoutée');
  } catch (error) {
    if (error.message !== 'unauthorized') toast(error.message || 'Impossible de joindre le backend');
  }
}

function adminPage() {
  if (!isResponsable()) {
    return `<div class="page-title"><div><h1>Administration</h1><p>Accès réservé aux responsables.</p></div></div>`;
  }

  const users = state.liveUsers || [
    { fullName: 'Jonathan M.', phone: '+243900000001', email: 'responsable@tourdavantgarde.org', role: { name: 'RESPONSABLE' } },
    { fullName: 'Marie L.', phone: '+243900000002', email: 'marie@tourdavantgarde.org', role: { name: 'INTERCESSEUR' } },
    { fullName: 'Pierre K.', phone: '+243900000003', email: 'pierre@tourdavantgarde.org', role: { name: 'INTERCESSEUR' } },
    { fullName: 'Jean B.', phone: '+243900000006', email: 'jean@tourdavantgarde.org', role: { name: 'MEMBRE' } },
  ];

  const cards = users.map((u) => `
    <div class="admin-user-row">
      <div class="admin-user-main">
        <div class="avatar">${esc((u.fullName || '?')[0])}</div>
        <div>
          <strong>${esc(u.fullName)}</strong>
          <small>${esc(u.phone)}${u.email ? ' · ' + esc(u.email) : ''}</small>
        </div>
      </div>
      <div class="admin-user-actions">
        <span class="badge ${u.role?.name === 'RESPONSABLE' ? 'b-assigned' : u.role?.name === 'INTERCESSEUR' ? 'b-progress' : 'b-new'}">${esc(u.role?.name || '—')}</span>
        <button class="mini-btn" onclick="toast('Profil utilisateur')">Voir</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="admin-shell">
      <div class="dashboard-header">
        <div>
          <p class="section-kicker">Administration</p>
          <h1>Gestion de la plateforme</h1>
        </div>
        <button class="primary" onclick="openUser()">+ Ajouter</button>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card accent-purple">
          <div class="kpi-label">Utilisateurs</div>
          <div class="kpi-value">${users.length}</div>
          <small>inscrits</small>
        </div>
        <div class="kpi-card accent-blue">
          <div class="kpi-label">Responsables</div>
          <div class="kpi-value">${users.filter((u) => u.role?.name === 'RESPONSABLE').length}</div>
          <small>actifs</small>
        </div>
        <div class="kpi-card accent-green">
          <div class="kpi-label">Intercesseurs</div>
          <div class="kpi-value">${users.filter((u) => u.role?.name === 'INTERCESSEUR').length}</div>
          <small>mobilisés</small>
        </div>
        <div class="kpi-card accent-gold">
          <div class="kpi-label">Membres</div>
          <div class="kpi-value">${users.filter((u) => u.role?.name === 'MEMBRE').length}</div>
          <small>dans la communauté</small>
        </div>
      </div>

      <div class="admin-panel">
        <div class="panel-head">
          <h3>Annuaire des membres</h3>
          <button class="mini-btn" onclick="toast('Export CSV')">Exporter</button>
        </div>
        <div class="admin-list">${cards}</div>
      </div>
    </div>
  `;
}

function openUser() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-box"><h2>Ajouter un membre</h2><label>Nom complet</label><input id="userName" placeholder="Ex. Esther K."><label>Téléphone</label><input id="userPhone" placeholder="Ex. +243900000010"><label>Email</label><input id="userEmail" type="email" placeholder="Ex. esther@tourdavantgarde.org"><label class="check-label"><input id="userIntercessor" type="checkbox"> Intercesseur</label><div class="modal-actions"><button class="secondary" onclick="this.closest('.modal').remove()">Annuler</button><button class="primary" onclick="saveUser()">Créer le membre</button></div></div>`;
  document.body.appendChild(modal);
}

async function saveUser() {
  const fullName = document.getElementById('userName').value.trim();
  const phone = document.getElementById('userPhone').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const isIntercessor = document.getElementById('userIntercessor').checked;
  if (!fullName || !phone) return toast('Nom et téléphone sont obligatoires');

  try {
    const res = await authFetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phone, email: email || undefined, isIntercessor }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(error.message) ? error.message[0] : error.message || 'Création impossible');
    }
    document.querySelector('.modal')?.remove();
    await loadUsers();
    render();
    toast('Membre ajouté');
  } catch (error) {
    if (error.message !== 'unauthorized') toast(error.message || 'Impossible de joindre le backend');
  }
}

function fmtNotifDate(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return iso;
  }
}

function notificationsPage() {
  const all = state.liveNotifications;
  const sent = all ? all.filter((n) => n.channel !== 'internal') : null;
  const items = sent
    ? sent.map((n) => `<div class="activity-row"><div class="activity-icon">${n.channel === 'WHATSAPP' ? 'W' : n.channel === 'EMAIL' ? '@' : '•'}</div><div class="activity-copy"><b>${esc(n.title)}</b><small>${esc(n.channel)} · ${esc(n.user?.fullName || n.user?.phone || '—')} · ${fmtNotifDate(n.createdAt)}</small></div><span class="badge b-done">${esc(n.status)}</span></div>`).join('')
    : ['12 nouvelles demandes de prière', '5 réunions à venir', '2 requêtes urgentes non traitées']
        .map((x) => `<div class="activity-row"><div class="activity-icon">•</div><div class="activity-copy"><b>${x}</b><small>Activité récente</small></div></div>`)
        .join('');
  return `<div class="admin-shell"><div class="dashboard-header"><div><p class="section-kicker">Communication</p><h1>Notifications envoyées</h1><p>Suivi des alertes transmises à la communauté.</p></div><span class="live-pill">${sent ? `${sent.length} événements` : 'Mode démo'}</span></div><div class="admin-panel"><div class="panel-head"><h3>Journal de diffusion</h3><span class="panel-note">WhatsApp · Email · Push</span></div><div class="activity-list">${items || '<div class="empty-state">Aucune notification pour le moment.</div>'}</div></div></div>`;
}

function messagesPage() {
  const all = state.liveNotifications;
  const msgs = all ? all.filter((n) => n.channel === 'internal') : null;
  const items = msgs
    ? msgs.map((n) => `<div class="message-row"><div class="avatar">${esc((n.user?.fullName || n.user?.phone || 'A')[0])}</div><div class="activity-copy"><b>${esc(n.user?.fullName || n.user?.phone || 'Anonyme')}</b><small>${fmtNotifDate(n.createdAt)}</small><p>${esc(n.body || '')}</p></div><button class="mini-btn" onclick="toast('Réponse bientôt disponible')">Ouvrir</button></div>`).join('')
    : ['Un membre souhaite parler à un responsable', 'Question sur le programme de la semaine']
        .map((x) => `<div class="message-row"><div class="avatar">?</div><div class="activity-copy"><b>${x}</b><small>Via WhatsApp · message entrant</small></div><button class="mini-btn" onclick="toast('Réponse bientôt disponible')">Ouvrir</button></div>`)
        .join('');
  return `<div class="admin-shell"><div class="dashboard-header"><div><p class="section-kicker">Échanges</p><h1>Messages des membres</h1><p>Demandes de contact reçues via le canal WhatsApp.</p></div><span class="live-pill">${msgs ? `${msgs.length} messages` : 'Mode démo'}</span></div><div class="admin-panel"><div class="panel-head"><h3>Boîte de réception</h3><span class="panel-note">Via WhatsApp</span></div><div class="message-list">${items || '<div class="empty-state">Aucun message pour le moment.</div>'}</div></div></div>`;
}

function pageContent() {
  if (state.page === 'dashboard') return dashboard();
  if (state.page === 'prayer') return prayerPage();
  if (state.page === 'whatsapp') return whatsappPage();
  if (state.page === 'campaigns') return campaigns();
  if (state.page === 'chronicles') return chronicles();
  if (state.page === 'groups') return groupsPage();
  if (state.page === 'meetings') return meetingsPage();
  if (state.page === 'stats') return statsPage();
  if (state.page === 'admin') return adminPage();
  if (state.page === 'notifications') return notificationsPage();
  if (state.page === 'messages') return messagesPage();
  if (state.page === 'community') return communityPage();
  if (state.page === 'actions') return actionsPage();
  if (state.page === 'program') return programPage();
  if (state.page === 'intentions') return intentionsPage();
  if (state.page === 'resources') return resourcesPage();
  return simple(nav.find((x) => x[0] === state.page)?.[2] || 'Module', "Espace Tour d'Avant-Garde.", ['Activité récente', 'Notifications', 'Ressources disponibles']);
}

function go(p) {
  state.page = p;
  state.query = '';
  render();
  window.scrollTo(0, 0);
  if (p === 'prayer') loadPrayerRequests().then(render);
  if (p === 'meetings') loadMeetings().then(render);
  if (p === 'dashboard') loadDashboardData();
  if (p === 'campaigns') loadCampaigns().then(render);
  if (p === 'groups') loadTeams().then(render);
  if (p === 'chronicles') loadTestimonies().then(render);
  if (p === 'stats') Promise.all([loadStats(), loadHistory()]).then(render);
  if (p === 'admin') loadUsers().then(render);
  if (p === 'notifications' || p === 'messages') loadNotifications().then(render);
  if (p === 'community') loadCommunities().then(render);
  if (p === 'actions') loadActions().then(render);
  if (p === 'program') loadProgram().then(render);
  if (p === 'intentions') loadIntentions().then(render);
}

function toast(t) {
  const d = document.createElement('div');
  d.className = 'toast';
  d.textContent = t;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2200);
}

function openPrayer() {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `<div class="modal-box"><h2>Déposer une demande de prière</h2><label>Sujet</label><input id="pt" placeholder="Ex. Protection pour ma famille"><label>Description</label><textarea id="pd" rows="5" placeholder="Décrivez votre demande..."></textarea><label>Catégorie</label><select id="pc"><option>Protection</option><option>Guérison</option><option>Percée</option><option>Délivrance</option><option>Famille</option></select><div class="modal-actions"><button class="secondary" onclick="this.closest('.modal').remove()">Annuler</button><button class="primary" onclick="savePrayer()">Déposer</button></div></div>`;
  document.body.appendChild(m);
}

async function savePrayer() {
  const title = document.getElementById('pt').value.trim();
  const description = document.getElementById('pd').value.trim();
  const category = document.getElementById('pc').value;
  if (!title) return toast('Le sujet est obligatoire');
  document.querySelector('.modal').remove();
  try {
    const res = await authFetch(`${API_BASE}/prayer-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: state.currentUser?.fullName || 'Responsable', phone: '+243900000001', subject: title, description, category, source: 'dashboard' }),
    });
    if (!res.ok) throw new Error('offline');
    await loadPrayerRequests();
  } catch (e) {
    state.prayers.unshift([state.currentUser?.fullName || 'Responsable', title, 'NEW']);
  }
  state.page = 'prayer';
  render();
  toast('Demande de prière déposée');
}

async function updateRequestStatus(id, status) {
  if (String(id).startsWith('mock-')) return toast('Backend hors ligne : changement non enregistré');
  try {
    await authFetch(`${API_BASE}/prayer-requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadPrayerRequests();
    render();
    toast('Statut mis à jour');
  } catch (e) {
    if (e.message !== 'unauthorized') toast('Impossible de joindre le backend');
  }
}

async function toggleFlambeauItem(key, checked) {
  try {
    await authFetch(`${API_BASE}/flambeau/today/checklist`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: checked }),
    });
    await loadDashboardData();
    render();
  } catch (e) {
    if (e.message !== 'unauthorized') toast('Impossible de mettre à jour le Flambeau');
  }
}

async function publishEncouragement() {
  const message = document.getElementById('flambeauMsg').value.trim();
  if (!message) return toast('Le message est vide');
  try {
    await authFetch(`${API_BASE}/flambeau/today/encouragement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    await loadDashboardData();
    render();
    toast('Encouragement publié');
  } catch (e) {
    if (e.message !== 'unauthorized') toast('Impossible de publier le message');
  }
}

function openMeeting() {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `<div class="modal-box"><h2>Ajouter une réunion</h2><label>Titre</label><input id="mt" placeholder="Ex. Veillée d'intercession"><label>Date et heure</label><input id="mstart" type="datetime-local"><label>Lieu</label><input id="mloc" placeholder="Ex. Salle principale + WhatsApp"><div class="modal-actions"><button class="secondary" onclick="this.closest('.modal').remove()">Annuler</button><button class="primary" onclick="saveMeeting()">Ajouter</button></div></div>`;
  document.body.appendChild(m);
}

async function saveMeeting() {
  const title = document.getElementById('mt').value.trim();
  const startAt = document.getElementById('mstart').value;
  const location = document.getElementById('mloc').value.trim();
  if (!title || !startAt) return toast('Titre et date sont obligatoires');
  try {
    await authFetch(`${API_BASE}/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, startAt: new Date(startAt).toISOString(), location }),
    });
    document.querySelector('.modal').remove();
    await loadMeetings();
    render();
    toast('Réunion ajoutée');
  } catch (e) {
    if (e.message !== 'unauthorized') toast('Impossible de joindre le backend');
  }
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function authFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...(options.headers || {}), ...authHeaders() } });
  if (res.status === 401) {
    logout();
    toast('Session expirée, reconnectez-vous.');
    throw new Error('unauthorized');
  }
  return res;
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      state.loginError = err.message || 'Identifiants invalides';
      render();
      return;
    }
    const data = await res.json();
    state.token = data.accessToken;
    state.currentUser = data.user;
    state.loginError = '';
    localStorage.setItem('tag_token', state.token);
    localStorage.setItem('tag_user', JSON.stringify(state.currentUser));
    render();
    Promise.all([loadDashboardData(), loadPrayerRequests(), loadMeetings()]).then(render);
  } catch (e) {
    state.loginError = "Impossible de joindre le serveur (backend hors ligne sur " + API_BASE + ')';
    render();
  }
}

function logout() {
  state.token = null;
  state.currentUser = null;
  localStorage.removeItem('tag_token');
  localStorage.removeItem('tag_user');
  render();
}

async function sendWa() {
  const input = document.getElementById('waInput');
  const text = input.value.trim();
  if (!text) return;
  state.waMessages.push({ from: 'user', text });
  render();
  try {
    const res = await fetch(`${API_BASE}/whatsapp/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: state.waPhone, text, name: 'Testeur' }),
    });
    const data = await res.json();
    state.waMessages.push({ from: 'veilleur', text: data.reply || '(pas de réponse)' });
  } catch (e) {
    state.waMessages.push({ from: 'veilleur', text: "Le Veilleur est hors ligne (backend non démarré sur " + API_BASE + ')' });
  }
  render();
  const chat = document.getElementById('waChat');
  if (chat) chat.scrollTop = chat.scrollHeight;
  const newInput = document.getElementById('waInput');
  if (newInput) newInput.focus();
}

async function loadDashboardData() {
  try {
    const [overviewRes] = await Promise.all([fetch(`${API_BASE}/dashboard/overview`)]);
    if (!overviewRes.ok) throw new Error('offline');
    const data = await overviewRes.json();
    state.live = data.today;
    state.session = data.session;
    state.worldIntention = data.worldIntention;
    state.flambeau = data.flambeau;
    state.apiOnline = true;
  } catch (e) {
    state.apiOnline = false;
  }
}

async function loadPrayerRequests() {
  try {
    const res = await fetch(`${API_BASE}/prayer-requests`);
    if (!res.ok) throw new Error('offline');
    state.liveRequests = await res.json();
  } catch (e) {
    state.liveRequests = null;
  }
}

async function loadMeetings() {
  try {
    const res = await fetch(`${API_BASE}/meetings`);
    if (!res.ok) throw new Error('offline');
    state.liveMeetings = await res.json();
  } catch (e) {
    state.liveMeetings = null;
  }
}

async function loadCampaigns() {
  try {
    const res = await fetch(`${API_BASE}/campaigns`);
    if (!res.ok) throw new Error('offline');
    state.liveCampaigns = await res.json();
  } catch (e) {
    state.liveCampaigns = null;
  }
}

async function loadTeams() {
  try {
    const res = await fetch(`${API_BASE}/intercession-teams`);
    if (!res.ok) throw new Error('offline');
    state.liveTeams = await res.json();
  } catch (e) {
    state.liveTeams = null;
  }
}

async function loadCommunities() {
  try {
    const res = await fetch(`${API_BASE}/communities`);
    if (!res.ok) throw new Error('offline');
    state.liveCommunities = await res.json();
  } catch (e) {
    state.liveCommunities = null;
  }
}

async function loadActions() {
  try {
    const res = await fetch(`${API_BASE}/action-of-faith`);
    if (!res.ok) throw new Error('offline');
    state.liveActions = await res.json();
  } catch (e) {
    state.liveActions = null;
  }
}

async function loadProgram() {
  try {
    const res = await fetch(`${API_BASE}/prayer-programs/today`);
    if (!res.ok) throw new Error('offline');
    state.liveProgram = await res.json();
  } catch (e) {
    state.liveProgram = null;
  }
}

async function loadIntentions() {
  try {
    const res = await fetch(`${API_BASE}/world-intentions`);
    if (!res.ok) throw new Error('offline');
    state.liveIntentions = await res.json();
  } catch (e) {
    state.liveIntentions = null;
  }
}

async function loadTestimonies() {
  try {
    const res = await fetch(`${API_BASE}/testimonies`);
    if (!res.ok) throw new Error('offline');
    state.liveTestimonies = await res.json();
  } catch (e) {
    state.liveTestimonies = null;
  }
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('offline');
    state.liveStats = await res.json();
  } catch (e) {
    state.liveStats = null;
  }
}

async function uploadTestimonyPhoto(testimonyId) {
  const input = document.getElementById(`photo-${testimonyId}`);
  const file = input?.files?.[0];
  if (!file) return toast('Choisissez une photo');
  const formData = new FormData();
  formData.append('photo', file);
  try {
    const res = await authFetch(`${API_BASE}/testimonies/${testimonyId}/photo`, { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'offline');
    }
    await loadTestimonies();
    render();
    toast('Photo ajoutée');
  } catch (e) {
    if (e.message !== 'unauthorized') toast(e.message === 'offline' ? 'Impossible de joindre le backend' : e.message);
  }
}

async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/history`);
    if (!res.ok) throw new Error('offline');
    state.liveHistory = await res.json();
  } catch (e) {
    state.liveHistory = null;
  }
}

async function captureSnapshotNow() {
  try {
    await authFetch(`${API_BASE}/dashboard/history/capture`, { method: 'POST' });
    await loadHistory();
    render();
    toast('Instantané capturé');
  } catch (e) {
    if (e.message !== 'unauthorized') toast('Impossible de capturer l’instantané');
  }
}

async function loadNotifications() {
  try {
    const res = await authFetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('offline');
    state.liveNotifications = await res.json();
  } catch (e) {
    state.liveNotifications = null;
  }
}

async function loadUsers() {
  if (!isResponsable()) return;
  try {
    const res = await authFetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('offline');
    state.liveUsers = await res.json();
  } catch (e) {
    state.liveUsers = null;
  }
}

function render() {
  document.getElementById('app').innerHTML = state.token ? shell() : loginScreen();
}

render();
if (state.token) Promise.all([loadDashboardData(), loadPrayerRequests(), loadMeetings()]).then(render);
setInterval(() => {
  if (!state.token) return;
  const shouldRerender = state.page === 'dashboard';
  Promise.all([loadDashboardData(), loadPrayerRequests(), loadMeetings()]).then(() => {
    if (shouldRerender) render();
  });
}, 20000);
