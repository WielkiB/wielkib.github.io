// ==========================================
// TRYB TESTOWY QUIZU
// ==========================================


let allTestQuestions = [];
let allTestAnswers = [];

let selectedCategory = null;
let selectedAmount = 10;

let currentTest = [];
let currentIndex = 0;
let testScore = 0;


// ==========================================
// INICJALIZACJA
// ==========================================

function initTestMode(questions, answers){

    allTestQuestions = questions.filter(
        q => q.id
    );

    allTestAnswers = answers.filter(
        a => a.id
    );


    setupTestButtons();

}



// ==========================================
// PRZYCISKI MENU
// ==========================================

function setupTestButtons(){


    document
    .getElementById("test-btn")
    .onclick = ()=>{

        document
        .getElementById("test-modal")
        .classList
        .remove("hidden");

    };



    document
    .getElementById("close-test-btn")
    .onclick = ()=>{

        closeTestMenu();

    };



    document
    .querySelectorAll(".test-category")
    .forEach(btn=>{


        btn.onclick=()=>{


            document
            .querySelectorAll(".test-category")
            .forEach(b=>
                b.classList.remove("selected")
            );


            btn.classList.add("selected");


            selectedCategory =
                Number(btn.dataset.category);


        };


    });



    document
    .querySelectorAll(".test-amount")
    .forEach(btn=>{


        btn.onclick=()=>{


            document
            .querySelectorAll(".test-amount")
            .forEach(b=>
                b.classList.remove("selected")
            );


            btn.classList.add("selected");


            selectedAmount =
                Number(btn.dataset.amount);


        };


    });



    document
    .getElementById("start-test-btn")
    .onclick=()=>{


        if(!selectedCategory){

            alert(
                "Wybierz kategorię!"
            );

            return;

        }


        startTest();

    };


}



// ==========================================
// START TESTU
// ==========================================

function startTest(){


    let pool =
    allTestQuestions
    .filter(q =>
        q.category_id === selectedCategory
    );



    shuffle(pool);



    if(
        selectedAmount === 0 ||
        selectedAmount > pool.length
    ){

        currentTest = pool;

    }
    else{

        currentTest =
            pool.slice(
                0,
                selectedAmount
            );

    }



    currentIndex = 0;

    testScore = 0;



    document
    .getElementById("test-modal")
    .classList
    .add("hidden");



    document
    .getElementById("test-screen")
    .classList
    .remove("hidden");



    showTestQuestion();


}



// ==========================================
// WYŚWIETLENIE PYTANIA
// ==========================================

function showTestQuestion(){


    let question =
        currentTest[currentIndex];



    if(!question){

        finishTest();

        return;

    }



    document
    .getElementById("test-progress")
    .innerHTML =

    `
    Pytanie ${currentIndex+1}
    /
    ${currentTest.length}
    `;



    document
    .getElementById("test-question")
    .innerHTML =

    `
    <h3>
    ${question.value}
    </h3>
    `;



    let box =
    document.getElementById(
        "test-answers"
    );


    box.innerHTML="";



    allTestAnswers
    .filter(a =>
        a.question_id === question.id
    )
    .sort((a,b)=>
        a.number-b.number
    )
    .forEach(answer=>{


        let div =
        document.createElement("div");



        div.className =
            "test-answer";



        div.innerHTML =
        `
        <b>${answer.label})</b>
        ${answer.value}
        `;



        div.onclick=()=>{


            checkTestAnswer(
                div,
                answer
            );


        };


        box.appendChild(div);


    });


}



// ==========================================
// SPRAWDZANIE
// ==========================================

function checkTestAnswer(
    element,
    answer
){


    let buttons =
    document.querySelectorAll(
        ".test-answer"
    );



    buttons.forEach(btn=>{

        btn.style.pointerEvents =
        "none";

    });



    let question =
        currentTest[currentIndex];



    let correct =
    allTestAnswers.find(
        a =>
        a.question_id === question.id
        &&
        a.is_correct == 1
    );



    if(answer.is_correct==1){

        element.classList.add(
            "correct"
        );

        testScore++;

    }
    else{

        element.classList.add(
            "wrong"
        );


        buttons.forEach(btn=>{


            if(
                btn.innerText.includes(
                    correct.value
                )
            ){

                btn.classList.add(
                    "correct"
                );

            }


        });


    }



    setTimeout(()=>{


        currentIndex++;


        showTestQuestion();


    },300);


}



// ==========================================
// KONIEC
// ==========================================

function finishTest(){


    document
    .getElementById("test-question")
    .innerHTML =

    `
    <h2>
    🎉 Koniec testu
    </h2>

    <h1>
    ${testScore} / ${currentTest.length}
    </h1>

    <p>
    Wynik:
    ${Math.round(
        testScore/currentTest.length*100
    )}%
    </p>

    `;



    document
    .getElementById("test-answers")
    .innerHTML =


    `
    <button 
    onclick="startTest()">
    🔄 Jeszcze raz
    </button>


    <button
    onclick="exitTest()">
    📚 Powrót
    </button>
    `;



}



// ==========================================
// WYJŚCIE
// ==========================================

function exitTest(){


    document
    .getElementById("test-screen")
    .classList
    .add("hidden");



}



// ==========================================
// MENU
// ==========================================

function closeTestMenu(){

    document
    .getElementById("test-modal")
    .classList
    .add("hidden");

}



// ==========================================
// LOSOWANIE
// ==========================================

function shuffle(array){

    for(
        let i=array.length-1;
        i>0;
        i--
    ){

        let j =
        Math.floor(
            Math.random()*(i+1)
        );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }


}