const CATEGORY_NAMES = {
    1: "📘 OGÓLNE",
    2: "🐮 ROLNICTWO",
    3: "🦄 BAJKI"
};

const CATEGORY_ICONS = {

    1:"📘",
    2:"🐮",
    3:"🦄"

};


let solved = JSON.parse(
    localStorage.getItem("quizSolved")
) || {};


let score = Number(
    localStorage.getItem("quizScore") || 0
);


let categoryScore = JSON.parse(
    localStorage.getItem("quizCategoryScore")
)
||
{
    1:0,
    2:0,
    3:0
};



let totalQuestions = 0;


Promise.all([
    loadCSV("question.csv"),
    loadCSV("answer.csv")
])
.then(([questions, answers]) => {

    totalQuestions = questions.length - 1;

    document.getElementById("total").innerText =
        totalQuestions;


    renderQuiz(questions, answers);
    initTestMode(questions, answers);
});


function loadCSV(path){

    return new Promise(resolve=>{

        Papa.parse(path,{
            download:true,
            header:true,
            dynamicTyping:true,
            complete:result=>resolve(result.data)
        });

    });

}



function renderQuiz(questions, answers){

    const quiz=document.getElementById("quiz");


    for(let category=1; category<=3; category++){


        const section=document.createElement("section");

        section.className=
            `category category-${category}`;


        section.innerHTML=
        `<div class="category-title">
            ${CATEGORY_NAMES[category]}
        </div>`;



        questions
        .filter(q=>q.category_id===category)
        .sort((a,b)=>a.number-b.number)
        .forEach(question=>{


            const card=document.createElement("div");

            card.className="question";
            card.dataset.id = question.id;


            card.innerHTML=`

                <h3>${CATEGORY_ICONS[category]} Pytanie ${question.number}</h3>

                <p>${question.value}</p>

            `;



            let answerBox=[];


            answers
            .filter(a=>a.question_id===question.id)
            .sort((a,b)=>a.number-b.number)
            .forEach(answer=>{


                const div=document.createElement("div");


                div.className="answer";


                div.innerHTML=
                `<b>${answer.label})</b> ${answer.value}`;



                div.onclick=()=>{

                    checkAnswer(
                        div,
                        answer,
                        answerBox,
                        category
                    );

                };


                answerBox.push({
                    element:div,
                    data:answer
                });


                card.appendChild(div);
                restoreQuestion(
                    question.id,
                    answerBox
                );

            });


            section.appendChild(card);


        });


        quiz.appendChild(section);


    }


}



function checkAnswer(
    clicked,
    answer,
    allAnswers,
    category
){


    // pytanie już rozwiązane
    if(clicked.parentElement.classList.contains("answered"))
        return;


    clicked.parentElement.classList.add("answered");
    let questionId = clicked.parentElement.dataset.id;

    let good=false;


    allAnswers.forEach(a=>{


        a.element.classList.add("disabled");


        if(a.data.is_correct==1){

            a.element.classList.add("correct");

        }


    });



    if(answer.is_correct==1){

        clicked.classList.add("correct");

        score++;

        categoryScore[category]++;

    }
    else{

        clicked.classList.add("wrong");

    }


solved[questionId]={
    answer: answer.id
};


saveState();

updateProgress();


// przewijanie

setTimeout(()=>{

let next =
clicked.parentElement
.nextElementSibling;


if(next){

next.scrollIntoView({
    behavior:"smooth",
    block:"center"
});

}

},700);
    updateScore();

}




function updateScore(){

    document.getElementById("correct")
        .innerText=score;


    document.getElementById("cat1")
        .innerText=categoryScore[1];


    document.getElementById("cat2")
        .innerText=categoryScore[2];


    document.getElementById("cat3")
        .innerText=categoryScore[3];

}

function restoreQuestion(id, answers){

    if(!solved[id])
        return;


    answers.forEach(a=>{

        a.element.classList.add("disabled");


        if(a.data.is_correct==1)
            a.element.classList.add("correct");


        if(
            solved[id].answer ==
            a.data.id &&
            a.data.is_correct==0
        ){

            a.element.classList.add("wrong");

        }

    });


    answers[0]
    .element
    .parentElement
    .classList
    .add("answered");

}



function saveState(){

    localStorage.setItem(
        "quizSolved",
        JSON.stringify(solved)
    );


    localStorage.setItem(
        "quizScore",
        score
    );


    localStorage.setItem(
        "quizCategoryScore",
        JSON.stringify(categoryScore)
    );

}



function updateProgress(){

    let done =
    Object.keys(solved).length;


    let percent =
    (done / totalQuestions) * 100;


    document
    .getElementById("progress-bar")
    .style.width =
    percent+"%";

    let percentText = Math.round(
    (done / totalQuestions) * 100
);


document.getElementById("progress-text")
.innerText =
`${done} / ${totalQuestions} (${percentText}%)`;

}
window.onload=()=>{

    updateScore();

    updateProgress();

};

document
.getElementById("reset-btn")
.onclick = function(){

    if(confirm(
        "Czy na pewno chcesz rozpocząć quiz od początku?"
    )){

        localStorage.removeItem(
            "quizSolved"
        );

        localStorage.removeItem(
            "quizScore"
        );

        localStorage.removeItem(
            "quizCategoryScore"
        );


        location.reload();

    }

};

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
        .then(() => console.log("PWA ready"))
        .catch(err => console.error(err));
}