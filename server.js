const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const logo = require('ascii-logo');
const { log } = require('console');
require('console.table');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'employee_db'
},
console.log(`Connected to ${database}`)
);

const init = () => {
    const header = logo({ name: 'Employee Tracker'}).render();
    console.log(header);

    inquirer.createPromptModule([
        {
            type: 'list',
            name: 'menu',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View All Departments',
                'View All Roles',
                'Add Department',
                'Add Role',
                'Add Employee',
                'Update Employee',
                'Quit'
            ]
        }
    ]).then((response) => {
        let ans = response.menu;
        switch(ans) {
            case 'View All Employees':
                viewEmp();
                break;
            case 'View All Departments':
                viewDepts();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'Add Department':
                addDept();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Add Employee':
                addEmp();
                break;
            case 'Update Employee':
                updateEmp();
                break;
            case 'Quit':
                quit();
                break;
            default:
                console.log('Something broke. Code needs fixing');
                break;
        }
    })
}

init();

const quit = () => {
    console.log('Than you for using the Employee Tracker App!');
    process.exit();
};
  
app.use((req, res) => {
    res.status(404).end();
});
  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});