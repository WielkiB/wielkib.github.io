fetch("questions.json")
.then(r => r.json())
.then(data => {

    questions = data;
    showQuestion();

});