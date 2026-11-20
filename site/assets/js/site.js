/* =============================================================
   SITE CONFIG — edit these values, every page picks them up.
   ============================================================= */
const SITE = {
  // Derek's Fairway online application and document upload links.
  // Leave empty until confirmed; buttons fall back to the contact page.
  applyUrl: "https://fairway.tidalwave.ai/signup/derek.goulette/D7F9279EP7NEQ1C2BTKG",
  uploadUrl: "",
  // Where the site's forms POST (e.g. a CRM webhook). Leave empty to show
  // a "not connected yet" notice instead of pretending to send.
  formEndpoint: "",
  instagramUrl: "https://www.instagram.com/derekgoulette",
  nmlsUrl: "https://www.nmlsconsumeraccess.org/EntityDetails.aspx/INDIVIDUAL/325427",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=115+Fairchild+Street+Suite+310+Daniel+Island+SC+29492",
  phone: "949-280-8044",
  email: "derek.goulette@fairwaymc.com",
  exampleRate: 6.5
};

(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Config-driven links ---------- */
  // Until a URL is set, each link keeps the fallback href written in the HTML.
  $$("[data-link]").forEach((a) => {
    const k = a.dataset.link;
    const url = { apply: SITE.applyUrl, upload: SITE.uploadUrl, instagram: SITE.instagramUrl, nmls: SITE.nmlsUrl, maps: SITE.mapsUrl }[k];
    if (!url) return;
    a.href = url;
    if (/^https?:/.test(url)) { a.target = "_blank"; a.rel = "noopener"; }
  });
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Mobile nav ---------- */
  const btn = $(".menu-btn"), panel = $("#mobile-nav");
  if (btn && panel) {
    const set = (open) => {
      btn.setAttribute("aria-expanded", open);
      panel.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";
    };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    panel.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    addEventListener("resize", () => { if (innerWidth > 920) set(false); });
  }

  /* ---------- Hero scroll effect ---------- */
  const hero = $(".hero");
  if (hero && !reduce) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const h = hero.offsetHeight || 1;
      const sp = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / h));
      hero.style.setProperty("--sp", sp.toFixed(4));
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* ---------- Ticker: duplicate for a seamless loop ---------- */
  $$(".ticker-track").forEach((t) => (t.innerHTML += t.innerHTML));

  /* ---------- Gentle reveal (content is visible without JS) ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    const els = $$(".reveal").filter((el) => el.getBoundingClientRect().top > innerHeight);
    els.forEach((el) => el.classList.add("pre"));
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.remove("pre"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Payment calculator ---------- */
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const compact = (v) => (v >= 1e6 ? "$" + (v / 1e6).toFixed(1) + "M" : "$" + Math.round(v / 1e3) + "K");
  $$("[data-calc]").forEach((root) => {
    const q = (n) => root.querySelector('[data-c="' + n + '"]');
    const price = q("price"), down = q("down"), rate = q("rate");
    if (rate && !rate.dataset.set) rate.value = SITE.exampleRate;
    let term = 30;
    const fill = (inp) => inp.style.setProperty("--p", ((inp.value - inp.min) / (inp.max - inp.min)) * 100 + "%");
    function run() {
      const P = +price.value, D = +down.value, R = +rate.value;
      const loan = P * (1 - D / 100), r = R / 1200, n = term * 12;
      const pmt = r ? (loan * r) / (1 - Math.pow(1 + r, -n)) : loan / n;
      q("o-price").textContent = money(P);
      q("o-down").textContent = D + "% · " + money(P * D / 100);
      q("o-rate").textContent = R.toFixed(3).replace(/0$/, "") + "%";
      q("pmt").innerHTML = money(pmt) + "<small> /MO</small>";
      if (q("loan")) q("loan").textContent = money(loan);
      if (q("dp")) q("dp").textContent = money(P * D / 100);
      if (q("term")) q("term").textContent = term + " years";
      [price, down, rate].forEach(fill);
      const chart = q("chart");
      if (chart) drawChart(chart, P, loan, r, n, pmt, term);
    }
    [price, down, rate].forEach((i) => i.addEventListener("input", run));
    $$("[data-term]", root).forEach((b) => b.addEventListener("click", () => {
      term = +b.dataset.term;
      $$("[data-term]", root).forEach((x) => x.setAttribute("aria-pressed", x === b));
      run();
    }));
    run();
  });

  // Balance falls while home equity (price minus balance, no appreciation assumed) rises.
  function drawChart(el, price, loan, r, n, pmt, term) {
    const W = 520, H = 200, pl = 44, pb = 22, pt = 12, pr = 10;
    let bal = loan;
    const B = [[0, loan]], E = [[0, price - loan]];
    for (let m = 1; m <= n; m++) {
      bal = Math.max(0, bal - (pmt - bal * r));
      if (m % 12 === 0) { B.push([m / 12, bal]); E.push([m / 12, price - bal]); }
    }
    const top = price * 1.1;
    const x = (v) => pl + (v / term) * (W - pl - pr);
    const y = (v) => pt + (1 - v / top) * (H - pt - pb);
    const path = (a) => a.map((p, i) => (i ? "L" : "M") + x(p[0]).toFixed(1) + " " + y(p[1]).toFixed(1)).join(" ");
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => top * f);
    const xt = term === 30 ? [0, 5, 10, 15, 20, 25, 30] : [0, 3, 6, 9, 12, 15];
    const end = E[E.length - 1];
    const css = getComputedStyle(el), c = (v) => css.getPropertyValue(v).trim();
    const bal_c = c("--accent-2"), eq_c = c("--mist"), fg_c = c("--fg");
    el.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Loan balance falls to zero over ' + term + " years while your home equity grows to " + money(price) + '">' +
      ticks.map((v) => '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="rgb(' + c("--fg-rgb") + ' / .09)"/><text x="' + (pl - 8) + '" y="' + (y(v) + 3) + '" text-anchor="end">' + compact(v) + "</text>").join("") +
      xt.map((v) => '<text x="' + x(v) + '" y="' + (H - 4) + '" text-anchor="middle">' + (v ? v + "Y" : "") + "</text>").join("") +
      '<path d="' + path(B) + " L" + x(term) + " " + y(0) + " L" + x(0) + " " + y(0) + 'Z" fill="' + bal_c + '" fill-opacity=".14"/>' +
      '<path d="' + path(B) + '" fill="none" stroke="' + bal_c + '" stroke-width="2.5"/>' +
      '<path d="' + path(E) + '" fill="none" stroke="' + eq_c + '" stroke-width="2.5"/>' +
      '<circle cx="' + x(end[0]) + '" cy="' + y(end[1]) + '" r="4.5" fill="' + eq_c + '"/>' +
      '<text x="' + (x(end[0]) - 10) + '" y="' + (y(end[1]) - 10) + '" text-anchor="end" style="fill:' + fg_c + ';font-weight:700;font-size:11px">' + compact(end[1]) + " EQUITY</text></svg>";
  }

  /* ---------- Forms ---------- */
  $$("form[data-form]").forEach((form) => {
    const status = $(".form-status", form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form));
      data.form = form.dataset.form;
      data.page = location.pathname;
      const say = (msg) => { status.hidden = false; status.textContent = msg; };
      if (!SITE.formEndpoint) {
        say("This form isn't connected yet. Please call " + SITE.phone + " or email " + SITE.email + " and Derek's team will help right away.");
        return;
      }
      const sendBtn = $("button[type=submit]", form);
      sendBtn.disabled = true;
      try {
        const res = await fetch(SITE.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        say("Thanks, we have it. Derek's team will reach out within one business day.");
      } catch (err) {
        say("That didn't go through. Please try again, or call " + SITE.phone + ".");
      } finally {
        sendBtn.disabled = false;
      }
    });
  });

  /* ---------- Copy buttons ---------- */
  $$("[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const label = b.textContent;
    const done = () => { b.textContent = "Copied"; setTimeout(() => (b.textContent = label), 1600); };
    const select = () => {
      const t = document.getElementById(b.dataset.target);
      if (!t) return;
      const rg = document.createRange(); rg.selectNodeContents(t);
      const s = getSelection(); s.removeAllRanges(); s.addRange(rg);
    };
    try { navigator.clipboard.writeText(b.dataset.copy).then(done, select); } catch (e) { select(); }
  }));
})();
