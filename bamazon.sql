CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE IF NOT EXISTS departments(
	department_ID INTEGER (10) PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(30) NOT NULL,
    over_head_cost FLOAT(8,2)
    );
    
INSERT INTO departments(department_ID, department_name, over_head_cost)
VALUES(1, "Gaming", 7199.84);

INSERT INTO departments(department_name)
VALUES("Kitchen"), ("Entertainment"), ("Electronics"), ("Home Automation");

CREATE TABLE IF NOT EXISTS products(
	item_id INTEGER(10) PRIMARY KEY AUTO_INCREMENT,
	product_name VARCHAR(30) NOT NULL,
    department_name VARCHAR(30),
    price FLOAT(10) NOT NULL,
    stock_qty INTEGER(10),
    product_sales FLOAT(7,2),
    department_ID INT(10),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);



INSERT INTO products (item_id, product_name, price, stock_qty, department_ID)
VALUES(1, "PS4", 449.99, 20, 1);

INSERT INTO products (product_name, price, stock_qty, department_ID)
VALUES("XBOX", 349.99, 30, 1),
		("Nintendo Switch",  449.99,  5, 1),
        ("Apple TV",  149.99,  15, 2),
        ("Roku", 49.00,  17, 2),
        ("Anova Smart Ciruclator",  199.99,  20, 3),
        ("Stand Mixer",  299.99,  10, 3),
        ("Le Cruset Cast Iron Pot", 179.99,  15, 3),
        ("Japanese Steel Knife",  129.99,  4, 3),
        ("Wood Cutting Board", 39.99,  25, 3);



SELECT products.department_ID, departments.department_name, products.product_name, products.item_id, products.price, products.stock_qty, products.product_sales 
FROM departments
JOIN products ON products.department_ID = departments.department_ID;


SELECT SUM(products.product_sales) AS total_department_sales, departments.department_ID, departments.department_name, departments.over_head_cost FROM  products 
JOIN departments ON departments.department_ID = products.department_ID GROUP BY department_ID ORDER BY total_department_sales ASC;


