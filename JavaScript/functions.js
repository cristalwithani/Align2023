/* DOCUMENTATION -------------------------------------------------------------------------------------------------------------------------------------------------------------------

Proccessing required courses from reqs.csv
reqs[0] = course_id
reqs[1] = priority
reqs[2] = sem_order
reqs[3] = credits
reqs[4] = course_name
reqs[5] = course_description


Proccessing elective courses from electives.csv
electives[0] = course_id
  * starting with 0 = General Core requirements
  * starting with 1, 2, 3, 4 = CSCI
electives[1] = priority
electives[2] = course_name
electives[3] = course_description

Required parameters:
  sem - must be F or S
  year - starting year, must be 4 whole digits
  hours - 9, 12, 15, or 18
    9 = 14 semesters
    12 = 10 semesters
    15 = 8 semesters
    18 = 7 semesters


Priority Coding:
  Fall-Even: 1, 2, 5, 8**
  Fall-Odd: 1, 4, 7
  Spring-Even: 1, 2, 4, 9**
  Spring-Odd: 1, 3, 6
  
  ** only on olympic years (every 4 years)
*/


//VARIABLES
    /*Hours variable
    function getOption() {
        selectElement = document.querySelector('#hours');
        output = selectElement.value;
        document.querySelector('.output').textContent = output;
    }
    //Sem variable
    function getOption2() {
        selectElement = document.querySelector('#sem');
        output = selectElement.value;
        document.querySelector('.output2').textContent = output;
    }
    //Year variable
    function getOption3() {
        textElement = document.querySelector('#year');
        output = textElement.value;
        document.querySelector('.output3').textContent = output;
    }

*/

// VARIABLES -------------------------------------------------------------------------------------------------------------------------------------------------------------------

    //import Node.js modules
    const fs = require('fs');

// FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------------------------------------

//function to get data from files and put into respective containment arrays
function getData() {
    const reqs = [];
  
    const fileInput = 'C:\\Users\\parus\\GitRepos\\Align2023\\Data\\reqs.csv';
  
    const reader = new FileReader();
  
    reader.onload = function (e) {
      const data = e.target.result;
      const lines = data.split('\n');
  
      for (let i = 0; i < lines.length; i++) {
        const items = lines[i].split(',');
        const course = items.map(item => item.trim());
        reqs.push(course);
      }
    };
  
    // Read the file asynchronously
    fetch(fileInput)
      .then(response => response.text())
      .then(data => reader.readAsText(new Blob([data])));
    
  return reqs;
}

//get variables from index.html
function getVariables(){
    let hours;
    let sem;
    let year;

    selectHours = document.querySelector('#hours');
    hours = selectHours.value;

    selectSem = document.querySelector('#sem');
    sem = selectSem.value;

    selectYear = document.querySelector('#year');
    year = selectYear.value;

    return{
        hours: hours,
        sem:sem,
        year:year
    };

}

//function to get semesters of plan to use as headers of schedule array indexes
function GenSem(hours,sem,year) {
    let schedule = [];
    let order = [];
    sems = [];
    num_sems = Math.ceil(120 / hours); //Math.ceil will round up for the number of semesters

    //create semester headers (F_2000, S_2001, etc.)
    if (sem == "F") {
        for (i = 1; i <= num_sems; i++) {
            if (i % 2 !== 0) {
                s = "F_" + year;
                sems.push(s);
                year = year + 1;
            } else {
                s = "S_" + year;
                sems.push(s);
            }
        }
    } else {
        for (i = 1; i <= num_sems; i++) {
            if (i % 2 !== 0) {
                s = "S_" + year;
                sems.push(s);
            } else {
                s = "F_" + year;
                sems.push(s);
                year = year + 1;
            }
        }
    }

    //create order array for priority checking
    for (s = 0; s < sems.length; s++) {
        string = sems[s].split('_');
        semester = string[0];
        y = parseInt(string[1]);
        if (semester == "F") {
            if (y % 2 !== 0) {
                //fall odd
                order.push("147");
            } else {
                if (y % 4 == 0) {
                    //olympic fall
                    order.push("1258")
                } else {
                    //fall even
                    order.push("125")
                }
            }
        } else {
            if (y % 2 !== 0) {
                //spring odd
                order.push("136");
            } else {
                if (y % 4 == 0) {
                    //olympic spring
                    order.push("1249")
                } else {
                    //spring even
                    order.push("124")
                }
            }
        }
    }

    //add semesters to schedules as headers (first index of array)
    schedule = sems.map(element => [element]);
    return {
        schedule: schedule,
        order: order
    };
}

//general function used to add courses to schedule


//function to add required courses
function requiredCourses(reqs, schedule, order) {
    function addCourse(course, prev) {
        //find nearest availble index (one that is not full)
        credits = Math.ceil(hours / 3);
        nearest = -1;
        for (s = 0; s < schedule.length; s++) {
            if (schedule[s].length < (credits + 3)) {
                nearest = s;
                break;
            }
        }
    
        //adjust nearest according to what prev is
        if (nearest !== -1) {
            if (nearest == prev) {
                nearest = nearest + 1;
            } else if (prev > nearest) {
                nearest = (prev - nearest) + nearest + 1;
            }
            //schedule[nearest].push(course);
        } else {
            console.warn("Schedule is full");
        }
    
        //adjust nearest according to priority
        course_priority = course[1];
        sem_priority = order[nearest];
    
        if (sem_priority.includes(course_priority)) {
            schedule[nearest].push(course);
        } else {
            do {
                nearest = nearest + 1;
                sem_priority = order[nearest];
            } while (!sem_priority.includes(course_priority) && (nearest >= schedule.length))
    
            schedule[nearest].push(course);
        }
    
        return nearest;
    }

    for (r = 1; r < reqs.length; r++) {
        o = parseInt(reqs[r][2]);
        switch (o) {
            case 1:
                prev = addCourse(reqs[r], -1);
                break;
            case 2:
                prev1 = addCourse(reqs[r], prev);
                break;
            case 3:
                prev2 = addCourse(reqs[r], prev1);
                break;
            case 4:
                prev3 = addCourse(reqs[r], prev2);
                break;
        }
    }
}

//function to add fillers in schedule where you can dd an elective or core
function fillers(hours, schedule) {
    credits = Math.ceil(hours / 3);
    for (s = 0; s < schedule.length; s++) {
        if (schedule[s].length <= (credits + 1)) {
            fill = (credits + 1) - schedule[s].length;
            for (f = 0; f < fill; f++) {
                schedule[s].push("Elective/Core");
            }
        }
    }
}

function writeOut(schedule) {
    for(s=0; s<schedule.length; s++){
        console.log(schedule[s]);
        console.log('-----------------------------------------');
    }
    //const CSVformat = schedule.map(row => row.join(',')).join('\n');
    //fs.writeFileSync('C:\\Users\\parus\\GitRepos\\Align2023\\Data\\schedule.csv',CSVformat);

    //console.log("CSV written!");
}

//Function to display alert before generating schedule
function showAlert() {
    var myText = "Schedule may take a few moments to generate.";
    alert(myText);
}

// TESTING -------------------------------------------------------------------------------------------------------------------------------------------------------------------

res = getData();
console.log(res);

//Test variables:
//var hours = 12;
//var sem = "F";
//var year = 2000;

//Schedule generation:
//GenSched();

/*
//Display schedule
for(s=0; s<schedule.length; s++){
  console.log(schedule[s]);
  console.log('-----------------------------------------');
}
*/