// NPM modules
var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");

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
  welcome();
});

// pushes greeting to console, then calls function that displays items and prompts customer
function welcome() {
  console.log(chalk.cyan("Welcome to the Bamazon Store!"));
  console.log(chalk.cyan("-----------------------------"));
  displayItems();
}

// displays list of items and asks customer which item and how much they'd like to buy
function displayItems() {
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    for (var i = 0; i < results.length; i++) {
      console.log(`  ${results[i].item_id} | ${results[i].product_name} | ${results[i].department_name} | $${results[i].price}`);
    }
    inquirer.prompt([
      {
        type: "input",
        name: "choice",
        message: "What is the ID of the product you wish to purchase?",
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
        message: "How many units would you like to buy?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
      ]).then(function(answer) {
        var cartItem = results[answer.choice - 1];
        var newQuantity = cartItem.stock_quantity - parseInt(answer.quantity);
        if (parseInt(answer.quantity) <= parseInt(cartItem.stock_quantity)) {
          checkOut(newQuantity, cartItem, parseInt(answer.quantity));
        }
        else {
          console.log(chalk.red(`There are only ${cartItem.stock_quantity} unit(s) of ~${cartItem.product_name}~ left.`));
          askCustomer();
        }
      });
  });
}

// updates database with new stock level and tells customer how much they spent
function checkOut(stock, object, units) {
  var query = "UPDATE products SET ? WHERE ?";
  connection.query(query, [{stock_quantity: stock},{item_id: object.item_id}], function(err) {
    if (err) throw err;
    console.log(chalk.green(`You have ordered ${units} unit(s) of ~${object.product_name}~.`));
    console.log(chalk.cyan(`Your order total is $${units * object.price}`));
    askCustomer();
  });
}

// asks if customer would like to continue shopping or exit
function askCustomer() {
  inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Would you like to continue shopping?",
      default: true
    }
  ]).then(function(answer) {
    if (answer.confirm) {
      console.log(chalk.yellow("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n"));
      displayItems();
    }
    else {
      console.log(chalk.magenta("\nSorry to see you go. Bye!"));
      connection.end();
    }
  });
}
