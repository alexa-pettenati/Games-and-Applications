const express = require('express');
const mysql = require('mysql');
var http = require("http");
var url = require("url");
var router = express.Router();

const app = express();

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "CSE316HW4_DB",
    port: "3306"
});

con.connect((err) => {
    if(err){
        throw err
    }else{
        console.log("connected")
    }
});
module.exports=con;

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log("Started the server on port "+port);
});

app.get("/", (req, res)=>{
        writeSearch(req, res);
});

app.get("/Calendar", (req, res)=>{
        writeSchedule(req, res);
});

function writeSearch(req, res){
        res.writeHead(200, {"Content-Type":"text/html"});
        let query = url.parse(req.url, true).query;
        let search = query.search ? query.search : "";
        let filter = query.filter ? query.filter : "";
        let html = 
        `
        <!DOCTYPE html>
        <html lang="en">

        <head>
                <link href='https://fonts.googleapis.com/css?family=Raleway' rel='stylesheet'>
                <link href='https://fonts.googleapis.com/css?family=Yellowtail' rel='stylesheet'>
                <script type="text/javascript" src="http://code.jquery.com/jquery-latest.js"></script>
                <title>SBU Class Find</title>
                <style>
                        body{
                                font-family: 'Raleway';
                        }
                        
                        .button {
                                font-family: 'Raleway';
                                border-radius: 16px;
                        }

                        .button:hover {
                                background-color: #363666;
                                color: white;
                        
                        }

                        option{
                                font-family: 'Raleway';
                        }
                        
                        .plzGoInline{
                                display:inline;
                        }

                        .topB{
                                
                                
                        }
                        
                        .search{
                                font-family: 'Raleway';
                        }

                        pre{
                                font-family: 'Raleway';

                        }

                        h2{
                                font-size:28 px;
                                display:inline;
                        }


                </style>
        </head>

        <body>
                <form method="get" action = "/">
                        <input id="search" type="text" name="search" class="search" value="" placeholder="Search...">
                        <select name="filter">
                                <option value="allFields"> All Fields</option>
                                <option value="courseName"> Course Name</option>
                                <option value="courseNumber"> Course Number</option>
                                <option value="day">Day</option>
                                <option value="time">Time</option>
                        </select>
                        <input type="submit" class="button" name="submit" value="Submit">
                </form>
                <br><br>
        </body>
        `;

        let sql = "SELECT * FROM mytable;";

        if(filter=="allFields"){
                sql = `SELECT * FROM mytable
                        WHERE Subj LIKE '%` + search + `%' OR
                                CRS LIKE '%` + search + `%' OR
                                Cmp LIKE '%` + search + `%' OR
                                Sctn LIKE '%` + search + `%' OR
                                Days LIKE '%` + search + `%' OR
                                start LIKE '%` + search + `%' OR
                                end LIKE '%` + search + `%' OR
                                Mtg_Start_Date  LIKE '%` + search + `%' OR
                                Mtg_End_Date LIKE '%` + search + `%' OR
                                Duration  LIKE '%` + search + `%' OR
                                Instruction_Mode  LIKE '%` + search + `%' OR
                                Building  LIKE '%` + search + `%' OR
                                Room  LIKE '%` + search + `%' OR
                                Instr   LIKE '%` + search + `%' OR
                                Enrl_Cap  LIKE '%` + search + `%' OR
                                Wait_Cap   LIKE '%` + search + `%' OR
                                Cmbnd_Descr   LIKE '%` + search + `%' OR
                                Cmbnd_Enrl_Cap    LIKE '%` + search + `%' OR
                                Course_Name   LIKE '%` + search + `%' OR
                                PrimaryKey   LIKE '%` + search + `%';`;
        } 
        else if(filter == "courseNumber"){
                sql = `SELECT * FROM mytable
                        WHERE CRS LIKE '%` + search + `%';`;
        }else if (filter == "courseName"){
                sql = `SELECT * FROM mytable
                        WHERE Course_Name LIKE '%` + search + `%';`;
        }else if(filter == "day"){
                sql = `SELECT * FROM mytable
                        WHERE Days LIKE '%` + search + `%';`;
        }else if(filter=="time"){ 
                sql = `SELECT * FROM mytable
                        WHERE start LIKE '%` + search + `%' OR
                                end LIKE '%` + search + `%';`;                        
        }

        con.query(sql, function(err, result){
                let count = 0;
                if(err) throw err;
                for(let item of result){
                        count++;;
                        var htmlColor="";
                        if(count % 2 !=0){
                                htmlColor="style='background-color: white;'";
                        }else{
                                htmlColor="style='background-color: #f0f0f0;'";
                        }
                        var start = item.Mtg_start_Date;
                        var end = item.Mtg_End_Date;
                        start = String(start).substring(0, 9);
                        end = String(end).substring(0, 9);
                        var dates = start +" to "+end;

                        html+=` 
                        <div `+htmlColor+`>
                        <h2  class="topB" ><u>` +item.PrimaryKey + `</u></h2>
                        <form action="/Calendar" method="get" class="plzGoInline">
                                <button name="add" class="button" value="`+item.PrimaryKey + `"> Add Class </button>
                        </form>
                        <div>
                        <div id="courseSearch">
<pre>   <b>Class Details</b>
                Course Title: `+item.Course_Name+`
                Course Name: CSE `+item.CRS+`
                Section: `+item.Sctn+`
                Component: `+item.Cmp+`
                Instructor: `+ item.Instr +`
        <b>Meeting Information</b>
                Days and Time: ` + item.Days +` `+item.start +` to `+item.end+`
                Dates: `+dates+`
                Duration: `+item.Duration+` minutes
                Instruction Mode: `+item.Instruction_Mode+`
                Location: Building `+item.Building+` room `+item.Room+`
        <b>Enrollment Information</b>
                Enrollment Cap: `+item.Enrl_Cap+`
                Waitlist Cap: `+item.Wait_Cap+`
                Combinded Description: `+item.Cmbnd_Desc+`
                Combined Enrollment Cap: `+item.Cmbnd_Enrl_Cap+`
</pre>
<br>
                        </div>
                        
                        `;
                }
                res.write(html+"\n\n</body></html>");
                res.end();

                
        });
};

function writeSchedule(req, res){
        let query = url.parse(req.url, true).query;
        let addQuery = `INSERT INTO Calendar SELECT * FROM mytable WHERE mytable.PrimaryKey="`+query.add+`";`

        let html=`
                <!DOCTYPE html>
                <html>
                <head>
                        <title>Schedule</title>
                        <link href='https://fonts.googleapis.com/css?family=Raleway' rel='stylesheet'>
                        <link href='https://fonts.googleapis.com/css?family=Yellowtail' rel='stylesheet'>
                        <style type = text/css>
                                body{
                                        font-family:'Raleway';
                                }

                                table{
                                        table-layout: fixed ;
                                        width: 100% ;
                                }

                                td{
                                        width: 70%;
                                }

                                table, tr, th, td{
                                        border: 1px solid black;
                                        heigth: 50px;
                                        vertical-align: bottom;
                                        padding: 2px;
                                        text-align: left;
                                        border-collapse: collapse;
                                        
                                }

                                th{
                                        background-color: #363636;
                                        font-size: 17px;
                                        color: white;
                                }

                                .heading{
                                        font-size:45px;
                                        display:inline;
                                        vertical-align:top;
                                }

                                .button {
                                        font-family: 'Raleway';
                                        border-radius: 16px;
                                }

                                .plzGoInline{
                                        display:inline;
                                        float:left;
                                }
        
                                .button:hover {
                                        background-color: #363666;
                                        color: white;
                                
                                }
                                .oneClass{
                                        margin: 2px;
                                        background-color: #A3E4D7 ;
                                        border-style: solid;
                                        border-width: thin thin thin thick;
                                        border-color: black black black #1ABC9C ;
                                        padding: 2px;
                                        
                                }

                                .topForm{
                                        margin: 20px;
                                }

                        </style>
                </head>
                <body>
                <div class="calTop">
                        <h1 class="heading plzGoInline">Schedule</h1>
                        <form action="/" method="get" class="plzGoInline topForm">
                                <button name="add" class="button"> Return </button>
                        </form>
                        </div>

                        <br>

                        <table>
                                <tr>
                                        <th>Mon</th>
                                        <th>Tue</th>
                                        <th>Wed</th>
                                        <th>Thu</th>
                                        <th>Fri</th>
                                </tr>
                                <tr>
                                        <td class='class'>Mon</td>
                                        <td class='class'>Tue</td>
                                        <td class='class'>Wed</td>
                                        <td class='class'>Thu</td>
                                        <td class='class'>Fri</td>
                                </tr>
                        </table>
                </body>
                </html>
        `;

        con.query(addQuery, function(err, result){
                if(err)console.log(err);
                con.query(constructSQLDayCommand("M"), function(err, result){
                        if(err)throw err;
                        html=html.replace("<td class='class'>Mon</td>", getDay(result, "MON"));
                        con.query(constructSQLDayCommand("TU"), function(err, result){
                                if(err)throw err;
                                html=html.replace("<td class='class'>Tue</td>", getDay(result, "TUE"));
                                con.query(constructSQLDayCommand("W"), function(err, result){
                                        if(err)throw err;
                                        html=html.replace("<td class='class'>Wed</td>", getDay(result, "WED"));
                                        con.query(constructSQLDayCommand("TH"), function(err, result){
                                                if(err)throw err;
                                                html=html.replace("<td class='class'>Thu</td>", getDay(result, "THU"));
                                                con.query(constructSQLDayCommand("F"), function(err, result){
                                                        if(err)throw err;
                                                        html=html.replace("<td class='class'>Fri</td>", getDay(result, "FRI"));
                                                        res.write(html+"\n\n</body>\n</html>");
                                                        res.end();
                                                });
                                        });
                                });
                        });
        
                });
        });
}

function getDay(SQLResult, tableHeader){
        let retStr="<td class='class'>";
        for(let item of SQLResult){ //this for loop goes over courses for one specific day
                retStr +=`<div class="oneClass">`               
                let time = item.start +" to "+item.end;
                retStr +="\n   <b> "+ time+"<br><b>"+
                item.PrimaryKey +" </b><br> "+
                item.Course_Name+"\n</b><br><br></div>";
        }
        return retStr + "</td>";
}


function constructSQLDayCommand(search){
        var sql = `SELECT * FROM Calendar
                        WHERE Days LIKE '%` +search+ `%'
                        ORDER BY Start_Time ASC;`; //put times in order for day
        return sql;
};