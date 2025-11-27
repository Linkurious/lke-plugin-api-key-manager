import {
  ApiRight,
  RestClient,
  ICreateApplicationParams,
  IUpdateApplicationParams
} from '@linkurious/rest-client';

import { parseLinkuriousAPI } from '../../backend/shared';

import * as helper from './helper';
import { group } from 'console';

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
};

async function closePopup(this: HTMLDivElement) {
  this.closest('.popin')?.classList.remove('show');
}

function deleteWebhook(webhookId: number) {
  void helper.runLongTask(null, async () => {
    closePopup.call(document.getElementById('confirmPopin') as HTMLDivElement);
    await parseLinkuriousAPI(window.restClient.webhook.deleteWebhook({ webhookId: webhookId }));
    // Refresh the webhooks table
    const table = document.querySelector('#webhooksTable tbody')! as HTMLTableElement;
    const rowToDelete = table.querySelector(`tr[webhook-id="${webhookId}"]`);
    if (rowToDelete) {
      rowToDelete.remove();
    }

    void helper.showPopin('info', 'Webhook deleted successfully');
  });
}

function addKey() {
  void helper.runLongTask(
    null,
    async () => {

      const addKeyForm = document.getElementById('addKeyForm') as HTMLFormElement;
      const mode = addKeyForm.getAttribute('mode') || 'create';

      if (addKeyForm.reportValidity()) {
        const name = document.getElementById('keyName') as HTMLInputElement;
        const rightsContainer = (document.getElementById('accessRightsContainer') as HTMLDivElement)
        const tagContainer = document.getElementById('tagContainer') as HTMLDivElement;

        const tags = Array.from(tagContainer.querySelectorAll('.tag')) as HTMLDivElement[];

        let groups: number[] = [];
        for (const tag of tags) {
          const groupId = tag.getAttribute('group-id');
          if (groupId) {
            groups.push(parseInt(groupId));
          }
        }

        const rights = getSelectedAccessRights();

        const errorBox = document.getElementById('errorBox') as HTMLDivElement;
        const errorTitle = document.getElementById('errorTitle') as HTMLHeadingElement;
        const errorMessage = document.getElementById('errorMessage') as HTMLParagraphElement;

        try {
          if (mode === 'create') {
            const body: ICreateApplicationParams = {
              name: name.value,
              rights: rights,
              groups: groups
            };

            await parseLinkuriousAPI(
              window.restClient.application.createApplication(body),
              async () => {
                errorBox.classList.remove('show');
                errorTitle.textContent = '';
                errorMessage.textContent = '';

                // resetting the key table
                const table = document.querySelector('#keysTable tbody')! as HTMLTableElement;
                table.innerHTML = '';
                await refreshKeysTable();
                //closing the formPopup
                closePopup.call(name.parentElement as HTMLDivElement);

                void helper.showPopin('info', 'API Key created successfully');
              },
              async (e) => {
                errorBox.classList.add('show');
                errorTitle.textContent = 'Error';
                errorMessage.textContent = e.body.message;
              }
            );
          } else if (mode === 'update') {
            const body: IUpdateApplicationParams = {
              id: parseInt(addKeyForm.getAttribute('key-id') || '0'),
              name: name.value,
              rights: rights,
              groups: groups
            };

            await parseLinkuriousAPI(
              window.restClient.application.updateApplication(body),
              async () => {
                errorBox.classList.remove('show');
                errorTitle.textContent = '';
                errorMessage.textContent = '';

                // resetting the key table
                const table = document.querySelector('#keysTable tbody')! as HTMLTableElement;
                table.innerHTML = '';
                await refreshKeysTable();
                //closing the formPopup
                closePopup.call(name.parentElement as HTMLDivElement);

                void helper.showPopin('info', 'API Key updated successfully');
              },
              async (e) => {
                errorBox.classList.add('show');
                errorTitle.textContent = 'Error';
                errorMessage.textContent = e.body.message;
              }
            )
          }
        } catch (e) {
          errorBox.classList.add('show');
          errorTitle.textContent = 'Error';
          errorMessage.textContent = (e as Error).message;
        }
      }
    },
    { defaultErrorHandler: true }
  );
}

function addGroup() {
  const addGroupsForm = document.getElementById('addGroupsForm') as HTMLFormElement;
  if (addGroupsForm.reportValidity()) {
    const container = document.getElementById('tagContainer') as HTMLDivElement;
    const groupSelect = document.getElementById('groupSelect') as HTMLSelectElement;
    const datasource = document.getElementById('datasourceSelect') as HTMLSelectElement;

    const tag = document.createElement('div');
    tag.classList.add('tag');
    tag.setAttribute('group-id', groupSelect.getAttribute('group-id') || '');

    const tagText = document.createElement('div');
    tagText.classList.add('tagText');

    const tagClose = document.createElement('a');
    tagClose.classList.add('tagClose');

    tag.appendChild(tagText);
    tag.appendChild(tagClose);

    tagClose.onclick = () => {
      tag.remove();
    };

    tagText.textContent = `${groupSelect.value} (${datasource.value})`;

    groupSelect.innerHTML = '<option value="" disabled selected>Select a Group</option>';
    groupSelect.selectedIndex = 0;
    datasource.selectedIndex = 0;

    container.appendChild(tag);
  }

}

function showConfirmPopup(webhookId: number, blockApp = false) {
  const popup = document.getElementById('confirmPopin') as HTMLDivElement;
  const cancel = popup.querySelector('.button.cancelButton') as HTMLAnchorElement;
  const confirm = popup.querySelector('.button.confirmButton') as HTMLAnchorElement;

  confirm.onclick = () => deleteWebhook(webhookId);

  if (blockApp) {
    cancel.classList.add('.none');
    popup.classList.add('hider');
  } else {
    cancel.classList.remove('.none');
    popup.classList.remove('hider');
  }

  popup.classList.add('show');
}

async function showFullpagePopup(mode = 'create', blockApp = false) {

  const popup = document.getElementById('createView') as HTMLDivElement;
  const close = popup.querySelector('.close') as HTMLAnchorElement;

  const addButton = document.getElementById('addWebhook') as HTMLButtonElement;
  if (mode === 'create') {
    addButton.innerText = 'CREATE';
  } else if (mode === 'update') {
    addButton.innerText = 'UPDATE';
  }

  // Collapse toggles
  const toggleBtns = popup.querySelectorAll('#accessRightsContainer .collapse-toggle');
  for (const btn of Array.from(toggleBtns)) {
    if (btn.getAttribute('aria-expanded') === 'true') {
      (btn as HTMLButtonElement).click();
    }
  }

  if (blockApp) {
    close.classList.add('.none');
    popup.classList.add('hider');
  } else {
    close.classList.remove('.none');
    popup.classList.remove('hider');
  }

  if (mode === 'create') {
    await resetKeyForm();
  }

  popup.classList.add('show');
}

async function loadDatasourceList() {
  const datasources = await parseLinkuriousAPI(window.restClient.dataSource.getDataSources());
  const datasourceSelect = document.getElementById('datasourceSelect') as HTMLSelectElement;
  for (const datasource of datasources) {
    const option = document.createElement('option');
    datasourceSelect.appendChild(option);
    if (datasource.key === undefined) {
      option.disabled = true;
      option.textContent = datasource.name + ' (not connected)';
    } else {
      option.value = datasource.key;
      option.textContent = datasource.name + ' (' + datasource.key + ')';
    }
  }
}

async function resetKeyForm() {

  const form = document.getElementById('addKeyForm') as HTMLFormElement;
  form.setAttribute('mode', 'create');
  form.removeAttribute('key-id');

  const name = document.getElementById('keyName') as HTMLInputElement;
  const rightsContainer = (document.getElementById('accessRightsContainer') as HTMLDivElement)
  const tagContainer = document.getElementById('tagContainer') as HTMLDivElement;

  // resetting tags
  const container = document.getElementById('tagContainer') as HTMLDivElement;
  container.innerHTML = '';

  // resetting name form
  name.value = '';

  // resetting access rights form
  rightsContainer.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    (cb as HTMLInputElement).checked = false;
    (cb as HTMLInputElement).indeterminate = false;
  });

  // resetting datasource and group select
  const datasourceSelect = document.getElementById('datasourceSelect') as HTMLSelectElement;
  const groupSelect = document.getElementById('groupSelect') as HTMLSelectElement;
  datasourceSelect.selectedIndex = 0;
  groupSelect.innerHTML = '<option value="" disabled selected>Select a Group</option>';
  groupSelect.removeAttribute('group-id');
}

async function loadGroupList() {
  const groupsMap = await fetch(`api/groups`);
  const groupsData = await groupsMap.json();
  const datasourceSelect = document.getElementById('datasourceSelect') as HTMLSelectElement;
  const groupSelect = document.getElementById('groupSelect') as HTMLSelectElement;

  for (const datasource of groupsData.datasources) {
    const option = document.createElement('option');
    datasourceSelect.appendChild(option);
    if (datasource.connected === false) {
      option.disabled = true;
      option.textContent = datasource.name + ' (not connected)';
    } else {
      option.value = datasource.sourcekey
      option.textContent = datasource.name + ' (' + datasource.sourcekey + ')';
    }
  }
  datasourceSelect.addEventListener('change', function (this: HTMLSelectElement) {

    groupSelect.innerHTML = '<option value="" disabled selected>Select a Group</option>';

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

    const groups = groupsData.datasources.find((ds: any) => ds.sourcekey === selectedSourceKey)?.groups || [];

    for (const group of groups) {
      const option = document.createElement('option');
      groupSelect.appendChild(option);
      option.setAttribute('group-id', group.id);
      option.value = group.name;
      option.textContent = group.name + ' (' + group.id + ')';
    }
  });

  groupSelect.addEventListener('change', function (this: HTMLSelectElement) {
    const selectedOption = this.options[this.selectedIndex];
    this.setAttribute('group-id', selectedOption.getAttribute('group-id') || '');
  });
}

async function fillKeyForm(keyId: number) {

  const currentKeyResponse = await fetch(`api/keys/${keyId}`);
  const currentKey = await currentKeyResponse.json();

  const addKeyForm = document.getElementById('addKeyForm') as HTMLFormElement;
  addKeyForm.setAttribute('key-id', keyId.toString());
  addKeyForm.setAttribute('mode', 'update');

  const name = document.getElementById('keyName') as HTMLInputElement;
  name.value = currentKey.name || '';

  const currentRights: RightsMap = currentKey.rights || [];

  const rightsContainer = (document.getElementById('accessRightsContainer') as HTMLDivElement)
  rightsContainer.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    (cb as HTMLInputElement).checked = false;
    (cb as HTMLInputElement).indeterminate = false;
  });

  for (const right in currentRights) {
    if (currentRights[right].counter === 1 && currentRights[right].actions.length === 0) {
      // Only one right without sub-actions, select the parent right
      const parentCheckbox = document.getElementById(right) as HTMLInputElement;
      parentCheckbox.click();
    } else {
      for (const action of currentRights[right].actions) {
        const actionCheckbox = document.getElementById(`${right}.${action}`) as HTMLInputElement;
        actionCheckbox.click();
      }
    }
  }

  const tagContainer = document.getElementById('tagContainer') as HTMLDivElement;
  tagContainer.innerHTML = '';
  const groups = currentKey.groups || [];
  for (const group of groups) {
    const tag = document.createElement('div');
    tag.classList.add('tag');
    tag.setAttribute('group-id', group.id.toString());

    const tagText = document.createElement('div');
    tagText.classList.add('tagText');

    const tagClose = document.createElement('a');
    tagClose.classList.add('tagClose');

    tag.appendChild(tagText);
    tag.appendChild(tagClose);

    tagClose.onclick = () => {
      tag.remove();
    };

    tagText.textContent = `${group.name} (${group.sourceKey || '*'})`;

    tagContainer.appendChild(tag);
  }

  showFullpagePopup('update');
}

// Keys Table
async function refreshKeysTable() {
  await helper.runLongTask(null, async (updater) => {
    updater.update('Reload API Keys...');
    const response = await fetch(`api/keys`);
    const keysList = await response.json();

    const table = document.querySelector('#keysTable tbody') as HTMLTableElement;
    const tbody = document.createElement('tbody');

    for (const key of keysList) {
      const tr = document.createElement('tr');
      tr.setAttribute('key-id', key.id);

      // name
      const name = document.createElement('td');
      name.textContent = key.name;
      tr.append(name);

      // state
      const state = document.createElement('td');
      if (key.enabled) {
        state.textContent = "Enabled"
      } else {
        state.textContent = "Disabled"
      }
      tr.append(state);

      // groups
      const groups = document.createElement('td');
      groups.style.whiteSpace = 'nowrap';
      let groupsRedacted = '';
      if (key.groups !== undefined) {
        for (const group of key.groups) {
            groupsRedacted += `${group.name} [${group.sourceKey || '*'}]<br><hr>`;
        }
        groups.innerHTML = groupsRedacted.slice(0, -4);
        tr.append(groups);
      }

      // rights
      const rights = document.createElement('td');
      let keyRights = '';
      if (key.rights !== undefined) {
        for (const right in key.rights) {
          let currentBadge = createBadge(right, key.rights[right].counter, key.rights[right].actions.join(', '));
          rights.append(currentBadge)
        }
        tr.append(rights);
      }

      // apiKey
      let apiKey = document.createElement('td');
      apiKey.style.whiteSpace = 'nowrap';
      apiKey.textContent = key.apiKey;
      apiKey = maskKey(apiKey);
      tr.append(apiKey);

      // actions
      const actions = document.createElement('td');

      // --> Update
      const updateButton = document.createElement('button');
      updateButton.classList.add('button', 'hasNext');
      updateButton.textContent = 'Update';
      updateButton.addEventListener(
        'click',
        () => fillKeyForm(key.id)
      );
      actions.append(updateButton);

       // --> Enable Toggle
      const enableButton = document.createElement('button');
      enableButton.classList.add('button');
      if (key.enabled) {
        enableButton.textContent = 'Disable';
        enableButton.classList.add('red');
      } else {
        enableButton.textContent = 'Enable';
        enableButton.classList.add('green');
      }
      enableButton.addEventListener(
        'click',
        () => fillKeyForm(key.id)
      );
      actions.append(enableButton);

      // const deliveriesButton = document.createElement('button');
      // deliveriesButton.classList.add('button', 'hasNext');
      // deliveriesButton.textContent = 'Deliveries';
      // deliveriesButton.addEventListener('click', () =>
      //   window.open(`../../api/admin/webhooks/${webhook.id}/deliveries`, '_blank')
      // );
      // actions.append(deliveriesButton);

      // const deleteButton = document.createElement('button');
      // deleteButton.classList.add('button', 'red');
      // deleteButton.textContent = 'Delete';
      // deleteButton.addEventListener('click', () => showConfirmPopup(webhook.id));
      // actions.append(deleteButton);

      tr.append(actions);

      tbody.appendChild(tr);
    }

    table.replaceWith(tbody);
  });
}

async function init() {
  helper.expose({ restClient: new RestClient({ baseUrl: '../..' }) });

  await helper.runLongTask(null, async () => {
    document.getElementById('addButton')!.onclick = () => showFullpagePopup();

    document
      .querySelectorAll('.popin .cancelButton')
      .forEach((p) => (<HTMLAnchorElement>p).addEventListener('click', closePopup));
    document.getElementById('addGroup')?.addEventListener('click', addGroup);
    document.getElementById('addWebhook')?.addEventListener('click', addKey);
    await refreshKeysTable();
    await loadGroupList();
    await generateAccessRightsForm();
  });
}

function maskKey(cell: HTMLTableCellElement): HTMLTableCellElement {
  const key = cell.textContent || '';

  cell.textContent = '';

  const container = document.createElement('span');
  const masked = key.slice(0, 5) + "..." + key.slice(-5);

  // Set pointer cursor
  container.style.cursor = 'pointer';
  container.style.position = 'relative';

  // Tooltip/extra content element
  const tooltip = document.createElement('span')
  tooltip.className = 'tooltip';
  tooltip.textContent = 'Copied!';
  tooltip.style.display = 'none';

  container.onclick = async () => {
    await navigator.clipboard.writeText(key);
    container.title = "Copied";
    // Show the extra content above the span
    tooltip.style.display = '';
    tooltip.style.opacity = '0.8';
    setTimeout(() => {
      container.title = "Copy";
      tooltip.style.display = 'none';
      tooltip.style.opacity = '0';
    }, 1000);
  };

  container.textContent = masked;
  container.title = "Copy";
  container.appendChild(tooltip);
  cell.appendChild(container);

  return cell;
}

function createBadge(
  name: string,
  number: number,
  extraContent: string
): HTMLElement {
  const badge = document.createElement('div');
  badge.className = 'badge';

  const nameSpan = document.createElement('span');
  nameSpan.textContent = name;
  badge.appendChild(nameSpan);

  const numberDiv = document.createElement('div');
  numberDiv.className = 'number';
  numberDiv.textContent = number.toString();
  badge.appendChild(numberDiv);

  if (extraContent != null && extraContent.length > 0) {
    const extraDiv = document.createElement('div');
    extraDiv.className = 'extra-content';
    extraDiv.textContent = extraContent;
    badge.appendChild(extraDiv);
  }
  return badge;
}

function groupActions(actionList: string[]): RightsMap {
  //const actionList = Object.values(ApiRight).sort().filter((action) => typeof action === 'string') as string[];
  return actionList.reduce((acc, currentAction) => {
    const parts = currentAction.split('.');

    let prefix: string;
    let action: string | null;

    if (parts.length === 1) {
      prefix = currentAction;
      action = null;
    } else {
      prefix = parts[0];
      action = parts.slice(1).join('.');
    }

    if (!acc[prefix]) {
      acc[prefix] = { counter: 0, actions: [] }
    }

    acc[prefix].counter += 1;
    if (action) {
      acc[prefix].actions.push(action);
    }

    return acc;
  }, {} as RightsMap);
}

function generateAccessRightsForm() {
  const container = document.getElementById('accessRightsContainer') as HTMLDivElement;
  container.innerHTML = '';

  const data = groupActions(Object.values(ApiRight).sort());

  // Create a wrapper for two columns
  const columnsWrapper = document.createElement('div');
  columnsWrapper.className = 'rights-wrapper';

  // Split prefixes into two roughly equal columns
  const prefixes = Object.keys(data);
  const mid = Math.ceil(prefixes.length / 2);
  const columns = [prefixes.slice(0, mid), prefixes.slice(mid)];

  for (const colPrefixes of columns) {
    const ul = document.createElement('ul');
    ul.className = 'tree-multiselect';

    for (const prefix of colPrefixes) {
      const li = document.createElement('li');
      li.className = 'tree-group';


      // Collapsible toggle button (arrow, collapsed by default)
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'collapse-toggle';

      if (data[prefix].actions.length > 0) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.textContent = '►';
      } else {
        toggleBtn.textContent = ''; // No arrow
        toggleBtn.disabled = true;
        toggleBtn.style.visibility = 'hidden';
      }

      // Group label and checkbox
      const groupLabel = document.createElement('label');
      groupLabel.className = 'group-label';

      const groupCheckbox = document.createElement('input');
      groupCheckbox.type = 'checkbox';
      groupCheckbox.className = 'group-checkbox';
      groupCheckbox.value = prefix;
      groupCheckbox.id = prefix;

      groupLabel.appendChild(groupCheckbox);
      groupLabel.appendChild(document.createTextNode(prefix));

      li.appendChild(toggleBtn);
      li.appendChild(groupLabel);

      let subUl: HTMLUListElement | undefined;
      if (data[prefix].actions.length > 0) {
        subUl = document.createElement('ul');
        subUl.className = 'tree-sublist';
        subUl.style.display = 'none'; // collapsed by default

        for (const action of data[prefix].actions) {
          const subLi = document.createElement('li');
          subLi.className = 'tree-action';

          const actionLabel = document.createElement('label');
          actionLabel.className = 'action-label';
          const actionCheckbox = document.createElement('input');
          actionCheckbox.type = 'checkbox';
          actionCheckbox.className = 'action-checkbox';
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
          if (subUl!.style.display === 'none') {
            subUl!.style.display = '';
            toggleBtn.setAttribute('aria-expanded', 'true');
            toggleBtn.textContent = '▼';
          } else {
            subUl!.style.display = 'none';
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.textContent = '►';
          }
        };
      }

      ul.appendChild(li);
    }

    columnsWrapper.appendChild(ul);
  }

  container.appendChild(columnsWrapper);

  // Group checkbox toggles all children
  container.querySelectorAll('.group-checkbox').forEach((groupCheckbox) => {
    groupCheckbox.addEventListener('change', function (this: HTMLInputElement) {
      const sublist = this.closest('li')?.querySelectorAll('.action-checkbox');
      if (sublist) {
        sublist.forEach((cb) => {
          (cb as HTMLInputElement).checked = this.checked;
        });
      }
      this.indeterminate = false;
    });
  });

  /**
   * Returns all checked checkboxes from the access rights form.
   * Useful for direct checkbox manipulation.
   */
  function getCheckedAccessRightsCheckboxes(): HTMLInputElement[] {
    const container = document.getElementById('accessRightsContainer') as HTMLDivElement;
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')) as HTMLInputElement[];
  }

  // Child checkbox updates parent state
  container.querySelectorAll('.action-checkbox').forEach((actionCheckbox) => {
    actionCheckbox.addEventListener('change', function (this: HTMLInputElement) {
      const groupLi = this.closest('.tree-group');
      const groupCheckbox = groupLi?.querySelector('.group-checkbox') as HTMLInputElement;
      const childCheckboxes = groupLi?.querySelectorAll('.action-checkbox') as NodeListOf<HTMLInputElement>;
      if (groupCheckbox && childCheckboxes) {
        const checkedCount = Array.from(childCheckboxes).filter(cb => cb.checked).length;
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
    });
  });
}

/**
   * Returns all selected access rights as an array of strings.
   * Format: <parent>.<child> for child nodes, <parent> for parent nodes without children.
   */
function getSelectedAccessRights(): ApiRight[] {
  const container = document.getElementById('accessRightsContainer') as HTMLDivElement;
  const selected: ApiRight[] = [];

  container.querySelectorAll('.tree-group').forEach((groupLi) => {
    const groupCheckbox = groupLi.querySelector('.group-checkbox') as HTMLInputElement;
    const actionCheckboxes = groupLi.querySelectorAll('.action-checkbox') as NodeListOf<HTMLInputElement>;

    if (actionCheckboxes.length === 0) {
      // No children, use parent only if checked
      if (groupCheckbox.checked) {
        const label = groupLi.querySelector('label:last-child');
        if (label) {
          selected.push(label.textContent?.trim() as ApiRight || '');
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

window.addEventListener('load', () => {
  void helper.runLongTask(
    null,
    async (updater) => {
      updater.update('App initialization...');
      try {
        const response = await fetch(`api/authorize`);
        if (response.status === 204) {
          await Promise.resolve(init());
        } else {
          void helper.showPopin(
            'error',
            "You don't have access to this plugin. Please contact your administrator.",
            true
          );
        }
      } catch (e) {
        void helper.showPopin('error', e instanceof Error ? e.message : JSON.stringify(e), true);
      }
    },
    { hideApp: true }
  );
});
