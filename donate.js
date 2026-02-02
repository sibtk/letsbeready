/* ============================================
   LET'S BE READY — Donation Page Logic
   Stripe Integration + Tracker + Impact Calculator
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- State ---
  let selectedAmount = 100;
  let selectedFrequency = 'one-time';
  let coverFees = false;

  // --- URL Parameter: Pre-select amount from ?amount=X ---
  const urlParams = new URLSearchParams(window.location.search);
  const presetAmount = parseInt(urlParams.get('amount'), 10);
  if (presetAmount > 0) {
    selectedAmount = presetAmount;
  }

  // --- DOM Elements ---
  const amountBtns = document.querySelectorAll('.amount-btn');
  const frequencyBtns = document.querySelectorAll('.frequency-btn');
  const customAmountWrap = document.getElementById('customAmountWrap');
  const customAmountInput = document.getElementById('customAmount');
  const impactMessage = document.getElementById('impactMessage');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const coverFeesCheckbox = document.getElementById('coverFees');

  // --- Amount Selection ---
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const amount = btn.dataset.amount;

      if (amount === 'custom') {
        customAmountWrap.classList.add('visible');
        customAmountInput.focus();
        if (customAmountInput.value) {
          selectedAmount = parseInt(customAmountInput.value, 10) || 0;
        }
      } else {
        customAmountWrap.classList.remove('visible');
        selectedAmount = parseInt(amount, 10);
      }

      updateImpact();
      updateSubmitButton();
    });
  });

  // Custom amount input
  if (customAmountInput) {
    customAmountInput.addEventListener('input', () => {
      selectedAmount = parseInt(customAmountInput.value, 10) || 0;
      updateImpact();
      updateSubmitButton();
    });
  }

  // --- Frequency Toggle ---
  frequencyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      frequencyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFrequency = btn.dataset.frequency;
      updateSubmitButton();
    });
  });

  // --- Cover Fees ---
  if (coverFeesCheckbox) {
    coverFeesCheckbox.addEventListener('change', () => {
      coverFees = coverFeesCheckbox.checked;
      updateSubmitButton();
    });
  }

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
      message = 'Enter an amount to see your impact';
    }

    impactMessage.innerHTML = message;
  }

  function updateSubmitButton() {
    if (!submitText) return;

    let total = selectedAmount;
    if (coverFees && total > 0) {
      total = Math.ceil(total / (1 - 0.022)); // Add fee coverage
    }

    const frequency = selectedFrequency === 'monthly' ? '/month' : '';
    submitText.textContent = total > 0 ? `Donate $${total.toLocaleString()}${frequency}` : 'Donate';
  }

  // --- Stripe Integration ---
  // NOTE: Replace 'pk_test_...' with your actual Stripe publishable key
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_REPLACE_WITH_YOUR_KEY';

  let stripe, cardElement;

  function initStripe() {
    try {
      stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
      const elements = stripe.elements({
        fonts: [
          { cssSrc: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap' }
        ]
      });

      cardElement = elements.create('card', {
        style: {
          base: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '16px',
            color: '#1E173C',
            '::placeholder': { color: '#6B6490' },
          },
          invalid: {
            color: '#e53e3e',
          },
        },
      });

      const cardMount = document.getElementById('card-element');
      if (cardMount) {
        cardElement.mount('#card-element');

        cardElement.on('change', (event) => {
          const errorEl = document.getElementById('card-errors');
          if (errorEl) {
            errorEl.textContent = event.error ? event.error.message : '';
          }
        });
      }
    } catch (e) {
      // Stripe not loaded or key invalid — form will still render
      console.info('Stripe not initialized. Replace STRIPE_PUBLISHABLE_KEY with your key.');
    }
  }

  initStripe();

  // --- Form Submission ---
  if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const firstName = document.getElementById('firstName')?.value?.trim();
      const lastName = document.getElementById('lastName')?.value?.trim();
      const email = document.getElementById('email')?.value?.trim();

      // Validation
      if (!firstName || !lastName || !email) {
        alert('Please fill in all required fields.');
        return;
      }

      if (selectedAmount <= 0) {
        alert('Please select a donation amount.');
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitText.textContent = 'Processing...';
      const spinner = document.getElementById('submitSpinner');
      if (spinner) spinner.style.display = 'block';

      let total = selectedAmount;
      if (coverFees) {
        total = Math.ceil(total / (1 - 0.022));
      }

      try {
        // In production, this would call your server endpoint:
        //
        // const response = await fetch('/api/create-payment-intent', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     amount: total * 100, // Stripe uses cents
        //     currency: 'usd',
        //     frequency: selectedFrequency,
        //     donor: { firstName, lastName, email },
        //     metadata: {
        //       coverFees: coverFees,
        //       originalAmount: selectedAmount,
        //     }
        //   }),
        // });
        //
        // const { clientSecret } = await response.json();
        //
        // const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        //   payment_method: {
        //     card: cardElement,
        //     billing_details: {
        //       name: `${firstName} ${lastName}`,
        //       email: email,
        //     },
        //   },
        // });
        //
        // if (error) throw error;
        // if (paymentIntent.status === 'succeeded') { showSuccess(); }

        // --- Demo mode: simulate success ---
        await new Promise(resolve => setTimeout(resolve, 2000));
        showSuccess(firstName, total);

      } catch (error) {
        const errorEl = document.getElementById('card-errors');
        if (errorEl) {
          errorEl.textContent = error.message || 'Payment failed. Please try again.';
        }
        submitBtn.disabled = false;
        updateSubmitButton();
        if (spinner) spinner.style.display = 'none';
      }
    });
  }

  function showSuccess(name, amount) {
    const params = new URLSearchParams({
      name: name || 'Friend',
      amount: amount || 0,
      frequency: selectedFrequency
    });
    window.location.href = `thank-you.html?${params.toString()}`;
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

    // Remove last item if more than 6
    if (feed.children.length > 6) {
      feed.removeChild(feed.lastChild);
    }
  }

  function updateTrackerAmount(newAmount) {
    const totalEl = document.getElementById('totalRaised');
    const donorCountEl = document.getElementById('donorCount');
    const childrenEl = document.getElementById('childrenFunded');
    const progressFill = document.getElementById('progressFill');

    if (totalEl) {
      const current = parseInt(totalEl.textContent.replace(/,/g, ''), 10) || 0;
      const newTotal = current + newAmount;
      totalEl.textContent = newTotal.toLocaleString();

      // Update progress bar
      if (progressFill) {
        const percentage = Math.min((newTotal / 75000) * 100, 100);
        progressFill.style.width = percentage + '%';
      }
    }

    if (donorCountEl) {
      const current = parseInt(donorCountEl.textContent, 10) || 0;
      donorCountEl.textContent = (current + 1).toString();
    }

    if (childrenEl) {
      const newChildren = Math.floor(newAmount / 300);
      if (newChildren > 0) {
        const current = parseInt(childrenEl.textContent, 10) || 0;
        childrenEl.textContent = (current + newChildren).toString();
      }
    }
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
    if (!matched) {
      // Show custom amount input with the preset value
      const customBtn = document.querySelector('[data-amount="custom"]');
      if (customBtn) {
        amountBtns.forEach(b => b.classList.remove('active'));
        customBtn.classList.add('active');
        customAmountWrap.classList.add('visible');
        if (customAmountInput) customAmountInput.value = presetAmount;
      }
    }
  }

  updateImpact();
  updateSubmitButton();

});
