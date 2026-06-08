const CATS = {
  "Food & Dining": { emoji: "🍔", color: "#e74c3c" },
  "Housing":       { emoji: "🏠", color: "#8e44ad" },
  "Transport":     { emoji: "🚗", color: "#e67e22" },
  "Shopping":      { emoji: "🛍️", color: "#e91e8c" },
  "Entertainment": { emoji: "🎬", color: "#3498db" },
  "Health":        { emoji: "💊", color: "#27ae60" },
  "Education":     { emoji: "📚", color: "#16a085" },
  "Other":         { emoji: "📦", color: "#95a5a6" },
};

// ── DATA (localStorage) ──
function loadData() {
  return JSON.parse(localStorage.getItem("spendly_expenses") || "[]");
}
function saveData(arr) {
  localStorage.setItem("spendly_expenses", JSON.stringify(arr));
}
function loadBudgets() {
  return JSON.parse(localStorage.getItem("spendly_budgets") || "{}");
}
function saveBudgets(obj) {
  localStorage.setItem("spendly_budgets", JSON.stringify(obj));
}
function loadUsers() {
  const def = [{ email: "demo@spendly.app", password: "demo1234", name: "Demo User" }];
  return JSON.parse(localStorage.getItem("spendly_users") || JSON.stringify(def));
}
function saveUsers(arr) {
  localStorage.setItem("spendly_users", JSON.stringify(arr));
}

let currentUser = null;

const fmt = n => "$" + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const myExp = () => loadData().filter(e => e.user === currentUser.email);
const allExp = () => loadData();

function saveMyExp(arr) {
  const others = loadData().filter(e => e.user !== currentUser.email);
  saveData([...others, ...arr.map(e => ({ ...e, user: currentUser.email }))]);
}

// ── AUTH ──
function switchTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
  document.getElementById("tab-" + tab).classList.add("active");
  document.getElementById("form-" + tab).style.display = "block";
}

function doLogin() {
  const email = document.getElementById("l-email").value.trim().toLowerCase();
  const pass  = document.getElementById("l-pass").value;
  const users = loadUsers();
  const u = users.find(u => u.email === email && u.password === pass);
  if (!u) { document.getElementById("l-err").textContent = "Wrong email or password."; return; }
  currentUser = u;

  // seed demo data if empty
  if (email === "demo@spendly.app" && myExp().length === 0) {
    saveMyExp([
      { id: 1,  desc: "Monthly Rent",  amt: 1850,  date: "2026-05-01", cat: "Housing" },
      { id: 2,  desc: "Netflix",       amt: 15.49, date: "2026-05-03", cat: "Entertainment" },
      { id: 3,  desc: "Groceries",     amt: 87.30, date: "2026-05-07", cat: "Food & Dining" },
      { id: 4,  desc: "Uber Ride",     amt: 22.50, date: "2026-05-10", cat: "Transport" },
      { id: 5,  desc: "Pharmacy",      amt: 44.75, date: "2026-05-12", cat: "Health" },
      { id: 6,  desc: "New Shoes",     amt: 89.99, date: "2026-05-15", cat: "Shopping" },
      { id: 7,  desc: "Dinner Out",    amt: 65.20, date: "2026-05-18", cat: "Food & Dining" },
      { id: 8,  desc: "Movie Tickets", amt: 32.00, date: "2026-05-20", cat: "Entertainment" },
      { id: 9,  desc: "Gas",           amt: 55.00, date: "2026-05-22", cat: "Transport" },
      { id: 10, desc: "Online Course", amt: 49.99, date: "2026-05-25", cat: "Education" },
    ]);
  }
  startApp();
}

function doRegister() {
  const name  = document.getElementById("r-name").value.trim();
  const email = document.getElementById("r-email").value.trim().toLowerCase();
  const pass  = document.getElementById("r-pass").value;
  if (!name || !email || !pass) { document.getElementById("r-err").textContent = "All fields required."; return; }
  if (pass.length < 6)          { document.getElementById("r-err").textContent = "Password min 6 chars."; return; }
  const users = loadUsers();
  if (users.find(u => u.email === email)) { document.getElementById("r-err").textContent = "Email already used."; return; }
  users.push({ email, password: pass, name });
  saveUsers(users);
  currentUser = { email, name };
  startApp();
}

function startApp() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("username").textContent = currentUser.name;
  goTo("dashboard");
}

function doLogout() {
  currentUser = null;
  document.getElementById("auth").style.display = "flex";
  document.getElementById("app").style.display = "none";
}

// ── NAVIGATION ──
function goTo(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  document.getElementById("nav-" + page).classList.add("active");
  if (page === "dashboard")  renderDashboard();
  if (page === "expenses")   renderExpenses();
  if (page === "add")        document.getElementById("add-date").value = new Date().toISOString().split("T")[0];
  if (page === "categories") renderCategories();
  if (page === "budget")     renderBudget();
}

// ── DASHBOARD ──
function renderDashboard() {
  const exps = myExp();
  const now = new Date();
  const m = now.getMonth(), y = now.getFullYear();

  const monthExps = exps.filter(e => {
    const d = new Date(e.date + "T00:00:00");
    return d.getMonth() === m && d.getFullYear() === y;
  });
  const monthTotal = monthExps.reduce((s, e) => s + e.amt, 0);
  const yearTotal  = exps.filter(e => new Date(e.date + "T00:00:00").getFullYear() === y).reduce((s,e) => s + e.amt, 0);
  const allTotal   = exps.reduce((s, e) => s + e.amt, 0);

  document.getElementById("stat-month").textContent = fmt(monthTotal);
  document.getElementById("stat-year").textContent  = fmt(yearTotal);
  document.getElementById("stat-all").textContent   = fmt(allTotal);

  // Budget alert
  const budgets = loadBudgets();
  const overall = parseFloat(budgets["overall"] || 0);
  const alertBox = document.getElementById("budget-alert");
  if (overall > 0) {
    const pct = (monthTotal / overall) * 100;
    if (pct >= 100) {
      alertBox.style.display = "block";
      alertBox.className = "budget-alert over";
      alertBox.textContent = `🚨 Over budget! You spent ${fmt(monthTotal)} of your ${fmt(overall)} monthly budget.`;
    } else if (pct >= 80) {
      alertBox.style.display = "block";
      alertBox.className = "budget-alert";
      alertBox.textContent = `⚠️ Warning! You've used ${Math.round(pct)}% of your ${fmt(overall)} monthly budget.`;
    } else {
      alertBox.style.display = "none";
    }
  } else {
    alertBox.style.display = "none";
  }

  // Chart
  const totals = {};
  exps.forEach(e => totals[e.cat] = (totals[e.cat] || 0) + e.amt);
  const entries = Object.entries(totals);
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (entries.length) {
    const total = entries.reduce((s, [, v]) => s + v, 0);
    let angle = -Math.PI / 2;
    entries.forEach(([cat, val]) => {
      const slice = (val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.arc(100, 100, 80, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = CATS[cat]?.color || "#ccc";
      ctx.fill();
      angle += slice;
    });
    ctx.beginPath();
    ctx.arc(100, 100, 50, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }

  document.getElementById("legend").innerHTML = entries.length
    ? entries.map(([cat, val]) => `
        <div class="legend-row">
          <div><span class="dot" style="background:${CATS[cat]?.color}"></span>${CATS[cat]?.emoji} ${cat}</div>
          <strong>${fmt(val)}</strong>
        </div>`).join("")
    : "<span style='color:#aaa;font-size:13px'>No data yet.</span>";

  // Recent
  const recent = [...exps].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  document.getElementById("recent").innerHTML = recent.length
    ? recent.map(e => `
        <div class="expense-item">
          <span class="exp-emoji">${CATS[e.cat]?.emoji}</span>
          <div class="exp-info"><strong>${e.desc}</strong><span>${fmtDate(e.date)}</span></div>
          <span class="exp-amt">-${fmt(e.amt)}</span>
        </div>`).join("")
    : "<div class='empty'>No transactions yet.</div>";
}

// ── EXPENSES ──
function renderExpenses() {
  const search = document.getElementById("search").value.toLowerCase();
  const catF   = document.getElementById("cat-filter").value;
  const sort   = document.getElementById("sort-filter").value;

  let exps = myExp().filter(e =>
    (e.desc.toLowerCase().includes(search) || e.cat.toLowerCase().includes(search)) &&
    (!catF || e.cat === catF)
  );

  if (sort === "date-desc") exps.sort((a, b) => new Date(b.date) - new Date(a.date));
  else if (sort === "date-asc")  exps.sort((a, b) => new Date(a.date) - new Date(b.date));
  else if (sort === "amt-desc")  exps.sort((a, b) => b.amt - a.amt);
  else exps.sort((a, b) => a.amt - b.amt);

  document.getElementById("exp-list").innerHTML = exps.length
    ? exps.map(e => `
        <div class="expense-item">
          <span class="exp-emoji">${CATS[e.cat]?.emoji}</span>
          <div class="exp-info"><strong>${e.desc}</strong><span>${e.cat} · ${fmtDate(e.date)}</span></div>
          <span class="exp-amt">-${fmt(e.amt)}</span>
          <button class="icon-btn" onclick="openEdit(${e.id})">✏️</button>
          <button class="icon-btn" onclick="delExp(${e.id})">🗑️</button>
        </div>`).join("")
    : "<div class='empty'>No expenses found.</div>";
}

function delExp(id) {
  if (!confirm("Delete this expense?")) return;
  saveMyExp(myExp().filter(e => e.id !== id));
  renderExpenses();
}

// ── ADD ──
function addExpense() {
  const desc = document.getElementById("add-desc").value.trim();
  const amt  = parseFloat(document.getElementById("add-amt").value);
  const date = document.getElementById("add-date").value;
  const cat  = document.getElementById("add-cat").value;
  const msg  = document.getElementById("add-msg");

  if (!desc || isNaN(amt) || amt <= 0 || !date) {
    msg.textContent = "Please fill in all fields.";
    msg.style.color = "#c0392b";
    return;
  }
  saveMyExp([...myExp(), { id: Date.now(), desc, amt, date, cat }]);
  document.getElementById("add-desc").value = "";
  document.getElementById("add-amt").value  = "";
  document.getElementById("add-note").value = "";
  msg.textContent = "✓ Expense saved!";
  msg.style.color = "#1e6b47";
  setTimeout(() => msg.textContent = "", 2500);
}

// ── EDIT ──
function openEdit(id) {
  const e = myExp().find(x => x.id === id);
  if (!e) return;
  document.getElementById("edit-id").value   = id;
  document.getElementById("edit-desc").value = e.desc;
  document.getElementById("edit-amt").value  = e.amt;
  document.getElementById("edit-date").value = e.date;
  document.getElementById("edit-cat").value  = e.cat;
  document.getElementById("modal").classList.add("open");
}

function saveEdit() {
  const id   = parseInt(document.getElementById("edit-id").value);
  const desc = document.getElementById("edit-desc").value.trim();
  const amt  = parseFloat(document.getElementById("edit-amt").value);
  const date = document.getElementById("edit-date").value;
  const cat  = document.getElementById("edit-cat").value;
  saveMyExp(myExp().map(e => e.id === id ? { ...e, desc, amt, date, cat } : e));
  document.getElementById("modal").classList.remove("open");
  renderExpenses();
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

// ── CATEGORIES ──
function renderCategories() {
  const exps = myExp();
  document.getElementById("cat-grid").innerHTML = Object.entries(CATS).map(([name, info]) => {
    const items = exps.filter(e => e.cat === name);
    const total = items.reduce((s, e) => s + e.amt, 0);
    return `<div class="cat-card">
      <div class="emoji">${info.emoji}</div>
      <div class="name">${name}</div>
      <div class="total">${fmt(total)}</div>
      <div class="count">${items.length} transaction${items.length !== 1 ? "s" : ""}</div>
    </div>`;
  }).join("");
}

// ── BUDGET ──
function renderBudget() {
  const exps = myExp();
  const budgets = loadBudgets();
  const now = new Date();
  const m = now.getMonth(), y = now.getFullYear();

  const monthTotal = exps
    .filter(e => { const d = new Date(e.date + "T00:00:00"); return d.getMonth() === m && d.getFullYear() === y; })
    .reduce((s, e) => s + e.amt, 0);

  // Overall budget card
  const overall = parseFloat(budgets["overall"] || 0);
  const overallPct = overall > 0 ? Math.min((monthTotal / overall) * 100, 100) : 0;
  const overallColor = overallPct >= 100 ? "#c0392b" : overallPct >= 80 ? "#e67e22" : "#1e6b47";

  document.getElementById("overall-budget-display").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <strong style="font-size:15px">Monthly Overall Budget</strong>
      <span style="font-family:monospace;font-weight:700;color:${overallColor}">${fmt(monthTotal)} / ${overall > 0 ? fmt(overall) : "Not set"}</span>
    </div>
    ${overall > 0 ? `
    <div class="budget-bar-bg">
      <div class="budget-bar" style="width:${overallPct}%;background:${overallColor}"></div>
    </div>
    <div class="budget-label"><span>${Math.round(overallPct)}% used</span><span>${fmt(Math.max(overall - monthTotal, 0))} left</span></div>
    ` : "<div style='color:#aaa;font-size:13px'>Set a budget below to track spending.</div>"}
  `;

  // Per category
  document.getElementById("budget-grid").innerHTML = Object.entries(CATS).map(([name, info]) => {
    const spent = exps
      .filter(e => { const d = new Date(e.date + "T00:00:00"); return e.cat === name && d.getMonth() === m && d.getFullYear() === y; })
      .reduce((s, e) => s + e.amt, 0);
    const limit = parseFloat(budgets[name] || 0);
    const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    const color = pct >= 100 ? "#c0392b" : pct >= 80 ? "#e67e22" : "#1e6b47";

    return `<div class="budget-item">
      <h4>${info.emoji} ${name}</h4>
      <input type="number" id="budget-${name.replace(/\s|&/g,'_')}" placeholder="Set limit ($)" value="${budgets[name] || ""}" min="0" step="1"/>
      <button class="save-budget" onclick="saveCatBudget('${name}')">Save</button>
      ${limit > 0 ? `
        <div class="budget-bar-wrap" style="margin-top:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:4px">
            <span>${fmt(spent)} spent</span><span>${fmt(limit)} limit</span>
          </div>
          <div class="budget-bar-bg">
            <div class="budget-bar" style="width:${pct}%;background:${color}"></div>
          </div>
          <div class="budget-label"><span>${Math.round(pct)}% used</span><span style="color:${color}">${pct >= 100 ? "Over budget!" : fmt(limit - spent) + " left"}</span></div>
        </div>` : ""}
    </div>`;
  }).join("");
}

function saveOverallBudget() {
  const val = document.getElementById("overall-input").value;
  const budgets = loadBudgets();
  budgets["overall"] = parseFloat(val) || 0;
  saveBudgets(budgets);
  document.getElementById("overall-input").value = "";
  renderBudget();
}

function saveCatBudget(name) {
  const key = name.replace(/\s|&/g, '_');
  const val = document.getElementById("budget-" + key).value;
  const budgets = loadBudgets();
  budgets[name] = parseFloat(val) || 0;
  saveBudgets(budgets);
  renderBudget();
}

// ── CSV EXPORT ──
function exportCSV() {
  const exps = myExp();
  if (!exps.length) { alert("No expenses to export."); return; }
  const rows = [["Description", "Category", "Amount", "Date"]];
  exps.forEach(e => rows.push([e.desc, e.cat, e.amt, e.date]));
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "expenses.csv";
  a.click();
}

// ── CLEAR ALL DATA ──
function clearAllData() {
  if (!confirm("Are you sure? This will delete ALL your expenses. This cannot be undone.")) return;
  saveMyExp([]);
  alert("All data cleared.");
  goTo("dashboard");
}