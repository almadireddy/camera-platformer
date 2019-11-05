"use strict";

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Region(points) {
  this.points = points || [];
  this.length = points.length;
}

Region.prototype.area = function () {
  var area = 0,
    i,
    j,
    point1,
    point2;

  for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
    point1 = this.points[i];
    point2 = this.points[j];
    area += point1.x * point2.y;
    area -= point1.y * point2.x;
  }
  area /= 2;

  return area;
};

Region.prototype.centroid = function () {
  var x = 0,
    y = 0,
    i,
    j,
    f,
    point1,
    point2;

  for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
    point1 = this.points[i];
    point2 = this.points[j];
    f = point1.x * point2.y - point2.x * point1.y;
    x += (point1.x + point2.x) * f;
    y += (point1.y + point2.y) * f;
  }

  f = this.area() * 6;

  return new Point(x / f, y / f);
};

Region.prototype.contains = function(p) {
  let x = p.x;
  let y = p.y;

  let cornersX = []
  let cornersY = []

  for (const i of this.points) {
    cornersX.push(i.x);
    cornersY.push(i.y);
  }

  var i, j=cornersX.length-1;
  var odd = false;

  var pX = cornersX;
  var pY = cornersY;

  for (i=0; i<cornersX.length; i++) {
      if ((pY[i]< y && pY[j]>=y ||  pY[j]< y && pY[i]>=y)
          && (pX[i]<=x || pX[j]<=x)) {
            odd ^= (pX[i] + (y-pY[i])*(pX[j]-pX[i])/(pY[j]-pY[i])) < x; 
      }

      j=i; 
  }

  return odd;
}