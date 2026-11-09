import type {
  ICreateApplicationParams,
  IUpdateApplicationParams,
} from "@linkurious/rest-client";
import { ApiRight, RestClient } from "@linkurious/rest-client";

import { deleteApplication, parseLinkuriousAPI } from "../../shared";

import * as helper from "./helper";

declare global {
  interface Window {
    restClient: RestClient;
  }
}

type RightsMap = {
  [key: string]: {
    counter: number;
    actions: string[];
  };
};

type GroupsMap = {
  datasources: {
    name: string;
    sourcekey: string;
    connected: boolean;
    groups: {
      name: string;
      id: number;
    }[];
  }[];
  groups: string[];
  admin_group: number;
};

type ApplicationGroup = {
  name: string;
  id: number;
  sourceKey?: string;
};

type ApplicationRightsMap = Record<
  string,
  {
    counter: number;
    actions: string[];
  }
>;

type ApplicationItem = {
  id: number;
  name: string;
  enabled: boolean;
  apiKey?: string;
  hint?: string;
  groups?: ApplicationGroup[];
  rights?: ApplicationRightsMap;
};

const API_KEY_LENGTH = 32;

let groupsMap: GroupsMap;
let unrenderedRights: ApiRight[] = [];
let applicationToDeleteId: number | undefined;

function closePopup(this: HTMLDivElement) {
  this.closest(".popin")?.classList.remove("show");
}

function showCreatedApplicationKey(apiKey: string) {
  void helper.showPopin("info", "", false, "API Key created successfully");

  const message = document.querySelector("#popin .popinMessage");
  const messageText = document.createElement("p");
  messageText.append("Copy the code below and save it securely.");
  messageText.appendChild(document.createElement("br"));
  const importantText = document.createElement("strong");
  importantText.textContent =
    "Important: This code will only be displayed once and cannot be retrieved later.";
  messageText.appendChild(importantText);
  message?.replaceChildren(messageText);

  const closeButton = document.querySelector("#popin .close");
  const copyWarning = document.createElement("p");
  copyWarning.className = "copy-required-error";
  copyWarning.setAttribute("role", "alert");
  copyWarning.textContent = "Copy the API key before closing this window.";

  let hasCopiedKey = false;
  const preventCloseBeforeCopy = (event: Event) => {
    if (hasCopiedKey) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    copyWarning.classList.add("show");
  };
  closeButton?.addEventListener("click", preventCloseBeforeCopy, true);

  const keyContainer = document.createElement("div");
  keyContainer.className = "created-key-container";
  keyContainer.appendChild(
    createMaskedKeyButton(apiKey, () => {
      hasCopiedKey = true;
      copyWarning.classList.remove("show");
      closeButton?.removeEventListener("click", preventCloseBeforeCopy, true);
    }),
  );
  message?.appendChild(keyContainer);
  message?.appendChild(copyWarning);
}

function createMaskedKeyButton(
  apiKey: string,
  onCopied: () => void,
): HTMLButtonElement {
  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.classList.add("button", "created-key-button");
  copyButton.textContent = apiKey;
  copyButton.title = "Copy API key";
  copyButton.setAttribute("aria-label", "Copy newly created API key");
  maskKey(copyButton, onCopied);

  return copyButton;
}

function addKey() {
  void helper.runLongTask(
    null,
    async () => {
      const addKeyForm = document.getElementById(
        "addKeyForm",
      ) as HTMLFormElement;
      const mode = addKeyForm.getAttribute("mode") || "create";

      if (addKeyForm.reportValidity()) {
        const name = document.getElementById("keyName") as HTMLInputElement;
        const enabled = document.getElementById(
          "enableKey",
        ) as HTMLInputElement;
        const tagContainer = document.getElementById(
          "tagContainer",
        ) as HTMLDivElement;

        const tags = Array.from(
          tagContainer.querySelectorAll(".tag"),
        ) as HTMLDivElement[];
        const includeAdminSwitch = document.getElementById(
          "includeAdmin",
        ) as HTMLInputElement;

        const groups: number[] = [];

        if (includeAdminSwitch.checked) {
          groups.push(groupsMap.admin_group);
        }

        for (const tag of tags) {
          const groupId = tag.getAttribute("group-id");
          if (groupId) {
            groups.push(parseInt(groupId));
          }
        }

        const rights = getSelectedAccessRights();

        const errorBox = document.getElementById("errorBox") as HTMLDivElement;
        const errorTitle = document.getElementById(
          "errorTitle",
        ) as HTMLHeadingElement;
        const errorMessage = document.getElementById(
          "errorMessage",
        ) as HTMLParagraphElement;

        try {
          if (mode === "create") {
            const body: ICreateApplicationParams = {
              name: name.value,
              rights: rights,
              groups: groups,
              enabled: enabled.checked,
            };

            await parseLinkuriousAPI(
              window.restClient.application.createApplication(body),
              async (application) => {
                errorBox.classList.remove("show");
                errorTitle.textContent = "";
                errorMessage.textContent = "";

                // resetting the key table
                const table = document.querySelector(
                  "#keysTable tbody",
                )! as HTMLTableElement;
                table.innerHTML = "";
                await refreshKeysTable();
                // closing the formPopup
                closePopup.call(name.parentElement as HTMLDivElement);

                showCreatedApplicationKey(application.apiKey);
              },
              async (e) => {
                errorBox.classList.add("show");
                errorTitle.textContent = "Error";
                errorMessage.textContent = e.body.message;
              },
            );
          } else if (mode === "update") {
            const body: IUpdateApplicationParams = {
              id: parseInt(addKeyForm.getAttribute("key-id") || "0"),
              name: name.value,
              rights: rights,
              groups: groups,
              enabled: enabled.checked,
            };

            await parseLinkuriousAPI(
              window.restClient.application.updateApplication(body),
              async () => {
                errorBox.classList.remove("show");
                errorTitle.textContent = "";
                errorMessage.textContent = "";

                // resetting the key table
                const table = document.querySelector(
                  "#keysTable tbody",
                )! as HTMLTableElement;
                table.innerHTML = "";
                await refreshKeysTable();
                // closing the formPopup
                closePopup.call(name.parentElement as HTMLDivElement);

                void helper.showPopin("info", "API Key updated successfully");
              },
              async (e) => {
                errorBox.classList.add("show");
                errorTitle.textContent = "Error";
                errorMessage.textContent = e.body.message;
              },
            );
          }
        } catch (e) {
          errorBox.classList.add("show");
          errorTitle.textContent = "Error";
          errorMessage.textContent = (e as Error).message;
        }
      }
    },
    { defaultErrorHandler: true },
  );
}

function addGroup() {
  const addGroupsForm = document.getElementById(
    "addGroupsForm",
  ) as HTMLFormElement;
  if (addGroupsForm.reportValidity()) {
    const container = document.getElementById("tagContainer") as HTMLDivElement;
    const groupSelect = document.getElementById(
      "groupSelect",
    ) as HTMLSelectElement;
    const datasource = document.getElementById(
      "datasourceSelect",
    ) as HTMLSelectElement;

    const tag = document.createElement("div");
    tag.classList.add("tag");
    tag.setAttribute("group-id", groupSelect.getAttribute("group-id") || "");

    const tagText = document.createElement("div");
    tagText.classList.add("tagText");

    const tagClose = document.createElement("a");
    tagClose.classList.add("tagClose");

    tag.appendChild(tagText);
    tag.appendChild(tagClose);

    tagClose.onclick = () => {
      tag.remove();
    };

    tagText.textContent = `${groupSelect.value} (${datasource.value})`;

    groupSelect.innerHTML =
      '<option value="" disabled selected>Select a Group</option>';
    groupSelect.selectedIndex = 0;
    datasource.selectedIndex = 0;

    container.appendChild(tag);
  }
}

async function showFullpagePopup(mode = "create", blockApp = false) {
  const popup = document.getElementById("createView") as HTMLDivElement;
  const close = popup.querySelector(".close") as HTMLAnchorElement;
  const title = document.getElementById("popinTitle") as HTMLHeadingElement;

  const addButton = document.getElementById("addApiKey") as HTMLButtonElement;
  if (mode === "create") {
    await resetKeyForm();
    title.innerText = "Create an API Key";
    addButton.innerText = "CREATE";
  } else if (mode === "update") {
    title.innerText = "Update an API Key";
    addButton.innerText = "UPDATE";
  }

  // Collapse toggles
  const toggleBtns = popup.querySelectorAll(
    "#accessRightsContainer .collapse-toggle",
  );
  for (const btn of Array.from(toggleBtns)) {
    if (btn.getAttribute("aria-expanded") === "true") {
      (btn as HTMLButtonElement).click();
    }
  }

  if (blockApp) {
    close.classList.add(".none");
    popup.classList.add("hider");
  } else {
    close.classList.remove(".none");
    popup.classList.remove("hider");
  }

  popup.classList.add("show");
}

async function resetKeyForm() {
  unrenderedRights = [];
  const form = document.getElementById("addKeyForm") as HTMLFormElement;
  form.setAttribute("mode", "create");
  form.removeAttribute("key-id");

  const name = document.getElementById("keyName") as HTMLInputElement;
  const rightsContainer = document.getElementById(
    "accessRightsContainer",
  ) as HTMLDivElement;

  // resetting tags
  const container = document.getElementById("tagContainer") as HTMLDivElement;
  container.innerHTML = "";

  // resetting name form
  name.value = "";

  // resetting access rights form
  rightsContainer.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    (cb as HTMLInputElement).checked = false;
    (cb as HTMLInputElement).indeterminate = false;
  });

  // resetting datasource and group select
  const datasourceSelect = document.getElementById(
    "datasourceSelect",
  ) as HTMLSelectElement;
  const groupSelect = document.getElementById(
    "groupSelect",
  ) as HTMLSelectElement;
  datasourceSelect.selectedIndex = 0;
  groupSelect.innerHTML =
    '<option value="" disabled selected>Select a Group</option>';
  groupSelect.removeAttribute("group-id");

  // resetting include admin switch
  const includeAdminSwitch = document.getElementById(
    "includeAdmin",
  ) as HTMLInputElement;
  includeAdminSwitch.checked = false;

  // resetting error box
  const errorBox = document.getElementById("errorBox") as HTMLDivElement;
  const errorTitle = document.getElementById(
    "errorTitle",
  ) as HTMLHeadingElement;
  const errorMessage = document.getElementById(
    "errorMessage",
  ) as HTMLParagraphElement;
  errorBox.classList.remove("show");
  errorTitle.textContent = "";
  errorMessage.textContent = "";
}

async function loadGroupList() {
  const groupsMapResponse = await fetch(`api/groups`);
  groupsMap = (await groupsMapResponse.json()) as GroupsMap;
  const datasourceSelect = document.getElementById(
    "datasourceSelect",
  ) as HTMLSelectElement;
  const groupSelect = document.getElementById(
    "groupSelect",
  ) as HTMLSelectElement;

  for (const datasource of groupsMap.datasources) {
    const option = document.createElement("option");
    datasourceSelect.appendChild(option);
    if (datasource.connected === false) {
      option.disabled = true;
      option.textContent = datasource.name + " (not connected)";
    } else {
      option.value = datasource.sourcekey;
      option.textContent = datasource.name + " (" + datasource.sourcekey + ")";
    }
  }
  datasourceSelect.addEventListener(
    "change",
    function (this: HTMLSelectElement) {
      groupSelect.innerHTML =
        '<option value="" disabled selected>Select a Group</option>';

      const selectedSourceKey = this.value;

      // DEPRECATED: Application API does not support selection by group names
      // if (selectedSourceKey === '*'){
      //   for (const groupName of groupsData.groups) {
      //     const option = document.createElement('option');
      //     groupSelect.appendChild(option);
      //     option.value = groupName;
      //     option.textContent = groupName;
      //   }
      // } else {
      //   const groups = groupsData.datasources.find((ds: any) => ds.sourcekey === selectedSourceKey)?.groups || [];

      //   for (const group of groups) {
      //     const option = document.createElement('option');
      //     groupSelect.appendChild(option);
      //     option.value = group.id;
      //     option.textContent = group.name + ' (' + group.id + ')';
      //   }
      // }

      const groups =
        groupsMap.datasources.find((ds) => ds.sourcekey === selectedSourceKey)
          ?.groups || [];

      for (const group of groups) {
        if (group.id !== groupsMap.admin_group) {
          const option = document.createElement("option");
          groupSelect.appendChild(option);
          option.setAttribute("group-id", group.id.toString());
          option.value = group.name;
          option.textContent = group.name + " (" + group.id + ")";
        }
      }
    },
  );

  groupSelect.addEventListener("change", function (this: HTMLSelectElement) {
    const selectedOption = this.options[this.selectedIndex];
    this.setAttribute(
      "group-id",
      selectedOption.getAttribute("group-id") || "",
    );
  });
}

async function fillKeyForm(keyId: number) {
  await resetKeyForm();

  const currentKeyResponse = await fetch(`api/keys/${keyId}`);
  const currentKey = (await currentKeyResponse.json()) as ApplicationItem;

  const addKeyForm = document.getElementById("addKeyForm") as HTMLFormElement;
  addKeyForm.setAttribute("key-id", keyId.toString());
  addKeyForm.setAttribute("mode", "update");

  const name = document.getElementById("keyName") as HTMLInputElement;
  name.value = currentKey.name || "";

  const enabled = document.getElementById("enableKey") as HTMLInputElement;
  currentKey.enabled ? (enabled.checked = true) : (enabled.checked = false);

  const currentRights: RightsMap = currentKey.rights ?? {};

  const rightsContainer = document.getElementById(
    "accessRightsContainer",
  ) as HTMLDivElement;
  rightsContainer.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    (cb as HTMLInputElement).checked = false;
    (cb as HTMLInputElement).indeterminate = false;
  });

  for (const right in currentRights) {
    if (
      currentRights[right].counter === 1 &&
      currentRights[right].actions.length === 0
    ) {
      // Only one right without sub-actions, select the parent right
      const parentCheckbox = document.getElementById(
        right,
      ) as HTMLInputElement | null;
      if (parentCheckbox) {
        parentCheckbox.click();
      } else {
        unrenderedRights.push(right as ApiRight);
      }
    } else {
      for (const action of currentRights[right].actions) {
        const actionRight = `${right}.${action}`;
        const actionCheckbox = document.getElementById(
          actionRight,
        ) as HTMLInputElement | null;
        if (actionCheckbox) {
          actionCheckbox.click();
        } else {
          unrenderedRights.push(actionRight as ApiRight);
        }
      }
    }
  }

  const tagContainer = document.getElementById(
    "tagContainer",
  ) as HTMLDivElement;
  tagContainer.innerHTML = "";
  const groups = currentKey.groups || [];
  for (const group of groups) {
    if (group.id === groupsMap.admin_group) {
      const includeAdminSwitch = document.getElementById(
        "includeAdmin",
      ) as HTMLInputElement;
      includeAdminSwitch.checked = true;
    } else {
      const tag = document.createElement("div");
      tag.classList.add("tag");
      tag.setAttribute("group-id", group.id.toString());

      const tagText = document.createElement("div");
      tagText.classList.add("tagText");

      const tagClose = document.createElement("a");
      tagClose.classList.add("tagClose");

      tag.appendChild(tagText);
      tag.appendChild(tagClose);

      tagClose.onclick = () => {
        tag.remove();
      };

      tagText.textContent = `${group.name} (${group.sourceKey || "*"})`;

      tagContainer.appendChild(tag);
    }
  }

  void showFullpagePopup("update");
}

function createActionButton(
  label: string,
  iconName: "edit" | "delete",
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "action-icon-button";
  button.setAttribute("aria-label", label);

  const icon = document.createElement("span");
  icon.className = `action-icon action-icon-${iconName}`;
  icon.setAttribute("aria-hidden", "true");
  button.appendChild(icon);

  const tooltip = document.createElement("span");
  tooltip.className = "action-tooltip tooltip-light";
  tooltip.textContent = label;
  const showTooltip = () => {
    const bounds = button.getBoundingClientRect();
    document.body.appendChild(tooltip);
    tooltip.classList.add("show");

    const tooltipBounds = tooltip.getBoundingClientRect();
    const gap = 8;
    const aboveTop = bounds.top - tooltipBounds.height - gap;
    const top = aboveTop >= 4 ? aboveTop : bounds.bottom + gap;
    const minCenter = tooltipBounds.width / 2 + 4;
    const maxCenter = window.innerWidth - tooltipBounds.width / 2 - 4;
    const center = bounds.left + bounds.width / 2;

    tooltip.style.left = `${Math.min(Math.max(center, minCenter), maxCenter)}px`;
    tooltip.style.top = `${Math.min(
      Math.max(top, 4),
      window.innerHeight - tooltipBounds.height - 4,
    )}px`;
  };
  const hideTooltip = () => tooltip.remove();
  button.addEventListener("mouseenter", showTooltip);
  button.addEventListener("mouseleave", hideTooltip);
  button.addEventListener("focus", showTooltip);
  button.addEventListener("blur", hideTooltip);
  button.addEventListener("click", onClick);

  return button;
}

// Keys Table
async function refreshKeysTable() {
  await helper.runLongTask(null, async (updater) => {
    updater.update("Reload API Keys...");
    const response = await fetch(`api/keys`);
    const keysList = (await response.json()) as ApplicationItem[];

    const table = document.querySelector(
      "#keysTable tbody",
    ) as HTMLTableElement;
    const tbody = document.createElement("tbody");

    for (const key of keysList) {
      const tr = document.createElement("tr");
      tr.setAttribute("key-id", key.id.toString());

      // name
      const name = document.createElement("td");
      const isNameTruncated = key.name.length > 20;
      if (isNameTruncated) {
        const truncatedName = document.createElement("span");
        truncatedName.className = "truncated-name";
        truncatedName.textContent = `${key.name.slice(0, 20)}...`;
        truncatedName.tabIndex = 0;
        truncatedName.setAttribute("aria-label", key.name);

        const tooltip = document.createElement("span");
        tooltip.className = "name-tooltip tooltip-light";
        tooltip.textContent = key.name;
        tooltip.setAttribute("role", "tooltip");
        truncatedName.appendChild(tooltip);
        name.appendChild(truncatedName);
      } else {
        name.textContent = key.name;
      }
      tr.append(name);

      // groups
      const groups = document.createElement("td");
      groups.style.whiteSpace = "nowrap";
      let groupsRedacted = "";
      if (key.groups !== undefined) {
        for (const group of key.groups) {
          groupsRedacted += `${group.name} [${group.sourceKey || "*"}]<br><hr>`;
        }
        groups.innerHTML = groupsRedacted.slice(0, -4);
        tr.append(groups);
      }

      // rights
      const rights = document.createElement("td");
      if (key.rights !== undefined) {
        for (const right in key.rights) {
          const currentBadge = createBadge(
            right,
            key.rights[right].counter,
            key.rights[right].actions.join(", "),
          );
          rights.append(currentBadge);
        }
        tr.append(rights);
      }

      // apiKey
      let apiKey = document.createElement("td");
      apiKey.style.whiteSpace = "nowrap";
      if (key.apiKey) {
        apiKey.textContent = key.apiKey;
        apiKey = maskTableKey(apiKey);
      } else {
        apiKey.textContent = key.hint
          ? `${"*".repeat(Math.max(0, API_KEY_LENGTH - key.hint.length))}${key.hint}`
          : "Unavailable";
      }
      tr.append(apiKey);

      // state
      const state = document.createElement("td");
      if (key.enabled) {
        state.innerHTML = "<span class='badge green'>Enabled</span>";
      } else {
        state.innerHTML = "<span class='badge red'>Disabled</span>";
      }
      tr.append(state);

      // actions
      const actions = document.createElement("td");

      actions.append(
        createActionButton("Update", "edit", () => void fillKeyForm(key.id)),
        createActionButton("Delete", "delete", () => {
          applicationToDeleteId = key.id;
          document.getElementById("confirmPopin")?.classList.add("show");
        }),
      );

      tr.append(actions);

      tbody.appendChild(tr);
    }

    table.replaceWith(tbody);
  });
}

async function init() {
  helper.expose({ restClient: new RestClient({ baseUrl: "../.." }) });

  await helper.runLongTask(null, async () => {
    document.getElementById("addButton")!.onclick = () => showFullpagePopup();

    document
      .querySelectorAll(".popin .cancelButton")
      .forEach((p) =>
        (<HTMLAnchorElement>p).addEventListener("click", closePopup),
      );
    document.getElementById("addGroup")?.addEventListener("click", addGroup);
    document.getElementById("addApiKey")?.addEventListener("click", addKey);
    document
      .querySelector("#confirmPopin .confirmButton")
      ?.addEventListener("click", () => {
        const id = applicationToDeleteId;
        applicationToDeleteId = undefined;
        const confirmPopin = document.getElementById(
          "confirmPopin",
        ) as HTMLDivElement;
        closePopup.call(confirmPopin);

        if (id === undefined) {
          return;
        }

        void helper.runLongTask(
          null,
          async () => {
            try {
              await parseLinkuriousAPI(
                deleteApplication(window.restClient, id),
              );
              await refreshKeysTable();
              void helper.showPopin("info", "API Key deleted successfully");
            } catch (e) {
              void helper.showPopin(
                "error",
                e instanceof Error ? e.message : JSON.stringify(e),
              );
            }
          },
          { defaultErrorHandler: false },
        );
      });
    await refreshKeysTable();
    await loadGroupList();
    generateAccessRightsForm();
  });
}

function maskKey(
  cell: HTMLElement,
  onCopied?: () => void,
  tooltipTheme: "light" | "dark" = "light",
): HTMLElement {
  const key = cell.textContent || "";

  cell.textContent = "";

  const container = document.createElement("span");
  container.className = "masked-key";
  const masked = key.slice(0, 5) + "..." + key.slice(-5);

  // Set pointer cursor
  container.style.cursor = "pointer";
  container.style.position = "relative";

  // Copy feedback element
  const tooltip = document.createElement("span");
  tooltip.className = `copy-feedback tooltip-${tooltipTheme}`;
  tooltip.textContent = "Copied!";
  tooltip.setAttribute("aria-live", "polite");

  container.onclick = async () => {
    try {
      await navigator.clipboard.writeText(key);
      onCopied?.();
      container.title = "Copied";
      tooltip.textContent = "Copied!";
    } catch {
      tooltip.textContent = "Copy failed";
    }
    tooltip.classList.add("show");
    window.setTimeout(() => {
      container.title = "Copy";
      tooltip.classList.remove("show");
    }, 1200);
  };

  container.textContent = masked;
  container.title = "Copy";
  container.appendChild(tooltip);
  cell.appendChild(container);

  return cell;
}

function maskTableKey(cell: HTMLTableCellElement): HTMLTableCellElement {
  const key = cell.textContent || "";
  maskKey(cell, undefined);

  const container = cell.querySelector(".masked-key");
  const tooltip = container?.querySelector(".copy-feedback");
  if (container) {
    const visibleLength = Math.min(5, Math.ceil(key.length / 2));
    container.textContent =
      key.slice(0, visibleLength) +
      "*".repeat(key.length - visibleLength * 2) +
      key.slice(-visibleLength);
    if (tooltip) {
      container.appendChild(tooltip);
    }
  }

  return cell;
}

function createBadge(
  name: string,
  number: number,
  extraContent: string,
): HTMLElement {
  const badge = document.createElement("div");
  badge.className = "badge";

  const nameSpan = document.createElement("span");
  nameSpan.textContent = name;
  badge.appendChild(nameSpan);

  const numberDiv = document.createElement("div");
  numberDiv.className = "number";
  numberDiv.textContent = number.toString();
  badge.appendChild(numberDiv);

  if (extraContent !== null && extraContent.length > 0) {
    const extraDiv = document.createElement("div");
    extraDiv.className = "extra-content-tooltip tooltip-light";
    extraDiv.textContent = extraContent;
    extraDiv.style.fontSize = window.getComputedStyle(badge).fontSize;
    extraDiv.setAttribute("role", "tooltip");
    badge.appendChild(extraDiv);

    badge.tabIndex = 0;
    badge.setAttribute("aria-label", `${name} ${number}: ${extraContent}`);
    const showTooltip = () => {
      const bounds = badge.getBoundingClientRect();
      document.body.appendChild(extraDiv);
      extraDiv.classList.add("show");

      const tooltipBounds = extraDiv.getBoundingClientRect();
      const gap = 8;
      const aboveTop = bounds.top - tooltipBounds.height - gap;
      const top = aboveTop >= 4 ? aboveTop : bounds.bottom + gap;
      const minCenter = tooltipBounds.width / 2 + 4;
      const maxCenter = window.innerWidth - tooltipBounds.width / 2 - 4;
      const center = bounds.left + bounds.width / 2;

      extraDiv.style.left = `${Math.min(Math.max(center, minCenter), maxCenter)}px`;
      extraDiv.style.top = `${Math.min(
        Math.max(top, 4),
        window.innerHeight - tooltipBounds.height - 4,
      )}px`;
    };
    const hideTooltip = () => extraDiv.remove();
    badge.addEventListener("mouseenter", showTooltip);
    badge.addEventListener("mouseleave", hideTooltip);
    badge.addEventListener("focus", showTooltip);
    badge.addEventListener("blur", hideTooltip);
  }
  return badge;
}

function groupActions(actionList: string[]): RightsMap {
  return actionList.reduce((acc, currentAction) => {
    const parts = currentAction.split(".");

    let prefix: string;
    let action: string | null;

    if (parts.length === 1) {
      prefix = currentAction;
      action = null;
    } else {
      prefix = parts[0];
      action = parts.slice(1).join(".");
    }

    if (!acc[prefix]) {
      acc[prefix] = { counter: 0, actions: [] };
    }

    acc[prefix].counter += 1;
    if (action) {
      acc[prefix].actions.push(action);
    }

    return acc;
  }, {} as RightsMap);
}

function generateAccessRightsForm() {
  const container = document.getElementById(
    "accessRightsContainer",
  ) as HTMLDivElement;
  container.innerHTML = "";

  const data = groupActions(
    Object.values(ApiRight)
      .filter((value) => typeof value === "string")
      .sort(),
  );

  // Create a wrapper for two columns
  const columnsWrapper = document.createElement("div");
  columnsWrapper.className = "rights-wrapper";

  // Split prefixes into two roughly equal columns
  const prefixes = Object.keys(data);
  const mid = Math.ceil(prefixes.length / 2);
  const columns = [prefixes.slice(0, mid), prefixes.slice(mid)];

  for (const colPrefixes of columns) {
    const ul = document.createElement("ul");
    ul.className = "tree-multiselect";

    for (const prefix of colPrefixes) {
      const li = document.createElement("li");
      li.className = "tree-group";

      // Collapsible toggle button (arrow, collapsed by default)
      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "collapse-toggle";

      if (data[prefix].actions.length > 0) {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.textContent = "►";
      } else {
        toggleBtn.textContent = ""; // No arrow
        toggleBtn.disabled = true;
        toggleBtn.style.visibility = "hidden";
      }

      // Group label and checkbox
      const groupLabel = document.createElement("label");
      groupLabel.className = "group-label";

      const groupCheckbox = document.createElement("input");
      groupCheckbox.type = "checkbox";
      groupCheckbox.className = "group-checkbox";
      groupCheckbox.value = prefix;
      groupCheckbox.id = prefix;

      groupLabel.appendChild(groupCheckbox);
      groupLabel.appendChild(document.createTextNode(prefix));

      li.appendChild(toggleBtn);
      li.appendChild(groupLabel);

      let subUl: HTMLUListElement | undefined;
      if (data[prefix].actions.length > 0) {
        subUl = document.createElement("ul");
        subUl.className = "tree-sublist";
        subUl.style.display = "none"; // collapsed by default

        for (const action of data[prefix].actions) {
          const subLi = document.createElement("li");
          subLi.className = "tree-action";

          const actionLabel = document.createElement("label");
          actionLabel.className = "action-label";
          const actionCheckbox = document.createElement("input");
          actionCheckbox.type = "checkbox";
          actionCheckbox.className = "action-checkbox";
          actionCheckbox.value = `${prefix}.${action}`;
          actionCheckbox.id = `${prefix}.${action}`;

          actionLabel.appendChild(actionCheckbox);
          actionLabel.appendChild(document.createTextNode(action));
          subLi.appendChild(actionLabel);

          subUl.appendChild(subLi);
        }
        li.appendChild(subUl);

        // Collapsible logic
        toggleBtn.onclick = () => {
          if (subUl!.style.display === "none") {
            subUl!.style.display = "";
            toggleBtn.setAttribute("aria-expanded", "true");
            toggleBtn.textContent = "▼";
          } else {
            subUl!.style.display = "none";
            toggleBtn.setAttribute("aria-expanded", "false");
            toggleBtn.textContent = "►";
          }
        };
      }

      ul.appendChild(li);
    }

    columnsWrapper.appendChild(ul);
  }

  container.appendChild(columnsWrapper);

  // Group checkbox toggles all children
  container.querySelectorAll(".group-checkbox").forEach((groupCheckbox) => {
    groupCheckbox.addEventListener("change", function (this: HTMLInputElement) {
      const sublist = this.closest("li")?.querySelectorAll(".action-checkbox");
      if (sublist) {
        sublist.forEach((cb) => {
          (cb as HTMLInputElement).checked = this.checked;
        });
      }
      this.indeterminate = false;
    });
  });

  // Child checkbox updates parent state
  container.querySelectorAll(".action-checkbox").forEach((actionCheckbox) => {
    actionCheckbox.addEventListener(
      "change",
      function (this: HTMLInputElement) {
        const groupLi = this.closest(".tree-group");
        const groupCheckbox = groupLi?.querySelector(
          ".group-checkbox",
        ) as HTMLInputElement;
        const childCheckboxes = groupLi?.querySelectorAll(
          ".action-checkbox",
        ) as NodeListOf<HTMLInputElement>;
        if (groupCheckbox && childCheckboxes) {
          const checkedCount = Array.from(childCheckboxes).filter(
            (cb) => cb.checked,
          ).length;
          if (checkedCount === childCheckboxes.length) {
            groupCheckbox.checked = true;
            groupCheckbox.indeterminate = false;
          } else if (checkedCount === 0) {
            groupCheckbox.checked = false;
            groupCheckbox.indeterminate = false;
          } else {
            groupCheckbox.checked = false;
            groupCheckbox.indeterminate = true;
          }
        }
      },
    );
  });
}

/**
 * Returns all selected access rights as an array of strings.
 * Format: <parent>.<child> for child nodes, <parent> for parent nodes without children.
 */
function getSelectedAccessRights(): ApiRight[] {
  const container = document.getElementById(
    "accessRightsContainer",
  ) as HTMLDivElement;
  const selected: ApiRight[] = [...unrenderedRights];

  container.querySelectorAll(".tree-group").forEach((groupLi) => {
    const groupCheckbox = groupLi.querySelector(
      ".group-checkbox",
    ) as HTMLInputElement;
    const actionCheckboxes = groupLi.querySelectorAll(
      ".action-checkbox",
    ) as NodeListOf<HTMLInputElement>;

    if (actionCheckboxes.length === 0) {
      // No children, use parent only if checked
      if (groupCheckbox.checked) {
        const label = groupLi.querySelector("label:last-child");
        if (label) {
          selected.push((label.textContent?.trim() as ApiRight) || "");
        }
      }
    } else {
      // Has children, collect checked children
      actionCheckboxes.forEach((cb) => {
        if (cb.checked) {
          selected.push(cb.value as ApiRight);
        }
      });
    }
  });

  return selected;
}

window.addEventListener("load", () => {
  void helper.runLongTask(
    null,
    async (updater) => {
      updater.update("App initialization...");
      try {
        const response = await fetch(`api/authorize`);
        if (response.status === 204) {
          await Promise.resolve(init());
        } else {
          void helper.showPopin(
            "error",
            "You don't have access to this plugin. Please contact your administrator.",
            true,
          );
        }
      } catch (e) {
        void helper.showPopin(
          "error",
          e instanceof Error ? e.message : JSON.stringify(e),
          true,
        );
      }
    },
    { hideApp: true },
  );
});
