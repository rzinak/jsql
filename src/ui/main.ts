import { evaluate } from "../engine/evaluator.ts";
import { tokenize } from "../engine/lexer.ts";
import { parse } from "../engine/parser.ts";
import { INITIAL_DATA } from "../utils/data.ts";

const query = document.getElementById('query-input') as HTMLInputElement;
const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
const clearInputBtn = document.getElementById('clear-input-btn') as HTMLButtonElement;
const clearOutputBtn = document.getElementById('clear-output-btn') as HTMLButtonElement;
const jsonInput = document.getElementById('json-input') as HTMLTextAreaElement;
const resultOutput = document.getElementById('result-output') as HTMLPreElement;

// TODO: add support for the rest of SQL keywords

jsonInput.value = JSON.stringify(INITIAL_DATA, null, 2);
query.value = 'select id, age, city from data where age < 22 and not city = "Santos"';

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

clearInputBtn.addEventListener('click', () => {
  try {
    jsonInput.value = '';
  } catch (err: any) {
    jsonInput.classList.add('error');
    jsonInput.value = err.message;
  }
});

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
