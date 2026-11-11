/* ============ COOKIE CONSENT v2 (lemarc.ai only) ============
   One file for every page. Two optional categories, both off until the visitor allows them:
     analytics -> GA4
     marketing -> Google Ads, Meta Pixel, LinkedIn Insight Tag
   Nothing third-party loads before a choice. Google Consent Mode v2 defaults to denied.
   Choice: cookie "lemarc_consent" = {"analytics":bool,"marketing":bool,"v":2}, 1 year,
   localStorage fallback. An old "yes"/"no" value (v1) asks again.
   Any footer element with [data-cookie-settings] reopens the banner.
   window.lemarcConsent.lead() fires the lead conversion on each allowed marketing tag.

   IDs: an empty string means that tag never loads. */
(function(){
  var CONSENT_CONFIG = {
    ga4: "G-L07BJYTNDW",          // Google Analytics 4 measurement ID
    googleAds: "AW-18357828862",   // Google Ads tag ID
    googleAdsLeadLabel: "0kUaCNbxprYdEP752LFE", // "Submit lead form" conversion label
    metaPixel: "1975091263448493", // Meta Pixel ID
    linkedinPartnerId: "11317777",  // LinkedIn Insight Tag partner ID
    linkedinLeadConversionId: "32733873"  // LinkedIn conversion ID for the lead
  };

  var KEY = "lemarc_consent";
  var loaded = {analytics:false, marketing:false};

  // Consent Mode v2 default, before any Google tag can exist.
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
  gtag("consent", "default", {
    ad_storage:"denied", ad_user_data:"denied", ad_personalization:"denied", analytics_storage:"denied"
  });

  var css =
    "#cc[hidden],#cc [hidden]{display:none!important}" +
    "#cc{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;justify-content:center;padding:var(--pad,1.25rem)}" +
    ".cc-card{background:#16181A;color:#E9E9E1;border-radius:8px;max-width:44rem;width:100%;padding:1.125rem 1.25rem;" +
      "display:flex;flex-wrap:wrap;align-items:center;gap:.875rem 1.5rem;box-shadow:0 8px 40px rgba(0,0,0,.28);" +
      "font-family:'Inter Tight',system-ui,sans-serif;max-height:calc(100vh - 2.5rem);overflow:auto}" +
    ".cc-text{margin:0;flex:1 1 20rem;font-size:.9375rem;line-height:1.5;color:#E9E9E1}" +
    ".cc-text a{color:#D9D6FF;text-decoration:underline;text-underline-offset:3px}" +
    ".cc-actions{display:flex;flex-wrap:wrap;gap:.625rem;flex:0 0 auto}" +
    ".cc-btn{font-family:inherit;font-size:.9375rem;font-weight:500;cursor:pointer;min-height:44px;" +
      "padding:.55rem 1.125rem;border-radius:5px;border:1px solid #4F47E6;background:#4F47E6;color:#fff}" +
    ".cc-btn:hover{background:#4038CC}" +
    ".cc-ghost{background:transparent;color:#E9E9E1;border-color:rgba(233,233,225,.45)}" +
    ".cc-ghost:hover{background:rgba(233,233,225,.1)}" +
    ".cc-btn:focus-visible,.cc-opt input:focus-visible{outline:2px solid #D9D6FF;outline-offset:2px}" +
    ".cc-choose{flex:1 1 100%;display:grid;gap:.25rem;margin:0;padding:0;border:0}" +
    ".cc-choose legend{padding:0;font-weight:500;font-size:.9375rem;margin-bottom:.25rem}" +
    ".cc-opt{display:flex;align-items:flex-start;gap:.75rem;min-height:44px;padding:.5rem 0;cursor:pointer;font-size:.9375rem;line-height:1.45}" +
    ".cc-opt input{width:1.25rem;height:1.25rem;margin:.1rem 0 0;flex:none;accent-color:#4F47E6;cursor:pointer}" +
    "#cc .cc-opt span{color:#E9E9E1;font-weight:500}" +
    ".cc-opt small{display:block;color:#C9C9BF;font-size:.875rem}" +
    "@media(max-width:32rem){.cc-actions{flex:1 1 100%}.cc-btn{flex:1 1 auto}}";

  var html =
    '<div class="cc-card" role="region" aria-label="Cookie choices">' +
      '<p class="cc-text">We use cookies to see how people find this site and to measure our ads, only if you allow it. ' +
        '<a href="/privacy#cookies">How we use cookies</a></p>' +
      '<fieldset class="cc-choose" id="ccChoose" hidden>' +
        '<legend>Choose which cookies to allow</legend>' +
        '<label class="cc-opt"><input type="checkbox" id="ccA"><span>Analytics<small>How people find and use this site.</small></span></label>' +
        '<label class="cc-opt"><input type="checkbox" id="ccM"><span>Marketing<small>Measuring and targeting our ads on Google, Meta and LinkedIn.</small></span></label>' +
      '</fieldset>' +
      '<div class="cc-actions">' +
        '<button class="cc-btn" id="ccNo" type="button">Reject all</button>' +
        '<button class="cc-btn cc-ghost" id="ccPick" type="button" aria-expanded="false" aria-controls="ccChoose">Choose</button>' +
        '<button class="cc-btn cc-ghost" id="ccSave" type="button" hidden>Save choices</button>' +
        '<button class="cc-btn" id="ccYes" type="button">Accept all</button>' +
      '</div>' +
    '</div>';

  var el, $ = function(id){ return document.getElementById(id); };

  function build(){
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    el = document.createElement("div");
    el.id = "cc";
    el.hidden = true;
    el.innerHTML = html;
    document.body.insertBefore(el, document.body.firstChild); // first in tab order
    $("ccYes").onclick = function(){ save({analytics:true, marketing:true}); };
    $("ccNo").onclick = function(){ save({analytics:false, marketing:false}); };
    $("ccPick").onclick = function(){ showChoose(true); $("ccA").focus(); };
    $("ccSave").onclick = function(){ save({analytics:$("ccA").checked, marketing:$("ccM").checked}); };
    document.querySelectorAll("[data-cookie-settings]").forEach(function(b){
      b.addEventListener("click", function(e){ e.preventDefault(); open(true); });
    });
  }

  function showChoose(on){
    $("ccChoose").hidden = !on;
    $("ccSave").hidden = !on;
    $("ccPick").hidden = on;
    $("ccPick").setAttribute("aria-expanded", on ? "true" : "false");
  }

  function open(fromSettings){
    var c = read() || {analytics:false, marketing:false};
    $("ccA").checked = !!c.analytics;
    $("ccM").checked = !!c.marketing;
    showChoose(!!fromSettings);
    el.hidden = false;
    if (fromSettings) $("ccA").focus();
  }

  function read(){
    var raw = null, m = document.cookie.match(/(?:^|; )lemarc_consent=([^;]+)/);
    if (m) raw = m[1];
    else { try { raw = localStorage.getItem(KEY); } catch(e){} }
    if (!raw) return null;
    try {
      var c = JSON.parse(decodeURIComponent(raw));
      return c && c.v === 2 ? c : null;   // v1 "yes"/"no" fails here and asks again
    } catch(e){ return null; }
  }

  function save(c){
    var v = encodeURIComponent(JSON.stringify({analytics:!!c.analytics, marketing:!!c.marketing, v:2}));
    // Host-only cookie so it holds across every page of www.lemarc.ai, for a year.
    document.cookie = KEY + "=" + v + "; path=/; max-age=31536000; samesite=lax";
    try { localStorage.setItem(KEY, v); } catch(e){}
    el.hidden = true;
    var withdrew = (loaded.analytics && !c.analytics) || (loaded.marketing && !c.marketing);
    forget(c);
    // A tag already running can't be unloaded: reload so only what is allowed runs.
    if (withdrew) { location.reload(); return; }
    apply(c);
  }

  // Expire first-party cookies of every category that is off. They live on the
  // registrable domain or the host, so clear the dot-domain, bare-domain and
  // host-only forms; only the matching one bites.
  function forget(c){
    var base = location.hostname.replace(/^www\./, "");
    var scopes = ["; domain=." + base, "; domain=" + base, ""];
    document.cookie.split("; ").forEach(function(pair){
      var n = pair.split("=")[0];
      var isA = n === "_ga" || n.indexOf("_ga_") === 0;
      var isM = n.indexOf("_gcl_") === 0 || n === "_fbp" || n === "_fbc" || n.indexOf("li_") === 0;
      if ((isA && !c.analytics) || (isM && !c.marketing)) {
        scopes.forEach(function(d){ document.cookie = n + "=; path=/; max-age=0" + d; });
      }
    });
  }

  function script(src){
    var s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  var gtagLoaded = false;
  function google(id){
    if (!gtagLoaded){ gtagLoaded = true; script("https://www.googletagmanager.com/gtag/js?id=" + id); gtag("js", new Date()); }
    gtag("config", id);
  }

  function apply(c){
    var cfg = CONSENT_CONFIG;
    gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.marketing ? "granted" : "denied",
      ad_user_data: c.marketing ? "granted" : "denied",
      ad_personalization: c.marketing ? "granted" : "denied"
    });
    if (c.analytics && !loaded.analytics){
      loaded.analytics = true;
      if (cfg.ga4) google(cfg.ga4);
    }
    if (c.marketing && !loaded.marketing){
      loaded.marketing = true;
      if (cfg.googleAds) google(cfg.googleAds);
      if (cfg.metaPixel){
        var f = window.fbq = function(){ f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
        if (!window._fbq) window._fbq = f;
        f.push = f; f.loaded = true; f.version = "2.0"; f.queue = [];
        script("https://connect.facebook.net/en_US/fbevents.js");
        fbq("init", cfg.metaPixel);
        fbq("track", "PageView");
      }
      if (cfg.linkedinPartnerId){
        window._linkedin_partner_id = cfg.linkedinPartnerId;
        window._linkedin_data_partner_ids = [cfg.linkedinPartnerId];
        window.lintrk = function(a, b){ window.lintrk.q.push([a, b]); };
        window.lintrk.q = [];
        script("https://snap.licdn.com/li.lms-analytics/insight.min.js");
      }
    }
  }

  // Lead conversion after a successful application. Never throws.
  function lead(){
    var cfg = CONSENT_CONFIG, c = read();
    if (!c || !c.marketing) return;
    try { if (cfg.googleAds && cfg.googleAdsLeadLabel) gtag("event", "conversion", {send_to: cfg.googleAds + "/" + cfg.googleAdsLeadLabel}); } catch(e){}
    try { if (cfg.metaPixel && window.fbq) fbq("track", "Lead"); } catch(e){}
    try { if (cfg.linkedinPartnerId && cfg.linkedinLeadConversionId && window.lintrk) lintrk("track", {conversion_id: cfg.linkedinLeadConversionId}); } catch(e){}
  }

  window.lemarcConsent = {lead: lead, open: function(){ open(true); }};

  function start(){
    build();
    var c = read();
    if (c) apply(c); else open(false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
