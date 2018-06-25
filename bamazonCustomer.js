var inquirer = require('inquirer');
var db = require('./db');
var table = require('cli-table');

var productData=[];

function displayItems(){
    var conn = db.connect();
    conn.connect(function(err){
        if(err){
            console.log(err);
        };
        conn.query('SELECT * FROM products', function(error, data){
            if(error){
                console.log(error);
            }
            var tableToPrint = new table({
                head: ['Item Id', 'product name', 'department', 'stock qty', 'price']
            })
            for (ele in data){
                tableToPrint.push([data[ele].item_id, data[ele].product_name, data[ele].department_name, data[ele].stock_qty.toString(), data[ele].price.toString()]);
                productData.push(data[ele]); //you might have to fix this later. 
            }
            console.log(tableToPrint.toString());
            makeOrder(data);    
            conn.end();
        }
        )}
    )
};


function makeOrder(data){
    inquirer.prompt([
        {
            "name":"productID",
            "type":"list",
            "choices":function(){
                // console.log("in the choices function");
                var arrayName=[];
                for(ele in data){
                    arrayName.push(data[ele].item_id.toString());
                    console.log(data[ele]);
                }
                return arrayName;
            },
            "message": "Select Item ID"
    },
    {
        "name":"qty",
        "type":"input",
        "message": "Type in quantity"
    }
    ]).then(answer => {
        var product = data.filter(function(item){
            return (item.item_id === parseInt(answer.productID));
        })
        // console.log(parseInt(answer.qty));
        // console.log((product[0].stock_qty));
        if (parseInt(answer.qty) > parseInt(product[0].stock_qty)){
            console.log("Insufficient Quantity, sorry we don't have that many.")
        }else{
            var updatedNumber = parseInt(product[0].stock_qty) - parseInt(answer.qty);
            // console.log("we have " + updatedNumber + " Left");
            // console.log("of " + product[0].item_id);
            var conn = db.connect();
            conn.connect(function (err){
                if(err){
                    console.log(err);
                }
                // updateStr = "UPDATE products SET stock_qty = " + updatedNumber + " WHERE item_id = " + product.item_id
                conn.query(
                    `
                    UPDATE products
                    SET stock_qty = '${updatedNumber}' 
                    WHERE item_id = '${product[0].item_id}';
                `, function(err, result){
                    if(err) throw err;
                    // console.log(result);
                    console.log("Thank you for your order, your total is: " + (answer.qty * product[0].price));
                });

                conn.end();
            })


        }
    })
}
displayItems();
