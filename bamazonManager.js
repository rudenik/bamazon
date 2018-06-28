var inquirer = require('inquirer');
var db = require('./db');
var table = require('cli-table');

var commands = ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Calculate Over Head Cost"];
// var selection;
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
    // console.log("selectionVar: " + selection);
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
                    conn.end();
                };
                conn.query('SELECT item_id, product_name, department_ID, price, stock_qty FROM bamazon.products WHERE stock_qty < 5;', function (error, data) {
                    if (error) {
                        console.log(error);
                        conn.end();
                    }
                    var tableToPrint = new table({
                        head: ['Item Id', 'product name', 'department_ID', 'stock qty', 'price']
                    })
                    if (data.length < 1) {
                        console.log("There is nothing with a low quantity");
                    } else {
                        for (ele in data) {
                            tableToPrint.push([data[ele].item_id, data[ele].product_name, data[ele].department_ID, (data[ele].stock_qty || 0).toString(), (data[ele].price || 0).toString()]);
                        }
                        console.log(tableToPrint.toString());
                        // console.log(data);
                    }
                    conn.end();
                })
            })

            break;
        case 2:
            listProducts();
            setTimeout(function(){
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
                    console.log("We got that");
                    console.log("Increased quantity to: " + updatedNumber);
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
                                // console.log(data);
                            })
                        conn.end();
                    })
                }
            })
        }, 10);
            break;
        case 3:
            inquirer.prompt([{
                    "name": "product_name",
                    "type": "input",
                    "message": "What is the product name?"
                },
                {
                    "name": "department_name",
                    "type": "input",
                    "message": "What is the department ID?"
                },
                {
                    "name": "price",
                    "type": "input",
                    "message": "What is the price of the new product?"
                },
                {
                    "name": "stock_qty",
                    "type": "input",
                    "message": "How many of the new product should we stock?"
                }
            ]).then(function (answer) {
                if (!answer.product_name) {
                    console.log("You didn't enter a name");
                } else if (!answer.department_name) {
                    console.log("You didn't enter a deparment ID");
                } else if (!answer.price) {
                    console.log("you didn't enter a price");
                } else if (!answer.stock_qty) {
                    console.log("You didn't enter a Quantity");
                } else {
                    console.log("let's add this to the database");

                    conn.connect(function (err) {
                        if (err) {
                            console.log(err);
                            conn.end();
                        };
                        conn.query(
                            `
                        INSERT INTO products (product_name, department_ID, price, stock_qty)
                        VALUES('${answer.product_name}', '${answer.department_name}', ${answer.price},  ${answer.stock_qty});
                    `,
                            function (error, data) {
                                if (error) throw error;
                                // console.log(data);
                            })
                        conn.end();
                    })
                }
                
            })
            break;
            case 4:
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                };
                conn.query(
                    `
                    SELECT products.department_ID, departments.department_name, products.product_name, products.item_id, products.price, products.stock_qty, products.product_sales 
                    FROM departments
                    JOIN products ON products.department_ID = departments.department_ID;
                    `,
                    function (error, data) {
                        if (error) throw error;
                        // console.log(data);
                        for(ele in data){
                            var costPerLine = ((data[ele].price * data[ele].stock_qty)*.8);
                            console.log(data[ele].product_name + " required " + costPerLine + " to acquire");
                        }

                    });

                conn.end();
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
            conn.end();
        };
        conn.query(`SELECT products.department_ID, departments.department_name, products.product_name, products.item_id, products.price, products.stock_qty, products.product_sales  
        FROM departments
        JOIN products ON products.department_ID = departments.department_ID;
        `, function (error, data) {
            if (error) {
                console.log(error);
                conn.end();
            }
            var tableToPrint = new table({
                head: ['Item ID', 'Product Name', 'Department_ID', 'Department_Name', 'Stock Qty', 'Price', 'Total Sales']
            })

            for (ele in data) {
                tableToPrint.push([data[ele].item_id, data[ele].product_name, data[ele].department_ID, data[ele].department_name, (data[ele].stock_qty || 0).toString(), data[ele].price.toString(), (data[ele].product_sales || 0).toString()]);
            }
            lastQuery = data;
            console.log(tableToPrint.toString());
            conn.end();
        })
    })

}