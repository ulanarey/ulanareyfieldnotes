/* ============================================================
   Field Notes — route line engine
   - Builds a meandering SVG path connecting the journal entries
   - Draws it progressively as the reader scrolls (pen stitching)
   - Rotates the compass needle as the "journey" progresses
   - Reveals photo plates as they enter the viewport
   No dependencies.
   ============================================================ */

(function () {
  "use strict";

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---- Plate reveals ---- */
  var plates = [].slice.call(document.querySelectorAll(".plate"));
  if ("IntersectionObserver" in window && !reduced) {
    var po = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-seen"); po.unobserve(e.target); }
      });
    }, { threshold: 0.18 });
    plates.forEach(function (p) { po.observe(p); });
  } else {
    plates.forEach(function (p) { p.classList.add("is-seen"); });
  }

  if (reduced) return; // no route line, no compass motion

  /* ---- Route line ---- */
  var svg = document.getElementById("route");
  var path = null;
  var pathLen = 0;

  function buildRoute() {
    var docH = document.documentElement.scrollHeight;
    var docW = document.documentElement.clientWidth;
    svg.setAttribute("viewBox", "0 0 " + docW + " " + docH);
    svg.style.height = docH + "px";

    var anchors = [].slice.call(document.querySelectorAll(".entry h2, .masthead h1"));
    if (anchors.length < 2) return;

    /* waypoints: alternate left/right margins beside each anchor */
    var pts = anchors.map(function (el, i) {
      var r = el.getBoundingClientRect();
      var y = r.top + scrollY + r.height / 2;
      var margin = Math.min(docW * 0.12, 130);
      var x = (i % 2 === 0) ? margin : docW - margin;
      return { x: x, y: y };
    });

    /* gentle S-curves between waypoints */
    var d = "M " + pts[0].x + " " + pts[0].y;
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      var midY = (a.y + b.y) / 2;
      d += " C " + a.x + " " + midY + ", " + b.x + " " + midY + ", " + b.x + " " + b.y;
    }

    svg.innerHTML = "";
    path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.appendChild(path);

    pathLen = path.getTotalLength();
    /* combine the stitch pattern with a draw-on offset:
       use a huge dasharray period trick — pattern handled in CSS,
       progressive draw via clip length */
    path.style.strokeDasharray = "6 7";
    path.style.strokeDashoffset = "0";
    update(); // set initial visible length
  }

  /* Progressive draw: mask by cutting the path short with a second dash trick.
     Simpler approach — use pathLength normalization and a clip via
     stroke-dasharray override: draw [visible] [rest]. The stitched look is
     approximated by keeping the segment short and the gap visible. */
  function setDrawn(fraction) {
    if (!path) return;
    var visible = pathLen * fraction;
    /* stitched dashes within the visible portion */
    var stitch = "6 7 ";
    var reps = Math.max(0, Math.floor(visible / 13));
    var remainder = Math.max(0, visible - reps * 13);
    var parts = new Array(reps + 1).join(stitch) + remainder + " " + (pathLen + 20);
    path.style.strokeDasharray = parts;
  }

  /* ---- Compass ---- */
  var needle = document.getElementById("needle");

  function update() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - innerHeight;
    var t = scrollable > 0 ? Math.min(Math.max(scrollY / scrollable, 0), 1) : 0;
    setDrawn(t);
    if (needle) needle.style.transform = "rotate(" + (t * 300 - 20) + "deg)";
    document.body.classList.toggle("traveling", scrollY > innerHeight * 0.6);
  }

  var ticking = false;
  addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(function () { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  var resizeTimer;
  addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildRoute, 200);
  });

  /* build after images/fonts settle so anchor positions are final */
  addEventListener("load", buildRoute);
  if (document.readyState === "complete") buildRoute();
})();
