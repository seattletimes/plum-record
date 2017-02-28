require("./lib/social");
require("./lib/ads");
// var track = require("./lib/tracking");

var $ = require("./lib/qsa");
var colors = require("./lib/colors");

var scrollContainer = $.one(".scroll-graph");
var seasons = $(".season");
var vizContainer = $.one(".viz");

var gameData = window.plum;
var maxPoints = gameData[gameData.length - 1].aggregate + 100;
var total = 0;
var bySeason = { 1: [], 2: [], 3: [], 4: [] };
gameData.forEach(function(g, i) {
  bySeason[g.season].push(g);
  if (g.notes) {
    var point = document.createElement("div");
    point.className = "point";
    point.setAttribute("data-index", i);
    point.style.left = (i + 1) / gameData.length * 100 + "%";
    point.style.top = (1 - g.aggregate / maxPoints) * 100 + "%";
    vizContainer.appendChild(point);
    g.element = point;
  }
});

var canvas = $.one(".graph");
var context = canvas.getContext("2d");
var counter = $.one(".viz .counter");

var palette = {
  1: "white",
  2: colors.palette.stLightPurple,
  3: "white",
  4: colors.palette.stLightPurple
};

var commafy = s => s.toLocaleString().replace(/\.0+$/, "");

var popup = $.one(".viz .popup");
var notClosed = true;

var setPopup = function(data) {
  var element = data.element;
  if (!element) return;
  popup.style.display = "block";
  popup.querySelector(".notes").innerHTML = data.notes;
  var vizBounds = vizContainer.getBoundingClientRect();
  var pointBounds = element.getBoundingClientRect();
  var popupBounds = popup.getBoundingClientRect();
  var x = pointBounds.left - vizBounds.left;
  x -= popupBounds.width + 10;
  if (x < 0) x += popupBounds.width + 20;
  if (x + popupBounds.width > vizBounds.width) x = vizBounds.width - popupBounds.width;
  var y = pointBounds.top - vizBounds.top;
  y -= popupBounds.height + 10;
  if (y < 0) y += popupBounds.height + pointBounds.height + 20;
  if (y + popupBounds.height > vizBounds.height) y = vizBounds.height - popupBounds.height;
  popup.style.left = x + "px";
  popup.style.top = y + "px";
}

popup.querySelector(".close-button").addEventListener("click", function() {
  popup.style.display = "none";
  $(".point.activated").forEach(p => p.classList.remove("activated"));
  notClosed = false;
});

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

  var seasonData = bySeason[num];
  var index = Math.floor(seasonData.length * progress);
  var final = seasonData[index];
  var noted = null;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  context.strokeStyle = palette[1];
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(0, canvas.height);
  var state = {
    season: 1,
    x: 0,
    y: 0
  }

  for (var i = 0; i < gameData.length; i++) {
    var game = gameData[i];

    var x = (i + 1) / gameData.length * canvas.width;
    var y = canvas.height - (game.aggregate / maxPoints * canvas.height);
    context.lineTo(x, y);

    if (state.season != game.season) {
      context.stroke();
      context.beginPath();
      context.moveTo(state.x, state.y);
      context.strokeStyle = palette[game.season];
      state.season = game.season;
    }

    state.x = x;
    state.y = y;

    if (game.notes) noted = game;

    if (game == final) break;
  }

  context.stroke();

  if (noted && notClosed) {
    $(".point.activated").forEach(p => p.classList.remove("activated"));
    noted.element.classList.add("activated");
    setPopup(noted);
  }

  counter.innerHTML = `
  <div>Game ${final.game}</div>
  <div>${final.points} out of ${final.game_points} points</div>
  <div>Career: ${commafy(final.aggregate)} points</div>`

}

window.addEventListener("scroll", onScroll);
onScroll();

$(".point").forEach(el => el.addEventListener("click", function() {
  el.classList.toggle("activated");
  $(".point.activated").filter(p => p != el).forEach(p => p.classList.remove("activated"));
  var index = el.getAttribute("data-index");
  setPopup(gameData[index]);
  notClosed = true;
}));