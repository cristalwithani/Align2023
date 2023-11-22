//import Node.js modules
const fs = require('fs');

function ugh(){
    console.log("yay");
}
const reqs_data = 'Data\\reqs.csv';

var hours = 12;
var sem = "F";
var year = 2000;

let coursedata = [];
let order = [];
let schedule = [];

function run(){
    getData(reqs_data,coursedata);
    console.log(coursedata);
}


/*getVariables(9,'F',2000);
let sched = [];
sched = GenSched();

for(s=0; s<sched.length; s++){
    console.log(sched[s]);
    console.log('-----------------------------------------');
  }
 
 //Array to populate the table
/*    var sheduleTable = [
        {for(s=0; s<schedule.length;s++)
        }]
*/

    //Insert data in to table on schedule_page.html
/*    function Insert_Data() {
        var table = document.getElementById("myTable");
        var rows = table.querySelectorAll('tr');
        console.log(rows)
        for (let i = 1; i < rows.length; i++) {
            rows[i].children[0].textContent = a[i - 1].sem
            rows[i].children[1].textContent = a[i - 1].year
            rows[i].children[2].textContent = a[i - 1].course
        }
    }
 */