document.addEventListener('DOMContentLoaded', function () {
  
  const formEl = document.querySelector('#film-form');
  const filterEl = document.querySelector('#filter');
  const email = 'shatalin-1991@list.ru';
  // Выпадающий список
  const choices = new Choices(filterEl, {
    searchEnabled: false,
    shouldSortItems: false,
    itemSelectText: "",
  });

  // Проверка формы
  const validate = new JustValidate('#film-form');
  validate
    .addField('#title', [
      {
        rule: 'required',
        errorMessage: 'Введите название фильма!',
      },
    ])
    .addField('#genre', [
      {
        rule: 'required',
        errorMessage: 'Введите жанр!',
      },
    ])
    .addField('#releaseYear', [
      {
        rule: 'required',
        errorMessage: 'Введите год выпуска!',
      },
      {
        rule: 'number',
        errorMessage: 'Год должен быть числом!',
      },
    ]);

  function handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const genre = document.getElementById("genre").value;
    const releaseYear = document.getElementById("releaseYear").value;
    const isWatched = document.getElementById("isWatched").checked;

    const film = {
      title: title,
      genre: genre,
      releaseYear: releaseYear,
      isWatched: isWatched,
    };

    addFilm(film);
  }

  async function addFilm(film) {
    await fetch("https://sb-film.skillbox.cc/films", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        email
      },
      body: JSON.stringify(film),
    });
    renderTable();
  }

  async function renderTable() {
    const filmsResponse = await fetch("https://sb-film.skillbox.cc/films", {
      headers: {
        email: email,
      },
    });
    const films = await filmsResponse.json();
    const filmTableBody = document.getElementById("film-tbody");
    filmTableBody.innerHTML = "";

    // И для каждого отдельного фильма создадим строку
    films.forEach((film) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${film.title}</td>
      <td>${film.genre}</td>
      <td>${film.releaseYear}</td>
      <td>${film.isWatched ? "Да" : "Нет"}</td>
      <td><button data-id="${film.id}" class="delete-button">Удалить</button></td>
    `;
      filmTableBody.appendChild(row);
    });

    formEl.reset();

    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        deleteFilm(id);
      });
    });
  }

  // Фильтр списка фильмов
  const searchByTitleEl = document.querySelector('#searchByTitle');
  const searchByGenreEl = document.querySelector('#searchByGenre');
  const searchByYearEl = document.querySelector('#searchByYear');

  // Обработчики событий для фильтров
  function getFilters() {
    const title = searchByTitleEl.value.trim();
    const genre = searchByGenreEl.value.trim();
    const releaseYear = searchByYearEl.value.trim();

    let isWatched = filterEl.value;
    if (isWatched === 'Yes') {
      isWatched = true;
    } else if (isWatched === 'No') {
      isWatched = false;
    } else {
      isWatched = '';
    }

    return { title, genre, releaseYear, isWatched };
  }

  const handleInput = debounce(() => {
    const filters = getFilters();
    filterByFilms(filters);
  }, 300); // задержка 300 мс

  // Один обработчик для всех инпутов
  [searchByTitleEl, searchByGenreEl, searchByYearEl].forEach(el => {
    el.addEventListener('input', handleInput);
  });

  filterEl.addEventListener('change', () => {
    const filters = getFilters();
    filterByFilms(filters);
  });


  async function filterByFilms(filters = {}) { //Функция renderTable теперь принимает объект filters в качестве аргумента
    // Создаем строку запроса с фильтрами
    const queryString = Object.keys(filters)
      .filter(key => filters[key] !== '' && filters[key] !== undefined)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
      .join('&');

    const url = `https://sb-film.skillbox.cc/films${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      headers: {
        email: email,
      }
    });

    const films = await response.json();
    const filmTableBody = document.querySelector('#film-tbody');
    filmTableBody.innerHTML = "";

    // И для каждого отдельного фильма создадим строку
    films.forEach((film) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${film.title}</td>
      <td>${film.genre}</td>
      <td>${film.releaseYear}</td>
      <td>${film.isWatched ? "Да" : "Нет"}</td>
      <td><button data-id="${film.id}" class="delete-button">Удалить</button></td>
    `;
      filmTableBody.appendChild(row);
    });

    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        deleteFilm(id);
      });
    });
  }
  // функция для отложенного запросса
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  // Удаляем конкретный филь по нажатию на кнопку deleteButtons
  async function deleteFilm(id) {

    const response = await fetch(`https://sb-film.skillbox.cc/films/${id}`, {
      method: "DELETE",
      headers: {
        email: email,
      }
    });

    const data = await response.json();// ПРЕОБРАЗУЕМ ДАННЫЕ В JSON
    console.log(data);

    renderTable();
  }

  // Удалить все фильмы с сервера и таблицы
  const buttonAllDelete = document.querySelector('#button');
  buttonAllDelete.onclick = async function (event) {
    event.preventDefault();

    const response = await fetch('https://sb-film.skillbox.cc/films', {
      method: "DELETE",
      headers: {
        email: email,
      }
    });

    const data = await response.json();// ПРЕОБРАЗУЕМ ДАННЫЕ В JSON
    console.log(data);// выводим в консоль

    renderTable();
  }

  formEl.addEventListener("submit", handleFormSubmit);
  // обязательно вызываем функцию, чтобы при загрузки мы сразу получили данные от сервера
  renderTable();

});

