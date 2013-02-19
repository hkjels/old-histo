
/**
 * Module dependencies.
 */

var Emitter = require('emitter'),
    dom = require('dom'),
    max = require('max'),
    object = require('object'),
    range = require('range'),
    retina = require('autoscale-canvas'),
    style = require('style'),
    toArray = require('object-to-array');

function nopx(str) {
  return parseInt(str.replace('px', ''));
}

// Expose `Histo`

module.exports = Histo;

/**
 * Histogram.
 *
 * @param {String} name
 */

function Histo(name) {
  this.on('plot', this.draw);
  this.on('change', this.draw);
  this.name = name || null;
  this.sorted = this.reversed = false;
  this.prepareCanvas();
}

// Inherit from `Emitter.prototype`

Emitter(Histo.prototype);

/**
 * Prepare canvas.
 */

Histo.prototype.prepareCanvas = function() {
  this.canvas = dom(require('./template')).get(0);
  ['width', 'height'].forEach(function(dim) {
    this.canvas[dim] = nopx(style('.histo', dim));
  }.bind(this));
  retina(this.canvas);
  this.ctx = this.canvas.getContext('2d');
};

/**
 * Plot points onto the histogram.
 *
 * @param {Mixed}     You can pass one point as `key, value` or a bunch
 *                    of points using one or more hashes.
 */

Histo.prototype.plot = function () {
  var args = toArray(arguments), points = {};
  if (args.length > 1) {
    if (typeof args[0] !== 'object') points[args[0]] = args[1];
    else args.forEach(function(obj) {
      object.merge(points, obj);
    });
  }
  else points = args[0];
  this.points = object.merge(this.points || {}, points);
  this.upper = max(object.values(this.points));
  this.emit('plot');
  return this;
};

/**
 * Draw histogram onto canvas.
 */

Histo.prototype.draw = function() {
  this.pad = nopx(style('.histo .gram', 'padding'));
  this.dim = {
    x: this.canvas.width - (this.pad * 2),
    y: this.canvas.height - (this.pad * 2)
  };
  this.canvas.width = this.canvas.width;
  this.drawOrigo();
  this.drawAxis();
  this.drawPlot();
};

/**
 * Draw origo.
 */

Histo.prototype.drawOrigo = function() {
  var x = this.pad, y = this.dim.y + this.pad,
      r = nopx(style('.histo .origo', 'width')),
      color = style('.histo .origo', 'background-color');
      ctx = this.ctx;

  this.origo = {x: x, y: y};

  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
};

/**
 * Draw axis.
 */

Histo.prototype.drawAxis = function() {
  var start = this.origo,
      end = { x: this.pad + this.dim.x, y: this.pad };

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(start.x, end.y);
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, start.y);
  ctx.strokeStyle = style('.histo .axis', 'background-color');
  ctx.stroke();
};

/**
 * Draw plot.
 */

Histo.prototype.drawPlot = function() {
  var ctx = this.ctx,
      barWidth = nopx(style('.histo .bar', 'width')),
      points = this.points;

  function growBar(label, n) {
    var point = points[label],
        start = {
          x: barWidth + this.origo.x + (n * (barWidth * 2)),
          y: this.origo.y
        };

    if (point >>> 0 === parseFloat(point)) {
      ctx.fillStyle = style('.histo .bar', 'background-color');
    } else {
      ctx.fillStyle = style('.histo .negative-bar', 'background-color');
    }

    ctx.fillRect(
      start.x,
      start.y,
      barWidth,
      -((this.dim.y / this.upper) * Math.abs(point))
    );
  }

  object.keys(points)
    .forEach(growBar.bind(this));
};

/**
 * Fade into existence.
 */

Histo.prototype.show = function () {
  setTimeout(function () {
    this.canvas.classList.add('show');
  }.bind(this), 50);
  return this.canvas;
};

