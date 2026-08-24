(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("preview") !== "1") return;

  document.documentElement.classList.add("is-customer-preview");

  const markLockedControls = () => {
    document
      .querySelectorAll("a, button, input, select, textarea, [role='button'], [tabindex]")
      .forEach((element) => {
        element.setAttribute("aria-disabled", "true");
        element.setAttribute("tabindex", "-1");
      });
  };

  const startLocking = () => {
    markLockedControls();
    window.requestAnimationFrame(markLockedControls);
    window.setTimeout(markLockedControls, 100);
  };

  document.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true
  );

  document.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startLocking, { once: true });
  } else {
    startLocking();
  }
})();
