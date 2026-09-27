import { isValidEmail } from "@/lib/email";
import { format } from "@/lib/typography";

type State = "empty" | "invalid" | "error" | "success" | "already" | "notConfigured";

const TONE: Record<State, "error" | "success" | "info"> = {
  empty: "error",
  invalid: "error",
  error: "error",
  success: "success",
  already: "success",
  notConfigured: "info",
};

/**
 * The beta sign-up form: checks the address, sends it to the configured
 * service and keeps what was typed when anything goes wrong. A success is
 * only shown once the service has answered.
 */
export function initBetaForm(): void {
  const form = document.querySelector<HTMLFormElement>("[data-beta-form]");
  const input = form?.querySelector<HTMLInputElement>("input[type=email]");
  const button = form?.querySelector<HTMLButtonElement>("button[type=submit]");
  const message = form?.querySelector<HTMLElement>("[data-beta-message]");
  if (!form || !input || !button || !message) return;

  const messages = JSON.parse(form.dataset.messages ?? "{}") as Record<State, string>;
  const endpoint = form.dataset.endpoint ?? "";

  const show = (state: State, email = "") => {
    message.textContent = format(messages[state] ?? "", { email });
    message.dataset.tone = TONE[state];
    input.setAttribute("aria-invalid", String(state === "empty" || state === "invalid"));
  };

  const setBusy = (busy: boolean) => {
    button.disabled = busy;
    button.textContent = (busy ? button.dataset.busy : button.dataset.label) ?? "";
  };

  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true" && isValidEmail(input.value)) {
      input.setAttribute("aria-invalid", "false");
      message.textContent = "";
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = input.value.trim();
    if (!email) {
      show("empty");
      input.focus();
      return;
    }
    if (!isValidEmail(email)) {
      show("invalid");
      input.focus();
      return;
    }
    if (!endpoint) {
      show("notConfigured");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.status === 409) show("already", email);
      else if (response.ok) {
        show("success", email);
        form.reset();
      } else show("error");
    } catch {
      show("error");
    } finally {
      setBusy(false);
    }
  });
}
