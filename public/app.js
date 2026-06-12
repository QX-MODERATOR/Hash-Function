const elements = {
  healthLabel: document.querySelector('#healthLabel'),
  hashInput: document.querySelector('#hashInput'),
  algorithmSelect: document.querySelector('#algorithmSelect'),
  roundsField: document.querySelector('#roundsField'),
  roundsInput: document.querySelector('#roundsInput'),
  roundsValue: document.querySelector('#roundsValue'),
  charCount: document.querySelector('#charCount'),
  byteCount: document.querySelector('#byteCount'),
  generateButton: document.querySelector('#generateButton'),
  multiButton: document.querySelector('#multiButton'),
  clearButton: document.querySelector('#clearButton'),
  copyHashButton: document.querySelector('#copyHashButton'),
  hashOutput: document.querySelector('#hashOutput'),
  resultMeta: document.querySelector('#resultMeta'),
  algorithmName: document.querySelector('#algorithmName'),
  algorithmDescription: document.querySelector('#algorithmDescription'),
  securityBadge: document.querySelector('#securityBadge'),
  useCaseTags: document.querySelector('#useCaseTags'),
  runtimeNote: document.querySelector('#runtimeNote'),
  compareHash: document.querySelector('#compareHash'),
  compareButton: document.querySelector('#compareButton'),
  useGeneratedButton: document.querySelector('#useGeneratedButton'),
  compareStatus: document.querySelector('#compareStatus'),
  multiTableBody: document.querySelector('#multiTableBody'),
  multiCount: document.querySelector('#multiCount'),
  toast: document.querySelector('#toast'),
};

const state = {
  algorithms: [],
  lastResult: null,
  toastTimer: null,
};

const preferredAlgorithm = 'sha256';

document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
  elements.hashInput.value = 'Hello, World!';
  bindEvents();
  updateInputStats();
  updateRoundsLabel();

  await Promise.allSettled([loadHealth(), loadAlgorithms()]);
  updateAlgorithmDetail();
  updateGeneratedHashButton();
}

function bindEvents() {
  elements.hashInput.addEventListener('input', updateInputStats);
  elements.roundsInput.addEventListener('input', updateRoundsLabel);
  elements.algorithmSelect.addEventListener('change', updateAlgorithmDetail);
  elements.generateButton.addEventListener('click', generateHash);
  elements.multiButton.addEventListener('click', generateAllDigests);
  elements.clearButton.addEventListener('click', clearWorkspace);
  elements.copyHashButton.addEventListener('click', () => {
    copyText(elements.hashOutput.textContent);
  });
  elements.compareButton.addEventListener('click', compareBcryptHash);
  elements.useGeneratedButton.addEventListener('click', useGeneratedHash);
  elements.multiTableBody.addEventListener('click', (event) => {
    const button = event.target.closest('[data-copy-hash]');

    if (button) {
      copyText(button.dataset.copyHash);
    }
  });
}

async function loadHealth() {
  try {
    const health = await fetchJson('/hash/health');
    elements.healthLabel.textContent = `API online - ${health.algorithmsAvailable} algorithms`;
    elements.healthLabel.classList.add('is-ok');
  } catch (error) {
    elements.healthLabel.textContent = 'API unavailable';
    elements.healthLabel.classList.add('is-error');
  }
}

async function loadAlgorithms() {
  state.algorithms = await fetchJson('/hash/algorithms');
  renderAlgorithmOptions();
}

function renderAlgorithmOptions() {
  const groups = new Map();

  state.algorithms.forEach((algorithm) => {
    const category = algorithm.category || 'Other';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category).push(algorithm);
  });

  const fragment = document.createDocumentFragment();

  groups.forEach((algorithms, category) => {
    const group = document.createElement('optgroup');
    group.label = category;

    algorithms.forEach((algorithm) => {
      const option = document.createElement('option');
      option.value = algorithm.name;
      option.disabled = !algorithm.available;
      option.textContent = `${algorithm.name} - ${algorithm.outputSize} bit${
        algorithm.available ? '' : ' - unavailable'
      }`;
      group.append(option);
    });

    fragment.append(group);
  });

  elements.algorithmSelect.replaceChildren(fragment);

  const defaultOption =
    state.algorithms.find(
      (algorithm) => algorithm.name === preferredAlgorithm && algorithm.available,
    ) || state.algorithms.find((algorithm) => algorithm.available);

  if (defaultOption) {
    elements.algorithmSelect.value = defaultOption.name;
  }
}

function updateInputStats() {
  const text = elements.hashInput.value;
  const bytes = new TextEncoder().encode(text).length;
  elements.charCount.textContent = `${text.length} chars`;
  elements.byteCount.textContent = `${bytes} bytes`;
}

function updateRoundsLabel() {
  elements.roundsValue.textContent = elements.roundsInput.value;
}

function updateAlgorithmDetail() {
  const algorithm = getSelectedAlgorithm();
  const isBcrypt = algorithm?.name === 'bcrypt';

  elements.roundsField.classList.toggle('is-hidden', !isBcrypt);

  if (!algorithm) {
    return;
  }

  elements.algorithmName.textContent = algorithm.name;
  elements.algorithmDescription.textContent = algorithm.description;
  elements.securityBadge.textContent = !algorithm.available
    ? 'Unavailable'
    : algorithm.secure
      ? 'Secure'
      : 'Legacy';
  elements.securityBadge.className = `badge ${
    !algorithm.available
      ? 'is-unavailable'
      : algorithm.secure
        ? 'is-secure'
        : 'is-legacy'
  }`;

  elements.useCaseTags.replaceChildren(
    ...algorithm.useCases.map((useCase) => {
      const tag = document.createElement('span');
      tag.textContent = useCase;
      return tag;
    }),
  );

  const note = algorithm.available
    ? algorithm.warning || ''
    : 'This runtime does not expose the required digest.';
  elements.runtimeNote.textContent = note;
  elements.generateButton.disabled = !algorithm.available;
}

async function generateHash() {
  const input = elements.hashInput.value;
  const algorithm = elements.algorithmSelect.value;

  if (!input.length) {
    showToast('Input text is empty.');
    elements.hashInput.focus();
    return;
  }

  const body = { input, algorithm };

  if (algorithm === 'bcrypt') {
    body.rounds = Number(elements.roundsInput.value);
  }

  setBusy(elements.generateButton, true, 'Generating');
  elements.hashOutput.textContent = 'Generating...';

  try {
    const result = await fetchJson('/hash/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    state.lastResult = result;
    renderHashResult(result);
    showToast('Hash generated.');
  } catch (error) {
    elements.hashOutput.textContent = '';
    showToast(error.message);
  } finally {
    setBusy(elements.generateButton, false, 'Generate hash');
    updateGeneratedHashButton();
  }
}

function renderHashResult(result) {
  elements.hashOutput.textContent = result.hash;
  elements.resultMeta.replaceChildren(
    createPill(result.algorithm),
    createPill(`${result.length} chars`),
    createPill(formatTime(result.timestamp)),
  );
}

async function generateAllDigests() {
  const input = elements.hashInput.value;

  if (!input.length) {
    showToast('Input text is empty.');
    elements.hashInput.focus();
    return;
  }

  setBusy(elements.multiButton, true, 'Running');

  try {
    const result = await fetchJson('/hash/multiple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });

    renderMultiTable(result.hashes);
    showToast('Digest batch complete.');
  } catch (error) {
    showToast(error.message);
  } finally {
    setBusy(elements.multiButton, false, 'Run all digests');
  }
}

function renderMultiTable(hashes) {
  const rows = state.algorithms
    .filter((algorithm) => algorithm.available && algorithm.name !== 'bcrypt')
    .filter((algorithm) => hashes[algorithm.name])
    .map((algorithm) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const bitCell = document.createElement('td');
      const hashCell = document.createElement('td');
      const actionCell = document.createElement('td');
      const copyButton = document.createElement('button');

      nameCell.textContent = algorithm.name;
      bitCell.textContent = algorithm.outputSize;
      hashCell.textContent = hashes[algorithm.name];
      hashCell.className = 'hash-cell';
      copyButton.type = 'button';
      copyButton.textContent = 'Copy';
      copyButton.dataset.copyHash = hashes[algorithm.name];
      actionCell.append(copyButton);

      row.append(nameCell, bitCell, hashCell, actionCell);
      return row;
    });

  if (!rows.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.className = 'empty-cell';
    cell.textContent = 'No available digest results';
    row.append(cell);
    rows.push(row);
  }

  elements.multiTableBody.replaceChildren(...rows);
  elements.multiCount.textContent = `${rows.length} row${rows.length === 1 ? '' : 's'}`;
}

async function compareBcryptHash() {
  const input = elements.hashInput.value;
  const hash = elements.compareHash.value.trim();

  if (!input.length || !hash.length) {
    showToast('Input text and bcrypt hash are required.');
    return;
  }

  setBusy(elements.compareButton, true, 'Comparing');
  setCompareStatus('Checking', '');

  try {
    const result = await fetchJson('/hash/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, hash }),
    });

    setCompareStatus(result.matches ? 'Match' : 'No match', result.matches ? 'match' : 'miss');
  } catch (error) {
    setCompareStatus('Error', 'miss');
    showToast(error.message);
  } finally {
    setBusy(elements.compareButton, false, 'Compare');
  }
}

function useGeneratedHash() {
  if (!state.lastResult?.hash) {
    showToast('No generated hash is available.');
    return;
  }

  elements.compareHash.value = state.lastResult.hash;
  showToast('Generated hash loaded.');
}

function updateGeneratedHashButton() {
  elements.useGeneratedButton.disabled = state.lastResult?.algorithm !== 'bcrypt';
}

function clearWorkspace() {
  elements.hashInput.value = '';
  elements.compareHash.value = '';
  elements.hashOutput.textContent = '';
  elements.resultMeta.replaceChildren(createPill('No result yet'));
  elements.multiTableBody.innerHTML =
    '<tr><td colspan="4" class="empty-cell">No batch result yet</td></tr>';
  elements.multiCount.textContent = '0 rows';
  state.lastResult = null;
  updateGeneratedHashButton();
  updateInputStats();
  setCompareStatus('Idle', '');
  elements.hashInput.focus();
}

function getSelectedAlgorithm() {
  return state.algorithms.find(
    (algorithm) => algorithm.name === elements.algorithmSelect.value,
  );
}

function createPill(text) {
  const pill = document.createElement('span');
  pill.textContent = text;
  return pill;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(' ')
      : data?.message || response.statusText;
    throw new Error(message);
  }

  return data;
}

function setBusy(button, busy, label) {
  button.disabled = busy;
  button.textContent = label;
}

function setCompareStatus(text, stateName) {
  elements.compareStatus.textContent = text;
  elements.compareStatus.className = `compare-status ${
    stateName ? `is-${stateName}` : ''
  }`;
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

async function copyText(text) {
  if (!text?.trim()) {
    showToast('Nothing to copy.');
    return;
  }

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const input = document.createElement('textarea');
      input.value = text;
      document.body.append(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }

    showToast('Copied.');
  } catch (error) {
    showToast('Copy failed.');
  }
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add('is-visible');
  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove('is-visible');
  }, 2400);
}
