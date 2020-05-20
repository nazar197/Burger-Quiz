document.addEventListener('DOMContentLoaded', () => {
  const btnOpenModal = document.getElementById('btnOpenModal');
  const modalBlock = document.getElementById('modalBlock');
  const modalTitle = document.querySelector('.modal-title');
  const closeModal = document.getElementById('closeModal');
  const questionTitle = document.getElementById('question');
  const formAnswers = document.getElementById('formAnswers');
  const nextButton = document.getElementById('next');
  const prevButton = document.getElementById('prev');
  const sendButton = document.getElementById('send');

  // Web app Firebase configuration
  const firebaseConfig = {
    // Here should be your information
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const getData = () => {
    // Loading spinner
    formAnswers.innerHTML = `
      <div class="loadingio-spinner-spin-65v29nlauuf"><div class="ldio-tx5y8vfz00j">
      <div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div></div>
    `;

    nextButton.classList.add('d-none');
    prevButton.classList.add('d-none');

    firebase.database().ref().child('questions').once('value')
      .then(snap => playTest(snap.val()));
  }

  btnOpenModal.addEventListener('click', () => {
    modalBlock.classList.add('d-block');
    getData();
  });

  closeModal.addEventListener('click', () => {
    modalBlock.classList.remove('d-block');
  });

  const playTest = (questions) => {

    const finalAnswers = [];
    const obj = {};
    
    let numberQuestion = 0;
    modalTitle.textContent = 'Твій власний бургер';
    
    const renderAnswers = index => {
      formAnswers.textContent = '';
      questions[index].answers.forEach(answer => {
        const div = document.createElement('div');
        div.classList.add('answers-item', 'd-flex', 'justify-content-center');
        const cardAnswer = `
          <input
            type="${ questions[index].type }"
            id="${ answer.title }"
            name="${ questions[index].question }"
            class="d-none"
            value="${ answer.title }"
          />
          <label for="${ answer.title }" class="d-flex flex-column justify-content-between">
            <img class="answerImg" src=${ answer.url } alt="burger">
            <span>${ answer.title }</span>
          </label>
        `;
        div.innerHTML = cardAnswer;
        formAnswers.insertAdjacentElement('beforeend', div);
      });
    };

    const renderQuestions = indexQuestion => {
      formAnswers.innerHTML = '';

      if (numberQuestion >= 0 && numberQuestion <= questions.length - 1) {
        questionTitle.textContent = `${questions[indexQuestion].question}`;
        renderAnswers(indexQuestion);
        nextButton.classList.remove('d-none');
        prevButton.classList.remove('d-none');
        sendButton.classList.add('d-none');
      }
      if (numberQuestion === 0) {
        prevButton.classList.add('d-none');
      }
      if (numberQuestion === questions.length) {
        nextButton.classList.add('d-none');
        prevButton.classList.add('d-none');
        sendButton.classList.remove('d-none');
        questionTitle.textContent = '';
        modalTitle.textContent = '';
        formAnswers.innerHTML = `
          <div class="form-group">
            <label for="numberPhone">Введіть свій номер телефону</label>
            <input type="phone" class="form-control" id="numberPhone" placeholder="Ваш мобільний" /> 
          </div>
        `;

        const numberPhone = document.getElementById('numberPhone');
        numberPhone.addEventListener('input', event => event.target.value = event.target.value.replace(/[^0-9]/, ''));
      }
      if (numberQuestion === questions.length + 1) {
        sendButton.classList.add('d-none');
        questionTitle.textContent = '';
        modalTitle.textContent = '';
        formAnswers.textContent = `
          Дякуємо! Ми Вам передзвонимо
          як тільки Ваше замовлення
          буде готове!
        `;

        for (let key in obj) {
          let newObj = {};
          newObj[key] = obj[key];
          finalAnswers.push(newObj);
        }

        setTimeout(() => {
          modalBlock.classList.remove('d-block');
        }, 2000);
      }
    };

    renderQuestions(numberQuestion);

    const checkAnswer = () => {
      const inputs = [...formAnswers.elements].filter((input) => input.checked || input.id === 'numberPhone');
      inputs.forEach((input, index) => {
        if (numberQuestion >= 0 && numberQuestion <= questions.length - 1) {
          obj[`${index}_${questions[numberQuestion].question}`] = input.value;
        }

        if (numberQuestion === questions.length) {
          obj['Номер телефону'] = input.value;
        }
      });
    }

    nextButton.onclick = () => {
      checkAnswer();
      numberQuestion++;
      renderQuestions(numberQuestion);
    };

    prevButton.onclick = () => {
      numberQuestion--;
      renderQuestions(numberQuestion);
    };

    sendButton.onclick = () => {
      checkAnswer();
      numberQuestion++;
      renderQuestions(numberQuestion);
      firebase
      .database()
      .ref()
      .child('contacts')
      .push(finalAnswers);
    };
  };

});