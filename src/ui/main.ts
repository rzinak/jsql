// TODO: implement JOIN

import { evaluate } from "../engine/evaluator.ts";
import { tokenize } from "../engine/lexer.ts";
import { parse } from "../engine/parser.ts";
import { CITIES, FLAT_INITIAL_DATA, NESTED_INITIAL_DATA, USERS } from "../utils/data.ts";

const query = document.getElementById('query-input') as HTMLInputElement;
const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
const copyInputBtn = document.getElementById('copy-input-btn') as HTMLButtonElement;
const clearInputBtn = document.getElementById('clear-input-btn') as HTMLButtonElement;
const copyOutputBtn = document.getElementById('copy-output-btn') as HTMLButtonElement;
const clearOutputBtn = document.getElementById('clear-output-btn') as HTMLButtonElement;
const jsonInput = document.getElementById('json-input') as HTMLTextAreaElement;
const resultOutput = document.getElementById('result-output') as HTMLPreElement;
const selectElement = document.getElementById('table-selector') as HTMLSelectElement;
const addTableBtn = document.getElementById('add-table-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const toast = document.getElementById('toast') as HTMLDivElement;
const toastMessage = document.getElementById('toast-message') as HTMLSpanElement;
const toastClose = document.getElementById('toast-close') as HTMLButtonElement;

query.value = 'SELECT name, preferences.notifications.sms, meta.views FROM example_nested WHERE preferences.color = blue';

// query.value = 'SELECT preferences.language as lang, COUNT(*) as total_users, AVG(meta.views) as avg_views FROM example_nested WHERE age >= 25 GROUP BY preferences.language HAVING total_users >= 2 ORDER BY avg_views DESC LIMIT 1';

// query.value = 'SELECT COUNT(*) as total, AVG(age) as media_idade FROM example_nested';

// TODO: IMPLEMENT JOIN!
// JOIN TEST
// query.value = 'SELECT u.name as usuario, c.name as cidade, c.uf FROM users u JOIN cities c ON u.city_id = c.id';

const STORAGE_KEY = 'jsql_database';
const TABLE_KEY = 'jsq_current_table';

const SEED_DATA = {
   "example_nested": NESTED_INITIAL_DATA,
  "example_flat": FLAT_INITIAL_DATA, 
  "users": USERS,
  "cities": CITIES
}

const storedData = localStorage.getItem(STORAGE_KEY);
const storedTable = localStorage.getItem(TABLE_KEY);

const database: Record<string, any[]> = storedData ? JSON.parse(storedData) : SEED_DATA;

let currentTable: string = storedTable || Object.keys(database)[0];

let typingTimer: number | undefined;
const doneTypingInterval = 500;

const saveState = () => {
  try {
    const currentJson = JSON.parse(jsonInput.value);
    database[currentTable] = currentJson;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
    localStorage.setItem(TABLE_KEY, currentTable);
  } catch (err) {
    console.warn('Invalid input json... Ignoring automatic save');
  }
}

const populateSelect = (obj: Record<string, any[]>) => {
  while (selectElement.options.length) selectElement.options.remove(0);
  const keys = Object.keys(obj);
  keys.forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    selectElement?.append(option);
  });
  if (storedTable) {
    selectElement.value = currentTable;
  }
}

populateSelect(database);

jsonInput.value = JSON.stringify(database[currentTable], null, 2);

const changeTable = (table: string) => {
  try {
    const parsedData = JSON.parse(jsonInput.value);
    database[currentTable] = parsedData;
    currentTable = table;
    jsonInput.value = JSON.stringify(database[currentTable], null, 2);
    saveState();
  } catch (err: any) {
    resultOutput.classList.add('error');
    resultOutput.textContent = err.message;
  }
}

selectElement.addEventListener('change', (event) => {
  const selectedValue = (event.target as HTMLSelectElement).value;
  changeTable(selectedValue);
});

const addTable = (newTableName: string | null) => {
  try {
    resultOutput.classList.remove('error');
    resultOutput.textContent = '';

    if (!newTableName || newTableName.trim() === '') {
      throw new Error('Table name cannot be empty');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newTableName)) {
      throw new Error('Table name can only contain letters, numbers and underscores');
    }

    if (database.hasOwnProperty(newTableName)) {
      throw new Error(`Table ${newTableName} already exists`);
    }

    database[newTableName] = [];
    populateSelect(database);
    changeTable(newTableName);
    selectElement.value = newTableName;
    saveState();
  } catch (err: any) {
    resultOutput.classList.add('error');
    resultOutput.textContent = err.message;
  }
}

addTableBtn.addEventListener('click', () => {
  addTable(window.prompt('Table name:'));
});

const run = () => {
  try {
    resultOutput.classList.remove('error');
    resultOutput.textContent = '';
    const tokens = tokenize(query.value);
    const parsed = parse(tokens);
    if (parsed.from.table !== currentTable) {
      throw new Error(`Table '${parsed.from.table}' not found. Did you mean '${currentTable}'?`);
    }
    const parsedInputJson = JSON.parse(jsonInput.value);
    const evaluated = evaluate(parsed, parsedInputJson);
    resultOutput.textContent = JSON.stringify(evaluated, null, 2);
    saveState();
  } catch (err: any) {
    resultOutput.classList.add('error');
    resultOutput.textContent = err.message;
  }
}

const showToast = (message: string = 'Copied to clipboard!') => {
  toastMessage.textContent = message;
  toast.classList.remove('hide');
  toast.classList.add('show');

  const hideToast = () => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      toast.classList.remove('hide');
    }, 300);
  };

  const timeout = setTimeout(hideToast, 3000);

  const closeHandler = () => {
    clearTimeout(timeout);
    hideToast();
    toastClose.removeEventListener('click', closeHandler);
  };

  toastClose.addEventListener('click', closeHandler);
};

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    showToast();
  } catch (err) {
    console.error('Failed to copy text:', err);
    showToast('Failed to copy!');
  }
}

const onTypingComplete = () => saveState();

copyInputBtn.addEventListener('click', () => copyToClipboard(jsonInput.value));

clearInputBtn.addEventListener('click', () => {
  try {
    jsonInput.value = '';
  } catch (err: any) {
    jsonInput.classList.add('error');
    jsonInput.value = err.message;
  }
});

copyOutputBtn.addEventListener('click', () => copyToClipboard(resultOutput.textContent));

clearOutputBtn.addEventListener('click', () => {
  try {
    resultOutput.classList.remove('error');
    resultOutput.textContent = '';
  } catch (err: any) {
    resultOutput.classList.add('error');
    resultOutput.textContent = err.message;
  }
});

runBtn?.addEventListener('click', run);
query?.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    run();
  }
});

jsonInput.addEventListener('blur', saveState);

jsonInput.addEventListener('input', () => {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(onTypingComplete, doneTypingInterval);
});

resetBtn.addEventListener('click', () => {
  if (confirm('Do you really want to delete all created tables and revert to the default ones?')) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TABLE_KEY);
    window.location.reload();
  }
});
