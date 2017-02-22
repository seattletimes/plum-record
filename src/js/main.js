// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var $ = require("./lib/qsa");

var scrollContainer = $.one(".scroll-graph");
var seasons = $(".season");
var debug = $.one(".debug");

var gameData = window.plum;
var total = 0;
var bySeason = { 1: [], 2: [], 3: [], 4: [] };
gameData.forEach(function(g) {
  bySeason[g.season].push(g);
});
var maxPoints = gameData[gameData.length - 1].aggregate;

var canvas = $.one(".graph");
var context = canvas.getContext("2d");

var onScroll = function() {
  var season = null;
  var bounds = null;
  for (var i = 0; i < seasons.length; i++) {
    var s = seasons[i];
    var b = s.getBoundingClientRect();
    if (b.top < 0) {
      if (!s.classList.contains("active")) s.classList.add("active");
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

  var seasonData = bySeason[num];
  var index = Math.floor(seasonData.length * progress);
  var final = seasonData[index];

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  context.strokeStyle = "white";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(0, canvas.height);

  for (var i = 0; i < gameData.length; i++) {
    var game = gameData[i];

    var x = (i / gameData.length) * canvas.width;
    var y = canvas.height - (game.aggregate / maxPoints * canvas.height);
    context.lineTo(x, y);

    if (game == final) break;
  }

  context.stroke();
}

window.addEventListener("scroll", onScroll);
onScroll();
