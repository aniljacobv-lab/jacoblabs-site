/* ============================================================
   Jacob Labs — shared behavior
   ============================================================ */
(function () {
  "use strict";

  /* --- year stamp --- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* --- theme toggle (persisted) --- */
  var root = document.documentElement;
  var saved;
  try { saved = localStorage.getItem("jl-theme"); } catch (e) {}
  if (saved === "light" || saved === "dark") {
    root.setAttribute("data-theme", saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    root.setAttribute("data-theme", "light");
  }
  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("jl-theme", next); } catch (e) {}
    });
  }

  /* --- scroll progress bar --- */
  var bar = document.getElementById("progress");
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* --- scroll reveal --- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 6) * 70 + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* --- contact form ---
     If FORMSPREE_ENDPOINT is set, submits via AJAX (no page reload).
     Otherwise falls back to opening the user's email client (mailto). */
  var FORMSPREE_ENDPOINT = ""; // e.g. "https://formspree.io/f/abcdwxyz"
  var CONTACT_EMAIL = "aniljacobv@gmail.com";

  var form = document.getElementById("contactForm");
  if (form) {
    var msg = document.getElementById("formMsg");
    var setMsg = function (text, kind) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = "form-msg " + kind;
    };
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = {
        name: (form.elements.name && form.elements.name.value || "").trim(),
        email: (form.elements.email && form.elements.email.value || "").trim(),
        message: (form.elements.message && form.elements.message.value || "").trim()
      };
      if (!data.name || !data.email || !data.message) {
        setMsg("Please fill in every field.", "err");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        setMsg("That email address looks off.", "err");
        return;
      }

      if (FORMSPREE_ENDPOINT) {
        setMsg("Sending…", "ok");
        fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (r.ok) {
            form.reset();
            setMsg("Thanks — message received. We'll be in touch.", "ok");
          } else {
            setMsg("Something went wrong. Email " + CONTACT_EMAIL + " directly.", "err");
          }
        }).catch(function () {
          setMsg("Network error. Email " + CONTACT_EMAIL + " directly.", "err");
        });
      } else {
        var subject = encodeURIComponent("Jacob Labs — message from " + data.name);
        var body = encodeURIComponent(data.message + "\n\n— " + data.name + " (" + data.email + ")");
        window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
        setMsg("Opening your email app…", "ok");
      }
    });
  }
})();
