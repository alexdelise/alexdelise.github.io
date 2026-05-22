(function () {
  "use strict";

  var config = window.visitorAnalyticsConfig || {};
  var fallbackData = window.visitorAnalyticsData || { countries: [] };
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
      return "";
    }

    date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  }

  function dispatchUpdate(data) {
    window.dispatchEvent(new CustomEvent("visitorAnalyticsUpdated", { detail: data }));
  }

  function updateDisplay(data) {
    var total = visitorTotal(data);
    var countries = (data.countries || []).length;

    window.visitorAnalyticsData = data;

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
    return fetch(apiUrl + path, Object.assign({
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
    });
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

  function fetchStats() {
    if (!apiUrl) {
      updateDisplay(fallbackData);
      return Promise.resolve(fallbackData);
    }

    return requestJson("/stats")
      .then(function (data) {
        updateDisplay(data);
        return data;
      })
      .catch(function () {
        updateDisplay(window.visitorAnalyticsData || fallbackData);
      });
  }

  function trackVisit() {
    if (!apiUrl || config.track === false) {
      updateDisplay(fallbackData);
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

  updateDisplay(fallbackData);
  trackVisit();

  if (apiUrl && refreshIntervalMs > 0 && document.querySelector(displayTargets)) {
    window.setInterval(fetchStats, refreshIntervalMs);
  }
})();
