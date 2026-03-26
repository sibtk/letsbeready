/* ============================================
   LET'S BE READY — Donation Page Logic
   GoLively Integration + Impact Calculator
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- State ---
  let selectedAmount = 100;

  // --- GoLively config ---
  // Replace with your GoLively campaign URL once approved
  // Set to '' to show the placeholder instead of the iframe
  const GOLIVELY_CAMPAIGN_URL = '';

  // --- URL Parameter: Pre-select amount from ?amount=X ---
  const urlParams = new URLSearchParams(window.location.search);
  const presetAmount = parseInt(urlParams.get('amount'), 10);
  if (presetAmount > 0) {
    selectedAmount = presetAmount;
  }

  // --- DOM Elements ---
  const amountBtns = document.querySelectorAll('.amount-btn');
  const impactMessage = document.getElementById('impactMessage');
  const golivelyIframe = document.getElementById('golivelyEmbed');

  // --- Amount Selection ---
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const amount = parseInt(btn.dataset.amount, 10);
      if (amount > 0) {
        selectedAmount = amount;
      }

      updateImpact();
      updateGolivelyAmount();
    });
  });

  // --- Impact Calculator ---
  function updateImpact() {
    if (!impactMessage) return;

    const amount = selectedAmount;
    let message = '';

    if (amount >= 3800) {
      const classrooms = Math.floor(amount / 3800);
      message = `<strong>$${amount.toLocaleString()}</strong> funds <strong>${classrooms} full classroom${classrooms > 1 ? 's' : ''}</strong> for an entire year`;
    } else if (amount >= 300) {
      const children = Math.floor(amount / 300);
      message = `<strong>$${amount.toLocaleString()}</strong> educates <strong>${children} child${children > 1 ? 'ren' : ''}</strong> for a full year`;
    } else if (amount >= 100) {
      const children = Math.floor(amount / 33);
      message = `<strong>$${amount.toLocaleString()}</strong> provides educational materials for <strong>${children} children</strong> for a month`;
    } else if (amount >= 50) {
      message = `<strong>$${amount}</strong> supplies learning materials for <strong>1 classroom</strong>`;
    } else if (amount >= 25) {
      message = `<strong>$${amount}</strong> provides daily nutritional snacks for <strong>1 child</strong> for a month`;
    } else if (amount > 0) {
      message = `<strong>$${amount}</strong> helps provide essential supplies for students`;
    } else {
      message = 'Select an amount to see your impact';
    }

    impactMessage.innerHTML = message;
  }

  // --- Update GoLively iframe with selected amount ---
  function updateGolivelyAmount() {
    if (!golivelyIframe || !GOLIVELY_CAMPAIGN_URL) return;

    // Show iframe, hide placeholder
    const placeholder = document.getElementById('golivelyPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    golivelyIframe.style.display = 'block';

    const separator = GOLIVELY_CAMPAIGN_URL.includes('?') ? '&' : '?';
    golivelyIframe.src = `${GOLIVELY_CAMPAIGN_URL}${separator}amount=${selectedAmount}`;
  }

  // --- Live Donation Feed ---
  function addDonationToFeed(name, amount) {
    const feed = document.getElementById('donationFeed');
    if (!feed) return;

    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
    const displayName = name ? name.substring(0, 1).toUpperCase() + name.substring(1).split(' ')[0] + ' ' + (name.split(' ')[1] || '').substring(0, 1) + '.' : 'Anonymous';

    const newItem = document.createElement('div');
    newItem.className = 'donation-item';
    newItem.style.animation = 'fadeInUp 0.5s var(--ease-out)';
    newItem.innerHTML = `
      <div class="donation-item__avatar">${initials}</div>
      <div class="donation-item__info">
        <div class="donation-item__name">${displayName}</div>
        <div class="donation-item__time">Just now</div>
      </div>
      <div class="donation-item__amount">$${amount.toLocaleString()}</div>
    `;

    feed.insertBefore(newItem, feed.firstChild);

    if (feed.children.length > 6) {
      feed.removeChild(feed.lastChild);
    }
  }

  function updateTrackerAmount(newAmount) {
    const totalEl = document.getElementById('totalRaised');
    const donorCountEl = document.getElementById('donorCount');
    const progressFill = document.getElementById('progressFill');

    if (totalEl) {
      const current = parseInt(totalEl.textContent.replace(/,/g, ''), 10) || 0;
      const newTotal = current + newAmount;
      totalEl.textContent = newTotal.toLocaleString();

      if (progressFill) {
        const percentage = Math.min((newTotal / 75000) * 100, 100);
        progressFill.style.width = percentage + '%';
      }
    }

    if (donorCountEl) {
      const current = parseInt(donorCountEl.textContent, 10) || 0;
      donorCountEl.textContent = (current + 1).toString();
    }
  }

  // --- Sponsor a Classroom button ---
  const sponsorBtn = document.getElementById('sponsorClassroomBtn');
  if (sponsorBtn) {
    sponsorBtn.addEventListener('click', () => {
      selectedAmount = 3800;
      amountBtns.forEach(b => b.classList.remove('active'));
      updateImpact();
      updateGolivelyAmount();
    });
  }

  // --- Initialize ---

  // Pre-select amount button from URL parameter
  if (presetAmount > 0) {
    let matched = false;
    amountBtns.forEach(btn => {
      btn.classList.remove('active');
      if (parseInt(btn.dataset.amount, 10) === presetAmount) {
        btn.classList.add('active');
        matched = true;
      }
    });
    if (!matched && amountBtns.length > 0) {
      amountBtns[amountBtns.length - 1].classList.add('active');
    }
  }

  updateImpact();
  if (presetAmount > 0) {
    updateGolivelyAmount();
  }

});
