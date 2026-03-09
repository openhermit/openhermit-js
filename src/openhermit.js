/**
 * OpenHermit v1.0
 * Makes any website discoverable and actionable by AI agents.
 * WebMCP compliant — https://openhermit.com
 */
(function (window, document) {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────
  var SCRIPT_TAG = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var API_KEY = SCRIPT_TAG.getAttribute('data-api-key');
  var API_BASE = SCRIPT_TAG.getAttribute('data-api-base') || 'https://www.openhermit.com';
  var VERSION = '1.0.0';

  if (!API_KEY) {
    console.warn('[OpenHermit] No data-api-key found on script tag.');
    return;
  }

  // ─── Utilities ────────────────────────────────────────────────────────────
  function toSnakeCase(str) {
    return str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 60);
  }

  function addMeta(name, content) {
    if (document.querySelector('meta[name="' + name + '"]')) return;
    var meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    document.head.appendChild(meta);
  }

  function addLink(rel, href) {
    if (document.querySelector('link[rel="' + rel + '"]')) return;
    var link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
  }

  function getCssSelector(el) {
    try {
      if (el.id) return '#' + el.id;
      if (el.name) return el.tagName.toLowerCase() + '[name="' + el.name + '"]';
      if (el.className) return el.tagName.toLowerCase() + '.' + el.className.split(' ')[0];
      return el.tagName.toLowerCase();
    } catch (e) { return el.tagName.toLowerCase(); }
  }

  function post(url, data) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = false;
      xhr.send(JSON.stringify(data));
    } catch (e) { /* fail silently */ }
  }

  function get(url, callback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          try { callback(JSON.parse(xhr.responseText)); } catch (e) { }
        }
      };
      xhr.send();
    } catch (e) { }
  }

  // ─── Agent Detection ──────────────────────────────────────────────────────
  function detectAgent() {
    var ua = navigator.userAgent || '';
    var agents = [
      { name: 'GPTBot', pattern: /GPTBot/i },
      { name: 'ChatGPT-User', pattern: /ChatGPT-User/i },
      { name: 'OAI-SearchBot', pattern: /OAI-SearchBot/i },
      { name: 'Claude', pattern: /ClaudeBot|Claude-Web|Anthropic/i },
      { name: 'Perplexity', pattern: /PerplexityBot/i },
      { name: 'Gemini', pattern: /Google-Extended|Googlebot-Extended/i },
      { name: 'Copilot', pattern: /bingbot.*copilot|copilot/i },
      { name: 'Operator', pattern: /openai-operator/i },
      { name: 'YouBot', pattern: /YouBot/i },
      { name: 'Cohere', pattern: /cohere-ai/i },
    ];

    for (var i = 0; i < agents.length; i++) {
      if (agents[i].pattern.test(ua)) return agents[i].name;
    }

    // Heuristics: headless browsers often used by agents
    if (!window.chrome && !window.safari && navigator.webdriver) return 'Headless-Agent';
    if (navigator.webdriver) return 'Automated-Browser';

    return null;
  }

  // ─── Form Detection ───────────────────────────────────────────────────────
  var FORM_TYPE_SIGNALS = {
    contact_form:  /contact|message|inquiry|enquiry|reach.?out|get.?in.?touch/i,
    booking:       /book|appoint|schedul|reserv|availab|calendar|slot/i,
    signup:        /sign.?up|register|creat.?account|join|membership/i,
    newsletter:    /newsletter|subscribe|email.?list|updates|notify/i,
    purchase:      /buy|checkout|order|purchase|payment|cart/i,
    quote:         /quote|estimate|calculat|price|cost|proposal/i,
    login:         /log.?in|sign.?in|password|username/i,
    search:        /search|find|look.?for/i,
    upload:        /upload|attach|file|cv|resume|document/i,
    support:       /support|help|ticket|issue|problem|complaint/i,
  };

  function guessFormType(form, fields) {
    var text = (form.innerHTML + (form.getAttribute('action') || '') + (form.id || '') + (form.className || '')).toLowerCase();
    for (var type in FORM_TYPE_SIGNALS) {
      if (FORM_TYPE_SIGNALS[type].test(text)) return type;
    }
    // Check field names
    var fieldText = fields.map(function (f) { return f.name; }).join(' ');
    if (/email/i.test(fieldText) && /message|body|content/i.test(fieldText)) return 'contact_form';
    if (/email/i.test(fieldText) && fields.length <= 2) return 'newsletter';
    return 'contact_form';
  }

  function guessFormName(form, type) {
    // Try aria-label, legend, nearest heading
    var sources = [
      form.getAttribute('aria-label'),
      form.querySelector('legend') && form.querySelector('legend').textContent,
      (function () {
        var el = form.previousElementSibling;
        while (el) {
          if (/^H[1-6]$/i.test(el.tagName)) return el.textContent;
          el = el.previousElementSibling;
        }
        return null;
      })(),
      form.id,
      form.className,
    ];
    for (var i = 0; i < sources.length; i++) {
      if (sources[i] && sources[i].trim().length > 2) {
        return sources[i].trim().substring(0, 50);
      }
    }
    return type.replace(/_/g, ' ');
  }

  function extractFields(form) {
    var fields = [];
    var inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(function (input) {
      var type = input.type || input.tagName.toLowerCase();
      if (/hidden|submit|button|reset|image/i.test(type)) return;

      // Find label
      var label = '';
      if (input.id) {
        var labelEl = document.querySelector('label[for="' + input.id + '"]');
        if (labelEl) label = labelEl.textContent.trim();
      }
      if (!label) label = input.getAttribute('aria-label') || input.placeholder || input.name || '';

      fields.push({
        name: input.name || input.id || label,
        label: label,
        type: type,
        required: input.required || false,
      });
    });
    return fields;
  }

  function buildDescription(type, name) {
    var descriptions = {
      contact_form: 'Submit a contact form inquiry to the business',
      booking:      'Book or schedule an appointment',
      signup:       'Create a new account or register',
      newsletter:   'Subscribe to the email newsletter',
      purchase:     'Complete a purchase or checkout',
      quote:        'Request a price quote or estimate',
      login:        'Sign in to an existing account',
      search:       'Search the website content',
      upload:       'Upload a file or document',
      support:      'Submit a support request or ticket',
    };
    return descriptions[type] || 'Submit the ' + name + ' form';
  }

  // ─── Third-Party Widget Detection ─────────────────────────────────────────
  function detectCalendly() {
    var signals = [
      document.querySelector('[data-url*="calendly.com"]'),
      document.querySelector('iframe[src*="calendly.com"]'),
      document.querySelector('a[href*="calendly.com"]'),
      window.Calendly ? { getAttribute: function () { return 'window.Calendly'; } } : null,
    ];

    for (var i = 0; i < signals.length; i++) {
      if (signals[i]) {
        var url = signals[i].getAttribute('data-url') ||
                  signals[i].getAttribute('src') ||
                  signals[i].getAttribute('href') || '';
        return {
          type: 'booking',
          name: 'Book Appointment',
          tool_name: 'book_appointment',
          tool_description: 'Schedule an appointment via Calendly',
          selector: getCssSelector(signals[i]),
          third_party: 'calendly',
          booking_url: url,
          webmcp_attributes: { booking_url: url, provider: 'calendly' },
        };
      }
    }
    return null;
  }

  function detectTypeform() {
    var el = document.querySelector('[data-tf-widget], iframe[src*="typeform.com"], a[href*="typeform.com"]');
    if (!el) return null;
    return {
      type: 'contact_form',
      name: 'Typeform',
      tool_name: 'submit_typeform',
      tool_description: 'Fill out and submit the Typeform',
      selector: getCssSelector(el),
      third_party: 'typeform',
      webmcp_attributes: { provider: 'typeform' },
    };
  }

  function detectHubspot() {
    var el = document.querySelector('.hbspt-form, iframe[src*="hubspot.com"], iframe[src*="hsforms.com"]');
    if (!el) return null;
    return {
      type: 'contact_form',
      name: 'Contact Form',
      tool_name: 'submit_hubspot_form',
      tool_description: 'Submit the HubSpot contact form',
      selector: getCssSelector(el),
      third_party: 'hubspot',
      webmcp_attributes: { provider: 'hubspot' },
    };
  }

  function detectIntercom() {
    var el = document.querySelector('#intercom-container, .intercom-launcher, iframe[src*="intercom"]');
    if (!el && !window.Intercom) return null;
    return {
      type: 'support',
      name: 'Live Chat',
      tool_name: 'open_live_chat',
      tool_description: 'Open the live chat to contact support',
      selector: '#intercom-container',
      third_party: 'intercom',
      webmcp_attributes: { provider: 'intercom' },
    };
  }

  function detectThirdPartyWidgets() {
    var widgets = [];
    var detectors = [detectCalendly, detectTypeform, detectHubspot, detectIntercom];
    detectors.forEach(function (detect) {
      try {
        var result = detect();
        if (result) widgets.push(result);
      } catch (e) { }
    });
    return widgets;
  }

  // ─── Business Info Extraction ─────────────────────────────────────────────
  function extractBusinessInfo() {
    var info = {};

    // Schema.org JSON-LD
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(function (s) {
      try {
        var data = JSON.parse(s.textContent);
        if (data.telephone) info.phone = data.telephone;
        if (data.email) info.email = data.email;
        if (data.address) {
          info.address = [
            data.address.streetAddress,
            data.address.addressLocality,
            data.address.addressCountry,
          ].filter(Boolean).join(', ');
        }
        if (data.openingHours) info.hours = Array.isArray(data.openingHours)
          ? data.openingHours.join(', ')
          : data.openingHours;
        if (data.name) info.business_name = data.name;
      } catch (e) { }
    });

    // tel: and mailto: links
    if (!info.phone) {
      var telLink = document.querySelector('a[href^="tel:"]');
      if (telLink) info.phone = telLink.href.replace('tel:', '');
    }
    if (!info.email) {
      var mailLink = document.querySelector('a[href^="mailto:"]');
      if (mailLink) info.email = mailLink.href.replace('mailto:', '').split('?')[0];
    }

    // Meta tags
    var siteName = document.querySelector('meta[property="og:site_name"]');
    if (siteName && !info.business_name) info.business_name = siteName.content;

    return info;
  }

  // ─── WebMCP Attribute Injection ───────────────────────────────────────────
  function injectWebMCPOnForm(form, action) {
    // OpenHermit proprietary attributes (current)
    form.setAttribute('data-mcp-action', action.tool_name);
    form.setAttribute('data-mcp-description', action.tool_description);
    if (action.fields && action.fields.length > 0) {
      form.setAttribute('data-mcp-params', JSON.stringify(action.fields));
    }
    form.setAttribute('data-openhermit', 'true');
    form.setAttribute('data-openhermit-id', action.id || '');

    // W3C WebMCP spec attributes (Chrome-native, forward-compatible)
    // https://webmachinelearning.github.io/webmcp/
    form.setAttribute('toolname', action.tool_name);
    form.setAttribute('tooldescription', action.tool_description);

    // Inject toolparamdescription on each field for W3C declarative spec
    if (action.fields && action.fields.length > 0) {
      var inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(function (input) {
        var fieldName = input.name || input.id;
        for (var i = 0; i < action.fields.length; i++) {
          if (action.fields[i].name === fieldName) {
            if (action.fields[i].label) {
              input.setAttribute('toolparamdescription', action.fields[i].label);
            }
            break;
          }
        }
      });
    }
  }

  // ─── Discoverability ──────────────────────────────────────────────────────
  function injectDiscoverability() {
    var manifestUrl = API_BASE + '/api/manifest?key=' + API_KEY;

    // WebMCP standard meta tags
    addMeta('webmcp', 'enabled');
    addMeta('ai-actions', manifestUrl);
    addMeta('ai-agent-ready', 'true');
    addMeta('openhermit', VERSION);

    // Link relations
    addLink('webmcp', manifestUrl);
    addLink('ai-actions', manifestUrl);

    // Open Graph for agents that read OG
    addMeta('og:ai-ready', 'true');
  }

  // ─── Event Tracking ───────────────────────────────────────────────────────
  var detectedAgent = detectAgent();
  var actionPrompts = {}; // keyed by tool_name, populated after sync

  function trackEvent(eventType, toolName, metadata) {
    post(API_BASE + '/api/events', {
      api_key: API_KEY,
      event_type: eventType,
      action_tool_name: toolName,
      agent_name: detectedAgent,
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      metadata: metadata || {},
    });
  }

  function attachFormTracking(form, toolName) {
    var submitted = false;
    form.addEventListener('submit', function (e) {
      if (submitted) return;
      submitted = true;
      // Only track if an agent is detected — human submissions are not agent interactions
      if (!detectedAgent) return;
      trackEvent('interaction', toolName, { form_action: form.action });

      // Check for success after submission
      // We listen for navigation or success messages
      setTimeout(function () {
        // If still on same page, look for success indicators
        var successSignals = document.querySelector(
          '.success, .thank-you, [class*="success"], [class*="thankyou"], [id*="success"]'
        );
        var eventType = successSignals ? 'completion' : 'completion'; // default to completion
        trackEvent(eventType, toolName, {});

        // Show agent prompt if configured
        if (actionPrompts[toolName] && actionPrompts[toolName].success_prompt) {
          // Inject a hidden element agents can read
          var promptEl = document.createElement('div');
          promptEl.setAttribute('data-mcp-response', 'true');
          promptEl.setAttribute('data-mcp-message', actionPrompts[toolName].success_prompt);
          promptEl.setAttribute('aria-label', actionPrompts[toolName].success_prompt);
          promptEl.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
          document.body.appendChild(promptEl);
        }
      }, 1500);
    });
  }

  // ─── Sync with OpenHermit API ─────────────────────────────────────────────
  function syncActions(actions) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', API_BASE + '/api/actions/sync', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          // Store prompts for use during tracking
          if (data.actions) {
            data.actions.forEach(function (a) {
              actionPrompts[a.tool_name] = {
                success_prompt: a.success_prompt,
                failure_prompt: a.failure_prompt,
                before_prompt: a.before_prompt,
                next_action_url: a.next_action_url,
                next_action_label: a.next_action_label,
              };
              // Inject before_prompt as aria description on the element
              if (a.selector && a.before_prompt) {
                try {
                  var el = document.querySelector(a.selector);
                  if (el) {
                    el.setAttribute('aria-description', a.before_prompt);
                    el.setAttribute('data-mcp-hint', a.before_prompt);
                  }
                } catch (err) { }
              }
            });
          }
        } catch (e) { }
      }
    };
    xhr.send(JSON.stringify({
      api_key: API_KEY,
      page_url: window.location.href,
      page_title: document.title,
      actions: actions,
    }));
  }

  // ─── Main Init ────────────────────────────────────────────────────────────
  function init() {
    try {
      // 1. Inject discoverability tags
      injectDiscoverability();

      // 2. Ping immediately — confirms script is installed, regardless of forms found
      post(API_BASE + '/api/ping', {
        api_key: API_KEY,
        page_url: window.location.href,
        script_version: VERSION,
      });

      var allActions = [];

      // 3. Detect native forms
      var forms = document.querySelectorAll('form');
      forms.forEach(function (form) {
        try {
          var fields = extractFields(form);
          var type = guessFormType(form, fields);
          var name = guessFormName(form, type);
          var toolName = toSnakeCase(name) || type;

          var action = {
            type: type,
            name: name,
            tool_name: toolName,
            tool_description: buildDescription(type, name),
            selector: getCssSelector(form),
            fields: fields,
          };

          injectWebMCPOnForm(form, action);
          attachFormTracking(form, toolName);
          allActions.push(action);
        } catch (e) { }
      });

      // 4. Detect third-party widgets
      var widgets = detectThirdPartyWidgets();
      allActions = allActions.concat(widgets);

      // 5. Extract business info
      var businessInfo = extractBusinessInfo();

      // 6. Track page view (agent visit)
      if (detectedAgent) {
        trackEvent('view', 'page_view', {
          agent: detectedAgent,
          actions_found: allActions.length,
          page_title: document.title,
        });
      }

      // 7. Sync detected actions with our API + get prompts back
      // Always sync (even empty) so we can confirm installation on pages without forms
      syncActions(allActions.map(function (a) {
        return Object.assign({}, a, { business_info: businessInfo });
      }));

    } catch (e) {
      // Never break the host page
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also run after dynamic content loads (SPAs)
  if (window.MutationObserver) {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType === 1 && node.querySelector && node.querySelector('form')) {
            // New forms added dynamically — re-scan
            setTimeout(init, 500);
            observer.disconnect();
          }
        });
      });
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

})(window, document);
