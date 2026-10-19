(() => {
  const install = document.querySelector('#install-app');
  const help = document.querySelector('#install-help');
  const status = document.querySelector('#offline-status');
  const standalone = window.matchMedia('(display-mode: standalone)');
  let promptEvent = null;
  let ready = false;
  const installed = () => standalone.matches || window.navigator.standalone === true;
  function renderInstall() {
    install.hidden = installed() || !promptEvent;
    help.textContent = installed()
      ? 'Installed. Open Weight n Waist from your home screen or app launcher.'
      : promptEvent
        ? 'Install for a dedicated app window and quick access from your home screen.'
        : 'On iPhone or iPad, open in Safari and choose Share → Add to Home Screen. In other supported browsers, choose Install app from the browser menu.';
  }
  function renderStatus() {
    status.textContent = ready
      ? navigator.onLine ? 'Ready for offline check-ins on this device.' : 'You’re offline. Check-ins still save on this device.'
      : navigator.onLine ? 'Preparing offline access…' : 'Connect once to prepare offline access.';
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    promptEvent = event;
    renderInstall();
  });
  window.addEventListener('appinstalled', () => {
    promptEvent = null;
    install.hidden = true;
    help.textContent = 'Installed. Open Weight n Waist from your home screen or app launcher.';
  });
  standalone.addEventListener('change', renderInstall);
  install.addEventListener('click', async () => {
    if (!promptEvent) return;
    install.disabled = true;
    const pending = promptEvent;
    promptEvent = null;
    try { await pending.prompt(); await pending.userChoice; }
    catch { /* Browser menu instructions remain available if the prompt fails. */ }
    finally { install.disabled = false; renderInstall(); }
  });
  window.addEventListener('online', renderStatus);
  window.addEventListener('offline', renderStatus);
  renderInstall();
  renderStatus();
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(registration => {
      const updateHint = () => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          document.querySelector('#update-help').hidden = false;
        }
      };
      updateHint();
      registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', updateHint);
      });
      navigator.serviceWorker.ready.then(() => { ready = true; renderStatus(); });
    }).catch(() => { status.textContent = 'Offline access could not be prepared. Reopen online to try again.'; });
  } else {
    status.textContent = 'Offline access needs a supported browser and HTTPS (or localhost).';
  }
})();
