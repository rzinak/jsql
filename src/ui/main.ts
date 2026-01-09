import { evaluate } from "../engine/evaluator.ts";
import { tokenize } from "../engine/lexer.ts";
import { parse } from "../engine/parser.ts";
import { FLAT_INITIAL_DATA, NESTED_INITIAL_DATA } from "../utils/data.ts";

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

// query.value = 'SELECT * from example_flat where age = 25';
// query.value = 'SELECT preferences.language, COUNT(*) FROM example_nested GROUP BY preferences.language';

// query.value = 'SELECT preferences.language FROM example_nested GROUP BY preferences.language';

// query.value = 'SELECT preferences.language, AVG(age), SUM(meta.views) FROM example_nested GROUP BY preferences.language';
// query.value = 'SELECT preferences.notifications.sms, MIN(age), MAX(age) FROM example_nested GROUP BY preferences.notifications.sms';
//query.value = 'SELECT preferences.language, COUNT(*) FROM example_nested WHERE age > 25 GROUP BY preferences.language';
// query.value = 'SELECT city as cidade, COUNT(DISTINCT age) as idades_unicas FROM example_nested GROUP BY city';
// query.value = 'SELECT preferences.language as lang, COUNT(*) as total FROM example_nested GROUP BY preferences.language';
// query.value = 'SELECT city as cidade, COUNT(DISTINCT city) as total_moradores FROM example_nested GROUP BY city';
// example output for the query above would be:
// [
//   {
//     "city": "Rio",
//     "age": 25,
//     "total": 1
//   },
//   {
//     "city": "São Paulo",
//     "age": 33,
//     "total": 1
//   }
// ]

// test this one as well
// query.value = 'SELECT preferences.language, COUNT(*) FROM example_nested GROUP BY preferences.language';

// SUM and AVG
// query.value = 'SELECT city as cidade, SUM(meta.views) as total_views, AVG(meta.views) as media_views FROM example_nested GROUP BY city';

// MIN and MAX
// query.value = 'SELECT preferences.language as lang, MIN(age) as menor_idade, MAX(age) as maior_idade FROM example_nested GROUP BY preferences.language';

// aggr + distinct + filter
query.value = 'SELECT city, COUNT(*) as total_pessoas, SUM(meta.views) as soma_views, COUNT(DISTINCT preferences.color) as cores_unicas FROM example_nested WHERE age > 20 GROUP BY preferences.language';

// edge testing
// query.value = 'SELECT city, SUM(name) as soma_nomes, AVG(social.instagram) as media_social FROM example_nested GROUP BY city';
// sum here returns zero or null, avg is trying to work on a field that doesnt exist!

const STORAGE_KEY = 'jsql_database';
const TABLE_KEY = 'jsq_current_table';

const SEED_DATA = {
  "example_nested": NESTED_INITIAL_DATA,
  "example_flat": FLAT_INITIAL_DATA,
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
    if (parsed.from !== currentTable) {
      throw new Error(`Table '${parsed.from}' not found. Did you mean '${currentTable}'?`);
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

run();

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Faiiled to copy text:', err);
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