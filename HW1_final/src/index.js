import Model from './model.js';

let model = new Model();

// window.model = model; // for debugging purposes so we can inspect the model in the console

window.onload = function () {
  document.getElementById('nav-questions').style.backgroundColor = 'lightgray';
  displayQuestionsPage();
  displayNumQuestions(model.getNumQuestions());
  displayQuestions(model.getAllQuestionsSortedByLatest());
};

window.navQuestionClick = function () {
  const navQuestion = document.getElementById('nav-questions');
  const navTags = document.getElementById('nav-tags');
  navQuestion.style.backgroundColor = 'lightgray';
  navTags.style.backgroundColor = 'whitesmoke';

  displayQuestionsPage();
};

window.navTagsClick = function () {
  const navQuestion = document.getElementById('nav-questions');
  const navTags = document.getElementById('nav-tags');
  navTags.style.backgroundColor = 'lightgray';
  navQuestion.style.backgroundColor = 'whitesmoke';

  displayTagsPage();
};

function unHighlightNav() {
  const navQuestion = document.getElementById('nav-questions');
  const navTags = document.getElementById('nav-tags');
  navTags.style.backgroundColor = 'whitesmoke';
  navQuestion.style.backgroundColor = 'whitesmoke';
}

window.searchQuestion = function (event) {
  if (event.keyCode != 13) return; // only search when user presses enter

  let userInputElement = document.getElementById('header-search');
  let userInput = userInputElement.value; // get the string from the search bar

  let searchResults = model.search(userInput);
  window.navQuestionClick(); // reset the page to the questions page
  displayQuestions(searchResults);

  document.getElementById('top-upper-main-title').innerHTML = 'Search Results';

  userInputElement.value = ''; // clear the search bar by modifying the DOM
};

window.askQuestion = function () {
  unHighlightNav();
  let mainDiv = document.getElementById('main');
  mainDiv.innerHTML = '';
  let postPrompt = `<form id="ask-question" onsubmit="return false">
  <h2>Question Title*</h2>
  <label for="title">Limit title to 100 characters or less</label>
  <input type="text" class="new-q-input" id="new-title" name="title" maxlength = "100"><br><br>
  <label for="title" class="new-q-error" id="title-error"></label>
  <h2>Question Text*</h2>
  <label for="content">Add details</label>
  <textarea id="new-content" name="content"></textarea><br><br>
  <label for="title" class="new-q-error" id="content-error"></label>
  <h2>Tags*</h2>
  <label for="tags">Add keywords separated by whitespace</label>
  <input type="text" class="new-q-input" id="new-tags" name="tags"><br><br>
  <label for="title" class="new-q-error" id="tags-error"></label>
  <h2>Username*</h2>
  <label for="username">Will be displayed to public</label>
  <input type="text" class="new-q-input" id="new-username" name="username"><br><br>
  <label for="title" class="new-q-error" id="username-error"></label>
  <input type="submit" class="submit-question" value="Post Question" onclick="validateQuestion()">
  <h3>* indicates mandatory fields</h3>
  </form>`;
  mainDiv.innerHTML += postPrompt;
};

window.validateQuestion = function () {
  let flag = true;
  let questionTitle = document.getElementById('new-title').value.trim();
  let questionContent = document.getElementById('new-content').value.trim();
  let questionTags = document.getElementById('new-tags').value.trim();
  let questionUsername = document.getElementById('new-username').value.trim();

  // remove previous erros meessages
  document.getElementById('title-error').innerHTML = '';
  document.getElementById('content-error').innerHTML = '';
  document.getElementById('tags-error').innerHTML = '';
  document.getElementById('username-error').innerHTML = '';

  if (questionTitle.length == 0) {
    flag = false;
    document.getElementById('title-error').innerHTML = '*Title field cannot be empty';
  }
  if (questionContent.length == 0) {
    flag = false;
    document.getElementById('content-error').innerHTML = '*Description field cannot be empty';
  }else{
    let [foundError, newText] = incorprateHyperLink(questionContent);
    if(foundError){
      flag = false;
      document.getElementById('content-error').innerHTML = '*Constraints violated. The target of a hyperlink, that is, the stuff within () cannot be empty and must begin with “https://” or “http://”.';
    }else{
      questionContent = newText;
    }
  }
  if (questionUsername.length == 0) {
    flag = false;
    document.getElementById('username-error').innerHTML = '*Username field cannot be empty';
  }
  let tags = questionTags.toLowerCase().split(' ');
  if (tags.length > 5) {
    flag = false;
    document.getElementById('tags-error').innerHTML = '*Question cannot have more than 5 tags';
  } else {
    for (const tag of tags) {
      if (tag.length > 10) {
        flag = false;
        document.getElementById('tags-error').innerHTML = '*A tag cannot be more than 10 characters';
        break;
      }
    }
  }

  tags = tags.filter((tag) => tag.trim() != '');
  if (tags.length == 0) {
    flag = false;
    document.getElementById('tags-error').innerHTML = '*Question must have at least one tag';
  }

  if (flag == true) {
    const filteredTags = tags.filter((tag) => tag.trim() != '');
    let newQuestion = {
      qid: `q${model.getNumQuestions() + 1}`,
      title: `${questionTitle}`,
      text: `${questionContent}`,
      tagIds: tagMaintenance(filteredTags),
      askedBy: `${questionUsername}`,
      askDate: new Date(),
      ansIds: [],
      views: 0,
    };
    model.addQuestion(newQuestion);
    window.navQuestionClick();
  }
};

function tagMaintenance(tagNames) {
  let tagIds = [];
  let flag = true;
  for (const tagName of tagNames) {
    innerloop: for (const tag of model.getAllTags()) {
      if (tagName === tag.name) {
        tagIds.push(tag.tid);
        flag = false;
        break innerloop;
      }
    }
    if (flag == true) {
      let newTag = {
        tid: `t${model.getAllTags().length + 1}`,
        name: `${tagName}`,
      };
      model.addTag(newTag);
      tagIds.push(newTag.tid);
    }
    flag = true;
  }
  return tagIds;
}

function displayQuestionsPage() {
  let mainDiv = document.getElementById('main');
  mainDiv.innerHTML = '';
  let questionsPrompt = `
      <div id="upper-main">
          <div id="top-upper-main">
            <h1 id="top-upper-main-title">All Questions</h1>
            <button id="main-ask" onclick="askQuestion()">Ask Question</button>
          </div>
          <div id="bottom-upper-main">
            <h3 id="number-of-questions">[PLACE HOLDER]</h3>
            <button id="main-unanswered" onclick="prefUnanswered()">Unanswered</button>
            <button id="main-active" onclick="prefActive()">Active</button>
            <button id="main-newest" onclick="prefNewest()">Newest</button>
          </div>
      </div>
      <div id="lower-main">
      </div>`;
  mainDiv.innerHTML = questionsPrompt;
  displayNumQuestions(model.getNumQuestions());
  displayQuestions(model.getAllQuestionsSortedByLatest());
  window.scrollTo(0, 0);
}

window.prefUnanswered = function () {
  displayQuestions(model.getAllQuestionsUnanswered());
  document.getElementById('top-upper-main-title').innerHTML = 'All Questions';
};

window.prefActive = function () {
  displayQuestions(model.getAllQuestionsSortedByActivity());
  document.getElementById('top-upper-main-title').innerHTML = 'All Questions';
};

window.prefNewest = function () {
  displayQuestions(model.getAllQuestionsSortedByLatest());
  document.getElementById('top-upper-main-title').innerHTML = 'All Questions';
};

function displayNumQuestions(numOfQuestions) {
  document.getElementById('number-of-questions').innerHTML = `${numOfQuestions} questions`;
}

function displayQuestions(questions) {
  let questionsContainer = document.getElementById('lower-main');
  displayNumQuestions(questions.length);
  questionsContainer.innerHTML = ''; // to reset the list of questions displayed
  if (questions.length == 0) {
    questionsContainer.innerHTML += `<div id="no-question-found">
    <h1>No Questions Found</h1>
    </div>`;
  } else {
    for (const element of questions) {
      let timeNow = new Date();
      let nextQuestion = `<div class="question-container">
      <div class="Qans-views-div">
        <h6>${element.ansIds.length} answers</h6>
        <h6>${element.views} views</h6>
      </div>
      <div class="Qcontent-div">
        <div id="Qcontent-div-top"><h2 id="${element.qid}" onclick="displayAnswers(this.id)">${element.title}</h2></div>
        <div id="Qcontent-div-bottom">${generateHtmlForTags(element.tagIds)}</div> 
      </div>
      <div class="Qmetadata-div">
        <h4>${element.askedBy}</h4>  
        <h5>asked ${generateDate(element.askDate, timeNow)} </h5>   
      </div>
      </div>`;
      questionsContainer.innerHTML += nextQuestion;
    }
  }
}

window.displayAnswers = function (id, increment = true) {
  unHighlightNav();
  const question = model.getQuestionById(id);
  const answers = model.getAllAnsers(question);
  if (increment) {
    model.incrementViews(id);
  }
  let mainDiv = document.getElementById('main');
  mainDiv.innerHTML = '';
  let questionPrompt = `<div id="upper-main-Answers">
          <div id="top-upper-mainAns">
            <h3 id="top-upper-main-numAns">${answers.length} answers</h3>
            <h1 id="top-upper-main-title">${question.title}</h1>
            <div id="top-upper-main-ask"><button id="ans-main-ask" onclick="askQuestion()">Ask Question</button></div>
          </div>
          <div id="bottom-upper-mainAns">
            <h3 id="top-upper-main-numViews">${question.views} views</h3>
            <p id="top-upper-main-questionContent">${question.text}</p>
            <div class="top-upper-main-QAskedBy">
              <h4>${question.askedBy}</h4>  
              <h5>asked ${generateDate(question.askDate, new Date())} </h5>   
            </div>
          </div>
      </div>
      <div id="lower-main-Answers">
      </div>`;
  mainDiv.innerHTML = questionPrompt;
  let lowerMainDiv = document.getElementById('lower-main-Answers');
  lowerMainDiv.innerHTML = '';
  for (const element of answers) {
    let timeNow = new Date();
    let nextAnswer = `<div class="answer-container">
      <div class="Acontent-div">
        <p>${element.text}</p>
      </div>
      <div class="Ametadata-div">
        <h4>${element.ansBy}</h4>  
        <h5>asked ${generateDate(element.ansDate, timeNow)} </h5>   
      </div>
      </div>`;
    lowerMainDiv.innerHTML += nextAnswer;
  }
  lowerMainDiv.innerHTML += `<div class="answer-container"><button class="ans-main-answer" id="${id}" onclick="answerQuestion(this.id)">Answer Question</button></div>`;
  window.scrollTo(0, 0);
};

window.answerQuestion = function (id) {
  unHighlightNav();
  let mainDiv = document.getElementById('main');
  mainDiv.innerHTML = '';
  let postPrompt = `<form id="ask-question" onsubmit="return false">
  <h2>Username*</h2>
  <label for="username">Will be displayed to public</label>
  <input type="text" class="new-q-input" id="ans-new-username" name="username"><br><br>
  <label for="title" class="new-q-error" id="ans-username-error"></label>
  <h2>Answer Text*</h2>
  <label for="content">Write answer here</label>
  <textarea id="ans-new-content" name="content"></textarea><br><br>
  <label for="title" class="new-q-error" id="ans-content-error"></label>
  <input type="submit" class="submit-question" id="${id}" value="Post Answer" onclick="validateAnswer(this.id)">
  <h3>* indicates mandatory fields</h3>
  </form>`;
  mainDiv.innerHTML += postPrompt;
};

window.validateAnswer = function (id) {
  let flag = true;
  let AnswerUsername = document.getElementById('ans-new-username').value;
  let AnswerText = document.getElementById('ans-new-content').value;

  //  Remove leading and trailing spaces
  AnswerUsername = AnswerUsername.trim();
  AnswerText = AnswerText.trim();

  // remove previous erros meessages
  document.getElementById('ans-username-error').innerHTML = '';
  document.getElementById('ans-content-error').innerHTML = '';

  if (AnswerUsername.length == 0) {
    flag = false;
    document.getElementById('ans-username-error').innerHTML = '*Username field cannot be empty';
  }

  if (AnswerText.length == 0) {
    flag = false;
    document.getElementById('ans-content-error').innerHTML = '*Answer field cannot be empty';
  }else{
    let [foundError, newText] = incorprateHyperLink(AnswerText);
    if(foundError){
      flag = false;
      document.getElementById('ans-content-error').innerHTML = '*Constraints violated. The target of a hyperlink, that is, the stuff within () cannot be empty and must begin with “https://” or “http://”.';
    }else{
      AnswerText = newText;
    }
  }

  if (flag == true) {
    let newAnswer = {
      aid: `a${model.getNumAnswers() + 1}`,
      text: `${AnswerText}`,
      ansBy: `${AnswerUsername}`,
      ansDate: new Date(),
    };
    model.addAnswer(newAnswer, id);
    window.navQuestionClick();
    displayAnswers(id, false);
  }
};

function incorprateHyperLink(text){
  let allHyperLinks = text.match(/\[[^\]]*\]\([^)]*\)/g) ?? [];
  let validHyperLinks = text.match(/\[[^\]]*\]\((https?:\/\/[^\)]*)\)/g) ?? [];
  let newText = text;
  const dict = {};
  validHyperLinks.forEach((hyperLink) => { 
      let value = hyperLink.split("](")[0].slice(1);
      let href = hyperLink.split("](")[1].slice(0,-1);
      let HyperText = `<a href=${href} target="_blank">${value}</a>`
      dict[hyperLink] = HyperText
  })
  let foundError = (allHyperLinks.length != validHyperLinks.length) ? true : false;
  for(let key in dict) {
    let value = dict[key];
    newText = newText.replace(key, value);
  }
  return [foundError, newText];
} 

function generateHtmlForTags(tagIds) {
  let html = `<ul id ="question-tags">`;
  for (const tagId of tagIds) {
    html += `<li>${model.getTagById(tagId).name}</li>`;
  }
  html += `</ul>`;
  return html;
}

function displayTagsPage() {
  let mainDiv = document.getElementById('main');
  mainDiv.innerHTML = '';
  let TagsPrompt = `
      <div id="upper-main-tags">
          <div id="top-upper-main-tags">
            <h1 id="top-upper-main-title-tags">All Tags</h1>
            <button id="main-ask" onclick="askQuestion()">Ask Question</button>
            <h1 id="number-of-tags">[PLACE HOLDER]</h3>
          </div>
      </div>
      <div id="lower-main">
      </div>`;
  mainDiv.innerHTML = TagsPrompt;

  displayNumTags();
  displayTags();
}

function displayNumTags() {
  document.getElementById('number-of-tags').innerHTML = `${model.getNumTags()} Tags`;
}

function displayTags() {
  let tagsContainer = document.getElementById('lower-main');
  tagsContainer.innerHTML = ''; // to reset the list of tags displayed

  let tagsWrapperDiv = document.createElement('div');
  tagsWrapperDiv.id = 'tags-wrapper-div';
  tagsContainer.appendChild(tagsWrapperDiv);

  let tagsWrapper = document.createElement('ul');
  tagsWrapper.id = 'tags-wrapper';

  tagsWrapperDiv.appendChild(tagsWrapper);

  for (const element of model.getAllTags()) {
    let nextTag = `<li class="tag-container">
    <div class="tag-name-div">
      <h2> <a id='${element.tid}' onclick='searchForTag(event)'> ${element.name} </a> </h2>
    </div>
    <div class="tag-num-questions-div">`;
    if (model.getNumQuestionsWithTag(element.tid) == 1) {
      nextTag += `<h4>${model.getNumQuestionsWithTag(element.tid)} question</h4>`;
    } else {
      nextTag += `<h4>${model.getNumQuestionsWithTag(element.tid)} questions</h4>`;
    }
    nextTag += `</div></li>`;
    tagsWrapper.innerHTML += nextTag;
  }
}

window.searchForTag = function (event) {
  let tagId = event.target.id;
  let tagName = event.target.innerHTML;

  displayQuestionsPage();
  displayQuestions(model.getAllQuestionsWithTag(tagId));
  document.getElementById('top-upper-main-title').innerHTML = 'All Questions With Tag: ' + tagName;
  const navQuestion = document.getElementById('nav-questions');
  const navTags = document.getElementById('nav-tags');
  navQuestion.style.backgroundColor = 'lightgray';
  navTags.style.backgroundColor = 'whitesmoke';
};

function generateDate(date1, date2) {
  let timeDifference = date2 - date1;
  let timeDifferenceInSec = timeDifference / 1000;
  if (Math.round(timeDifferenceInSec) < 60) {
    return `${Math.round(timeDifferenceInSec)} seconds ago`;
  }
  let timeDifferenceInMin = timeDifferenceInSec / 60;
  if (Math.round(timeDifferenceInMin) < 60) {
    return `${Math.round(timeDifferenceInMin)} minutes ago`;
  }
  let timeDifferenceInHour = timeDifferenceInMin / 60;
  if (Math.round(timeDifferenceInHour) < 24) {
    return `${Math.round(timeDifferenceInHour)} hours ago`;
  }
  let timeDifferenceInDay = timeDifferenceInHour / 24;
  if (timeDifferenceInDay < 365) {
    // <Month><day> at <hh:min>
    return `${date1.toLocaleString('default', {
      month: 'short',
    })} ${date1.getDate()} at ${('0' + date1.getHours()).slice(-2)}:${('0' + date1.getMinutes()).slice(-2)}`;
  }
  // <Month><day>,<year> at <hh:min>
  return `${date1.toLocaleString('default', {
    month: 'short',
  })} ${date1.getDate()}, ${date1.getFullYear()} at ${('0' + date1.getHours()).slice(-2)}:${(
    '0' + date1.getMinutes()
  ).slice(-2)}`;
}
