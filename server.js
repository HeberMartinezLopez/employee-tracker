// const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const logo = require('asciiart-logo');
// const app = express();
require('console.table');

// const PORT = process.env.PORT || 3001;

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());


// mysql connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'employee_db'
},
console.log(`Connected to employee_db`)
);

// print ascii logo
const header = logo({ name: 'Employee Tracker'}).render();
console.log(header);

// function to initiate app
const init = () => {

    inquirer.prompt([
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
};

// query to see all employees
const viewEmp = () => {
    db.query(
        `SELECT * FROM employee_list`, (err, res) => {
        err ? console.log(err) : console.table(res),
        init();
    })
};

// query to see all departments
const viewDepts = () => {
    db.query('SELECT * FROM dep_list', (err, res) => {
        err ? console.log(err) : console.table(res),
        init();
    })
};

// query to see all roles
const viewRoles = () => {
    db.query('SELECT * FROM role_list', (err, res) => {
        err ? console.log(err) : console.table(res),
        init();
    })
};

// query to add a new department
const addDept = () => {

    inquirer.prompt([
        {
            type: 'input',
            name: 'addDep',
            message: 'What is the name of the department?'
        }
    ])
    
    .then((response) => {

        let newDep = response.addDep;
        
        db.query(
        `INSERT INTO dep_list (dep_name) 
            VALUES
                ('${newDep}')`, 
            (err, res) => {
                err ? console.log(err) : console.table(`Added ${newDep} to database!`, res),
                init();
            }
        );
    });
};

// query to add new role
const addRole = () => {
    db.query('SELECT * FROM dep_list', (err, res) => {
        if (err){
            console.log(err);
            return init();
        }
        const deptChoices = res.map((department) => ({
            value: department.id,
            name: department.dep_name
          }));
        inquirer.prompt([
            {
                type: 'input',
                name: 'rolesName',
                message: 'What is the name of the role?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?'
            },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Which department does the role belong to?',
                choices: deptChoices,
            }
        ]).then((response) => {
            let deptId = response.departmentId;
            let roleName = response.rolesName;
            let roleSalary = response.salary;
            db.query(
                `INSERT INTO role_list (title, salary, dep_list_id)
                    VALUES
                    ('${roleName}', '${roleSalary}','${deptId}')`, 
                    (err, res) => {
                        err ? console.log(err) : console.table(`Added ${roleName} to the database`, res),
                        init();
                    }
                );
            }
        );
    });
};

// query to add new employee
const addEmp = () => {
    db.query('SELECT * FROM role_list', (err, res) => {
        if(err){
            console.log(err);
            return init();
        }

        const roleChoices = res.map((role) => ({
            value: role.id,
            name: role.title
        }));

        db.query('SELECT * FROM employee_list', (err, empRes) => {
            if(err){
                console.log(err);
                return init();
            }

            const managerChoices = empRes.map((employee) => ({
                value: employee.id,
                name: `${employee.first_name} ${employee.last_name}`,
            }));

            managerChoices.push(
                { 
                    value: null, 
                    name: 'No Manager'
                }
            );
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: "What is the employee's first name?"
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: "What is the employee's last name?"
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: "What is the employee's role?",
                    choices: roleChoices
                },
                {
                    type: 'list',
                    name: 'managerId',
                    message: "Who is the employee's manager?",
                    choices: managerChoices
                }
            ]).then((response) => {
                const roleId = response.roleId;
                const empFirst = response.firstName;
                const empLast = response.lastName;
                const managerId = response.managerId;
                db.query(
                    `INSERT INTO employee_list ( first_name, last_name, role_list_id, manager_id)
                        VALUES
                            ('${empFirst}', '${empLast}', '${roleId}', '${managerId}')`,
                        (err, res) => {
                            err ? console.log(err) : console.table(`Added ${empFirst} ${empLast} to the database`, res),
                            init();
                        }
                    );
                }
            );
        });
    });
};

// query to update employee
const updateEmp = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'empId',
            message: "Which employee's role do you want to update?",
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Which role do you want to assign the selected employee?',
            choices: roleChoices
        }
    ]).then((response) => { 
        const { empId, roleId } = response;

        db.query(
            `UPDATE employee_list
            SET role_list_id = ?
            WHERE id =?`,
            [roleId, empId], (err, res) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log(`Updated ${empId}'s role`);
                }
                init();
            }
        );
    });
};

// function to quit and exit app
const quit = () => {
    console.log('Thank you for using the Employee Tracker App!');
    process.exit();
};

// app.use((req, res) => {
//     res.status(404).end();
//   });
  
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });

// initiate app
init();