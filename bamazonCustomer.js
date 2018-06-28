var inquirer = require('inquirer');
var db = require('./db');
var table = require('cli-table');

var productData=[];

function displayItems(){
    var conn = db.connect();
    conn.connect(function(err){
        if(err){
            console.log(err);
            conn.end();
        };
        conn.query('SELECT * FROM products', function(error, data){
            if(error){
                console.log(error);
                conn.end();
            }
            var tableToPrint = new table({
                head: ['Item Id', 'product name', 'price']
            })
            for (ele in data){
                tableToPrint.push([data[ele].item_id, data[ele].product_name, data[ele].price.toString()]);
                productData.push(data[ele]); //you might have to fix this later. 
            }
            console.log(tableToPrint.toString());//setTimeOUT tofix this.
            conn.end();
            makeOrder(data); 
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
        if (parseInt(answer.qty) > parseInt(product[0].stock_qty)){
            console.log("Insufficient Quantity, sorry we don't have that many.")
        }else{
            var updatedNumber = parseInt(product[0].stock_qty) - parseInt(answer.qty);
            var saleTotal = parseFloat(answer.qty * product[0].price)
                if(!product[0].product_sales){
                    product[0].product_sales=0;
                    var current_sales = parseFloat(product[0].product_sales) + parseFloat(saleTotal);
                }else{
                    var current_sales = parseFloat(product[0].product_sales) + parseFloat(saleTotal);
                }
            var conn = db.connect();
            conn.connect(function (err){
                if(err){
                    conn.end();
                    console.log(err);
                }
                conn.query(
                    `
                    UPDATE products
                    SET stock_qty = '${updatedNumber}',  product_sales = '${parseFloat(current_sales)}'
                    WHERE item_id = '${product[0].item_id}';
                `, function(err, result){
                    if(err) throw err;
                    console.log("Thank you for your order, your total is: " + saleTotal);
                });
                conn.end();
            })


        }
    })
}
displayItems();
