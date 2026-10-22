document.addEventListener("DOMContentLoaded", function () {
  // If the phone cover photo is missing, fall back to the laptop cover photo
  var coverImg = document.querySelector(".cover-media");
  if (coverImg) {
    var useLaptopCover = function () {
      var pic = coverImg.parentNode;
      if (pic && pic.tagName === "PICTURE") {
        pic.querySelectorAll("source").forEach(function (s) { s.remove(); });
      }
      if (coverImg.getAttribute("src") !== "images/cover.jpg" || coverImg.naturalWidth === 0) {
        coverImg.removeEventListener("error", useLaptopCover);
        coverImg.src = "images/cover.jpg?fallback";
      }
    };
    coverImg.addEventListener("error", useLaptopCover);
    if (coverImg.complete && coverImg.naturalWidth === 0 && /cover-mobile/.test(coverImg.currentSrc || "")) useLaptopCover();
  }

  var coverCta = document.getElementById("coverCta");
  if (coverCta) {
    coverCta.addEventListener("click", function (e) {
      e.preventDefault();
      document.body.classList.add("entered");
    });
  }

  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.textContent = isOpen ? "close" : "menu";
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "menu";
      });
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Full-screen photo viewer. `photos` is a list of { src, alt }; returns open(index).
  function makeLightbox(photos) {
    // Build one lightbox for this gallery, appended to the body.
    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML =
      '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<img class="lightbox-image" src="" alt="">' +
      '<span class="lightbox-counter"></span>';
    document.body.appendChild(lightbox);

    var lbImg = lightbox.querySelector(".lightbox-image");
    var lbCounter = lightbox.querySelector(".lightbox-counter");
    var lbClose = lightbox.querySelector(".lightbox-close");
    var idx = 0;

    var items = photos;

    function show(i) {
      idx = (i + items.length) % items.length;
      lbImg.src = items[idx].src;
      lbImg.alt = items[idx].alt || "";
      lbCounter.textContent = (idx + 1) + " / " + items.length;
    }

    function open(i) {
      show(i);
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    lbClose.addEventListener("click", close);

    // Click the backdrop (outside the image) to close.
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });

    // Click the left/right half of the image to go prev/next (no visible arrows).
    lbImg.addEventListener("click", function (e) {
      var rect = lbImg.getBoundingClientRect();
      var clickedLeft = (e.clientX - rect.left) < rect.width / 2;
      if (items.length > 1) show(clickedLeft ? idx - 1 : idx + 1);
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });

    var startX = null;
    lightbox.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40 && items.length > 1) { show(dx > 0 ? idx - 1 : idx + 1); }
      startX = null;
    });

    return open;
  }

  // Photo grids: click any photo to open it full screen.
  document.querySelectorAll(".masonry").forEach(function (gallery) {
    var links = Array.prototype.slice.call(gallery.querySelectorAll(".masonry-item"))
      .filter(function (el) { return el.tagName === "A" && el.querySelector("img"); });
    if (!links.length) return;
    var open = makeLightbox(links.map(function (a) {
      var img = a.querySelector("img");
      return { src: a.getAttribute("href") || img.src, alt: img.alt };
    }));
    links.forEach(function (a, i) {
      a.addEventListener("click", function (e) { e.preventDefault(); open(i); });
    });
  });

  // Contact email: on phones, tapping copies the address (laptops keep the Gmail draft link)
  var emailLink = document.getElementById("contactEmail");
  var copiedNote = document.getElementById("contactCopied");
  var isPhone = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (emailLink && copiedNote && isPhone) {
    var hideTimer = null;
    var showCopied = function (text) {
      copiedNote.textContent = text;
      copiedNote.classList.add("show");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { copiedNote.classList.remove("show"); }, 2200);
    };
    var fallbackCopy = function (text) {
      var box = document.createElement("textarea");
      box.value = text;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      box.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      document.body.removeChild(box);
      return ok;
    };
    emailLink.addEventListener("click", function (e) {
      e.preventDefault();
      var address = emailLink.getAttribute("data-email");
      var done = function () { showCopied("copied!"); };
      var failed = function () {
        if (fallbackCopy(address)) { done(); } else { window.location.href = "mailto:" + address; }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(done, failed);
      } else {
        failed();
      }
    });
  }

  // Phone "scroll down" arrow: hide it once the visitor starts scrolling
  // (or if the whole page already fits on screen).
  var scrollHint = document.querySelector(".page-scroll-hint");
  if (scrollHint) {
    var updateHint = function () {
      var atTop = window.scrollY < 40;
      var hasMore = document.documentElement.scrollHeight - window.innerHeight > 80;
      scrollHint.classList.toggle("is-hidden", !(atTop && hasMore));
    };
    window.addEventListener("scroll", updateHint, { passive: true });
    window.addEventListener("resize", updateHint);
    updateHint();
  }

  // Section covers (e.g. Designs / Development / Final product): click a cover
  // to open that section's photos full screen.
  document.querySelectorAll(".section-card[data-gallery]").forEach(function (card) {
    var list = document.getElementById(card.getAttribute("data-gallery"));
    if (!list) return;
    var photos = Array.prototype.map.call(list.querySelectorAll("a[href]"), function (a) {
      return { src: a.getAttribute("href"), alt: a.getAttribute("data-alt") || "" };
    });
    if (!photos.length) return;
    var open = makeLightbox(photos);
    card.addEventListener("click", function () { open(0); });
  });

  var list = document.getElementById("selectedList");
  var preview = document.getElementById("cursorPreview");
  var previewImg = document.getElementById("cursorPreviewImg");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (list && preview && previewImg && canHover) {
    var raf = null;
    var lastX = 0, lastY = 0;

    function place() {
      preview.style.transform = "translate(" + (lastX + 28) + "px, " + (lastY - preview.offsetHeight / 2) + "px)";
      raf = null;
    }

    list.addEventListener("mousemove", function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!raf) raf = requestAnimationFrame(place);
    });

    list.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("mouseenter", function () {
        if (link.dataset.img) {
          var letterboxed = "letterbox" in link.dataset;
          preview.classList.toggle("is-letterboxed", letterboxed);
          preview.classList.toggle("is-landscape", letterboxed);
          previewImg.onload = function () {
            if (!letterboxed) {
              preview.classList.toggle("is-landscape", previewImg.naturalWidth > previewImg.naturalHeight);
            }
            place();
          };
          previewImg.alt = link.dataset.label || "";
          previewImg.src = link.dataset.img;
        }
        preview.classList.add("show");
      });
      link.addEventListener("mouseleave", function () {
        preview.classList.remove("show");
      });
    });
  }

  // Contact form: send in place (Netlify Forms) and show a thank-you, no page jump
  var form = document.getElementById("contactForm");
  if (form) {
    var status = document.getElementById("contactStatus");
    var button = form.querySelector(".contact-send");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      button.disabled = true;
      status.classList.remove("is-error");
      status.textContent = "Sending…";
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.textContent = "Thank you — your message is on its way. I'll reply by email soon.";
      }).catch(function () {
        status.classList.add("is-error");
        status.innerHTML = 'Sorry, that didn\'t send. Please email me at <a href="mailto:melinasuriani@gmail.com">melinasuriani@gmail.com</a>.';
      }).then(function () { button.disabled = false; });
    });
  }
});
