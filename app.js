'use strict';
function calculateCalories(p) {
 const {sex,age,weight,height,activity,goal}=p;
 if(!['male','female'].includes(sex)||!Number.isInteger(age)||age<18||age>120||!Number.isFinite(weight)||weight<20||weight>500||!Number.isFinite(height)||height<100||height>250||![1.2,1.375,1.55,1.725,1.9].includes(activity)||![0.85,1,1.15].includes(goal)) throw new Error('Проверьте возраст (18–120), вес (20–500 кг) и рост (100–250 см).');
 const bmr=10*weight+6.25*height-5*age+(sex==='male'?5:-161);
 if(bmr<=0) throw new Error('Проверьте параметры: для них расчёт неприменим.');
 const maintenance=bmr*activity;
 return {bmr,maintenance,target:maintenance*goal};
}
if(typeof module!=='undefined') module.exports={calculateCalories};
if(typeof document!=='undefined'){
 const form=document.querySelector('form'),result=document.querySelector('#result'),status=document.querySelector('#status');
 const format=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0});
 form.addEventListener('input',()=>{result.hidden=true;status.textContent='';});
 form.addEventListener('submit',event=>{
 event.preventDefault();result.hidden=true;
 if(!form.checkValidity()){status.textContent='Заполните все поля корректно: возраст 18–120 лет, вес 20–500 кг, рост 100–250 см.';form.reportValidity();return;}
 const p={};
 for(const key of ['sex','age','weight','height','activity','goal']) p[key]=key==='sex'?form.elements[key].value:Number(form.elements[key].value);
 try{
 const values=calculateCalories(p);
 for(const key of ['bmr','maintenance','target']) document.getElementById(key).textContent=format.format(values[key]);
 document.querySelector('#description').textContent=p.goal===0.85?'На 15% ниже нормы поддержания':p.goal===1.15?'На 15% выше нормы поддержания':'Без изменения нормы';
 status.textContent='';result.hidden=false;
 }catch(error){status.textContent=error.message;}
 });
}