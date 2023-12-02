import { openModal, closeModal } from "./modal.mjs";

//Получаем элементы страниц из DOM
const pageStart = document.getElementById('start-page');
const pageMain = document.getElementById('main-page');
const pageProducts = document.getElementById('products-page');
const pageSetting = document.getElementById('setting-page');
const iconMain = document.getElementById('icon-main');
const iconProducts = document.getElementById('icon-products');
const iconSetting = document.getElementById('icon-setting');

//Получаем все кнопки из DOM
const buttonAll = document.querySelectorAll('button');

//Получаем элементы Стартовой страницы из DOM
const textNorm = document.getElementById('norm-count');
const circleNorm = document.querySelector('.graph-circle');
const textGraph = document.querySelector('.graph-title');
const buttonsGender = document.querySelectorAll('.gender-button');
const inputsParameters = document.querySelectorAll('.parameters-input');
const buttonsActivity = document.querySelectorAll('.activity-button');
const inputAge = document.getElementById('input-age');
const inputHeight = document.getElementById('input-height');
const inputWeight = document.getElementById('input-weight');
const buttonEnd = document.getElementById('end-button');

//Получаем элементы Модальных окон из DOM
const buttonAddFood = document.getElementById('add-food-button');
const buttonCloseFood = document.getElementById('close-modal-food');
const buttonAddProduct = document.getElementById('add-product-button');
const buttonCloseProduct = document.getElementById('close-modal-product');
const buttonAddProductModal = document.getElementById('add-product-modal-button');
const buttonAddFoodModal = document.getElementById('add-food-modal-button');

//Получаем элементы Главной страницы из DOM
const listFood = document.getElementById('food-list');
const listEatenFood = document.getElementById('eaten-list');

//Получаем элементы страницы Списка продуктов из DOM
const inputSearch = document.getElementById('search-input');
const colunmCalorie = document.getElementById('calorie-th');
const tableProducts = document.getElementById('product-body');
const inputProductName = document.getElementById('add-product-name');
const inputProductKcal = document.getElementById('add-product-kcal');

//Получаем элементы страницы Параметров из DOM
const buttonsGenderSetting = document.querySelectorAll('.gender-setting');
const buttonsActivitySetting = document.querySelectorAll('.activity-setting');
const inputAgeSetting = document.getElementById('setting-age');
const inputHeightSetting =  document.getElementById('setting-height');
const inputWeightSetting =  document.getElementById('setting-weight');
const buttonChange = document.getElementById('change-button');

//Начальные состояния
let User = {};
let FoodsToday = new Map();
let Products = new Map([
  ['Бананы',  87],
  ['Креветка',  85],
  ['Хлеб пшеничный', 246],
  ['Крупа овсяная',  342],
  ['Молоко 3,2%',  58],
  ['Крупа гречневая',  30],
  ['Курица',  161],
  ['Хлеб ржаной', 210],
  ['Форель',  99],
  ['Яйцо куриное',  153],
  ['Масло оливковое',  898],
]);

//Снимаем default состояние со всех кнопок
buttonAll.forEach(btn => btn.addEventListener('click', event => event.preventDefault()))

//Получаем данные из LocalStorage при загрузке
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('user') != null) {
    User = JSON.parse(localStorage.getItem ('user'));
  } else {
    pageStart.classList.remove('hidden');
  }

  if (localStorage.getItem('products') != null) {
    Products = new Map(JSON.parse(localStorage.getItem('products')));
  } 

  if (localStorage.getItem('foodsToday') != null) {
    FoodsToday = new Map(JSON.parse(localStorage.getItem('foodsToday')));
    buildMainPage();
  } 
})

//Ограничиваем ввод цифрами для параметров пользователя
inputsParameters.forEach(input => {input.oninput = () => inputNumber(input)})

//Задаем начальные параметры для профиля
buttonsGender.forEach(btn => 
  btn.addEventListener('click', () => {chooseButton(buttonsGender, btn)}
))
buttonsActivity.forEach(btn => 
  btn.addEventListener('click', () => {chooseButton(buttonsActivity, btn)}
))

//Получаем параметры и скрываем Стартовую страницы с настройками
buttonEnd.addEventListener('click', () => {
  if (inputAge.value > 0 && inputHeight.value >= 80 && inputHeight.value <= 250 && inputWeight.value >= 20 && inputWeight.value <= 300) {
    User.age = inputAge.value;
    User.height = inputHeight.value;
    User.weight = inputWeight.value;
    User.gender = document.querySelectorAll('.gender-button.choose-button')[0].innerHTML;
    User.activity = document.querySelectorAll('.activity-button.choose-button')[0].innerHTML;
    User.dailyNorm = getDailyNorm();
    localStorage.setItem('user', JSON.stringify(User));
    pageStart.classList.add('hidden-page');
  }
  buildMainPage();
})

//Переключение между страницами
iconMain.addEventListener('click', () => {
  if (pageMain.classList.contains('hidden')) {
    pageProducts.classList.add('hidden');
    pageSetting.classList.add('hidden');
    pageMain.classList.remove('hidden');
    buildMainPage();
  }
})
iconProducts.addEventListener('click', () => {
  if (pageProducts.classList.contains('hidden')) {
    pageMain.classList.add('hidden');
    pageSetting.classList.add('hidden');
    pageProducts.classList.remove('hidden');
    saveLocalStorage(Products, 'products');
    buildTable(Products);
  }
})
iconSetting.addEventListener('click', () => {
  if (pageSetting.classList.contains('hidden')) {
    pageMain.classList.add('hidden');
    pageProducts.classList.add('hidden');
    pageSetting.classList.remove('hidden');
    setSettingData();
    document.querySelectorAll('.parameters-setting').forEach(input => {input.oninput = () => inputNumber(input)})
  }
})

//Добавление приема пищи с выбранными продуктами на Главную страницу
buttonAddFoodModal.addEventListener('click', () => {
  const inputsCheckedFood = document.querySelectorAll('#label-checkbox');

  let hasEmptyInput = false;
  //Перебираем input:checked
  inputsCheckedFood.forEach(el => {
    if (el.parentElement.children[0].checked) {
      //Если значение input не заполнено, выводим цветовое предупреждение
      if (el.parentElement.parentElement.children[1].value === ''){
        let errorEl= el.parentElement.parentElement.children[1];
        errorEl.style.border = '2px solid var(--red)';
        hasEmptyInput =true;         
      } else {
        let errorEl= el.parentElement.parentElement.children[1];
        errorEl.style.border = '2px solid var(--black)';
      }
    }
  })

  //Если незаполненных input в модальном окне нет, то отрисовываем Main Page и добавляем прием пищи
  if(!hasEmptyInput){
    const idFood = getId();
    let arrayFood = [];
    //Если input:checked, получаем данные и добавляем в массив со съеденными продуктами
    inputsCheckedFood.forEach(el => {
      if (el.parentElement.children[0].checked) {
        let name = el.dataset.name;
        let kcalCount = Number(el.dataset.kcal);
        let gramm = Number(el.parentElement.parentElement.children[1].value);
        arrayFood.push({ name , kcal : (gramm * kcalCount / 100) })
      }
    })

    FoodsToday.set(idFood, arrayFood);
    closeModal('modal-food');
    buildMainPage();
  } 
})

//Добавление продукта в Список продуктов
buttonAddProductModal.addEventListener('click', () => {
  let hasEmptyInput = false;

  //Проверяем что все поля заполнены
  if (inputProductName.value == '') {
    inputProductName.style.border = '2px solid var(--red)';
    hasEmptyInput = true;
  } else {
    inputProductName.style.border = '2px solid var(--black)';
  } 
  if (inputProductKcal.value == '') {
    inputProductKcal.style.border = '2px solid var(--red)';
    hasEmptyInput = true;
  } else {
    inputProductKcal.style.border = '2px solid var(--black)';
  }

  if(!hasEmptyInput) {
    Products.set(inputProductName.value, inputProductKcal.value);
    saveLocalStorage(Products, 'products');
    buildTable(Products);
    closeModal('modal-product');
    inputProductName.value = '';
    inputProductKcal.value = '';
  }
})

//Сортируем по калорийности
colunmCalorie.addEventListener('click', () => {
  let order = colunmCalorie.dataset.order;
  let text = colunmCalorie.innerHTML;
  text = text.substring(0, text.length-2);

  if (order === 'desc') {
    colunmCalorie.dataset.order = 'asc';
    colunmCalorie.innerHTML = text + ' ▼';
    const ProductsSort = Array.from(Products).sort((a, b) => b[1] - a[1]);
    Products = new Map(ProductsSort)
  } else {
    colunmCalorie.dataset.order = 'desc';
    colunmCalorie.innerHTML = text + ' ▲';
    const ProductsSort = Array.from(Products).sort((a, b) => a[1] - b[1]);
    Products = new Map(ProductsSort)
  }
  saveLocalStorage(Products, 'products');
  buildTable(Products);
})

//Фильтруем по названию продукта
inputSearch.addEventListener('input', (event) => {
  const ProductsFilter = new Map();
  
  Products.forEach((value, key) => {
    if (key.toLowerCase().includes(event.target.value.toLowerCase())) {
      ProductsFilter.set(key, value)
    }
  })
  buildTable(ProductsFilter);
})

//Изменяем значения параметров профиля в Настройках
buttonsGenderSetting.forEach(btn => 
  btn.addEventListener('click', () => {chooseButton(buttonsGenderSetting, btn)}
))
buttonsActivitySetting.forEach(btn => 
  btn.addEventListener('click', () => {chooseButton(buttonsActivitySetting, btn)}
))

//Получаем значения параметров для User со страницы Настроек
buttonChange.addEventListener('click', () => {
  //Проверяем что значения заполнены в указанных пределах
  if (inputAgeSetting.value > 0 && inputHeightSetting.value >= 70 && inputHeightSetting.value <= 300 && inputWeightSetting.value >= 20 && inputWeightSetting.value <= 500) {
    User.age = inputAgeSetting.value;
    User.height = inputHeightSetting.value;
    User.weight = inputWeightSetting.value;
    User.gender = document.querySelectorAll('.gender-setting.choose-button')[0].innerHTML;
    User.activity = document.querySelectorAll('.activity-setting.choose-button')[0].innerHTML;
    User.dailyNorm = getDailyNorm();
    //Сохраняем пару ключ/значение в LocalStorage 
    localStorage.setItem('user', JSON.stringify(User));
  }
})

//Открытие и закрытие модальных окон
buttonAddFood.addEventListener('click', () => {
  buildFoodList(Products);
  document.querySelectorAll('.input-item').forEach(input => {input.oninput = () => inputNumber(input)});
  openModal('modal-food')
})
buttonCloseFood.addEventListener('click', () => closeModal('modal-food'));
buttonAddProduct.addEventListener('click', () => {
  openModal('modal-product')
  document.getElementById('add-product-kcal').oninput = () => inputNumber(document.getElementById('add-product-kcal'))})
buttonCloseProduct.addEventListener('click', () => closeModal('modal-product'));

/**
 * Метод для ввода в input только цифр
 * @param {any} input Input-элемент
 * @returns Числовое значение input
 */
function inputNumber (input) {
  input.value = input.value.replace(/[A-Za-zА-Яа-яЁё\,\.<>/\|+={}~`[\]:;\s"'?!@#$%^&*()_\-]/g, '');
}

/**
 * Метод для визуального изменения кнопок с параметрами пользователя
 * @param {*} buttonParent Элементы Parent контейнера с кнопками
 * @param {*} buttonChild  Элемент Child, выбранная кнопка
 */
function chooseButton (buttonParent, buttonChild) {
  buttonParent.forEach(btn => btn.classList.remove('choose-button'));
    buttonChild.classList.add('choose-button');
}

/**
 * Метод для заполнения полей данными пользователя со Стартовой страницы
 */
function setSettingData () {
  document.querySelectorAll('.gender-setting').forEach(btn => {
    if (btn.innerHTML === User.gender) {
      btn.classList.add('choose-button')
    }
  })
  
  inputAgeSetting.value = User.age;
  inputHeightSetting.value = User.height;
  inputWeightSetting.value = User.weight;

  document.querySelectorAll('.activity-setting').forEach(btn => {
    if (btn.innerHTML === User.activity) {
      btn.classList.add('choose-button')
    }
  })
}

/**
 * Сохраняем данных в LocalStorage
 * @param {Map} Map Коллекция ключ/значение, которые нужно сохранить
 * @param {String} key Ключ для сохранения
 */
function saveLocalStorage (Map, key) {
  localStorage.setItem(key, JSON.stringify(Array.from(Map.entries())));
}

/**
 * Отображение Главной странице
 */
function buildMainPage () {
  listEatenFood.innerHTML = '';
  let totalCalories = 0;

  //Перебор и отрисовка блока Приема пищи
  FoodsToday.forEach((value, key) => {
    let sumCalories = 0;

  
    value.forEach(el => sumCalories += el.kcal);
    sumCalories = Math.round(sumCalories);
    //Подсчет потребленных калорий
    totalCalories += sumCalories;

    let block = `<li class="eaten-item">
                  <div class="eaten-head">
                    <div class="head-left">
                      <h4>Прием пищи</h4>
                      <span class="kcal-text">
                      <span class="coutn-kcal">${sumCalories}</span> ккал</span>
                    </div>
                    <button class="button-transparent delete-food-item" data-key=${key}>
                      <img src="./assets/img/delete.svg" alt="delete"/>
                    </button>
                  </div>
                <ul class="food-block ul" id="${key}"></ul>
              </li>`;

    listEatenFood.innerHTML += block;
    let listFood = document.getElementById(key);
    listFood.innerHTML = '';

    //Перебор и отрисовка выбранных продуктов Приема пищи
    value.forEach(value => {
      let row = `<li class="eaten-food">
                  <div class="eaten-info">
                    <span>${value.name}</span> - <span>${value.kcal}</span> kcal
                  </div>
                </li>`
      listFood.innerHTML += row;
    })
  })

  //Отображение header Главной страницы
  document.getElementById('eaten-count').innerHTML = totalCalories;
  textNorm.innerHTML = User.dailyNorm;
  let percent = Math.round(totalCalories * 100 / User.dailyNorm);
  textGraph.innerHTML = `${percent}%`;
  circleNorm.setAttribute('stroke-dasharray', `${percent}, 100`);

  //Проверка превышения лимита суточной нормы и цветовое предупреждение
  if (percent > 100) {
    document.querySelector('.graph-circle').setAttribute('stroke', '#FF2171');
    document.querySelector('.graph-title').setAttribute('fill', '#FF2171');
    document.querySelector('.norm-text').style.color = 'var(--red)';
    document.querySelector('.norm-number').style.color = 'var(--red)';
  } else {
    document.querySelector('.graph-circle').setAttribute('stroke', '#b23488');
    document.querySelector('.graph-title').setAttribute('fill', '#000000');
    document.querySelector('.norm-text').style.color = 'var(--black)';
    document.querySelector('.norm-number').style.color = 'var(--black)';
  }

  //Удаление приема пищи со страницы, из Map и перерисовка Главной страницы
  document.querySelectorAll('.delete-food-item').forEach(btn => {
    btn.addEventListener('click', btn => {
      FoodsToday.delete(btn.target.parentNode.dataset.key);
      buildMainPage();
    })
  })
  //Сохранение в LocalStorage данных о приемах пищи
  saveLocalStorage(FoodsToday, 'foodsToday');
}

/**
 * Отображение списка продуктов в Модальном окне Главной страницы
 * @param {Map} Map Коллекция ключ/значение
 */
function buildFoodList (Map) {
  listFood.innerHTML = '';

  Map.forEach((value, key) => {
    let idListItem = getId();
    let listItem = `<li class="food-item">
                      <div class="checkbox-block">
                        <input type="checkbox" id="${idListItem}" class="custom-checkbox">
                        <label id="label-checkbox" for="${idListItem}" data-kcal=${value} data-name='${key}'>${key}</label>
                      </div>
                      <input class="input-item input" type="text" inputmode="numeric" placeholder="в граммах" maxlength="4">
                    </li>`
    listFood.innerHTML += listItem;
  })
}

/**
 * Отображение списка продуктов в таблице
 * @param {Map} Map Коллекция ключ/значение
 */
function buildTable (Map) {
  tableProducts.innerHTML = '';

  Map.forEach((value, key) => {
    let row = `<tr>
                <td>${key}</td>
                <td class="kcal-td">${value}</td>
                <td class="button-td">
                  <button class="button-transparent delete-button delete-product-button">
                    <img src="./assets/img/delete.svg" alt="delete"/>
                  </button>
                </td>
              </tr>`

    tableProducts.innerHTML += row;
  })

  //Обработка удаления строки таблицы из Мар и перерисовка таблицы
  document.querySelectorAll('.delete-product-button').forEach(btn => {
    btn.addEventListener('click', btn => {
      Map.delete(btn.target.parentNode.parentNode.parentNode.cells[0].innerHTML);
      buildTable(Map);
    })
  })
}

/**
 * Расчет суточной нормы ккал для человека
 * @returns Суточная норма калорий
 */
function getDailyNorm () {
  let weight = User.weight;
  let height = User.height;
  let age = User.age;
  let indexGender = User.gender == "Мужчина" ? 5 : -161;

  let indexActivity = 0;
  if (User.activity == "Низкий") {
    indexActivity = 1.2;
  } else if (User.activity == "Средний") {
    indexActivity = 1.55;
  } else {
    indexActivity = 1.725;
  }

  return Math.round((10 * weight + 6.25 * height - 5 * age + indexGender) * indexActivity);
}

/**
 * Генерация уникального ID
 * @param {Number} length Длина ID
 * @returns Уникальный идентификатор
 */
function getId (length = 6) {
  return Math.random().toString(36).substring(2, length+2);
}