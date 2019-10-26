var weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
var months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var date = new Date();

document.querySelector("#day").innerHTML = date.getDate();
document.querySelector("#month").innerHTML = months[date.getMonth()];
document.querySelector("#day-name").innerHTML = weekday[date.getDay()];
document.querySelector("#year").innerHTML = date.getFullYear();
