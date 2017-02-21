// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var $ = require("./lib/qsa");

var scrollContainer = $.one(".scroll-graph");
var seasons = $(".season");
var debug = $.one(".debug");

var onScroll = function() {
  var season = null;
  var bounds = null;
  for (var i = 0; i < seasons.length; i++) {
    var s = seasons[i];
    var b = s.getBoundingClientRect();
    if (b.top < 0) {
      s.classList.add("active");
    } else {
      s.classList.remove("active");
    }
    if (b.top <= window.innerHeight && b.bottom > 0 && !season) {
      season = s;
      bounds = b;
    }
  }
  if (!bounds) return;
  var progress = bounds.top > 0 ? 0 : 1 - ((bounds.height + bounds.top) / bounds.height);
  if (progress > 1) progress = 1;
  var num = season.getAttribute("data-season");
  debug.innerHTML = `Season ${num}, ${(progress * 100).toFixed(1)}%`;
}

window.addEventListener("scroll", onScroll);
onScroll();
