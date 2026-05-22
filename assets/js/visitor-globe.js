(function () {
  "use strict";

  var root = document.querySelector("[data-visitor-globe]");
  var canvas = document.getElementById("visitor-globe");
  var tooltip = document.getElementById("visitor-globe-tooltip");
  var detail = document.getElementById("visitor-country-detail");

  if (!root || !canvas || !tooltip || !detail) {
    return;
  }

  var ctx = canvas.getContext("2d");
  var data = window.visitorAnalyticsData || { countries: [] };
  var countryData = (data.countries || []).slice();
  var countryByCode = countryData.reduce(function (acc, country) {
    acc[country.code] = country;
    return acc;
  }, {});

  var LANDMASSES = [
    {
      name: "North America",
      polygons: [
        [
          [-168, 72],
          [-128, 73],
          [-92, 70],
          [-58, 57],
          [-52, 45],
          [-78, 25],
          [-98, 15],
          [-118, 24],
          [-130, 45],
          [-168, 58]
        ]
      ]
    },
    {
      name: "South America",
      polygons: [
        [
          [-82, 12],
          [-60, 8],
          [-36, -8],
          [-44, -32],
          [-58, -55],
          [-74, -42],
          [-80, -18]
        ]
      ]
    },
    {
      name: "Europe",
      polygons: [
        [
          [-11, 58],
          [10, 66],
          [32, 60],
          [36, 43],
          [20, 36],
          [0, 42],
          [-11, 50]
        ]
      ]
    },
    {
      name: "Africa",
      polygons: [
        [
          [-18, 34],
          [12, 37],
          [38, 20],
          [50, -6],
          [31, -35],
          [7, -35],
          [-12, -18],
          [-18, 8]
        ]
      ]
    },
    {
      name: "Asia",
      polygons: [
        [
          [34, 57],
          [78, 70],
          [143, 58],
          [154, 34],
          [122, 10],
          [86, 8],
          [58, 24],
          [34, 40]
        ]
      ]
    },
    {
      name: "Australia",
      polygons: [
        [
          [112, -11],
          [154, -10],
          [153, -38],
          [133, -44],
          [113, -34]
        ]
      ]
    },
    {
      name: "Greenland",
      polygons: [
        [
          [-52, 82],
          [-25, 76],
          [-30, 60],
          [-48, 58],
          [-64, 68]
        ]
      ]
    }
  ];

  var COUNTRY_SHAPES = {
    AU: [
      [
        [112, -11],
        [154, -10],
        [153, -38],
        [133, -44],
        [113, -34]
      ]
    ],
    BR: [
      [
        [-74, 5],
        [-50, 4],
        [-35, -8],
        [-43, -24],
        [-54, -34],
        [-66, -24],
        [-74, -10]
      ]
    ],
    CA: [
      [
        [-141, 70],
        [-58, 70],
        [-52, 50],
        [-75, 44],
        [-96, 49],
        [-125, 49],
        [-141, 60]
      ]
    ],
    DE: [
      [
        [5, 55],
        [15, 55],
        [15, 47],
        [6, 47],
        [5, 51]
      ]
    ],
    GB: [
      [
        [-8, 58],
        [2, 58],
        [2, 50],
        [-6, 50]
      ]
    ],
    IN: [
      [
        [68, 36],
        [90, 28],
        [88, 8],
        [76, 7],
        [68, 22]
      ]
    ],
    US: [
      [
        [-124, 49],
        [-67, 49],
        [-67, 25],
        [-82, 25],
        [-97, 26],
        [-106, 31],
        [-117, 32],
        [-124, 41]
      ],
      [
        [-168, 71],
        [-141, 70],
        [-130, 58],
        [-151, 54],
        [-168, 60]
      ],
      [
        [-161, 23],
        [-154, 23],
        [-154, 18],
        [-161, 18]
      ]
    ]
  };

  var colors = {};
  var width = 0;
  var height = 0;
  var pixelRatio = 1;
  var radius = 0;
  var centerX = 0;
  var centerY = 0;
  var rotation = { lon: -35, lat: 22 };
  var zoom = 1;
  var hoveredCode = null;
  var selectedCode = null;
  var hitTargets = [];
  var isDragging = false;
  var dragStart = null;
  var dragMoved = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function readColors() {
    var style = getComputedStyle(document.documentElement);
    colors = {
      water: style.getPropertyValue("--visitor-water-color").trim() || "#2d353b",
      land: style.getPropertyValue("--visitor-land-color").trim() || "#475258",
      line: style.getPropertyValue("--visitor-globe-line-color").trim() || "rgba(211, 198, 170, 0.16)",
      highlight: style.getPropertyValue("--visitor-accent-pink").trim() || "#d699b6",
      text: style.getPropertyValue("--global-text-color").trim() || "#d3c6aa",
      border: style.getPropertyValue("--global-border-color").trim() || "#56635f"
    };
  }

  function project(lon, lat) {
    var deg = Math.PI / 180;
    var lambda = (lon - rotation.lon) * deg;
    var phi = lat * deg;
    var phi0 = rotation.lat * deg;
    var cosPhi = Math.cos(phi);
    var cosc = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * cosPhi * Math.cos(lambda);

    return {
      x: centerX + radius * cosPhi * Math.sin(lambda),
      y: centerY - radius * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * cosPhi * Math.cos(lambda)),
      visible: cosc > -0.02,
      depth: cosc
    };
  }

  function buildVisiblePolygon(points) {
    var projected = [];

    points.forEach(function (point) {
      var p = project(point[0], point[1]);
      if (p.visible) {
        projected.push(p);
      }
    });

    return projected;
  }

  function drawProjectedPolygon(points, fill, stroke, lineWidth) {
    if (points.length < 3) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (var i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth || 1;
      ctx.stroke();
    }
  }

  function drawGeoLine(points) {
    var started = false;

    ctx.beginPath();

    points.forEach(function (point) {
      var p = project(point[0], point[1]);

      if (!p.visible) {
        started = false;
        return;
      }

      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    });

    ctx.stroke();
  }

  function drawGraticule() {
    var points;
    var lon;
    var lat;

    ctx.save();
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;

    for (lat = -60; lat <= 60; lat += 30) {
      points = [];
      for (lon = -180; lon <= 180; lon += 4) {
        points.push([lon, lat]);
      }
      drawGeoLine(points);
    }

    for (lon = -150; lon <= 180; lon += 30) {
      points = [];
      for (lat = -80; lat <= 80; lat += 4) {
        points.push([lon, lat]);
      }
      drawGeoLine(points);
    }

    ctx.restore();
  }

  function drawLandmasses() {
    LANDMASSES.forEach(function (landmass) {
      landmass.polygons.forEach(function (polygon) {
        drawProjectedPolygon(buildVisiblePolygon(polygon), colors.land, null, 0);
      });
    });
  }

  function drawVisitorCountries() {
    hitTargets = [];

    countryData.forEach(function (country) {
      var polygons = COUNTRY_SHAPES[country.code];
      var isActive = country.code === hoveredCode || country.code === selectedCode;

      if (!polygons) {
        return;
      }

      polygons.forEach(function (polygon) {
        var projected = buildVisiblePolygon(polygon);

        if (projected.length < 3) {
          return;
        }

        drawProjectedPolygon(
          projected,
          colors.highlight,
          isActive ? colors.text : colors.water,
          isActive ? 2 : 1
        );
        hitTargets.push({
          code: country.code,
          points: projected
        });
      });
    });
  }

  function render() {
    readColors();

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    radius = Math.min(width, height) * 0.41 * zoom;
    centerX = width / 2;
    centerY = height / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.water;
    ctx.fill();
    ctx.clip();

    drawGraticule();
    drawLandmasses();
    drawVisitorCountries();

    ctx.restore();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function resize() {
    var rect = root.getBoundingClientRect();

    width = Math.max(320, Math.round(rect.width));
    height = Math.max(420, Math.round(canvas.getBoundingClientRect().height || 420));
    pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    render();
  }

  function pointInPolygon(x, y, points) {
    var inside = false;
    var i;
    var j;
    var xi;
    var yi;
    var xj;
    var yj;
    var intersects;

    for (i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
      xi = points[i].x;
      yi = points[i].y;
      xj = points[j].x;
      yj = points[j].y;
      intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

      if (intersects) {
        inside = !inside;
      }
    }

    return inside;
  }

  function findCountryAt(x, y) {
    var i;

    for (i = hitTargets.length - 1; i >= 0; i -= 1) {
      if (pointInPolygon(x, y, hitTargets[i].points)) {
        return countryByCode[hitTargets[i].code] || null;
      }
    }

    return null;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function visitorLabel(count) {
    return count === 1 ? "visitor" : "visitors";
  }

  function sortedStates(country) {
    return (country.states || []).slice().sort(function (a, b) {
      return b.visitors - a.visitors;
    });
  }

  function countryMarkup(country, compact) {
    var states = sortedStates(country);
    var html = "<strong>" + escapeHtml(country.name) + "</strong>";

    html += "<span>" + country.visitors + " " + visitorLabel(country.visitors) + "</span>";

    if (country.code === "US" && states.length) {
      html += "<ul>";
      states.slice(0, compact ? 4 : states.length).forEach(function (state) {
        html += "<li>" + escapeHtml(state.name) + ": " + state.visitors + "</li>";
      });
      html += "</ul>";
    }

    return html;
  }

  function setDetail(country) {
    if (!country) {
      detail.innerHTML = "<p>Hover over a highlighted country to see visitor totals. Click a country to keep it selected.</p>";
      return;
    }

    detail.innerHTML = countryMarkup(country, false);
  }

  function showTooltip(country, x, y) {
    var tooltipX = clamp(x, 120, Math.max(120, width - 120));
    var tooltipY = clamp(y, 72, Math.max(72, height - 12));

    tooltip.innerHTML = countryMarkup(country, true);
    tooltip.style.left = tooltipX + "px";
    tooltip.style.top = tooltipY + "px";
    tooltip.classList.add("is-visible");
  }

  function hideTooltip() {
    tooltip.classList.remove("is-visible");
  }

  function pointerPosition(event) {
    var rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function updateHover(event) {
    var pos = pointerPosition(event);
    var country = findCountryAt(pos.x, pos.y);
    var nextCode = country ? country.code : null;

    if (nextCode !== hoveredCode) {
      hoveredCode = nextCode;
      canvas.style.cursor = country ? "pointer" : "grab";
      render();
    }

    if (country) {
      showTooltip(country, pos.x, pos.y);
      setDetail(country);
    } else {
      hideTooltip();
      setDetail(selectedCode ? countryByCode[selectedCode] : null);
    }
  }

  canvas.addEventListener("pointerdown", function (event) {
    var pos = pointerPosition(event);

    isDragging = true;
    dragMoved = false;
    dragStart = {
      x: pos.x,
      y: pos.y,
      lon: rotation.lon,
      lat: rotation.lat
    };
    canvas.setPointerCapture(event.pointerId);
    hideTooltip();
  });

  canvas.addEventListener("pointermove", function (event) {
    var pos;
    var dx;
    var dy;

    if (!isDragging || !dragStart) {
      updateHover(event);
      return;
    }

    pos = pointerPosition(event);
    dx = pos.x - dragStart.x;
    dy = pos.y - dragStart.y;

    if (Math.abs(dx) + Math.abs(dy) > 5) {
      dragMoved = true;
    }

    rotation.lon = dragStart.lon - dx * 0.35;
    rotation.lat = clamp(dragStart.lat + dy * 0.28, -70, 70);
    hoveredCode = null;
    render();
  });

  canvas.addEventListener("pointerup", function (event) {
    var pos;
    var country;

    isDragging = false;
    canvas.releasePointerCapture(event.pointerId);

    if (!dragMoved) {
      pos = pointerPosition(event);
      country = findCountryAt(pos.x, pos.y);
      selectedCode = country ? country.code : selectedCode;
      setDetail(country || (selectedCode ? countryByCode[selectedCode] : null));
    }
  });

  canvas.addEventListener("pointerleave", function () {
    if (!isDragging) {
      hoveredCode = null;
      hideTooltip();
      canvas.style.cursor = "grab";
      setDetail(selectedCode ? countryByCode[selectedCode] : null);
      render();
    }
  });

  canvas.addEventListener(
    "wheel",
    function (event) {
      event.preventDefault();
      zoom = clamp(zoom * (event.deltaY > 0 ? 0.9 : 1.1), 0.72, 1.7);
      render();
    },
    { passive: false }
  );

  canvas.addEventListener("keydown", function (event) {
    var handled = true;

    if (event.key === "ArrowLeft") {
      rotation.lon -= 10;
    } else if (event.key === "ArrowRight") {
      rotation.lon += 10;
    } else if (event.key === "ArrowUp") {
      rotation.lat = clamp(rotation.lat + 8, -70, 70);
    } else if (event.key === "ArrowDown") {
      rotation.lat = clamp(rotation.lat - 8, -70, 70);
    } else if (event.key === "+" || event.key === "=") {
      zoom = clamp(zoom * 1.1, 0.72, 1.7);
    } else if (event.key === "-" || event.key === "_") {
      zoom = clamp(zoom * 0.9, 0.72, 1.7);
    } else if (event.key === "Home") {
      rotation = { lon: -35, lat: 22 };
      zoom = 1;
    } else {
      handled = false;
    }

    if (handled) {
      event.preventDefault();
      render();
    }
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(root);
  } else {
    window.addEventListener("resize", resize);
  }

  setDetail(null);
  resize();
})();
