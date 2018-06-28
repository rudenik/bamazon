var inquirer = require('inquirer');
var db = require('./db');
var table = require('cli-table');

var commands = ["View Product Sales by Department", "Create New Department"];

function getSelection(){
    inquirer.prompt([
        {
            "name":"command",
            "message":"What would you like to do?",
            "type":"list",
            "choices":commands
        }
    ]).then(function(answer){
        console.log(answer.command);
        selectionMade(answer.command);
    })
}

function selectionMade(answer){
    var conn = db.connect();
    var selectedIndex = commands.indexOf(answer)
    var tableToPrint = new table({
        head: ['Department_ID', 'Department_Name', 'over_head_costs', 'product_sales', 'total_profit']
    })


    switch(selectedIndex){
        case 0:
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                conn.end();
            };
            conn.query(`
            SELECT SUM(products.product_sales) AS total_department_sales, departments.department_ID, departments.department_name, departments.over_head_cost FROM  products 
            JOIN departments ON departments.department_ID = products.department_ID GROUP BY department_ID ORDER BY departments.department_ID ASC;
        `, function (error, data) {
                if (error) {
                    console.log(error);
                    conn.end();
                };
                // console.log(data);
            for(ele in data){
                var departmentCost = (data[ele].total_department_sales - data[ele].over_head_cost).toFixed(2);
                // departmentCost.toPrecision(2);
                tableToPrint.push([data[ele].department_ID, data[ele].department_name, (data[ele].over_head_cost || 0), (data[ele].total_department_sales || 0), (departmentCost || 0)])

            }
            console.log(tableToPrint.toString()); 
            conn.end();   
    })
})
        break;
        case 1:
        console.log("case 1");
        inquirer.prompt([{
            "name": "department_name",
            "type": "input",
            "message": "What is the Department name?"
        },
        {
            "name": "oheadcost",
            "type": "input",
            "message": "What is the over head cost?"
        },
        
    ]).then(function (answer) {
        if (!answer.department_name) {
            console.log("You didn't enter a name");
        } else {
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                };
                conn.query(
                    `
                INSERT INTO departments (department_name, over_head_cost)
                VALUES('${answer.department_name}',  '${answer.oheadcost}');
            `,
                    function (error, data) {
                        if (error) {
                            console.log(error);
                            
                            conn.end();
                        }
                    })
                conn.end();
                console.log("let's add this to the database");
            })
        }
    })
        break;
    }
}
getSelection();