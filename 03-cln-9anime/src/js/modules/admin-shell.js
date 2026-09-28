/* ═══════════════════════════════════════════════════════════
   admin-shell.js — injects sidebar + topbar into every admin page
   Usage: <script src="admin-shell.js"></script>
          <script>renderAdminShell('analytics');</script>
   Valid page keys: titles | analytics | top10 | genres | users | preferences
═══════════════════════════════════════════════════════════ */

function renderAdminShell(activePage, topbarTitle, topbarRight) {

  /* ── SIDEBAR ── */
  const sidebarMount = document.getElementById('sidebar-mount');
  if (sidebarMount) {
    const navItems = [
      { key:'titles',      href:'../admin/control.html',     icon:'ti-movie',     label:'All Titles',   section:'Library' },
      { key:'analytics',   href:'../admin/analytics.html',   icon:'ti-chart-bar', label:'Analytics' },
      { key:'top10',       href:'../admin/top10.html',       icon:'ti-star',      label:'Top 10' },
      { key:'genres',      href:'../admin/genre.html',       icon:'ti-tag',       label:'Genres',       section:'Settings' },
      { key:'users',       href:'../admin/users.html',       icon:'ti-users',     label:'Users' },
      { key:'preferences', href:'../admin/preferences.html', icon:'ti-settings',  label:'Preferences' },
    ];

    let itemsHtml = '';
    navItems.forEach(item => {
      if (item.section) {
        itemsHtml += `<div class="sidebar-section">${item.section}</div>`;
      }
      itemsHtml += `
        <a href="${item.href}" class="sidebar-item${activePage === item.key ? ' active' : ''}">
          <i class="ti ${item.icon}"></i> ${item.label}
        </a>`;
    });

    sidebarMount.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-logo">
          CINEMA<em>X</em>
          <small>Control Panel</small>
        </div>
        ${itemsHtml}
        <div class="sidebar-footer">
          <div style="margin-bottom:6px">
            <a href="../index.html"><i class="ti ti-arrow-left" style="font-size:0.8rem"></i> Back to Site</a>
          </div>
          CinemaX Admin v1.0
        </div>
      </aside>`;
  }

  /* ── TOPBAR ── */
  const topbarMount = document.getElementById('topbar-mount');
  if (topbarMount) {
    topbarMount.innerHTML = `
      <header class="topbar">
        <div class="topbar-title">${topbarTitle || 'Admin'}</div>
        <div class="topbar-right" id="topbar-right-slot">
          ${topbarRight || ''}
        </div>
      </header>`;
  }

  /* ── TOAST (shared) ── */
  if (!document.getElementById('toast')) {
    const t = document.createElement('div');
    t.innerHTML = `
      <div class="toast" id="toast">
        <i class="ti ti-check" id="toastIcon"></i>
        <span id="toastMsg"></span>
      </div>`;
    document.body.appendChild(t.firstElementChild);
  }
}

/* ── SHARED TOAST HELPER ── */
let _toastTimer;
function showToast(msg, type = 'success') {
  clearTimeout(_toastTimer);
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon= document.getElementById('toastIcon');
  if (!toast) return;
  toastMsg.textContent = msg;
  toast.className = `toast ${type}`;
  const icons = { success:'ti-check', error:'ti-alert-circle', info:'ti-info-circle', warning:'ti-alert-triangle' };
  toastIcon.className = `ti ${icons[type] || 'ti-check'}`;
  toast.classList.add('show');
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ── SHARED CONFIRM DIALOG ── */
function renderConfirmDialog(mountId = 'confirm-mount') {
  const el = document.getElementById(mountId);
  if (!el) return;
  el.innerHTML = `
    <div class="confirm-dialog" id="confirmDialog">
      <div class="confirm-box">
        <div class="confirm-icon"><i class="ti ti-trash"></i></div>
        <div class="confirm-title" id="confirmTitle">Are you sure?</div>
        <div class="confirm-msg" id="confirmMsg">This action cannot be undone.</div>
        <div class="confirm-actions">
          <button class="btn btn-ghost" id="confirmCancel">Cancel</button>
          <button class="btn btn-danger" id="confirmOk">
            <i class="ti ti-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>`;
}
