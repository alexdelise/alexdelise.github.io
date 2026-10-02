(function () {
  "use strict";

  var config = window.visitorAnalyticsConfig || {};
  var hasLiveData = false;
  var pending = null;
  var apiUrl = String(config.apiUrl || "").replace(/\/+$/, "");
  var refreshIntervalMs = Number(config.refreshIntervalMs || 30000);
  var displayTargets = "[data-visitor-count], [data-visitor-total], [data-visitor-country-count], [data-visitor-updated]";

  function visitorTotal(data) {
    return (data.countries || []).reduce(function (total, country) {
      return total + Number(country.visitors || 0);
    }, 0);
  }

  function formatDate(value) {
    var date;

    if (!value) {
      return "Not yet available";
    }

    date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function dispatchUpdate(data) {
    window.dispatchEvent(new CustomEvent("visitorAnalyticsUpdated", { detail: data }));
  }

  function updateDisplay(data) {
    var total = visitorTotal(data);
    var countries = (data.countries || []).length;

    hasLiveData = true;
    setStatus("", false);
    window.visitorAnalyticsData = data;
    renderRecent(data);

    document.querySelectorAll("[data-visitor-count], [data-visitor-total]").forEach(function (node) {
      node.textContent = total;
    });

    document.querySelectorAll("[data-visitor-country-count]").forEach(function (node) {
      node.textContent = countries;
    });

    document.querySelectorAll("[data-visitor-updated]").forEach(function (node) {
      node.textContent = formatDate(data.updated);
    });

    dispatchUpdate(data);
  }

  function requestJson(path, options) {
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 12000);
    return fetch(apiUrl + path, Object.assign({
      signal: controller.signal,
      headers: {
        Accept: "application/json"
      },
      mode: "cors",
      credentials: "omit"
    }, options || {})).then(function (response) {
      if (!response.ok) {
        throw new Error("Visitor analytics request failed.");
      }

      return response.json();
    }).finally(function () { window.clearTimeout(timeout); });
  }

  function sessionKey() {
    return "visitorAnalyticsTracked:" + apiUrl;
  }

  function wasTrackedThisSession() {
    try {
      return window.sessionStorage.getItem(sessionKey()) === "true";
    } catch (error) {
      return false;
    }
  }

  function markTrackedThisSession() {
    try {
      window.sessionStorage.setItem(sessionKey(), "true");
    } catch (error) {
      // Ignore storage failures; tracking should not affect page behavior.
    }
  }

  function setStatus(message, failed) {
    document.querySelectorAll("[data-visitor-status]").forEach(function (node) {
      node.textContent = message;
    });
    document.querySelectorAll("[data-visitor-retry]").forEach(function (node) {
      node.hidden = !failed;
    });
    if (failed && !hasLiveData) {
      document.querySelectorAll(displayTargets).forEach(function (node) {
        node.textContent = "Unavailable";
      });
      document.querySelectorAll("[data-visitor-recent]").forEach(function (node) {
        node.textContent = "Analytics unavailable.";
      });
    }
  }

  function renderRecent(data) {
    var recent = (data.countries || []).filter(function (country) {
      return country.code !== "XX" && country.lastVisited && Number.isFinite(Date.parse(country.lastVisited));
    }).sort(function (a, b) {
      return Date.parse(b.lastVisited) - Date.parse(a.lastVisited) || a.name.localeCompare(b.name);
    }).slice(0, 3);
    document.querySelectorAll("[data-visitor-recent]").forEach(function (node) {
      node.textContent = "";
      if (!recent.length) {
        node.textContent = "Recent countries will appear as new visits are recorded.";
        return;
      }
      var list = document.createElement("ul");
      recent.forEach(function (country) {
        var item = document.createElement("li");
        var button = document.createElement("button");
        button.type = "button";
        button.textContent = country.name;
        button.addEventListener("click", function () {
          window.dispatchEvent(new CustomEvent("visitorCountrySelected", { detail: country.code }));
        });
        item.appendChild(button);
        var time = document.createElement("small");
        time.textContent = formatDate(country.lastVisited);
        item.appendChild(time);
        list.appendChild(item);
      });
      node.appendChild(list);
    });
  }

  function fetchStats() {
    if (pending) { return pending; }
    if (!apiUrl) {
      setStatus("Analytics unavailable: service is not configured.", true);
      return Promise.resolve();
    }
    if (!hasLiveData) {
      document.querySelectorAll(displayTargets).forEach(function (node) { node.textContent = "Loading…"; });
      setStatus("Loading analytics…", false);
    }
    pending = requestJson("/stats").then(function (data) {
      updateDisplay(data);
      return data;
    }).catch(function () {
      setStatus(hasLiveData ? "Unable to refresh. Showing the last successful update." : "Analytics unavailable. Please retry.", true);
    }).finally(function () { pending = null; });
    return pending;
  }

  function trackVisit() {
    if (!apiUrl || config.track === false) {
      fetchStats();
      return;
    }

    if (wasTrackedThisSession()) {
      fetchStats();
      return;
    }

    requestJson("/track", {
      method: "POST",
      keepalive: true,
      headers: {
        Accept: "application/json"
      }
    })
      .then(function (data) {
        markTrackedThisSession();
        updateDisplay(data);
      })
      .catch(function () {
        fetchStats();
      });
  }

  document.querySelectorAll("[data-visitor-retry]").forEach(function (node) {
    node.addEventListener("click", fetchStats);
  });
  fetchStats();
  trackVisit();

  if (apiUrl && refreshIntervalMs > 0 && document.querySelector(displayTargets)) {
    window.setInterval(fetchStats, refreshIntervalMs);
  }
})();
