import { evaluate } from "../engine/evaluator.ts";
import { tokenize } from "../engine/lexer.ts";
import { parse } from "../engine/parser.ts";

// SELECT name, city FROM users WHERE age > 18

// const query = 'SELECT name, city FROM users WHERE age > 18';
//
// const database = [
//   { id: 1, name: 'Alice', age: 25, city: 'Rio' },
//   { id: 2, name: 'Bob', age: 17, city: 'SP' },
//   { id: 3, name: 'Charlie', age: 30, city: 'BH' }
// ];
//
// const tokens = tokenize(query);
//
// const parsed = parse(tokens);
// console.log(JSON.stringify(parsed, null, 2));
//
// const evaluated = evaluate(parsed, database);
// console.log(evaluated);

const query = document.getElementById('query-input') as HTMLInputElement;
const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
const jsonInput = document.getElementById('json-input') as HTMLTextAreaElement;
const resultOutput = document.getElementById('result-output') as HTMLPreElement;

clearBtn.addEventListener('click', () => {
  try {
    resultOutput.classList.remove('error');
    resultOutput.textContent = '';
  } catch (err: any) {
    resultOutput.classList.add('error');
    resultOutput.textContent = err.message;
  }
});

runBtn?.addEventListener('click', () => {
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
});
