var inquirer = require('inquirer');
var db = require('./db');
var table = require('cli-table');

var commands = ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"];
var selection;
var lastQuery;


function getSelection() {
    inquirer.prompt([{
        "name": "selection",
        "message": "How would you like to proceed?",
        "type": "list",
        "choices": commands,
    }]).then(function (answer) {
        selectionMade(answer.selection);
        return answer.selection;
    });
}

function selectionMade(selected) {
    console.log("selectionVar: " + selection);
    var conn = db.connect();
    var selectedIndex = commands.indexOf(selected);

    switch (selectedIndex) {
        case 0:
            listProducts();
            break;
        case 1:
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                };
                conn.query('SELECT item_id, product_name, department_name, price, stock_qty FROM bamazon.products WHERE stock_qty < 5;', function (error, data) {
                    if (error) {
                        console.log(error);
                    }
                    var tableToPrint = new table({
                        head: ['Item Id', 'product name', 'department', 'stock qty', 'price']
                    })
                    for (ele in data) {
                        tableToPrint.push([data[ele].item_id, data[ele].product_name, data[ele].department_name, data[ele].stock_qty.toString(), data[ele].price.toString()]);
                    }
                    console.log(tableToPrint.toString());
                    conn.end();
                })
            })

            break;
        case 2:
            listProducts();
            console.log("last Query: " + lastQuery);
            inquirer.prompt([{
                    "name": "productID",
                    "type": "input",
                    "message": "Which Product ID did you want to add qty for?"
                },
                {
                    "name": "increase",
                    "type": "input",
                    "message": "How many did you want to add"
                }
            ]).then(function (answer) {

                var productToIncrease = lastQuery.filter(function (item) {
                    return (item.item_id === parseInt(answer.productID));
                })
                if (productToIncrease.length < 1) {
                    console.log("Product Doesn't Exists")
                } else {
                    var updatedNumber = parseInt(productToIncrease[0].stock_qty) + parseInt(answer.increase);
                    console.log("we got that");
                    console.log("increase to: " + updatedNumber);
                    conn.connect(function (err) {
                        if (err) {
                            console.log(err);
                        };
                        conn.query(
                            `
                            UPDATE products
                            SET stock_qty = '${updatedNumber}' 
                            WHERE item_id = '${productToIncrease[0].item_id}';
                        
                        `,
                            function (error, data) {
                                if (error) throw error;
                                console.log(data);
                            })
                        conn.end();
                    })
                }
            })
            break;
        case 3:
            inquirer.prompt([
                {
                    "name":"product_name",
                    "type":"input", 
                    "message":"What is the product name?"
                },
                {
                    "name":"department_name",
                    "type":"input", 
                    "message":"What is the department name?"
                },
                {
                    "name":"price",
                    "type":"input", 
                    "message":"What is the price of the new product?"
                },
                {
                    "name":"stock_qty",
                    "type":"input", 
                    "message":"How many of the new product should we stock?"
                }
            ]).then(function(answer){
                if(!answer.product_name){
                    console.log("You didn't enter a name");
                }else if(!answer.department_name){
                    console.log("You didn't enter a deparment Name");
                }else if(!answer.price){   
                    console.log("you didn't enter a price");
                }else if(!answer.stock_qty){
                    console.log("You didn't enter a Quantity");
                }else{
                    console.log("let's add this to the database");
                
                conn.connect(function (err) {
                    if (err) {
                        console.log(err);
                    };
                    conn.query(
                        `
                        INSERT INTO products (product_name, department_name, price, stock_qty)
                        VALUES('${answer.product_name}', '${answer.department_name}', ${answer.price},  ${answer.stock_qty});
                    `,
                        function (error, data) {
                            if (error) throw error;
                            console.log(data);
                        })
                    conn.end();
                })
            }
                
            })
            break;
    }
}

getSelection();

function listProducts() {
    var conn = db.connect();
    conn.connect(function (err) {
        if (err) {
            console.log(err);
        };
        conn.query('SELECT * FROM products', function (error, data) {
            if (error) {
                console.log(error);
            }
            var tableToPrint = new table({
                head: ['Item Id', 'product name', 'department', 'stock qty', 'price']
            })
            for (ele in data) {
                tableToPrint.push([data[ele].item_id, data[ele].product_name, data[ele].department_name, data[ele].stock_qty.toString(), data[ele].price.toString()]);
            }
            lastQuery = data;
            console.log(tableToPrint.toString());
            conn.end();
        })
    })

}