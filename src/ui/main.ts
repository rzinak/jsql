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
const clearInputBtn = document.getElementById('clear-input-btn') as HTMLButtonElement;
const clearOutputBtn = document.getElementById('clear-output-btn') as HTMLButtonElement;
const jsonInput = document.getElementById('json-input') as HTMLTextAreaElement;
const resultOutput = document.getElementById('result-output') as HTMLPreElement;

const INITIAL_DATA = [
  { "id": 1, "name": "Alice", "age": 25, "city": "Rio" },
  { "id": 2, "name": "Bob", "age": 17, "city": "SP" },
  { "id": 3, "name": "Charlie", "age": 30, "city": "BH" },
  { "id": 4, "name": "David", "age": 40, "city": "Salvador" },
  { "id": 5, "name": "Eve", "age": 22, "city": "Brasília" },
  { "id": 6, "name": "Frank", "age": 35, "city": "Manaus" },
  { "id": 7, "name": "Grace", "age": 29, "city": "Fortaleza" },
  { "id": 8, "name": "Hank", "age": 28, "city": "Recife" },
  { "id": 9, "name": "Ivy", "age": 24, "city": "Curitiba" },
  { "id": 10, "name": "Jack", "age": 26, "city": "Porto Alegre" },
  { "id": 11, "name": "Katie", "age": 32, "city": "Belo Horizonte" },
  { "id": 12, "name": "Leo", "age": 33, "city": "São Paulo" },
  { "id": 13, "name": "Mia", "age": 21, "city": "Florianópolis" },
  { "id": 14, "name": "Nate", "age": 23, "city": "Campinas" },
  { "id": 15, "name": "Olivia", "age": 27, "city": "Niterói" },
  { "id": 16, "name": "Paul", "age": 31, "city": "Maceió" },
  { "id": 17, "name": "Quinn", "age": 19, "city": "Santos" },
  { "id": 18, "name": "Rita", "age": 38, "city": "Vitória" },
  { "id": 19, "name": "Sam", "age": 36, "city": "Aracaju" },
  { "id": 20, "name": "Tina", "age": 34, "city": "Cuiabá" },
  { "id": 21, "name": "Ursula", "age": 39, "city": "Belém" },
  { "id": 22, "name": "Vince", "age": 22, "city": "Goiânia" },
  { "id": 23, "name": "Wendy", "age": 30, "city": "João Pessoa" },
  { "id": 24, "name": "Xander", "age": 28, "city": "Teresina" },
  { "id": 25, "name": "Yara", "age": 27, "city": "São Luís" },
  { "id": 26, "name": "Zane", "age": 24, "city": "Caxias do Sul" },
  { "id": 27, "name": "Aiden", "age": 29, "city": "Natal" },
  { "id": 28, "name": "Bella", "age": 22, "city": "Macapá" },
  { "id": 29, "name": "Cameron", "age": 25, "city": "São Gonçalo" },
  { "id": 30, "name": "Diana", "age": 31, "city": "Juiz de Fora" },
  { "id": 31, "name": "Ethan", "age": 23, "city": "Ribeirão Preto" },
  { "id": 32, "name": "Felicia", "age": 30, "city": "São João de Meriti" },
  { "id": 33, "name": "Gabriel", "age": 34, "city": "Olinda" },
  { "id": 34, "name": "Helen", "age": 38, "city": "Blumenau" },
  { "id": 35, "name": "Ian", "age": 25, "city": "São Bernardo do Campo" },
  { "id": 36, "name": "Julian", "age": 32, "city": "Novo Hamburgo" },
  { "id": 37, "name": "Kimberly", "age": 28, "city": "Maringá" },
  { "id": 38, "name": "Liam", "age": 26, "city": "São Caetano do Sul" },
  { "id": 39, "name": "Megan", "age": 29, "city": "Ponta Grossa" },
  { "id": 40, "name": "Noah", "age": 21, "city": "Bauru" },
  { "id": 41, "name": "Olga", "age": 33, "city": "Rio Grande" },
  { "id": 42, "name": "Perry", "age": 32, "city": "Petrolina" },
  { "id": 43, "name": "Quincy", "age": 28, "city": "Aracaju" },
  { "id": 44, "name": "Ralph", "age": 24, "city": "Tocantins" },
  { "id": 45, "name": "Sally", "age": 26, "city": "Itajaí" },
  { "id": 46, "name": "Travis", "age": 30, "city": "Palmas" },
  { "id": 47, "name": "Uriah", "age": 29, "city": "Cuiabá" },
  { "id": 48, "name": "Vera", "age": 27, "city": "Divinópolis" },
  { "id": 49, "name": "Wade", "age": 35, "city": "Porto Velho" },
  { "id": 50, "name": "Xena", "age": 22, "city": "Londrina" }
]

jsonInput.value = JSON.stringify(INITIAL_DATA, null, 2);
// query.value = 'SELECT name, city, age FROM data WHERE age < 22';
query.value = 'SELECT * FROM data';

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
