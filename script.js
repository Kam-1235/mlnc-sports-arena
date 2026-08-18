const matches = [
  {date:"10 Sep 2026",sport:"Cricket",match:"Thunder Hawks vs Blue Warriors",time:"10:00 AM",venue:"College Ground",status:"Upcoming"},
  {date:"11 Sep 2026",sport:"Badminton",match:"A. Sharma vs R. Singh",time:"11:30 AM",venue:"Indoor Hall",status:"Upcoming"},
  {date:"12 Sep 2026",sport:"Football",match:"Campus Titans vs Delhi Strikers",time:"3:00 PM",venue:"Football Ground",status:"Upcoming"},
  {date:"13 Sep 2026",sport:"Basketball",match:"MLNC Hoopers vs Campus Titans",time:"2:00 PM",venue:"Basketball Court",status:"Upcoming"},
  {date:"14 Sep 2026",sport:"Cricket",match:"Delhi Strikers vs Thunder Hawks",time:"10:00 AM",venue:"College Ground",status:"Upcoming"},
  {date:"16 Sep 2026",sport:"Football",match:"Blue Warriors vs Campus Titans",time:"4:00 PM",venue:"Football Ground",status:"Upcoming"}
];

function renderSchedule(filter="all"){
  const body=document.getElementById("scheduleBody");
  const rows=matches.filter(m=>filter==="all"||m.sport===filter);
  body.innerHTML=rows.map(m=>`<tr><td>${m.date}</td><td><b>${m.sport}</b></td><td>${m.match}</td><td>${m.time}</td><td>${m.venue}</td><td><span class="status">${m.status}</span></td></tr>`).join("");
}
renderSchedule();
document.getElementById("sportFilter").addEventListener("change",e=>renderSchedule(e.target.value));

function selectSport(sport){
  document.getElementById("sport").value=sport;
  document.getElementById("register").scrollIntoView({behavior:"smooth"});
  setTimeout(()=>document.getElementById("name").focus(),500);
}

document.getElementById("registrationForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("name").value.trim();
  const sport=document.getElementById("sport").value;
  const msg=document.getElementById("formMessage");
  msg.textContent=`✓ Thank you, ${name}! Your ${sport} registration has been submitted successfully.`;
  msg.style.color="#087443";
  e.target.reset();
});

document.getElementById("menuBtn").addEventListener("click",()=>{
  document.getElementById("nav").classList.toggle("open");
});
document.querySelectorAll("nav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("nav").classList.remove("open")));
