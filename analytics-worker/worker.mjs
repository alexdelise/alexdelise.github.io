const STORAGE_KEY = "visitor-analytics:v1";

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const requestOrigin = request.headers.get("Origin") || "";
  const origins = allowedOrigins(env);
  const allowOrigin = origins.includes("*") || origins.includes(requestOrigin) ? requestOrigin || "*" : origins[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function jsonResponse(request, env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(request, env),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function emptyStats() {
  return {
    updated: null,
    source: "cloudflare-worker",
    countries: {}
  };
}

function normalizeCountryCode(value) {
  const code = String(value || "").toUpperCase();

  return /^[A-Z]{2}$/.test(code) ? code : "XX";
}

function normalizeStateCode(value) {
  const code = String(value || "").toUpperCase();

  return /^[A-Z]{2}$/.test(code) ? code : "";
}

function countryName(code) {
  if (code === "XX") {
    return "Unknown";
  }

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch (error) {
    return code;
  }
}

function readCountry(request) {
  const cf = request.cf || {};
  const code = normalizeCountryCode(cf.country);

  return {
    code,
    name: countryName(code),
    stateCode: code === "US" ? normalizeStateCode(cf.regionCode) : "",
    stateName: code === "US" ? String(cf.region || cf.regionCode || "").trim() : ""
  };
}

async function readStats(env) {
  const stored = await env.VISITOR_COUNTS.get(STORAGE_KEY, { type: "json" });

  if (!stored || !stored.countries) {
    return emptyStats();
  }

  return stored;
}

async function writeStats(env, stats) {
  await env.VISITOR_COUNTS.put(STORAGE_KEY, JSON.stringify(stats));
}

function publicStats(stats) {
  const countries = Object.values(stats.countries || {})
    .map((country) => {
      const output = {
        code: country.code,
        name: country.name,
        visitors: country.visitors || 0
      };

      if (country.states) {
        output.states = Object.values(country.states)
          .sort((a, b) => b.visitors - a.visitors || a.name.localeCompare(b.name))
          .map((state) => ({
            code: state.code,
            name: state.name,
            visitors: state.visitors || 0
          }));
      }

      return output;
    })
    .sort((a, b) => b.visitors - a.visitors || a.name.localeCompare(b.name));

  return {
    updated: stats.updated,
    source: "cloudflare-worker",
    countries
  };
}

function incrementStats(stats, location) {
  const country = stats.countries[location.code] || {
    code: location.code,
    name: location.name,
    visitors: 0,
    states: location.code === "US" ? {} : undefined
  };

  country.name = location.name;
  country.visitors += 1;

  if (location.code === "US" && location.stateCode) {
    country.states = country.states || {};
    country.states[location.stateCode] = country.states[location.stateCode] || {
      code: location.stateCode,
      name: location.stateName || location.stateCode,
      visitors: 0
    };
    country.states[location.stateCode].name = location.stateName || country.states[location.stateCode].name;
    country.states[location.stateCode].visitors += 1;
  }

  stats.countries[location.code] = country;
  stats.updated = new Date().toISOString();
  return stats;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env)
      });
    }

    if (!env.VISITOR_COUNTS) {
      return jsonResponse(request, env, { error: "VISITOR_COUNTS KV binding is missing." }, 500);
    }

    if (request.method === "GET" && (path === "/" || path === "/stats")) {
      return jsonResponse(request, env, publicStats(await readStats(env)));
    }

    if (request.method === "POST" && path === "/track") {
      const stats = await readStats(env);
      const updated = incrementStats(stats, readCountry(request));

      await writeStats(env, updated);
      return jsonResponse(request, env, publicStats(updated));
    }

    return jsonResponse(request, env, { error: "Not found." }, 404);
  }
};
