// NPM modules
var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
var Table = require("cli-table-redemption");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  viewOptions();
});

// prompt that sends user to correct function
function viewOptions() {
  inquirer.prompt([
    {
      type: "rawlist",
      name: "choice",
      message: "What would you like to do?",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }
  ]).then(function(answer) {
    switch (answer.choice) {
      case "View Products for Sale":
        viewProducts();
        break;
      case "View Low Inventory":
        viewLowInventory();
        break;
      case "Add to Inventory":
        addInventory();
        break;
      case "Add New Product":
        addNewProduct();
        break;
      default:
        askContinue();
    }
  });
}

// outputs all products in a table
function viewProducts() {
  console.log(chalk.cyan("View Products for Sale"));
  var table = new Table({
    head: ['Item_ID', 'Product_Name', 'Department_Name', 'Price', 'Quantity'],
    style: {head: ['green'], border: ['white']}
  });
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    for (var i = 0; i < results.length; i++) {
      table.push([results[i].item_id, results[i].product_name, results[i].department_name, results[i].price, results[i].stock_quantity]);
    }
    console.log(table.toString());
    askContinue();
  });
}

// outputs products with fewer than five items in a table
function viewLowInventory() {
  console.log(chalk.cyan("View Low Inventory"));
  var table = new Table({
    head: ['Item_ID', 'Product_Name', 'Department_Name', 'Quantity'],
    style: {head: ['green'], border: ['white']}
  });
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    for (var i = 0; i < results.length; i++) {
      if (results[i].stock_quantity < 5) {
        table.push([results[i].item_id, results[i].product_name, results[i].department_name, results[i].stock_quantity]);
      }
    }
    console.log(table.toString());
    askContinue();
  });
}

// add more inventory of an existing product
function addInventory() {
  console.log(chalk.cyan("Add to Inventory"));
  connection.query("SELECT * FROM products", function(err, results) {
    for (var i = 0; i < results.length; i++) {
      console.log(`  ${results[i].item_id} | ${results[i].product_name} | ${results[i].department_name} | ${results[i].stock_quantity}`);
    }
    inquirer.prompt([
      {
        type: "input",
        name: "item",
        message: "Which item would you like to restock?",
        validate: function(value) {
          if (value <= results.length) {
            return true;
          }
          return false;
        }
      },
      {
        type: "input",
        name: "quantity",
        message: "How much of this item would you like to add?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ]).then(function(answer) {
      var chosenItem = results[answer.item - 1];
      var newQuantity = chosenItem.stock_quantity + parseInt(answer.quantity);
      var query = "UPDATE products SET ? WHERE ?";
      connection.query(query, [{stock_quantity: newQuantity},{item_id: answer.item}], function(err) {
        if (err) throw err;
        console.log(chalk.green(`You have have added ${answer.quantity} unit(s) of ~${results[answer.item].product_name}~.`));
        askContinue();
      });
    });
  });
}

// add a new product to store
function addNewProduct() {
  console.log(chalk.cyan("Add New Product"));
  inquirer.prompt([
    {
      type: "input",
      name: "product",
      message: "What is the name of the product you wish to add?"
    },
    {
      type: "input",
      name: "department",
      message: "Which department does this product belong in?"
    },
    {
      type: "input",
      name: "price",
      message: "What is the price per unit of this product?",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    },
    {
      type: "input",
      name: "quantity",
      message: "How many of this item does the store have in inventory?",
      validate: function(value) {
        if (isNaN(value) === false) {
            return true;
        }
        return false;
      }
    }
  ]).then(function(answer) {
    var query = "INSERT INTO products SET ?";
    connection.query(query, [{product_name: answer.product, department_name: answer.department, price: answer.price, stock_quantity: answer.quantity}], function(err) {
      if (err) throw err;
      console.log(chalk.green(`You have have added ${answer.quantity} unit(s) of ~${answer.product}~.`));
      askContinue();
    });
  });
}

// asks if user wants to continue or exit
function askContinue() {
  inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Would you like to perform another managerial task?",
      default: true
    }
  ]).then(function(answer) {
    if (answer.confirm) {
      console.log(chalk.yellow("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n"));
      viewOptions();
    }
    else {
      console.log(chalk.magenta("\nSorry to see you go. Bye!"));
      connection.end();
    }
  });
}
