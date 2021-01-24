//Export express
const express = require('express');
const { check, body } = require('express-validator/check');

//Get the Employee
const Employee = require('../models/employee');

//Instantiate to use the functionalities
const router = express.Router();

//Get the controllers
const appControllers = require("../controllers/appControllers");

//Impor the Validator
const auth = require('../middleware/is-auth');

/***********************************************
 * LOGIN | GET or POST
 ***********************************************/
/********** ROUTE GET -> LOGIN ********************/
router.get('/', appControllers.getLogin);

/********** POST GET -> LOGIN ********************/
router.post('/login', [
        //Input Validation using the express-validator package
        body('email')
        .isEmail()
        .withMessage('Please enter a valid email address!'),
        body('password', 'Invalid Password!')
        .isLength({ min: 4 })
        .trim()
    ],
    appControllers.postLogin);

/***********************************************
 * EMPLOYEE NOTES | GET or POST
 ***********************************************/
router.get('/employeenotes', auth, appControllers.getEmployeeNotes);

router.post('/employeenotes-searchemployee', auth, appControllers.employeeNotesSearchEmployee);

router.post('/employeenotes-deletenote', auth, appControllers.postDeleteNote)

router.get('/getupdatednotes', auth, appControllers.getUpDatedNotes)

/***********************************************
 * ADD NOTES | GET or POST
 ***********************************************/
router.get('/addnotes', auth, appControllers.getAddNotes);

router.post('/addnote-searchemployee', auth, appControllers.addNoteSearchEmployee);

router.post('/addnote-submitnote', auth, appControllers.submitNote);

/***********************************************
 * MY NOTES | GET or POST
 ***********************************************/
router.get('/mynotes', auth, appControllers.getMyNotes)

/************************************************
 * MANAGE EMPLOYEE ROUTES 
 ************************************************/
//GET the page Manage Employee
router.get('/manageemployee', auth, appControllers.getManageEmployee);

//SUBMITION of an Employee to save in the data base
router.post('/addemployee', auth, [
        //Using express validator to check inputs
        //check name
        check('name')
        .isLength({ min: 1 })
        .withMessage('Name Required!')
        .trim()
        .custom((value, { req }) => {
            return Employee.findOne({ name: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject(
                        'Employee already registred. Please enter a different one!'
                    );
                }
            });

        }),
        //check the email
        check('email')
        .isEmail()
        .trim()
        .withMessage('Invalid email.')
        .custom((value, { req }) => {
            return Employee.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject(
                        'Employee email already registred. Please enter a different one!'
                    );
                }
            });

        }),
        //check the password
        body(
            'password',
            'Please enter at least 4 characters password containing only letters and numbers.'
        )
        .isLength({ min: 4 })
        .trim()
    ],
    appControllers.postAddEmployee
);

//POST for search
router.post('/managemployee-searchEmployee', auth, appControllers.ManageEmployeeSearchEmployee);

//POST for deleting employee
router.post('/managemployee-deleteemployee', auth, appControllers.manageEmployeeDeleteEmployee);

router.post("/editemployee", auth, appControllers.editEmployee)

/***********************************************
 * MY INFOR | GET or POST
 ***********************************************/
router.get('/myinfo', auth, appControllers.getMyInfo);

router.post('/info-change-password', auth, [
    //check the password
    body(
        'confirmPassword',
        'Please enter at least 4 characters password containing only letters and numbers.'
    )
    .isLength({ min: 4 })
    .trim()
], appControllers.infoChangePassword)

/***********************************************
 * LOGOUT
 ***********************************************/
router.get('/logout', auth, appControllers.getLogout);

/************************
 * Export Routes
 ************************/
module.exports = router;