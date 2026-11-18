'use strict';
function calculateCalories(p) {
 const {sex,age,weight,height,activity,goal}=p;
 if(!['male','female'].includes(sex)||!Number.isInteger(age)||age<18||age>120||!Number.isFinite(weight)||weight<20||weight>500||!Number.isFinite(height)||height<100||height>250||![1.2,1.375,1.55,1.725,1.9].includes(activity)||![0.85,1,1.15].includes(goal)) throw new Error('Проверьте возраст (18–120), вес (20–500 кг) и рост (100–250 см).');
 const bmr=10*weight+6.25*height-5*age+(sex==='male'?5:-161);
 if(bmr<=0) throw new Error('Проверьте параметры: для них расчёт неприменим.');
 const maintenance=bmr*activity;
 return {bmr,maintenance,target:maintenance*goal};
}

function calculateBmi(weight, height) {
 const value = weight / ((height / 100) ** 2);
 if (!Number.isFinite(value) || weight <= 0 || height <= 0) throw new Error('Проверьте вес и рост.');
 return { value };
}
function calculateWater(weight) {
 if (!Number.isFinite(weight) || weight < 20 || weight > 500) throw new Error('Проверьте вес (20–500 кг).');
 return { millilitres: weight * 30, litres: weight * 30 / 1000 };
}
const exampleMeals = [
 { name: 'Завтрак', title: 'Овсянка с бананом и орехами', foods: [
  {name:'Овсяные хлопья, сухие',grams:70,kcal100:370},
  {name:'Молоко 2,5%',grams:200,kcal100:52},
  {name:'Банан, мякоть',grams:100,kcal100:89},
  {name:'Грецкие орехи',grams:15,kcal100:654}
 ]},
 { name: 'Обед', title: 'Курица с рисом и овощами', foods: [
  {name:'Куриная грудка, готовая без кожи',grams:150,kcal100:165},
  {name:'Рис, варёный',grams:200,kcal100:130},
  {name:'Свежие овощи без заправки',grams:200,kcal100:30},
  {name:'Растительное масло для заправки',grams:10,kcal100:900}
 ]},
 { name: 'Ужин', title: 'Рыба с гречкой и овощами', foods: [
  {name:'Белая рыба, готовая без масла',grams:150,kcal100:120},
  {name:'Гречка, варёная',grams:200,kcal100:110},
  {name:'Свежие овощи без заправки',grams:200,kcal100:30},
  {name:'Растительное масло для заправки',grams:10,kcal100:900}
 ]}
];
function getExampleMenu() {
 return exampleMeals.map(meal => ({...meal, calories:meal.foods.reduce((sum,food)=>sum+food.grams*food.kcal100/100,0)}));
}

if(typeof module!=='undefined') module.exports={calculateCalories,calculateBmi,calculateWater,getExampleMenu};
if(typeof document!=='undefined'){
 const form=document.querySelector('form'),result=document.querySelector('#result'),status=document.querySelector('#status');
 const format=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0});
 
 // Keep fields empty until a step is requested; start from the placeholder.
 const stepFields = ['age', 'weight', 'height'];
 function stepField(input, direction) {
   const current = input.value === '' ? Number(input.placeholder) : Number(input.value);
   const next = Math.min(Number(input.max), Math.max(Number(input.min), Math.round(current) + direction));
   input.value = String(next);
   input.dispatchEvent(new Event('input', { bubbles: true }));
 }
 stepFields.forEach(name => {
   const input = form.elements[name];
   input.addEventListener('keydown', event => {
     if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
       event.preventDefault();
       stepField(input, event.key === 'ArrowUp' ? 1 : -1);
     }
   });
 });
 form.querySelectorAll('[data-step]').forEach(button => {
   button.addEventListener('click', () => {
     const input = form.elements[button.dataset.field];
     stepField(input, Number(button.dataset.step));
     input.focus();
   });
 });

 form.addEventListener('input',()=>{result.hidden=true;status.textContent='';});
 form.addEventListener('submit',event=>{
 event.preventDefault();result.hidden=true;
 if(!form.checkValidity()){status.textContent='Заполните все поля корректно: возраст 18–120 лет, вес 20–500 кг, рост 100–250 см.';form.reportValidity();return;}
 const p={};
 for(const key of ['sex','age','weight','height','activity','goal']) p[key]=key==='sex'?form.elements[key].value:Number(form.elements[key].value);
 try{
 const values=calculateCalories(p);
 const bmi=calculateBmi(p.weight,p.height);
 document.querySelector('#bmi').textContent=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(bmi.value);
 const water=calculateWater(p.weight);
 document.querySelector('#water-litres').textContent=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(water.litres);
 document.querySelector('#water-ml').textContent=format.format(water.millilitres);
 const meals=document.querySelector('#meals');
 meals.replaceChildren();
 const menu=getExampleMenu();
 menu.forEach(meal=>{
 const article=document.createElement('article');article.className='meal';
 const heading=document.createElement('h3');heading.textContent=meal.name+' · ≈'+format.format(meal.calories)+' ккал';
 const title=document.createElement('p');title.textContent=meal.title;
 const list=document.createElement('ul');
 meal.foods.forEach(food=>{const item=document.createElement('li');item.textContent=food.name+' — '+food.grams+' г';list.append(item);});
 article.append(heading,title,list);meals.append(article);
 });
 document.querySelector('#menu-total').textContent=format.format(menu.reduce((sum,meal)=>sum+meal.calories,0));
 for(const key of ['bmr','maintenance','target']) document.getElementById(key).textContent=format.format(values[key]);
 document.querySelector('#description').textContent=p.goal===0.85?'На 15% ниже нормы поддержания':p.goal===1.15?'На 15% выше нормы поддержания':'Без изменения нормы';
 status.textContent='';result.hidden=false;
 }catch(error){status.textContent=error.message;}
 });
}