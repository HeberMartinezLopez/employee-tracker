-- Active: 1693010750266@@127.0.0.1@3306@empTracker_db
DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE dep_list (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dep_name VARCHAR (30) NOT NULL
);

CREATE TABLE role_list (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL UNSIGNED NOT NULL,
    dep_list_id INT UNSIGNED NOT NULL,
    CONSTRAINT fk_dep FOREIGN KEY (dep_list_id) REFERENCES dep_list(id) ON DELETE CASCADE
);

CREATE TABLE employee_list (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR (30) NOT NULL,
    last_name VARCHAR (30) NOT NULL,
    role_list_id INT UNSIGNED NOT NULL,
    CONSTRAINT fk_role FOREIGN KEY (role_list_id) REFERENCES role_list(id) ON DELETE CASCADE,
    manager_id INT UNSIGNED,
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee_list(id) ON DELETE SET NULL
)