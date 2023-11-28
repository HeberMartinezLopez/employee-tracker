const inquirer = require('inquirer');
const mysql = require('mysql2');
const logo = require('asciiart-logo');
require('console.table');

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
function init() {

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
function viewEmp(){
    db.query(
        `SELECT e.id AS 'Employee ID', e.first_name AS 'First Name', e.last_name AS 'Last Name', r.title AS 'Job Title', d.dep_name AS 'Department', r.salary AS 'Salary',
        CONCAT(m.first_name, ' ', m.last_name) AS 'Manager'
        FROM employee_list e
        JOIN role_list r ON e.role_list_id = r.id
        JOIN dep_list d ON r.dep_list_id = d.id
        LEFT JOIN employee_list m ON e.manager_id = m.id;`, 
        (err, res) => {
        err ? console.log(err) : console.table(`\n`,res),
        init();
    })
};

// query to see all departments
function viewDepts(){
    db.query(`SELECT id AS 'Department ID', dep_name AS 'Department Name' FROM dep_list;`, 
    (err, res) => {
        err ? console.log(err) : console.table(`\n`, res),
        init();
    })
};

// query to see all roles
function viewRoles(){
    db.query(`SELECT r.id AS 'Role ID', r.title AS 'Job Title', d.dep_name AS 'Department', r.salary AS 'Salary'
    FROM role_list r
    JOIN dep_list d ON r.dep_list_id = d.id;`, 
    (err, res) => {
        err ? console.log(err) : console.table(`\n`, res),
        init();
    })
};

// query to add a new department
function addDept(){

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
            (err, __res) => {
                err ? console.log(err) : console.table(`Added ${newDep} to database!`),
                init();
            }
        );
    });
};

// query to add new role
function addRole(){
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
                    (err, __res) => {
                        err ? console.log(err) : console.table(`Added ${roleName} to the database`),
                        init();
                    }
                );
            }
        );
    });
};

// query to add new employee
function addEmp (){
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
                const managerId = response.managerId === 'No Manager' ? null : response.managerId;
                db.query(
                    `INSERT INTO employee_list (first_name, last_name, role_list_id, manager_id)
                    VALUES (?, ?, ?, ?)`,
                    [empFirst, empLast, roleId, managerId],
                        (err, __res) => {
                            err ? console.log(err) : console.table(`Added ${empFirst} ${empLast} to the database`),
                            init();
                        }
                    );
                }
            );
        });
    });
};

// query to get role choices
function getRoleChoices(choices){
    db.query('SELECT * FROM role_list', (err, res) => {
        if (err) {
            console.log(err);
            choices(err, null);
        } else {
            const roleChoices = res.map((role) => ({
                value: role.id,
                name: role.title
            }));
            choices(null, roleChoices);
        }
    });
};

// query to update employee

function updateEmp(){
    inquirer.prompt([
        {
            type: 'input',
            name: 'fullName',
            message: "Enter the employee's name:",
        }
    ]).then((nameResponse) => {
        const { fullName } = nameResponse;
        const [firstName, lastName] = fullName.split(' ');

        getRoleChoices((err, roleChoices) => {
            if (err) {
                console.log(err);
                init();
            } else {
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'roleId',
                        message: 'Which role do you want to assign the selected employee?',
                        choices: roleChoices
                    }
                ]).then((roleResponse) => {
                    const { roleId } = roleResponse;

                    db.query(
                        `UPDATE employee_list
                        SET role_list_id = ?
                        WHERE first_name = ? AND last_name = ?`,
                        [roleId, firstName, lastName],
                        (err, __res) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(`Updated ${fullName}'s role`);
                            }
                            init();
                        }
                    );
                });
            }
        });
    });
};


// function to quit and exit app
function quit() {
    console.log('Thank you for using the Employee Tracker App!');
    process.exit();
};

// initiate app
init();