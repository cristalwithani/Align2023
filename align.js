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
//Hours variable
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

//Function to display alert before generating schedule
function showAlert() {
    var myText = "Schedule may take a few moments to generate.";
    alert(myText);
}

//import Node.js modules
const fs = require('fs');

//paths to course data files
const reqs_data = 'Data\\reqs.csv';
const elective_data = 'Data\\electives.csv';

//arrays to contain course data
const reqs = [];
const electives = [];

//array that indicates what priority each seemster in schedule has (for processing courses)
order = [];

//array for final schedule
schedule = [];

//array for schedule of possible electives
elective_schedule = [];

//user input parameters
var hours = 0;
var sem = "";
var year = 0;


// FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------------------------------------

function getVariables() {
    hours = document.getElementById("hours").value;
    sem = document.getElementById("sem").value;
    year = document.getElementById("year").value;
}

//function to get data from files and put into respective containment arrays
function getData(filepath) {
    try {
        // Read the entire file synchronously
        const data = fs.readFileSync(filepath, 'utf8');

        // Split the data into lines
        const lines = data.split('\n');

        // Process each line
        for (let i = 0; i < lines.length; i++) {
            const items = lines[i].split(',');
            const course = items.map(item => item.trim());
            if (filepath.includes("reqs")) {
                reqs.push(course);
            } else {
                electives.push(course);
            }
        }
    } catch (err) {
        console.error('Error reading the file:', err);
    }
}

//function to get semesters of plan to use as headers of schedule array indexes
function GenSem() {
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
    elective_schedule = sems.map(element => [element]);
}


/*
function that adds courses to schedule
parameters:
  course - array that contains course information to be added to schedule
  prev - the index of schedule that the previous course was added to
    * this also gets returned 
*/
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

/*
Function to add required courses to schedule based on sem_order (reqs[r][2])
  1 = These courses go ASAP 
  2 = These courses go next and must go after 1 courses and before 3 courses
  3 = These courses go next and must go after 2 courses and before 4 courses
  4 = These courses can go wherever after 3 courses 
*/

function requiredCourses() {
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
function fillers() {
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

function GenSched() {
    getData(reqs_data);
    GenSem();
    requiredCourses();
    fillers();
}

function electiveSched() {
    getData(elective_data);
    //make priority lists for elective courses
    fallEven = [];
    fallOdd = [];
    springEven = [];
    springOdd = [];
    fallOlympic = [];
    springOlympic = [];

    for (e = 0; e < electives.length; e++) {
        priority = parseInt(electives[e][1]);
        switch (priority) {
            case 1:
                fallEven.push(electives[e]);
                fallOdd.push(electives[e]);
                springEven.push(electives[e]);
                springOdd.push(electives[e]);
                break;
            case 2:
                fallEven.push(electives[e]);
                springEven.push(electives[e]);
                break;
            case 3:
                springOdd.push(electives[e]);
                break;
            case 4:
                fallOdd.push(electives[e]);
                springEven.push(electives[e]);
                break;
            case 5:
                fallEven.push(electives[e]);
                break;
            case 6:
                springOdd.push(electives[e]);
                break;
            case 7:
                fallOdd.push(electives[e]);
                break;
            case 8:
                if (year % 4 == 0) {
                    fallOlympic.push(electives[e]);
                }
                break;
            case 9:
                if (year % 4 == 0) {
                    springOlympic.push(electives[e]);
                }
                break;
        }
    }

    //add priority lists to semesters in elective schedule
    for (e = 0; e < elective_schedule.length; e++) {
        s_priority = order[e];
        switch (s_priority) {
            case '125':
                elective_schedule[e].push(fallEven);
                break;
            case '1258':
                elective_schedule[e].push(fallEven);
                if (fallOlympic.length > 0) {
                    elective_schedule[e].push(fallOlympic);
                }
                break;
            case '147':
                elective_schedule[e].push(fallOdd);
                break;
            case '124':
                elective_schedule[e].push(springEven);
                break;
            case '1249':
                elective_schedule[e].push(springEven);
                if (springOlympic.length > 0) {
                    elective_schedule[e].push(springOlympic);
                }
                break;
            case '136':
                elective_schedule[e].push(springOdd);
                break;
        }
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

    // TESTING -------------------------------------------------------------------------------------------------------------------------------------------------------------------
/*
//Test variables:
var hours = 12;
var sem = "F";
var year = 2000;

//Schedule generation:
GenSched();

//Display schedule
for(s=0; s<schedule.length; s++){
  console.log(schedule[s]);
  console.log('-----------------------------------------');
}

//Electives schedule generation:
electiveSched();

//Display electives schedule
for(e=0; e<elective_schedule.length; e++){
  console.log(elective_schedule[e]);
  console.log('-----------------------------------------');
}
*/




