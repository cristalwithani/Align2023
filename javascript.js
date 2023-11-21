//Javascript for the index.html 

//Script for "hours" variable from the "hours_per_sem" dropdown
const selectElement = document.querySelector("hours_per_sem");
const result = document.querySelector(".result");

selectElement.addEventListener("change", (event) => {
  result.textContent = `The hours per semester are: ${event.target.value}`; //Send this value to schedule_page.html
  
//Script for "semester" variable from the "start_sem" dropdown
const selectElement = document.querySelector("start_sem");
const result2 = document.querySelector(".result2");

selectElement.addEventListener("change", (event) => {
  result.textContent = `The starting semester is: ${event.target.value}`; //Send this value to schedule_page.html
  
//Script for getting "year" variable from the text box
const input = document.querySelector("input");
const log = document.getElementById("log");

input.addEventListener("change", updateValue);

function updateValue(e) {
  log.textContent = `The starting year is: ${e.target.value}'; //Send this value to schedule_page.html
}
