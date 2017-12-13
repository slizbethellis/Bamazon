DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

use bamazon;

CREATE TABLE products (
	item_id INTEGER NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(255) NULL,
    department_name VARCHAR(255) NULL,
    price DECIMAL(10,2) NULL,
    stock_quantity INTEGER NULL,
    PRIMARY KEY (item_id)
);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES ('Bobcat-in-a-box', 'Pets', 200, 50), ('Flying Dental Drone', 'Personal Care', 10000, 10),
	('Opossum Milk (gallon)', 'Groceries', 8, 100), ('Bottom Half of a Blender', 'Small Appliances', 50, 15),
    ('Frankie, the Undead Laptop', 'Toys', 40, 1), ('Double-Stick Duct Tape Slippers', 'Shoes', 5, 100),
    ('Toaster of Mystery', 'Small Appliances', 1000, 10), ('Stackable Dehydrated Water', 'Groceries', 10, 50),
    ('Nine-Dimensional Hypercardigan', 'Apparel', 500, 10), ('Remote-Controlled Spider', 'Toys', 25, 50);
    
SELECT * FROM products;