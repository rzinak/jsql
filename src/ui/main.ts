// TODO: let the user create data sources -- tables --, i already added a select there in the 'input json' section.
// i could start with some in-memory data, so it wont start empty;
// no need for a modal now, window.prompt is enough for now;
// one thing i should keep in mind is during the 'context switch', as i would need to save the current data inside
// the in-memory storage, should not allow the user to change the data source if there's something wrong;
// need a global state for the current data source;

import { evaluate } from "../engine/evaluator.ts";
import { tokenize } from "../engine/lexer.ts";
import { parse } from "../engine/parser.ts";
import { NESTED_INITIAL_DATA } from "../utils/data.ts";

const query = document.getElementById('query-input') as HTMLInputElement;
const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
const copyInputBtn = document.getElementById('copy-input-btn') as HTMLButtonElement;
const clearInputBtn = document.getElementById('clear-input-btn') as HTMLButtonElement;
const copyOutputBtn = document.getElementById('copy-output-btn') as HTMLButtonElement;
const clearOutputBtn = document.getElementById('clear-output-btn') as HTMLButtonElement;
const jsonInput = document.getElementById('json-input') as HTMLTextAreaElement;
const resultOutput = document.getElementById('result-output') as HTMLPreElement;

jsonInput.value = JSON.stringify(NESTED_INITIAL_DATA, null, 2);
// query.value = 'select id, age, city, meta from data where meta.views = 100';
// query.value = 'select id, age, city, preferences from data where preferences.notifications.sms = false';
// query.value = 'select id, age, city, address from data where LIKE "rua%"';
// query.value = 'select id, age, city, address from data where address.street LIKE "rua%"';
// query.value = 'SELECT name, preferences.language FROM users WHERE preferences.language LIKE "pt%"';
query.value = 'SELECT name, preferences.language, address FROM users WHERE preferences.language LIKE "pt%"';

const run = () => {
  try {
    resultOutput.classList.remove('error');
    resultOutput.textContent = '';
    const tokens = tokenize(query.value);
    const parsed = parse(tokens);
    const parsedInputJson = JSON.parse(jsonInput.value);
    const evaluated = evaluate(parsed, parsedInputJson);
    resultOutput.textContent = JSON.stringify(evaluated, null, 2);
  } catch (err: any) {
    resultOutput.classList.add('error');
    resultOutput.textContent = err.message;
  }
}

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Faiiled to copy text:', err);
  }
}

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
