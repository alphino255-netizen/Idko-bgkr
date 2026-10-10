/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/main/actionview/app/javascript
Released under the MIT license
 */
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, 
  global.Rails = factory());
})(this, (function() {
  "use strict";
  const linkClickSelector = "a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]";
  const buttonClickSelector = {
    selector: "button[data-remote]:not([form]), button[data-confirm]:not([form])",
    exclude: "form button"
  };
  const inputChangeSelector = "select[data-remote], input[data-remote], textarea[data-remote]";
  const formSubmitSelector = "form:not([data-turbo=true])";
  const formInputClickSelector = "form:not([data-turbo=true]) input[type=submit], form:not([data-turbo=true]) input[type=image], form:not([data-turbo=true]) button[type=submit], form:not([data-turbo=true]) button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])";
  const formDisableSelector = "input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled";
  const formEnableSelector = "input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled";
  const fileInputSelector = "input[name][type=file]:not([disabled])";
  const linkDisableSelector = "a[data-disable-with], a[data-disable]";
  const buttonDisableSelector = "button[data-remote][data-disable-with], button[data-remote][data-disable]";
  let nonce = null;
  const loadCSPNonce = () => {
    const metaTag = document.querySelector("meta[name=csp-nonce]");
    return nonce = metaTag && metaTag.content;
  };
  const cspNonce = () => nonce || loadCSPNonce();
  const m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;
  const matches = function(element, selector) {
    if (selector.exclude) {
      return m.call(element, selector.selector) && !m.call(element, selector.exclude);
    } else {
      return m.call(element, selector);
    }
  };
  const EXPANDO = "_ujsData";
  const getData = (element, key) => element[EXPANDO] ? element[EXPANDO][key] : undefined;
  const setData = function(element, key, value) {
    if (!element[EXPANDO]) {
      element[EXPANDO] = {};
    }
    return element[EXPANDO][key] = value;
  };
  const $ = selector => Array.prototype.slice.call(document.querySelectorAll(selector));
  const isContentEditable = function(element) {
    var isEditable = false;
    do {
      if (element.isContentEditable) {
        isEditable = true;
        break;
      }
      element = element.parentElement;
    } while (element);
    return isEditable;
  };
  const csrfToken = () => {
    const meta = document.querySelector("meta[name=csrf-token]");
    return meta && meta.content;
  };
  const csrfParam = () => {
    const meta = document.querySelector("meta[name=csrf-param]");
    return meta && meta.content;
  };
  const CSRFProtection = xhr => {
    const token = csrfToken();
    if (token) {
      return xhr.setRequestHeader("X-CSRF-Token", token);
    }
  };
  const refreshCSRFTokens = () => {
    const token = csrfToken();
    const param = csrfParam();
    if (token && param) {
      return $('form input[name="' + param + '"]').forEach((input => input.value = token));
    }
  };
  const AcceptHeaders = {
    "*": "*/*",
    text: "text/plain",
    html: "text/html",
    xml: "application/xml, text/xml",
    json: "application/json, text/javascript",
    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
  };
  const ajax = options => {
    options = prepareOptions(options);
    var xhr = createXHR(options, (function() {
      const response = processResponse(xhr.response != null ? xhr.response : xhr.responseText, xhr.getResponseHeader("Content-Type"));
      if (Math.floor(xhr.status / 100) === 2) {
        if (typeof options.success === "function") {
          options.success(response, xhr.statusText, xhr);
        }
      } else {
        if (typeof options.error === "function") {
          options.error(response, xhr.statusText, xhr);
        }
      }
      return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : undefined;
    }));
    if (options.beforeSend && !options.beforeSend(xhr, options)) {
      return false;
    }
    if (xhr.readyState === XMLHttpRequest.OPENED) {
      return xhr.send(options.data);
    }
  };
  var prepareOptions = function(options) {
    options.url = options.url || location.href;
    options.type = options.type.toUpperCase();
    if (options.type === "GET" && options.data) {
      if (options.url.indexOf("?") < 0) {
        options.url += "?" + options.data;
      } else {
        options.url += "&" + options.data;
      }
    }
    if (!(options.dataType in AcceptHeaders)) {
      options.dataType = "*";
    }
    options.accept = AcceptHeaders[options.dataType];
    if (options.dataType !== "*") {
      options.accept += ", */*; q=0.01";
    }
    return options;
  };
  var createXHR = function(options, done) {
    const xhr = new XMLHttpRequest;
    xhr.open(options.type, options.url, true);
    xhr.setRequestHeader("Accept", options.accept);
    if (typeof options.data === "string") {
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    }
    if (!options.crossDomain) {
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      CSRFProtection(xhr);
    }
    xhr.withCredentials = !!options.withCredentials;
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        return done(xhr);
      }
    };
    return xhr;
  };
  var processResponse = function(response, type) {
    if (typeof response === "string" && typeof type === "string") {
      if (type.match(/\bjson\b/)) {
        try {
          response = JSON.parse(response);
        } catch (error) {}
      } else if (type.match(/\b(?:java|ecma)script\b/)) {
        const script = document.createElement("script");
        script.setAttribute("nonce", cspNonce());
        script.text = response;
        document.head.appendChild(script).parentNode.removeChild(script);
      } else if (type.match(/\b(xml|html|svg)\b/)) {
        const parser = new DOMParser;
        type = type.replace(/;.+/, "");
        try {
          response = parser.parseFromString(response, type);
        } catch (error1) {}
      }
    }
    return response;
  };
  const href = element => element.href;
  const isCrossDomain = function(url) {
    const originAnchor = document.createElement("a");
    originAnchor.href = location.href;
    const urlAnchor = document.createElement("a");
    try {
      urlAnchor.href = url;
      return !((!urlAnchor.protocol || urlAnchor.protocol === ":") && !urlAnchor.host || originAnchor.protocol + "//" + originAnchor.host === urlAnchor.protocol + "//" + urlAnchor.host);
    } catch (e) {
      return true;
    }
  };
  let preventDefault;
  let {CustomEvent: CustomEvent} = window;
  if (typeof CustomEvent !== "function") {
    CustomEvent = function(event, params) {
      const evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
    CustomEvent.prototype = window.Event.prototype;
    ({preventDefault: preventDefault} = CustomEvent.prototype);
    CustomEvent.prototype.preventDefault = function() {
      const result = preventDefault.call(this);
      if (this.cancelable && !this.defaultPrevented) {
        Object.defineProperty(this, "defaultPrevented", {
          get() {
            return true;
          }
        });
      }
      return result;
    };
  }
  const fire = (obj, name, data) => {
    const event = new CustomEvent(name, {
      bubbles: true,
      cancelable: true,
      detail: data
    });
    obj.dispatchEvent(event);
    return !event.defaultPrevented;
  };
  const stopEverything = e => {
    fire(e.target, "ujs:everythingStopped");
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };
  const delegate = (element, selector, eventType, handler) => element.addEventListener(eventType, (function(e) {
    let {target: target} = e;
    while (!!(target instanceof Element) && !matches(target, selector)) {
      target = target.parentNode;
    }
    if (target instanceof Element && handler.call(target, e) === false) {
      e.preventDefault();
      e.stopPropagation();
    }
  }));
  const toArray = e => Array.prototype.slice.call(e);
  const serializeElement = (element, additionalParam) => {
    let inputs = [ element ];
    if (matches(element, "form")) {
      inputs = toArray(element.elements);
    }
    const params = [];
    inputs.forEach((function(input) {
      if (!input.name || input.disabled) {
        return;
      }
      if (matches(input, "fieldset[disabled] *")) {
        return;
      }
      if (matches(input, "select")) {
        toArray(input.options).forEach((function(option) {
          if (option.selected) {
            params.push({
              name: input.name,
              value: option.value
            });
          }
        }));
      } else if (input.checked || [ "radio", "checkbox", "submit" ].indexOf(input.type) === -1) {
        params.push({
          name: input.name,
          value: input.value
        });
      }
    }));
    if (additionalParam) {
      params.push(additionalParam);
    }
    return params.map((function(param) {
      if (param.name) {
        return `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`;
      } else {
        return param;
      }
    })).join("&");
  };
  const formElements = (form, selector) => {
    if (matches(form, "form")) {
      return toArray(form.elements).filter((el => matches(el, selector)));
    } else {
      return toArray(form.querySelectorAll(selector));
    }
  };
  const handleConfirmWithRails = rails => function(e) {
    if (!allowAction(this, rails)) {
      stopEverything(e);
    }
  };
  const confirm = (message, element) => window.confirm(message);
  var allowAction = function(element, rails) {
    let callback;
    const message = element.getAttribute("data-confirm");
    if (!message) {
      return true;
    }
    let answer = false;
    if (fire(element, "confirm")) {
      try {
        answer = rails.confirm(message, element);
      } catch (error) {}
      callback = fire(element, "confirm:complete", [ answer ]);
    }
    return answer && callback;
  };
  const handleDisabledElement = function(e) {
    const element = this;
    if (element.disabled) {
      stopEverything(e);
    }
  };
  const enableElement = e => {
    let element;
    if (e instanceof Event) {
      if (isXhrRedirect(e)) {
        return;
      }
      element = e.target;
    } else {
      element = e;
    }
    if (isContentEditable(element)) {
      return;
    }
    if (matches(element, linkDisableSelector)) {
      return enableLinkElement(element);
    } else if (matches(element, buttonDisableSelector) || matches(element, formEnableSelector)) {
      return enableFormElement(element);
    } else if (matches(element, formSubmitSelector)) {
      return enableFormElements(element);
    }
  };
  const disableElement = e => {
    const element = e instanceof Event ? e.target : e;
    if (isContentEditable(element)) {
      return;
    }
    if (matches(element, linkDisableSelector)) {
      return disableLinkElement(element);
    } else if (matches(element, buttonDisableSelector) || matches(element, formDisableSelector)) {
      return disableFormElement(element);
    } else if (matches(element, formSubmitSelector)) {
      return disableFormElements(element);
    }
  };
  var disableLinkElement = function(element) {
    if (getData(element, "ujs:disabled")) {
      return;
    }
    const replacement = element.getAttribute("data-disable-with");
    if (replacement != null) {
      setData(element, "ujs:enable-with", element.innerHTML);
      element.innerHTML = replacement;
    }
    element.addEventListener("click", stopEverything);
    return setData(element, "ujs:disabled", true);
  };
  var enableLinkElement = function(element) {
    const originalText = getData(element, "ujs:enable-with");
    if (originalText != null) {
      element.innerHTML = originalText;
      setData(element, "ujs:enable-with", null);
    }
    element.removeEventListener("click", stopEverything);
    return setData(element, "ujs:disabled", null);
  };
  var disableFormElements = form => formElements(form, formDisableSelector).forEach(disableFormElement);
  var disableFormElement = function(element) {
    if (getData(element, "ujs:disabled")) {
      return;
    }
    const replacement = element.getAttribute("data-disable-with");
    if (replacement != null) {
      if (matches(element, "button")) {
        setData(element, "ujs:enable-with", element.innerHTML);
        element.innerHTML = replacement;
      } else {
        setData(element, "ujs:enable-with", element.value);
        element.value = replacement;
      }
    }
    element.disabled = true;
    return setData(element, "ujs:disabled", true);
  };
  var enableFormElements = form => formElements(form, formEnableSelector).forEach((element => enableFormElement(element)));
  var enableFormElement = function(element) {
    const originalText = getData(element, "ujs:enable-with");
    if (originalText != null) {
      if (matches(element, "button")) {
        element.innerHTML = originalText;
      } else {
        element.value = originalText;
      }
      setData(element, "ujs:enable-with", null);
    }
    element.disabled = false;
    return setData(element, "ujs:disabled", null);
  };
  var isXhrRedirect = function(event) {
    const xhr = event.detail ? event.detail[0] : undefined;
    return xhr && xhr.getResponseHeader("X-Xhr-Redirect");
  };
  const handleMethodWithRails = rails => function(e) {
    const link = this;
    const method = link.getAttribute("data-method");
    if (!method) {
      return;
    }
    if (isContentEditable(this)) {
      return;
    }
    const href = rails.href(link);
    const csrfToken$1 = csrfToken();
    const csrfParam$1 = csrfParam();
    const form = document.createElement("form");
    let formContent = `<input name='_method' value='${method}' type='hidden' />`;
    if (csrfParam$1 && csrfToken$1 && !isCrossDomain(href)) {
      formContent += `<input name='${csrfParam$1}' value='${csrfToken$1}' type='hidden' />`;
    }
    formContent += '<input type="submit" />';
    form.method = "post";
    form.action = href;
    form.target = link.target;
    form.innerHTML = formContent;
    form.style.display = "none";
    document.body.appendChild(form);
    form.querySelector('[type="submit"]').click();
    stopEverything(e);
  };
  const isRemote = function(element) {
    const value = element.getAttribute("data-remote");
    return value != null && value !== "false";
  };
  const handleRemoteWithRails = rails => function(e) {
    let data, method, url;
    const element = this;
    if (!isRemote(element)) {
      return true;
    }
    if (!fire(element, "ajax:before")) {
      fire(element, "ajax:stopped");
      return false;
    }
    if (isContentEditable(element)) {
      fire(element, "ajax:stopped");
      return false;
    }
    const withCredentials = element.getAttribute("data-with-credentials");
    const dataType = element.getAttribute("data-type") || "script";
    if (matches(element, formSubmitSelector)) {
      const button = getData(element, "ujs:submit-button");
      method = getData(element, "ujs:submit-button-formmethod") || element.getAttribute("method") || "get";
      url = getData(element, "ujs:submit-button-formaction") || element.getAttribute("action") || location.href;
      if (method.toUpperCase() === "GET") {
        url = url.replace(/\?.*$/, "");
      }
      if (element.enctype === "multipart/form-data") {
        data = new FormData(element);
        if (button != null) {
          data.append(button.name, button.value);
        }
      } else {
        data = serializeElement(element, button);
      }
      setData(element, "ujs:submit-button", null);
      setData(element, "ujs:submit-button-formmethod", null);
      setData(element, "ujs:submit-button-formaction", null);
    } else if (matches(element, buttonClickSelector) || matches(element, inputChangeSelector)) {
      method = element.getAttribute("data-method");
      url = element.getAttribute("data-url");
      data = serializeElement(element, element.getAttribute("data-params"));
    } else {
      method = element.getAttribute("data-method");
      url = rails.href(element);
      data = element.getAttribute("data-params");
    }
    ajax({
      type: method || "GET",
      url: url,
      data: data,
      dataType: dataType,
      beforeSend(xhr, options) {
        if (fire(element, "ajax:beforeSend", [ xhr, options ])) {
          return fire(element, "ajax:send", [ xhr ]);
        } else {
          fire(element, "ajax:stopped");
          return false;
        }
      },
      success(...args) {
        return fire(element, "ajax:success", args);
      },
      error(...args) {
        return fire(element, "ajax:error", args);
      },
      complete(...args) {
        return fire(element, "ajax:complete", args);
      },
      crossDomain: isCrossDomain(url),
      withCredentials: withCredentials != null && withCredentials !== "false"
    });
    stopEverything(e);
  };
  const formSubmitButtonClick = function(e) {
    const button = this;
    const {form: form} = button;
    if (!form) {
      return;
    }
    if (button.name) {
      setData(form, "ujs:submit-button", {
        name: button.name,
        value: button.value
      });
    }
    setData(form, "ujs:formnovalidate-button", button.formNoValidate);
    setData(form, "ujs:submit-button-formaction", button.getAttribute("formaction"));
    return setData(form, "ujs:submit-button-formmethod", button.getAttribute("formmethod"));
  };
  const preventInsignificantClick = function(e) {
    const link = this;
    const method = (link.getAttribute("data-method") || "GET").toUpperCase();
    const data = link.getAttribute("data-params");
    const metaClick = e.metaKey || e.ctrlKey;
    const insignificantMetaClick = metaClick && method === "GET" && !data;
    const nonPrimaryMouseClick = e.button != null && e.button !== 0;
    if (nonPrimaryMouseClick || insignificantMetaClick) {
      e.stopImmediatePropagation();
    }
  };
  const Rails = {
    $: $,
    ajax: ajax,
    buttonClickSelector: buttonClickSelector,
    buttonDisableSelector: buttonDisableSelector,
    confirm: confirm,
    cspNonce: cspNonce,
    csrfToken: csrfToken,
    csrfParam: csrfParam,
    CSRFProtection: CSRFProtection,
    delegate: delegate,
    disableElement: disableElement,
    enableElement: enableElement,
    fileInputSelector: fileInputSelector,
    fire: fire,
    formElements: formElements,
    formEnableSelector: formEnableSelector,
    formDisableSelector: formDisableSelector,
    formInputClickSelector: formInputClickSelector,
    formSubmitButtonClick: formSubmitButtonClick,
    formSubmitSelector: formSubmitSelector,
    getData: getData,
    handleDisabledElement: handleDisabledElement,
    href: href,
    inputChangeSelector: inputChangeSelector,
    isCrossDomain: isCrossDomain,
    linkClickSelector: linkClickSelector,
    linkDisableSelector: linkDisableSelector,
    loadCSPNonce: loadCSPNonce,
    matches: matches,
    preventInsignificantClick: preventInsignificantClick,
    refreshCSRFTokens: refreshCSRFTokens,
    serializeElement: serializeElement,
    setData: setData,
    stopEverything: stopEverything
  };
  const handleConfirm = handleConfirmWithRails(Rails);
  Rails.handleConfirm = handleConfirm;
  const handleMethod = handleMethodWithRails(Rails);
  Rails.handleMethod = handleMethod;
  const handleRemote = handleRemoteWithRails(Rails);
  Rails.handleRemote = handleRemote;
  const start = function() {
    if (window._rails_loaded) {
      throw new Error("rails-ujs has already been loaded!");
    }
    window.addEventListener("pageshow", (function() {
      $(formEnableSelector).forEach((function(el) {
        if (getData(el, "ujs:disabled")) {
          enableElement(el);
        }
      }));
      $(linkDisableSelector).forEach((function(el) {
        if (getData(el, "ujs:disabled")) {
          enableElement(el);
        }
      }));
    }));
    delegate(document, linkDisableSelector, "ajax:complete", enableElement);
    delegate(document, linkDisableSelector, "ajax:stopped", enableElement);
    delegate(document, buttonDisableSelector, "ajax:complete", enableElement);
    delegate(document, buttonDisableSelector, "ajax:stopped", enableElement);
    delegate(document, linkClickSelector, "click", preventInsignificantClick);
    delegate(document, linkClickSelector, "click", handleDisabledElement);
    delegate(document, linkClickSelector, "click", handleConfirm);
    delegate(document, linkClickSelector, "click", disableElement);
    delegate(document, linkClickSelector, "click", handleRemote);
    delegate(document, linkClickSelector, "click", handleMethod);
    delegate(document, buttonClickSelector, "click", preventInsignificantClick);
    delegate(document, buttonClickSelector, "click", handleDisabledElement);
    delegate(document, buttonClickSelector, "click", handleConfirm);
    delegate(document, buttonClickSelector, "click", disableElement);
    delegate(document, buttonClickSelector, "click", handleRemote);
    delegate(document, inputChangeSelector, "change", handleDisabledElement);
    delegate(document, inputChangeSelector, "change", handleConfirm);
    delegate(document, inputChangeSelector, "change", handleRemote);
    delegate(document, formSubmitSelector, "submit", handleDisabledElement);
    delegate(document, formSubmitSelector, "submit", handleConfirm);
    delegate(document, formSubmitSelector, "submit", handleRemote);
    delegate(document, formSubmitSelector, "submit", (e => setTimeout((() => disableElement(e)), 13)));
    delegate(document, formSubmitSelector, "ajax:send", disableElement);
    delegate(document, formSubmitSelector, "ajax:complete", enableElement);
    delegate(document, formInputClickSelector, "click", preventInsignificantClick);
    delegate(document, formInputClickSelector, "click", handleDisabledElement);
    delegate(document, formInputClickSelector, "click", handleConfirm);
    delegate(document, formInputClickSelector, "click", formSubmitButtonClick);
    document.addEventListener("DOMContentLoaded", refreshCSRFTokens);
    document.addEventListener("DOMContentLoaded", loadCSPNonce);
    return window._rails_loaded = true;
  };
  Rails.start = start;
  if (typeof jQuery !== "undefined" && jQuery && jQuery.ajax) {
    if (jQuery.rails) {
      throw new Error("If you load both jquery_ujs and rails-ujs, use rails-ujs only.");
    }
    jQuery.rails = Rails;
    jQuery.ajaxPrefilter((function(options, originalOptions, xhr) {
      if (!options.crossDomain) {
        return CSRFProtection(xhr);
      }
    }));
  }
  if (typeof exports !== "object" && typeof module === "undefined") {
    window.Rails = Rails;
    if (fire(document, "rails:attachBindings")) {
      start();
    }
  }
  return Rails;
}));
(function () {
  'use strict';

  var sweetAlertScriptPromise = null;

  function swalTokens() {
    return {
      modalBg: '#ffffff',
      modalBorder: '#c5d0df',
      modalText: '#1f2937',
      modalTitle: '#111827',
      modalShadow: '0 20px 46px rgba(15, 23, 42, 0.24)',
      overlay: 'rgba(15, 23, 42, 0.4)',
      closeColor: '#4b5563'
    };
  }

  function applySwalChrome(SwalInstance, theme) {
    var popup = SwalInstance.getPopup();
    if (popup) {
      popup.style.border = '1px solid ' + theme.modalBorder;
      popup.style.borderRadius = '1rem';
      popup.style.boxShadow = theme.modalShadow;
    }

    var title = SwalInstance.getTitle();
    if (title) title.style.color = theme.modalTitle;

    var closeButton = SwalInstance.getCloseButton();
    if (closeButton) {
      closeButton.style.color = theme.closeColor;
      closeButton.style.border = '0';
      closeButton.style.background = 'transparent';
      closeButton.style.boxShadow = 'none';
      closeButton.style.opacity = '1';
    }
  }

  window.loadSweetAlertScript = function () {
    if (window.Swal && typeof window.Swal.fire === 'function') return Promise.resolve(window.Swal);
    if (sweetAlertScriptPromise) return sweetAlertScriptPromise;

    sweetAlertScriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
      script.async = true;
      script.defer = true;
      script.onload = function () {
        if (window.Swal && typeof window.Swal.fire === 'function') return resolve(window.Swal);
        sweetAlertScriptPromise = null;
        reject(new Error('SweetAlert2 did not initialize'));
      };
      script.onerror = function () {
        sweetAlertScriptPromise = null;
        reject(new Error('SweetAlert2 failed to load'));
      };
      document.head.appendChild(script);
    });

    return sweetAlertScriptPromise;
  };

  window.themedSwalFire = function (options) {
    var settings = options || {};
    return window.loadSweetAlertScript().then(function (SwalInstance) {
      var theme = swalTokens();
      var originalDidOpen = typeof settings.didOpen === 'function' ? settings.didOpen : null;
      var themedOptions = Object.assign({
        background: theme.modalBg,
        color: theme.modalText,
        backdrop: theme.overlay
      }, settings, {
        didOpen: function (popupElement) {
          applySwalChrome(SwalInstance, theme);
          if (originalDidOpen) originalDidOpen(popupElement);
        }
      });
      return SwalInstance.fire(themedOptions);
    });
  };

  window.publicPageJsonRequest = function (input, init, options) {
    var requestInit = Object.assign({}, init || {});
    var settings = Object.assign({
      maxAttempts: 2,
      retryDelayMs: 350,
      retryableStatuses: [408, 429, 500, 502, 503, 504],
      csrfRefreshPath: '/-/csrf-token',
      retryAbortErrors: true,
      timeoutMs: 0
    }, options || {});
    var maxAttempts = Math.max(1, parseInt(settings.maxAttempts, 10) || 1);
    var retryDelayMs = Math.max(0, parseInt(settings.retryDelayMs, 10) || 0);
    var timeoutMs = Math.max(0, parseInt(settings.timeoutMs, 10) || 0);
    var retryableStatuses = Array.isArray(settings.retryableStatuses) ? settings.retryableStatuses : [];
    var csrfRefreshAttempted = false;
    var attempt = 0;

    function wait(delay) {
      return new Promise(function (resolve) { window.setTimeout(resolve, Math.max(0, delay || 0)); });
    }

    function requestMethod() {
      return String(requestInit.method || (input && input.method) || 'GET').toUpperCase();
    }

    function requestUrl() {
      if (typeof input === 'string') return input;
      return input && input.url ? input.url : String(input || '');
    }

    function requestHeaders() {
      if (!(requestInit.headers instanceof Headers)) requestInit.headers = new Headers(requestInit.headers || {});
      return requestInit.headers;
    }

    function formToken() {
      var form = settings.form;
      var tokenInput = form && typeof form.querySelector === 'function' ? form.querySelector('input[name="authenticity_token"]') : null;
      return tokenInput && tokenInput.value ? tokenInput.value : '';
    }

    function bodyToken() {
      var body = requestInit.body;
      if (typeof FormData !== 'undefined' && body instanceof FormData) return body.get('authenticity_token') || '';
      if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return body.get('authenticity_token') || '';
      return '';
    }

    function resolvedCsrfToken() {
      var meta = document.querySelector('meta[name="csrf-token"]');
      return String(settings.csrfToken || requestHeaders().get('X-CSRF-Token') || (meta && meta.content) || formToken() || bodyToken() || '');
    }

    function applyCsrfToken(token) {
      var value = token && String(token).trim();
      if (value) requestHeaders().set('X-CSRF-Token', value);
    }

    function syncCsrfToken(token) {
      var value = token && String(token).trim();
      if (!value) return;
      settings.csrfToken = value;
      applyCsrfToken(value);
      var form = settings.form;
      var tokenInput = form && typeof form.querySelector === 'function' ? form.querySelector('input[name="authenticity_token"]') : null;
      if (tokenInput) tokenInput.value = value;
      if (typeof FormData !== 'undefined' && requestInit.body instanceof FormData) requestInit.body.set('authenticity_token', value);
      if (typeof URLSearchParams !== 'undefined' && requestInit.body instanceof URLSearchParams) requestInit.body.set('authenticity_token', value);
    }

    function retryDelay(response) {
      var retryAfter = response && response.headers ? response.headers.get('Retry-After') : null;
      if (!retryAfter) return retryDelayMs;
      var seconds = Number(retryAfter);
      if (Number.isFinite(seconds) && seconds >= 0) return Math.max(retryDelayMs, Math.ceil(seconds * 1000));
      var retryAt = Date.parse(retryAfter);
      return Number.isFinite(retryAt) ? Math.max(retryDelayMs, retryAt - Date.now()) : retryDelayMs;
    }

    function retryableResponse(response, payload) {
      return response && !response.ok && ((payload && payload.retryable === true) || retryableStatuses.indexOf(response.status) >= 0);
    }

    function retryableError(error) {
      if (error && error.name === 'AbortError') return settings.retryAbortErrors !== false;
      return /abort|timeout|timed out|network|failed to fetch|load failed|connection reset|connection refused/i.test(error && error.message ? String(error.message) : '');
    }

    function csrfExpired(response, payload) {
      if (!response || (response.status !== 419 && response.status !== 422) || !payload) return false;
      var code = payload.error_code && String(payload.error_code).trim().toUpperCase();
      return payload.csrf_expired === true || code === 'CSRF_EXPIRED' || code === 'PUB-002';
    }

    function freshCsrfToken() {
      if (settings.csrfRefresh === false || typeof window.fetch !== 'function') return Promise.resolve('');
      var targetUrl = new URL(requestUrl(), window.location.origin);
      var refreshUrl = new URL(settings.csrfRefreshPath, window.location.origin);
      refreshUrl.searchParams.set('path', targetUrl.pathname);
      refreshUrl.searchParams.set('method', requestMethod());
      return window.fetch(refreshUrl.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
        cache: 'no-store'
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (payload) {
          return response.ok ? (payload.csrf_token || '') : '';
        });
      }).catch(function () { return ''; });
    }

    function performRequest() {
      attempt += 1;
      applyCsrfToken(resolvedCsrfToken());
      var attemptInit = Object.assign({}, requestInit);
      var timeoutId = null;
      if (timeoutMs > 0 && typeof window.AbortController === 'function' && !attemptInit.signal) {
        var controller = new window.AbortController();
        attemptInit.signal = controller.signal;
        timeoutId = window.setTimeout(function () { controller.abort(); }, timeoutMs);
      }
      function clearTimeoutIfNeeded() {
        if (timeoutId !== null) window.clearTimeout(timeoutId);
      }

      return window.fetch(input, attemptInit).then(function (response) {
        return response.clone().json().catch(function () { return {}; }).then(function (payload) {
          clearTimeoutIfNeeded();
          if (!csrfRefreshAttempted && csrfExpired(response, payload)) {
            csrfRefreshAttempted = true;
            return freshCsrfToken().then(function (token) {
              if (!token) return { response: response, payload: payload, attempt: attempt };
              syncCsrfToken(token);
              return performRequest();
            });
          }
          if (attempt < maxAttempts && retryableResponse(response, payload)) return wait(retryDelay(response)).then(performRequest);
          return { response: response, payload: payload, attempt: attempt };
        });
      }).catch(function (error) {
        clearTimeoutIfNeeded();
        if (attempt < maxAttempts && retryableError(error)) return wait(retryDelayMs).then(performRequest);
        throw error;
      });
    }

    return performRequest();
  };
})();
(function () {
  'use strict';

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var STORAGE_KEY = 'chipmunk_website_analytics_context_v1';
  var COLLECTOR_BATCH_SIZE = 20;
  var collectorQueue = [];
  var collectorFlushScheduled = false;

  function body() {
    return document.body;
  }

  function configuration() {
    var element = body();
    if (!element || !element.dataset.analyticsMerchantId) return null;

    return {
      merchantId: element.dataset.analyticsMerchantId,
      hubMerchantId: element.dataset.analyticsHubMerchantId,
      googleTagId: element.dataset.analyticsGoogleTagId,
      gtmContainerId: element.dataset.analyticsGtmContainerId,
      channel: element.dataset.analyticsChannel,
      endpoint: element.dataset.analyticsEndpoint || '/-/website-events'
    };
  }

  function safeStorage() {
    try {
      return window.sessionStorage;
    } catch (_error) {
      return null;
    }
  }

  function readStoredContext() {
    var storage = safeStorage();
    if (!storage) return {};

    try {
      return JSON.parse(storage.getItem(STORAGE_KEY) || '{}') || {};
    } catch (_error) {
      return {};
    }
  }

  function captureCampaignContext() {
    var stored = readStoredContext();
    var search = new URLSearchParams(window.location.search || '');
    UTM_KEYS.forEach(function (key) {
      var value = search.get(key);
      if (value) stored[key] = String(value).slice(0, 255);
    });
    if (!stored.referrer && document.referrer) stored.referrer = document.referrer.slice(0, 1000);

    var storage = safeStorage();
    if (storage) {
      try { storage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch (_error) {}
    }
    return stored;
  }

  function sanitizedUrl(value) {
    if (!value) return '';
    try {
      var url = new URL(value, window.location.origin);
      return (url.origin + url.pathname).slice(0, 2000);
    } catch (_error) {
      return '';
    }
  }

  function cookieValue(name) {
    var prefix = name + '=';
    var match = document.cookie.split(';').map(function (part) { return part.trim(); }).find(function (part) {
      return part.indexOf(prefix) === 0;
    });
    return match ? decodeURIComponent(match.slice(prefix.length)) : '';
  }

  function gaClientId() {
    var value = cookieValue('_ga');
    var parts = value.split('.');
    return parts.length >= 4 ? parts.slice(-2).join('.') : '';
  }

  function gaSessionId(config) {
    if (!config || !config.googleTagId) return '';
    var suffix = config.googleTagId.replace(/^(G|GT)-/i, '').replace(/[^A-Z0-9]/gi, '');
    var value = cookieValue('_ga_' + suffix);
    var match = value.match(/(?:^|\.)s?(\d{8,})(?:\.|$)/);
    return match ? match[1] : '';
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'evt-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function analyticsContext() {
    var config = configuration();
    var campaign = captureCampaignContext();
    var context = {
      ga_client_id: gaClientId(),
      ga_session_id: gaSessionId(config),
      source_host: window.location.host,
      source_path: window.location.pathname,
      source_url: sanitizedUrl(window.location.href),
      referrer: sanitizedUrl(campaign.referrer || document.referrer)
    };
    UTM_KEYS.forEach(function (key) { if (campaign[key]) context[key] = campaign[key]; });
    return context;
  }

  function compact(object) {
    var result = {};
    Object.keys(object || {}).forEach(function (key) {
      var value = object[key];
      if (value !== null && typeof value !== 'undefined' && value !== '') result[key] = value;
    });
    return result;
  }

  function dispatchToBrowserChannel(config, eventName, eventId, attributes) {
    window.dataLayer = window.dataLayer || [];
    var browserAttributes = Object.assign({}, attributes && attributes.payload ? attributes.payload : {}, attributes || {});
    delete browserAttributes.payload;
    var eventPayload = compact(Object.assign({}, browserAttributes, { event: eventName, event_id: eventId }));
    window.dataLayer.push(eventPayload);

    if (config.channel === 'google_tag' && typeof window.gtag === 'function') {
      var gtagPayload = Object.assign({}, eventPayload);
      delete gtagPayload.event;
      window.gtag('event', eventName, gtagPayload);
    }
  }

  function sendToCollector(config, payloads) {
    var body = payloads.length === 1 ? payloads[0] : { events: payloads };
    var json = JSON.stringify(body);
    if (navigator.sendBeacon) {
      var accepted = navigator.sendBeacon(config.endpoint, new Blob([json], { type: 'application/json' }));
      if (accepted) return;
    }
    window.fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      keepalive: true,
      body: json
    }).catch(function () {});
  }

  function flushCollectorQueue() {
    collectorFlushScheduled = false;
    if (!collectorQueue.length) return;

    var entries = collectorQueue.splice(0, COLLECTOR_BATCH_SIZE);
    sendToCollector(entries[0].config, entries.map(function (entry) { return entry.payload; }));
    if (collectorQueue.length) scheduleCollectorFlush();
  }

  function scheduleCollectorFlush() {
    if (collectorFlushScheduled) return;
    collectorFlushScheduled = true;

    if (typeof window.queueMicrotask === 'function') {
      window.queueMicrotask(flushCollectorQueue);
    } else {
      Promise.resolve().then(flushCollectorQueue);
    }
  }

  function dispatchToCollector(config, payload) {
    collectorQueue.push({ config: config, payload: payload });
    if (collectorQueue.length >= COLLECTOR_BATCH_SIZE) {
      flushCollectorQueue();
    } else {
      scheduleCollectorFlush();
    }
  }

  function trackEvent(eventName, attributes) {
    var config = configuration();
    if (!config || !eventName) return null;

    var data = Object.assign({}, attributes || {});
    var eventId = data.event_id || uuid();
    delete data.event_id;
    var payload = compact(Object.assign({}, analyticsContext(), data, {
      merchant_id: data.merchant_id || config.merchantId,
      event_name: eventName,
      event_id: eventId,
      occurred_at: new Date().toISOString(),
      payload: data.payload || {}
    }));
    delete payload.hub_merchant_id;
    dispatchToBrowserChannel(config, eventName, eventId, data);
    dispatchToCollector(config, payload);
    return eventId;
  }

  function trackOnce(key, eventName, attributes) {
    var marker = 'chipmunk_analytics_once:' + key;
    var storage = safeStorage();
    if (storage && storage.getItem(marker)) return null;
    if (storage) storage.setItem(marker, '1');
    return trackEvent(eventName, attributes);
  }

  function refreshContextInputs(root) {
    (root || document).querySelectorAll('input[name="website_analytics_context"], input[data-website-analytics-context]').forEach(function (input) {
      input.value = JSON.stringify(analyticsContext());
    });
  }

  function bindDeclarativeEvents(root) {
    (root || document).querySelectorAll('script[data-website-analytics-event]').forEach(function (element) {
      if (element.dataset.analyticsProcessed === '1') return;
      element.dataset.analyticsProcessed = '1';
      try {
        var data = JSON.parse(element.textContent || '{}');
        var eventName = data.event_name;
        delete data.event_name;
        trackOnce('page:' + eventName + ':' + window.location.pathname + ':' + (data.merchant_id || ''), eventName, data);
      } catch (_error) {}
    });
  }

  function bindClicks(root) {
    var scope = root || document;
    if (scope.documentElement && scope.documentElement.dataset.websiteAnalyticsClicksBound === '1') return;
    if (scope.documentElement) scope.documentElement.dataset.websiteAnalyticsClicksBound = '1';

    scope.addEventListener('click', function (event) {
      var gameLink = event.target.closest('[data-analytics-select-game]');
      if (gameLink) {
        trackEvent('select_game', {
          merchant_id: gameLink.dataset.analyticsMerchantId,
          flow: 'hub',
          item_id: gameLink.dataset.analyticsGameId,
          item_name: gameLink.dataset.analyticsGameName,
          item_category: 'game'
        });
      }

      var product = event.target.closest('[data-type-two-product]');
      if (product) {
        var productData = {
          flow: 'topup',
          item_id: product.dataset.analyticsItemId || product.dataset.packageCode,
          item_name: product.dataset.analyticsItemName || product.dataset.packageName,
          item_category: product.dataset.analyticsItemCategory || 'topup',
          value: product.dataset.analyticsValue,
          currency: product.dataset.analyticsCurrency || 'IDR',
          payload: { quantity: 1 }
        };
        trackEvent('select_item', productData);
        trackEvent('add_to_cart', productData);
      }
    });
  }

  function bindTopUpMilestones(root) {
    var scope = root || document;
    var form = scope.getElementById ? scope.getElementById('landingTypeTwoForm') : null;
    if (!form || form.dataset.websiteAnalyticsMilestonesBound === '1') return;
    form.dataset.websiteAnalyticsMilestonesBound = '1';

    var playerId = form.querySelector('[name="player_id"]');
    if (playerId) {
      playerId.addEventListener('blur', function () {
        if (!playerId.value.trim()) return;
        trackOnce('topup_player_id:' + window.location.pathname, 'input_player_id', {
          flow: 'topup',
          payload: { field_completed: true }
        });
      });
    }

    var phone = form.querySelector('[name="phone"]');
    if (phone) {
      phone.addEventListener('blur', function () {
        if (!phone.value.trim()) return;
        trackOnce('topup_contact:' + window.location.pathname, 'add_contact_info', {
          flow: 'topup',
          payload: { contact_method: 'whatsapp' }
        });
      });
    }
  }

  function initialize() {
    if (!configuration()) return;
    captureCampaignContext();
    refreshContextInputs(document);
    bindDeclarativeEvents(document);
    bindClicks(document);
    bindTopUpMilestones(document);
    document.querySelectorAll('form').forEach(function (form) {
      if (form.dataset.websiteAnalyticsContextBound === '1') return;
      form.dataset.websiteAnalyticsContextBound = '1';
      form.addEventListener('submit', function () { refreshContextInputs(form); });
    });
  }

  window.chipmunkTrackEvent = trackEvent;
  window.chipmunkTrackEventOnce = trackOnce;
  window.chipmunkAnalyticsContext = analyticsContext;
  window.chipmunkRefreshAnalyticsContext = refreshContextInputs;
  window.addEventListener('pagehide', flushCollectorQueue);
  document.addEventListener('DOMContentLoaded', initialize);
  document.addEventListener('turbolinks:load', initialize);
})();
(function () {
  'use strict';

  var cleanup = function () {};

  function initialize() {
    cleanup();
    var cards = Array.from(document.querySelectorAll('[data-domain-hub-parallax="1"]'));
    if (!cards.length || !window.matchMedia || !window.requestAnimationFrame) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var coarsePointer = window.matchMedia('(pointer: coarse)');
    var removers = [];
    var frame = null;
    var baseline = null;
    var listening = false;
    var disposed = false;
    var permissionRequested = false;
    var states = cards.map(function (card) {
      return { card: card, x: 0, y: 0, targetX: 0, targetY: 0 };
    });

    function listen(target, event, handler) {
      target.addEventListener(event, handler, { passive: true });
      removers.push(function () { target.removeEventListener(event, handler); });
    }

    function clamp(value) { return Math.max(-1, Math.min(1, value)); }

    function paint(state) {
      state.card.style.setProperty('--hub-parallax-bg-x', (state.x * 11).toFixed(2) + 'px');
      state.card.style.setProperty('--hub-parallax-bg-y', (state.y * 11).toFixed(2) + 'px');
      state.card.style.setProperty('--hub-parallax-fg-x', (state.x * 5).toFixed(2) + 'px');
      state.card.style.setProperty('--hub-parallax-fg-y', (state.y * 5).toFixed(2) + 'px');
    }

    function animate() {
      frame = null;
      var moving = false;
      states.forEach(function (state) {
        state.x += (state.targetX - state.x) * 0.16;
        state.y += (state.targetY - state.y) * 0.16;
        if (Math.abs(state.targetX - state.x) + Math.abs(state.targetY - state.y) < 0.002) {
          state.x = state.targetX;
          state.y = state.targetY;
        } else {
          moving = true;
        }
        paint(state);
      });
      if (moving) frame = window.requestAnimationFrame(animate);
    }

    function schedule() {
      if (frame === null && !disposed && !document.hidden && !reducedMotion.matches) {
        frame = window.requestAnimationFrame(animate);
      }
    }

    function reset() {
      baseline = null;
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      states.forEach(function (state) {
        state.x = state.y = state.targetX = state.targetY = 0;
        paint(state);
      });
    }

    // Use the viewport so every enabled card responds even outside its bounds.
    listen(document, 'pointermove', function (event) {
      if (event.pointerType !== 'mouse' || reducedMotion.matches || document.hidden) return;
      if (!window.innerWidth || !window.innerHeight) return;
      var x = clamp(event.clientX / window.innerWidth * 2 - 1);
      var y = clamp(event.clientY / window.innerHeight * 2 - 1);
      states.forEach(function (state) { state.targetX = x; state.targetY = y; });
      schedule();
    });
    listen(document, 'pointerleave', function (event) {
      if (event.pointerType !== 'mouse') return;
      states.forEach(function (state) { state.targetX = state.targetY = 0; });
      schedule();
    });

    function orientation(event) {
      if (document.hidden || reducedMotion.matches || !coarsePointer.matches) return;
      if (!Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
      // Calibrate to the user's current grip and rotate the axes with the screen.
      var angle = window.screen && window.screen.orientation ? window.screen.orientation.angle : (window.orientation || 0);
      if (!baseline || baseline.angle !== angle) {
        baseline = { beta: event.beta, gamma: event.gamma, angle: angle };
      }
      var beta = ((event.beta - baseline.beta + 540) % 360) - 180;
      var gamma = event.gamma - baseline.gamma;
      var radians = angle * Math.PI / 180;
      var x = clamp((gamma * Math.cos(radians) + beta * Math.sin(radians)) / 22);
      var y = clamp((beta * Math.cos(radians) - gamma * Math.sin(radians)) / 22);
      states.forEach(function (state) { state.targetX = x; state.targetY = y; });
      schedule();
    }

    function startOrientation() {
      if (listening || disposed) return;
      listening = true;
      listen(window, 'deviceorientation', orientation);
    }

    var sensor = window.DeviceOrientationEvent;
    var needsPermission = sensor && typeof sensor.requestPermission === 'function';
    if (sensor && window.isSecureContext && coarsePointer.matches) {
      if (needsPermission) {
        // Browsers that require motion permission only allow this call during
        // a user gesture. Ask on the first tap without adding a page button.
        listen(document, 'click', function () {
          if (permissionRequested || reducedMotion.matches || document.hidden) return;
          permissionRequested = true;
          try {
            Promise.resolve(sensor.requestPermission()).then(function (result) {
              if (disposed) return;
              if (result === 'granted') startOrientation();
            }).catch(function () {});
          } catch (_error) {
            // Keep the page usable if the browser rejects sensor permission.
          }
        });
      } else {
        startOrientation();
      }
    }

    function motionPreferenceChanged() {
      reset();
    }

    listen(document, 'visibilitychange', reset);
    listen(window, 'blur', reset);
    listen(window, 'orientationchange', reset);
    if (reducedMotion.addEventListener) listen(reducedMotion, 'change', motionPreferenceChanged);
    cleanup = function () {
      disposed = true;
      reset();
      removers.forEach(function (remove) { remove(); });
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
  window.addEventListener('pagehide', function () { cleanup(); });
  window.addEventListener('pageshow', function (event) { if (event.persisted) initialize(); });
})();
// Lightweight runtime for Hub, Royal Dream, and Higgs public pages.
// Keep operational editors, Action Cable, and backoffice helpers out of this bundle.
//



;
