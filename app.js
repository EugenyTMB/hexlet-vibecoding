'use strict';
const storageKey = 'hexlet-calorie-foods-v1';
const form = document.querySelector('#food-form');
const status = document.querySelector('#status');
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
const valid = item => item && typeof item.name === 'string' && item.name.trim().length > 0 && item.name.length <= 100 && Number.isFinite(item.weight) && item.weight >= 0.1 && item.weight <= 100000 && Number.isFinite(item.calories) && item.calories >= 0 && item.calories <= 1000;
let foods = [];
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) foods = saved.filter(valid);
} catch { status.textContent = 'Не удалось загрузить сохранённый список.'; }
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(foods)); }
  catch { status.textContent = 'Сохранение недоступно. Список работает до закрытия страницы.'; }
}
function render() {
  const body = document.querySelector('#foods');
  body.replaceChildren();
  let total = 0;
  foods.forEach((food, index) => {
    const kcal = food.weight * food.calories / 100;
    total += kcal;
    const row = document.createElement('tr');
    [food.name, number.format(food.weight) + ' г', number.format(kcal)].forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    const cell = document.createElement('td');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'remove';
    button.textContent = 'Удалить';
    button.setAttribute('aria-label', 'Удалить ' + food.name);
    button.addEventListener('click', () => {
      foods.splice(index, 1);
      status.textContent = 'Продукт удалён.';
      save(); render();
      document.querySelector('#name').focus();
    });
    cell.append(button); row.append(cell); body.append(row);
  });
  document.querySelector('#total').textContent = number.format(total);
  document.querySelector('#count').textContent = 'Продуктов: ' + foods.length;
  document.querySelector('#empty').hidden = foods.length > 0;
  document.querySelector('#table').hidden = foods.length === 0;
  document.querySelector('#clear').hidden = foods.length === 0;
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const food = { name: document.querySelector('#name').value.trim(), weight: Number(document.querySelector('#weight').value), calories: Number(document.querySelector('#calories').value) };
  if (!valid(food)) { status.textContent = 'Проверьте название, вес и калорийность продукта.'; return; }
  foods.push(food);
  status.textContent = 'Продукт добавлен.';
  save(); render(); form.reset(); document.querySelector('#name').focus();
});
document.querySelector('#clear').addEventListener('click', () => {
  foods = []; status.textContent = 'Список очищен.';
  save(); render(); document.querySelector('#name').focus();
});
render();
