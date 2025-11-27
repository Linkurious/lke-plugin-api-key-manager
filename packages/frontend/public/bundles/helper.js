"use strict";
(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/helper.ts
  function expose(obj) {
    if (obj) {
      const dynamicWindow = window;
      for (const [key, value] of Object.entries(obj)) {
        dynamicWindow[key] = value;
      }
    }
    return window;
  }
  function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
  var WaitingMessage = class {
    constructor(container, nestLevel, init) {
      this.nestLevel = nestLevel;
      this.destroyed = false;
      this.data = init;
      const messageContainer = container.querySelector(".messageDisplay");
      this.message = document.createElement("p");
      this.message.classList.add("none");
      messageContainer.appendChild(this.message);
    }
    update(message) {
      if (this.destroyed) {
        throw new Error("Task already completed");
      }
      if (message === "" || message === null || message === void 0) {
        this.message.classList.add("none");
      } else {
        this.message.textContent = message;
        this.message.classList.remove("none");
      }
    }
    destroy() {
      this.message.remove();
      this.destroyed = true;
    }
  };
  var nestedWaitings = 0;
  function startWaiting(hideApp, init) {
    nestedWaitings++;
    const spinner = document.getElementById("spinner");
    if (hideApp) {
      spinner.classList.add("hider");
    }
    spinner.classList.add("show");
    return new WaitingMessage(spinner, nestedWaitings, init);
  }
  function stopWaiting(updater) {
    nestedWaitings--;
    updater.destroy();
    if (nestedWaitings === 0) {
      const spinner = document.getElementById("spinner");
      spinner.classList.remove("hider");
      spinner.classList.remove("show");
    }
  }
  function runLongTask(_0, _1) {
    return __async(this, arguments, function* (init, cb, options = {}) {
      var _a, _b;
      const updater = startWaiting((_a = options.hideApp) != null ? _a : false, init);
      try {
        try {
          return yield Promise.resolve(typeof cb === "function" ? cb(updater) : cb);
        } catch (e) {
          if ((_b = options.defaultErrorHandler) != null ? _b : true) {
            yield showPopin("error", e instanceof Error ? e.toString() : JSON.stringify(e));
          }
          throw e;
        }
      } finally {
        stopWaiting(updater);
      }
    });
  }
  var popinResolvers = void 0;
  function showPopin(style, message, hideApp = false) {
    return new Promise((resolve, reject) => {
      if (popinResolvers) {
        popinResolvers.resolve(false);
      }
      popinResolvers = { resolve, reject };
      const popin = document.getElementById("popin");
      const close = popin.querySelector(".close");
      const titleElement = popin.querySelector(".popinTitle");
      const messageElement = popin.querySelector(".popinMessage");
      titleElement.textContent = style === "info" ? "Information" : "Error";
      messageElement.replaceChildren();
      for (const line of message.split("\n")) {
        const p = document.createElement("p");
        p.textContent = line;
        messageElement.appendChild(p);
      }
      if (hideApp) {
        close.classList.add("none");
        popin.classList.add("hider");
      } else {
        close.classList.remove("none");
        popin.classList.remove("hider");
      }
      popin.classList.add("show");
    });
  }
  function closePopin() {
    var _a;
    (_a = this.closest(".popin")) == null ? void 0 : _a.classList.remove("show");
    if (popinResolvers) {
      popinResolvers.resolve(true);
      popinResolvers = void 0;
    }
  }
  window.addEventListener("load", () => {
    document.querySelectorAll(".popin .close").forEach((p) => p.addEventListener("click", closePopin));
  });
})();
//# sourceMappingURL=helper.js.map
