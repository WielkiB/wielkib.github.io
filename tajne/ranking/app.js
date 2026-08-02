const API =
"https://ranking-worker.dupagunwo.workers.dev";



const prizes = [

"🚜 Quad",

"📱 iPhone",

"🎮 Konsola PS5",

"🛴 Hulajnoga elektryczna",

"🎧 Air Pods Max",

"🥽 Okulary VR",

"⌚ Smartwatch",

"🎮 Nintendo Switch",

"🔊 Głośnik JBL",

"🎧 Air Pods"

];



async function loadRanking(){


const response =
await fetch(API);


const data =
await response.json();


const ranking =
data.ranking;



document.querySelector("#players")
.textContent =
data.count;



document.querySelector("#avgPoints")
.textContent =
data.stats.avgPoints;



document.querySelector("#avgTime")
.textContent =
data.stats.avgTime;



document.querySelector("#perfect")
.textContent =
ranking.filter(
x=>x.points===10
).length;



document.querySelector("#update")
.textContent =
new Date(
data.updated
)
.toLocaleTimeString();



renderTop(ranking.slice(0,10));

renderTable(ranking);

charts(ranking);


}




function renderTop(players){


const box =
document.querySelector("#top10");


box.innerHTML="";


players.forEach((p,i)=>{


box.innerHTML += `

<div class="player">

<h2>
${i+1}. ${p.nick}
</h2>


<h3>
${p.points}/10
</h3>


<p>
⏱ ${p.time}
</p>


<div class="prize">

🎁 ${prizes[i]}

</div>

</div>

`;

});


}





function renderTable(players){


const table =
document.querySelector("#ranking");


table.innerHTML="";


players.forEach((p,i)=>{


table.innerHTML +=`

<tr>

<td>${i+1}</td>

<td>${p.nick}</td>

<td>${p.points}</td>

<td>${p.time}</td>

<td>${p.date}</td>

<td>
${prizes[i] ?? ""}
</td>

</tr>

`;

});


}





function charts(data){


new Chart(
document
.getElementById("pointsChart"),
{

type:"bar",

data:{

labels:
["10","9","8","7","6"],


datasets:[{

label:"Liczba graczy",

data:[
10,
9,
8,
7,
6
].map(
x=>
data.filter(
p=>p.points===x
).length
)

}]

}

});





new Chart(
document
.getElementById("timeChart"),
{

type:"line",

data:{

labels:
data.slice(0,20)
.map(
p=>p.nick
),


datasets:[{

label:"Czas sekundy",

data:
data.slice(0,20)
.map(
p=>p.seconds
)

}]

}

});


}



loadRanking();


setInterval(
loadRanking,
60000
);