/*
  Quick quiz bootstrap extension
*/

/* Anclient initialization */
const QuizProtocol = {
	quizId: "quizId",
	questions: "questions",
	qtitle: "qtitle",
	quizinfo: "quizinfo",
	qowner: "qowner",
	dcreate: "dcreate",

	poll: "poll",
	pollUser: "pollUser",
}

const Quizports = {
	quiz: 'quiz.serv'
}

const quiz_a = {
	quiz: 'quiz',     //
	list: 'list',     // load quizzes
	insert: 'insert', // create new quiz
	update: 'update', // update quiz

	poll: 'poll',     // submit poll results
}

const QuestionType = {
	single: "1",
	multiple: "x"
}

const an = anreact.an; //.init("http://localhost:8080/jserv-quiz/");
console.log(an);
an.understandPorts(Quizports);

;(function($) {

// keep track of number of quizes added to page
let quiz_count = 0;

let that;
/** add jQuery selection method to create
 * quiz structure from question json file
 * @param {string} serv root url to quiz.serv?a=json
 * @param {string} quizId quiz id
 */
$.fn.quiz = function(serv, quizId) {
  if (!serv && !quizId)
	that = this;
  else if (typeof quizId === "string") {
    // $.getJSON(filename, render.bind(this));
	an.init(serv);
	$.getJSON(`${serv}/${Quizports.quiz}?qid=${quizId}`,
		render.bind(that)
	).fail(
		(e, c) => {
			console.log(e, c);
			$('div').html(e.responseText); //.appendTo(this);
			alert("Network Error: " + serv);
		}
	);
  } else {
    // render.call(this, filename);
	console.error("why here?")
  }
};

// create html structure for quiz
// using loaded questions json
function render(quiz_opts) {
  if (quiz_opts.type === "io.odysz.semantic.jprotocol.AnsonMsg") {
  	quiz_opts = quiz_opts.body[0];
  }
  let questions = quiz_opts.questions;

  let state = {
	poll: {},
    total : questions.length
  };

  let $quiz = $(this)
    .attr("class", "carousel slide")
    .attr("data-ride", "carousel");

  // unique ID for container to refer to in carousel
  let name = $quiz.attr("id") || "urban_quiz_" + (++quiz_count);

  $quiz.attr('id', name);

  let height = $quiz.height();

  /*
    Slides container div
  */
  let $slides = $("<div>")
    .attr("class", "carousel-inner")
    .attr("role", "listbox")
    .appendTo($quiz);

  /*
    Create title slide
  */
  let $title_slide = $("<div>")
    .attr("class", "item active")
    .attr("height", height + "px")
    .appendTo($slides);

  $('<h1>')
    .text(quiz_opts.title)
    .attr('class', 'quiz-title')
    .appendTo($title_slide);

  let $start_button = $("<div>")
    .attr("class", "quiz-answers")
    .appendTo($title_slide);

  let $indicators = $('<ol>')
    .attr('class', 'progress-circles')

  $("<button>")
    .attr('class', 'quiz-button btn')
    .text("Take the quiz!")
    .click(function() {
      $quiz.carousel('next');
      $indicators.addClass('show');

      $(".active .quiz-button.btn").each( function() {
        // console.log(this.getBoundingClientRect())
        $(this).css("margin-left", function(){
          return ((250 - this.getBoundingClientRect().width) *0.5) + "px"
        })
      })
    })
    .appendTo($start_button);

  $indicators
    .appendTo($quiz);

  $.each(questions, function(question_index, question) {
    $('<li>')
      .attr('class', question_index ? "" : "dark")
      .appendTo($indicators);
  });

  /*
    Add all question slides
  */
  $.each(questions, function(question_index, question) {

	let $answers;
    let last_question = (question_index + 1 === state.total);
	let qtype = question.qtype || QuestionType.single;
	// let qtype = question.qtype || QuestionType.multiple;

    //bootstrap carousel
    {
      let $item = $("<div>")
        .attr("class", "item")
        .attr("height", height + "px")
        .appendTo($slides);
      let $img_div;
      if (question.image) {
        $img_div = $('<div>')
          .attr('class', 'question-image')
          .appendTo($item);
        $("<img>")
          .attr("class", "img-responsive")
          .attr("src", question.image)
          .appendTo($img_div);
        $('<p>')
          .text(question.image_credit)
          .attr("class", "image-credit")
          .appendTo($img_div);
      }
      $("<div>")
        .attr("class", "quiz-question")
        .html(question.prompt || '[Question Contents]')
        .appendTo($item);

      $answers = $("<div>")
        .attr("class", "quiz-answers")
        .appendTo($item);

      // if the question has an image
      // append a container with the image to the item
    }

    // for each possible answer to the question
    // add a button with a click event
	if (typeof question.answers === 'string') {
		let ans1 = question.answers.split('\\n');
		let ans2 = question.answers.split('\n');
		question.answers = ans1 && ans1.length > (ans2 || []).length ?
			ans1 : ans2 || []
	}

    $.each(question.answers, function(ansix, answer) {
		let ans_btn = qtype === QuestionType.single ?
					singleAnswer(question, ansix, answer) :
					multiAnswers(question, ansix, answer);
		ans_btn.appendTo($answers);

		if (qtype === QuestionType.single)
			ans_btn.on('click', function() {
				let qid = this.getAttribute('qid');
				let aid = this.getAttribute('aid');
				state.poll[qid] = {};
				state.poll[qid][aid] = true;

				onNext(last_question || questions.length === 0);
			});
		else {
			// multiple checkbox
			ans_btn.on('click', function(e, x) {
				let qid = this.getAttribute('qid');
				let aid = this.getAttribute('aid');

				console.log($('#' + this.id + ' input:checked').length, qid, aid);
				let checked = $('#' + this.id + ' input:checked').length > 0;
				if (!state.poll[qid])
					state.poll[qid] = {};
				state.poll[qid][aid] = checked;
			});
		}
    });
	if (qtype !== QuestionType.single) {
		btn_next = singleAnswer(questions, -1, "Next")
				.on('click', function(e) {
					// Object.assign(state.poll[question.qid] || {}, {ansix: e.target.checked});
					onNext(last_question || questions.length === 0);
				}).appendTo($answers);
	}

	function onNext(islast) {
		$quiz.carousel('next');

		// if we've reached the final question
		// set the results text
		if (islast) {
			$results_title.html(resultsText(state));
			$results_ratio.text( "Thank you for your paticipating!" );
			$acadynamo_link.attr('href', acadynamo(state, quiz_opts));
			$github_link.attr('href', githubrepo(state, quiz_opts));
			$indicators.removeClass('show');
			// indicate the question number
			$indicators.find('li')
				.removeClass('dark')
				.eq(0)
				.addClass('dark');
		} else {
			// indicate the question number
			$indicators.find('li')
				.removeClass('dark')
				.eq(question_index+1)
				.addClass('dark');
		}

		function acadynamo() {
			return "https://github.com/REDY-a/ERA";
		}

		function githubrepo() {
			return "https://github.com/Georgezhang23/ERA";
		}

		function resultsText(state) {
			return "Quiz Finished!";
		}
	}
  });

  // final results slide
  let $results_slide = $("<div>")
    .attr("class", "item")
    .attr("height", height + "px")
    .appendTo($slides);

  let $results_title = $('<h1>')
    .attr('class', 'quiz-title')
    .appendTo($results_slide);

  let $results_ratio = $('<div>')
    .attr('class', 'results-ratio')
    .appendTo($results_slide);

  let $restart_button = $("<div>")
    .attr("class", "quiz-answers")
    .appendTo($results_slide);

  let $social = $("<div>")
    .attr('class', 'results-social')
    .html('<div id = "social-text">Did you like the quiz? You can follow us!</div>')
    .appendTo($results_slide);

  let $acadynamo_link = $('<a>')
    // .html('<span class="social social-twitter follow-tw"></span>')
    .html('<span class="social social-twitter follow-cdfls"></span>')
    .appendTo($social);

  let $github_link = $('<a>')
    .html('<span class="social social-facebook follow-github"></span>')
    .appendTo($social);

  $("<button>")
    .attr('class', 'quiz-button btn')
    .text("Submit?")
    .click(function() {
	  let that = this;
	  saveQuiz(state, () => {
		that.innerText = 'Saved!';
		that.disabled = true; });
    })
    .appendTo($restart_button);

  $quiz.carousel({
    "interval" : false
  });

  $(window).on('resize', function() {
    $quiz.find(".item")
      .attr('height', $quiz.height() + "px");
  });

}

function multiAnswers(question, ansix, answer) {
	let flin = $('<div/>')
		.attr('id', `${question.qid}-${ansix}`)
		.attr('qid', question.qid)
		.attr('aid', ansix)
		.attr('class', 'col-md-12 form-group form-inline btn')
		// .appendTo($answers);

	let ans_btn = $('<label />')
		.html(answer)
		.attr('class', 'col-md-10 form-label quiz-button multi-answer btn ')
		.appendTo(flin);

	ans_btn.prepend($('<input/>')
		.attr('class', 'col-md-2 quiz-check btn')
		.attr({ type: 'checkbox', id: `${question.qid}-${ansix}`}));

	return flin;
}

function singleAnswer(question, ansix, answer) {
	let ans_btn = $("<div>")
		.attr('id', `${question.qid}-${ansix}`)
		.attr('qid', question.qid)
		.attr('aid', ansix)
		.attr('class', 'quiz-button btn')
		.html(answer)

	return ans_btn;
}

function saveQuiz(state, onOk) {
	let props = {}
	let poll = formatArr(state.poll);
	props[QuizProtocol.pollUser] = state.user || '';
	props[QuizProtocol.qtitle] = state.title;
	props[QuizProtocol.poll] = poll;
	props[QuizProtocol.quizId] = state.quizId;

	let req = an.restReq('quiz',
		new anreact.UserReq(null, "quizzes", props).A(quiz_a.poll) );

	an.post(req, (resp) => {
		let opts = {
			allowOutsideClick : false,
			allowEscapeKey : false,
			confirmButtonText: "OK!",
			html : true,
			title: "Info",
			text: resp.Body().m,
			confirmButtonColor: "#0096D2"
		};
		swal(opts);
		if (typeof onOk === 'function')
			onOk();
	})

 	/**
	 * @param {object} obj {00002: {2, true, 3, true}}
	 * @return {array} [] ['00002', '2,3']] 0: question id, 1: resutls
	 */
	function formatArr(obj) {
		let arr = [];
		for (let qid in obj) {
			reslts = [];
			for (let aid in obj[qid])
				reslts.push(aid);
			arr.push([qid, reslts.join(',')]);
		}
		return arr;
	}
}

})(jQuery);
