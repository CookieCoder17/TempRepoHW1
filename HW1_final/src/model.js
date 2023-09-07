export default class Model {
  constructor() {
    this.data = {
      questions: [
        {
          qid: 'q1',
          title: 'Programmatically navigate using React router',
          text: "the alert shows the proper index for the li clicked, and when I alert the variable within the last function I'm calling, moveToNextImage(stepClicked), the same value shows but the animation isn't happening. This works many other ways, but I'm trying to pass the index value of the list item clicked to use for the math to calculate.",
          tagIds: ['t1', 't2'],
          askedBy: 'JoJi John',
          askDate: new Date('December 17, 2020 03:24:00'),
          ansIds: ['a1', 'a2'],
          views: 10,
        },
        {
          qid: 'q2',
          title: 'android studio save string shared preference, start activity and load the saved string',
          text: 'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.',
          tagIds: ['t3', 't4', 't2'],
          askedBy: 'saltyPeter',
          askDate: new Date('January 01, 2022 21:06:12'),
          ansIds: ['a3', 'a4', 'a5'],
          views: 121,
        },
      ],
      tags: [
        {
          tid: 't1',
          name: 'react',
        },
        {
          tid: 't2',
          name: 'javascript',
        },
        {
          tid: 't3',
          name: 'android-studio',
        },
        {
          tid: 't4',
          name: 'shared-preferences',
        },
      ],

      answers: [
        {
          aid: 'a1',
          text: "React Router is mostly a wrapper around the history library. history handles interaction with the browser's window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don't have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.",
          ansBy: 'hamkalo',
          ansDate: new Date('March 02, 2022 15:30:00'),
        },
        {
          aid: 'a2',
          text: "On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn't change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.",
          ansBy: 'azad',
          ansDate: new Date('January 31, 2022 15:30:00'),
        },
        {
          aid: 'a3',
          text: 'Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.',
          ansBy: 'abaya',
          ansDate: new Date('April 21, 2022 15:25:22'),
        },
        {
          aid: 'a4',
          text: 'YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);',
          ansBy: 'alia',
          ansDate: new Date('December 02, 2022 02:20:59'),
        },
        {
          aid: 'a5',
          text: 'I just found all the above examples just too confusing, so I wrote my own. ',
          ansBy: 'sana',
          ansDate: new Date('December 31, 2022 20:20:59'),
        },
      ],
    };
  }
  // add methods to query, insert, and update the model here. E.g.,
  getAllQuestions() {
    return this.data.questions;
  }

  getQuestionById(qid) {
    const question = this.data.questions.find((q) => q.qid === qid);
    return question;
  }

  getAnswerById(aid) {
    const answer = this.data.answers.find((a) => a.aid === aid);
    return answer;
  }

  getAllTags() {
    return this.data.tags;
  }

  getNumTags() {
    return this.data.tags.length;
  }

  getAllQuestionsSortedByLatest() {
    return this.data.questions.sort((a, b) => b.askDate - a.askDate);
  }

  getAllQuestionsSortedByActivity() {
    let questionsWithoutAnswers = this.data.questions.filter((q) => q.ansIds.length === 0);
    let questionsWithAnswers = this.data.questions.filter((q) => q.ansIds.length > 0);

    let sortedArray = [];

    questionsWithAnswers = questionsWithAnswers.sort((a, b) => {
      const aDate = this.getLatestAnswerDate(a);
      const bDate = this.getLatestAnswerDate(b);
      return bDate - aDate;
    });

    questionsWithoutAnswers = questionsWithoutAnswers.sort((a, b) => b.askDate - a.askDate);

    sortedArray = [...questionsWithAnswers, ...questionsWithoutAnswers];
    return sortedArray;
  }

  getLatestAnswerDate(question) {
    let latestDate = new Date(0);
    for (const aid of question.ansIds) {
      const answer = this.getAnswerById(aid);
      if (answer.ansDate > latestDate) {
        latestDate = answer.ansDate;
      }
    }
    return latestDate;
  }

  getAllQuestionsUnanswered() {
    return this.data.questions.filter((q) => q.ansIds.length === 0);
  }

  getNumQuestions() {
    return this.data.questions.length;
  }

  getNumAnswers() {
    return this.data.answers.length;
  }

  getAllAnsers(question) {
    let answers = [];
    for (const aid of question.ansIds) {
      answers.push(this.getAnswerById(aid));
    }
    answers = answers.sort((a, b) => b.ansDate - a.ansDate);
    return answers;
  }

  addQuestion(question) {
    this.data.questions.push(question);
  }

  addAnswer(answer, qid) {
    this.data.answers.push(answer);
    for (const question of this.data.questions) {
      if (question.qid === qid) {
        question.ansIds.push(answer.aid);
      }
    }
  }

  addTag(tag) {
    this.data.tags.push(tag);
  }

  incrementViews(qid) {
    const question = this.data.questions.find((q) => q.qid === qid);
    question.views++;
  }

  getTagById(tid) {
    return this.data.tags.find((t) => t.tid === tid);
  }

  searchByString(searchWords) {
    return this.data.questions.filter((q) => {
      const title = q.title.toLowerCase();
      const text = q.text.toLowerCase();
      return searchWords.some((word) => title.includes(word) || text.includes(word));
    });
  }

  searchByTag(searchTags) {
    return this.data.questions.filter((q) => {
      return searchTags.some((tag) => {
        return q.tagIds.some((tid) => this.getTagById(tid).name === tag);
      });
    });
  }

  search(searchString) {
    const phrase = searchString.toLowerCase();
    if (phrase.trim() == '') {
      return this.getAllQuestions();
    }
    let searchWords = [];
    let searchTags = [];
    let currentWord = '';
    for (let i = 0; i < phrase.length; i++) {
      if (phrase[i] == '[') {
        while (phrase[++i] != ']' && phrase[i] != ' ' && i < phrase.length) {
          currentWord += phrase[i];
        }
        if (phrase[i] == ']') {
          searchTags.push(currentWord.trim());
          currentWord = '';
        } else {
          currentWord = '[' + currentWord;
          searchWords.push(currentWord.trim());
          currentWord = '';
        }
      } else {
        while (phrase[i] != ' ' && i < phrase.length) {
          currentWord += phrase[i];
          i++;
        }
        searchWords.push(currentWord.trim());
        currentWord = '';
      }
    }
    const filteredSearchWords = searchWords.filter((word) => word != '');

    const byString = this.searchByString(filteredSearchWords);
    const byTag = this.searchByTag(searchTags);
    const results = byString.filter((q) => !byTag.includes(q));
    return [...results, ...byTag];
  }

  getNumQuestionsWithTag(tid) {
    return this.data.questions.filter((q) => q.tagIds.includes(tid)).length;
  }

  getAllQuestionsWithTag(tid) {
    return this.data.questions.filter((q) => q.tagIds.includes(tid));
  }
}
