const recordsBody = document.getElementById('recordsBody');
const today = new Date();
const todayISO = toISODate(today);

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function parseDate(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function daysBetween(from, to) {
  const start = parseDate(from), end = parseDate(to);
  if (!start || !end || end < start) return 0;
  return Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
    Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000);
}
function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);
}
function addRow(data = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input class="cell-input" type="date" data-field="from" aria-label="From date"></td>
    <td><input class="cell-input name" type="text" data-field="name" placeholder="Name" aria-label="Name"></td>
    <td><input class="cell-input number" type="number" min="0" step="0.01" data-field="principal" placeholder="0.00" aria-label="Principal amount"></td>
    <td><div class="input-group input-group-sm"><input class="cell-input rate" type="number" min="0" step="0.01" data-field="rate" aria-label="Per day interest"><span class="input-group-text">%</span></div></td>
    <td><input class="cell-input" type="date" data-field="to" aria-label="To date"></td>
    <td class="calculated days" data-output="days">0</td>
    <td class="calculated" data-output="daily">₹0.00</td>
    <td class="calculated" data-output="interest">₹0.00</td>
    <td class="calculated" data-output="amount">₹0.00</td>
    <td><button class="remove-btn" type="button" title="Delete entry" aria-label="Delete entry">✕</button></td>`;
  for (const [field, value] of Object.entries(data)) {
    const input = tr.querySelector(`[data-field="${field}"]`);
    if (input) input.value = value;
  }
  recordsBody.appendChild(tr);
  tr.addEventListener('input', recalculate);
  tr.querySelector('.remove-btn').addEventListener('click', () => {
    tr.remove();
    recalculate();
  });
  recalculate();
}
function recalculate() {
  let principalTotal = 0, interestTotal = 0, amountTotal = 0, count = 0;
  recordsBody.querySelectorAll('tr').forEach(tr => {
    count++;
    const value = field => tr.querySelector(`[data-field="${field}"]`).value;
    const principal = Math.max(0, Number(value('principal')) || 0);
    const rate = Math.max(0, Number(value('rate')) || 0);
    const days = daysBetween(value('from'), value('to'));
    const daily = principal * rate / 100;
    const interest = daily * days;
    const amount = principal + interest;

    tr.querySelector('[data-output="days"]').textContent = days;
    tr.querySelector('[data-output="daily"]').textContent = money(daily);
    tr.querySelector('[data-output="interest"]').textContent = money(interest);
    tr.querySelector('[data-output="amount"]').textContent = money(amount);

    principalTotal += principal;
    interestTotal += interest;
    amountTotal += amount;
  });
  document.getElementById('summaryPrincipal').textContent = money(principalTotal);
  document.getElementById('summaryInterest').textContent = money(interestTotal);
  document.getElementById('summaryAmount').textContent = money(amountTotal);
  document.getElementById('footerPrincipal').textContent = money(principalTotal);
  document.getElementById('footerInterest').textContent = money(interestTotal);
  document.getElementById('footerAmount').textContent = money(amountTotal);
  document.getElementById('recordCount').textContent = `${count} ${count === 1 ? 'record' : 'records'}`;
  document.getElementById('emptyState').classList.toggle('d-none', count !== 0);
}
// Sample rows matching the provided screenshot. To Date automatically uses today's date on page load.
addRow({ from: '2026-11-02', name: 'KESHAV', principal: 2500, rate: 20, to: todayISO });
addRow({ from: '2026-11-07', name: 'KESHAV', principal: 2400, rate: 20, to: todayISO });


// Keep the calculator hidden until GPS location is successfully obtained.
document.addEventListener('DOMContentLoaded', () => {
  const popupElement = document.getElementById('showDataModal');
  const popup = new bootstrap.Modal(popupElement, {
    backdrop: 'static',
    keyboard: false
  });
  window.locationGatePopup = popup;
  popup.show();
});
