(function () {
  "use strict";

  var root = document.querySelector("[data-visitor-globe]");
  var globeEl = document.getElementById("visitor-globe");
  var status = document.getElementById("visitor-globe-status");
  var detail = document.getElementById("visitor-country-detail");

  if (!root || !globeEl || !detail) {
    return;
  }

  var WORLD_TOPOLOGY_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
  var ISO_NUMERIC_BY_ALPHA2 = {
    AD: "020",
    AE: "784",
    AF: "004",
    AG: "028",
    AI: "660",
    AL: "008",
    AM: "051",
    AO: "024",
    AQ: "010",
    AR: "032",
    AS: "016",
    AT: "040",
    AU: "036",
    AW: "533",
    AX: "248",
    AZ: "031",
    BA: "070",
    BB: "052",
    BD: "050",
    BE: "056",
    BF: "854",
    BG: "100",
    BH: "048",
    BI: "108",
    BJ: "204",
    BL: "652",
    BM: "060",
    BN: "096",
    BO: "068",
    BQ: "535",
    BR: "076",
    BS: "044",
    BT: "064",
    BV: "074",
    BW: "072",
    BY: "112",
    BZ: "084",
    CA: "124",
    CC: "166",
    CD: "180",
    CF: "140",
    CG: "178",
    CH: "756",
    CI: "384",
    CK: "184",
    CL: "152",
    CM: "120",
    CN: "156",
    CO: "170",
    CR: "188",
    CU: "192",
    CV: "132",
    CW: "531",
    CX: "162",
    CY: "196",
    CZ: "203",
    DE: "276",
    DJ: "262",
    DK: "208",
    DM: "212",
    DO: "214",
    DZ: "012",
    EC: "218",
    EE: "233",
    EG: "818",
    EH: "732",
    ER: "232",
    ES: "724",
    ET: "231",
    FI: "246",
    FJ: "242",
    FK: "238",
    FM: "583",
    FO: "234",
    FR: "250",
    GA: "266",
    GB: "826",
    GD: "308",
    GE: "268",
    GF: "254",
    GG: "831",
    GH: "288",
    GI: "292",
    GL: "304",
    GM: "270",
    GN: "324",
    GP: "312",
    GQ: "226",
    GR: "300",
    GS: "239",
    GT: "320",
    GU: "316",
    GW: "624",
    GY: "328",
    HK: "344",
    HM: "334",
    HN: "340",
    HR: "191",
    HT: "332",
    HU: "348",
    ID: "360",
    IE: "372",
    IL: "376",
    IM: "833",
    IN: "356",
    IO: "086",
    IQ: "368",
    IR: "364",
    IS: "352",
    IT: "380",
    JE: "832",
    JM: "388",
    JO: "400",
    JP: "392",
    KE: "404",
    KG: "417",
    KH: "116",
    KI: "296",
    KM: "174",
    KN: "659",
    KP: "408",
    KR: "410",
    KW: "414",
    KY: "136",
    KZ: "398",
    LA: "418",
    LB: "422",
    LC: "662",
    LI: "438",
    LK: "144",
    LR: "430",
    LS: "426",
    LT: "440",
    LU: "442",
    LV: "428",
    LY: "434",
    MA: "504",
    MC: "492",
    MD: "498",
    ME: "499",
    MF: "663",
    MG: "450",
    MH: "584",
    MK: "807",
    ML: "466",
    MM: "104",
    MN: "496",
    MO: "446",
    MP: "580",
    MQ: "474",
    MR: "478",
    MS: "500",
    MT: "470",
    MU: "480",
    MV: "462",
    MW: "454",
    MX: "484",
    MY: "458",
    MZ: "508",
    NA: "516",
    NC: "540",
    NE: "562",
    NF: "574",
    NG: "566",
    NI: "558",
    NL: "528",
    NO: "578",
    NP: "524",
    NR: "520",
    NU: "570",
    NZ: "554",
    OM: "512",
    PA: "591",
    PE: "604",
    PF: "258",
    PG: "598",
    PH: "608",
    PK: "586",
    PL: "616",
    PM: "666",
    PN: "612",
    PR: "630",
    PS: "275",
    PT: "620",
    PW: "585",
    PY: "600",
    QA: "634",
    RE: "638",
    RO: "642",
    RS: "688",
    RU: "643",
    RW: "646",
    SA: "682",
    SB: "090",
    SC: "690",
    SD: "729",
    SE: "752",
    SG: "702",
    SH: "654",
    SI: "705",
    SJ: "744",
    SK: "703",
    SL: "694",
    SM: "674",
    SN: "686",
    SO: "706",
    SR: "740",
    SS: "728",
    ST: "678",
    SV: "222",
    SX: "534",
    SY: "760",
    SZ: "748",
    TC: "796",
    TD: "148",
    TF: "260",
    TG: "768",
    TH: "764",
    TJ: "762",
    TK: "772",
    TL: "626",
    TM: "795",
    TN: "788",
    TO: "776",
    TR: "792",
    TT: "780",
    TV: "798",
    TW: "158",
    TZ: "834",
    UA: "804",
    UG: "800",
    UM: "581",
    US: "840",
    UY: "858",
    UZ: "860",
    VA: "336",
    VC: "670",
    VE: "862",
    VG: "092",
    VI: "850",
    VN: "704",
    VU: "548",
    WF: "876",
    WS: "882",
    YE: "887",
    YT: "175",
    ZA: "710",
    ZM: "894",
    ZW: "716"
  };

  var data = window.visitorAnalyticsData || { countries: [] };
  var countryData = (data.countries || []).slice();
  var visitorByNumericId = countryData.reduce(function (acc, country) {
    var numericId = ISO_NUMERIC_BY_ALPHA2[country.code];

    if (numericId) {
      acc[numericId] = country;
    }

    return acc;
  }, {});
  var colors = {};
  var globe = null;
  var countries = [];
  var hoveredFeature = null;
  var selectedFeature = null;

  function setStatus(message, isHidden) {
    if (!status) {
      return;
    }

    status.textContent = message || "";
    status.classList.toggle("is-hidden", Boolean(isHidden));
  }

  function readColors() {
    var style = getComputedStyle(document.documentElement);

    colors = {
      water: style.getPropertyValue("--visitor-water-color").trim() || "#2d353b",
      land: style.getPropertyValue("--visitor-land-color").trim() || "#475258",
      border: style.getPropertyValue("--visitor-country-border-color").trim() || "rgba(211, 198, 170, 0.34)",
      highlight: style.getPropertyValue("--visitor-accent-pink").trim() || "#d699b6",
      hover: style.getPropertyValue("--global-text-color").trim() || "#d3c6aa",
      background: style.getPropertyValue("--global-surface-color").trim() || "#343f44"
    };
  }

  function normalizeCountryId(value) {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value).padStart(3, "0");
  }

  function featureVisitor(feature) {
    return feature && feature.properties ? feature.properties.visitorData : null;
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
    var html = '<div class="visitor-globe-label">';

    html += "<strong>" + escapeHtml(country.name) + "</strong>";
    html += "<span>" + country.visitors + " " + visitorLabel(country.visitors) + "</span>";

    if (country.code === "US" && states.length) {
      html += "<ul>";
      states.slice(0, compact ? 4 : states.length).forEach(function (state) {
        html += "<li>" + escapeHtml(state.name) + ": " + state.visitors + "</li>";
      });
      html += "</ul>";
    }

    html += "</div>";
    return html;
  }

  function setDetail(country) {
    if (!country) {
      detail.innerHTML = "<p>Hover over a highlighted country to see visitor totals. Click a country to keep it selected.</p>";
      return;
    }

    detail.innerHTML = countryMarkup(country, false);
  }

  function polygonCapColor(feature) {
    return featureVisitor(feature) ? colors.highlight : colors.land;
  }

  function polygonSideColor(feature) {
    return featureVisitor(feature) ? colors.highlight : colors.land;
  }

  function polygonStrokeColor(feature) {
    if (feature === hoveredFeature || feature === selectedFeature) {
      return colors.hover;
    }

    return colors.border;
  }

  function polygonAltitude(feature) {
    if (feature === hoveredFeature || feature === selectedFeature) {
      return 0.018;
    }

    return featureVisitor(feature) ? 0.012 : 0.004;
  }

  function polygonLabel(feature) {
    var visitor = featureVisitor(feature);

    return visitor ? countryMarkup(visitor, true) : null;
  }

  function resizeGlobe() {
    var rect = root.getBoundingClientRect();
    var height = globeEl.getBoundingClientRect().height || 520;

    if (globe) {
      globe.width(Math.max(320, Math.round(rect.width)));
      globe.height(Math.max(420, Math.round(height)));
    }
  }

  function refreshTheme() {
    var material;

    readColors();

    if (!globe) {
      return;
    }

    globe.backgroundColor(colors.background);
    material = globe.globeMaterial();

    if (material && material.color && material.color.set) {
      material.color.set(colors.water);
    }

    if (material && material.emissive && material.emissive.set) {
      material.emissive.set(colors.water);
    }

    globe
      .polygonCapColor(polygonCapColor)
      .polygonSideColor(polygonSideColor)
      .polygonStrokeColor(polygonStrokeColor)
      .polygonAltitude(polygonAltitude);
  }

  function movePointOfView(deltaLng, deltaLat, deltaAltitude) {
    var point = globe.pointOfView();

    globe.pointOfView(
      {
        lat: Math.max(-70, Math.min(70, (point.lat || 0) + deltaLat)),
        lng: (point.lng || 0) + deltaLng,
        altitude: Math.max(1.25, Math.min(3.6, (point.altitude || 2.25) + deltaAltitude))
      },
      250
    );
  }

  function wireKeyboardControls() {
    globeEl.addEventListener("keydown", function (event) {
      var handled = true;

      if (event.key === "ArrowLeft") {
        movePointOfView(-12, 0, 0);
      } else if (event.key === "ArrowRight") {
        movePointOfView(12, 0, 0);
      } else if (event.key === "ArrowUp") {
        movePointOfView(0, 8, 0);
      } else if (event.key === "ArrowDown") {
        movePointOfView(0, -8, 0);
      } else if (event.key === "+" || event.key === "=") {
        movePointOfView(0, 0, -0.25);
      } else if (event.key === "-" || event.key === "_") {
        movePointOfView(0, 0, 0.25);
      } else if (event.key === "Home") {
        globe.pointOfView({ lat: 20, lng: -35, altitude: 2.25 }, 350);
      } else {
        handled = false;
      }

      if (handled) {
        event.preventDefault();
      }
    });
  }

  function enrichCountries(world) {
    countries = window.topojson.feature(world, world.objects.countries).features;

    countries.forEach(function (feature) {
      var visitor = visitorByNumericId[normalizeCountryId(feature.id)];

      feature.properties = feature.properties || {};
      feature.properties.visitorData = visitor || null;
    });
  }

  function initializeGlobe() {
    var controls;

    readColors();

    globe = new window.Globe(globeEl, {
      rendererConfig: { antialias: true, alpha: true }
    })
      .backgroundColor(colors.background)
      .showAtmosphere(false)
      .showGraticules(false)
      .globeImageUrl(null)
      .polygonsData(countries)
      .polygonGeoJsonGeometry("geometry")
      .polygonCapColor(polygonCapColor)
      .polygonSideColor(polygonSideColor)
      .polygonStrokeColor(polygonStrokeColor)
      .polygonAltitude(polygonAltitude)
      .polygonLabel(polygonLabel)
      .polygonCapCurvatureResolution(2)
      .polygonsTransitionDuration(120)
      .onPolygonHover(function (feature) {
        var visitor = featureVisitor(feature);

        hoveredFeature = visitor ? feature : null;
        globeEl.classList.toggle("is-hovering", Boolean(visitor));
        setDetail(visitor || featureVisitor(selectedFeature));
        globe
          .polygonStrokeColor(polygonStrokeColor)
          .polygonAltitude(polygonAltitude);
      })
      .onPolygonClick(function (feature) {
        if (!featureVisitor(feature)) {
          return;
        }

        selectedFeature = feature;
        setDetail(featureVisitor(feature));
        globe
          .polygonStrokeColor(polygonStrokeColor)
          .polygonAltitude(polygonAltitude);
      });

    controls = globe.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.45;
    controls.zoomSpeed = 0.7;
    controls.minDistance = 170;
    controls.maxDistance = 520;

    refreshTheme();
    resizeGlobe();
    globe.pointOfView({ lat: 20, lng: -35, altitude: 2.25 }, 0);
    wireKeyboardControls();
    setDetail(null);
    setStatus("", true);
  }

  if (!window.Globe || !window.topojson) {
    setStatus("Unable to load the globe libraries.", false);
    return;
  }

  fetch(WORLD_TOPOLOGY_URL)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("World topology request failed.");
      }

      return response.json();
    })
    .then(function (world) {
      enrichCountries(world);
      initializeGlobe();
    })
    .catch(function () {
      setStatus("Unable to load the country geometry.", false);
    });

  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeGlobe).observe(root);
  } else {
    window.addEventListener("resize", resizeGlobe);
  }

  if ("MutationObserver" in window) {
    new MutationObserver(refreshTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  }

  window.addEventListener("storage", refreshTheme);
})();
