//Dependecy needed
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');
const nodemailer = require('nodemailer');

//Get the Schema Models for data
const Employee = require('../models/employee')
const Note = require('../models/note');

//Import Private values
const PrivInfo = require('../config/private');

//Set up the transporter for the e-mail
const transporter = nodemailer.createTransport({
    service: PrivInfo.provider,
    auth: {
        user: PrivInfo.email,
        pass: PrivInfo.pass
    }
});


/***********************************************
 * LOGIN | GET or POST
 ***********************************************/

/********** GET -> LOGIN ********************/
exports.getLogin = (req, res, next) => {
    //Check if there is nothing on the array message of errors
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    //Render the page
    res.render('pages/login', {
        title: "Sloop - Login",
        oldInput: {
            name: '',
            email: '',
            password: '',
        },
        validationErrors: [],
        errorMessage: message,
    });
}

/********** POST -> LOGIN ********************/
exports.postLogin = (req, res, next) => {
    //Employee info
    const email = req.body.email;
    const password = req.body.password;

    //Check for errrors passed if error are 
    //passed the page is rended back with the erros
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('pages/login', {
            title: "Sloop - Login",
            oldInput: {
                email: email,
                password: password,
            },
            validationErrors: errors.array(),
            errorMessage: errors.array()[0].msg,
        });
    }

    //Check for the employee in the data base
    Employee.findOne({ email: email })
        .then(employee => {
            //If an employee is not found the page is handled back with errors
            if (!employee) {
                return res.status(422).render('pages/login', {
                    title: "Sloop - Login",
                    oldInput: {
                        email: email,
                        password: password,
                    },
                    errorMessage: 'Email Not Found!',
                    validationErrors: []
                });
            }

            //Check the encryption on the password matches
            bcrypt
                .compare(password, employee.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.employee = employee;

                        //Check for what type of emplyee is loging in so the right acesss is given
                        if (employee.position == 'Manager') {
                            return req.session.save(err => {
                                console.log(err);
                                res.redirect('/employeenotes');
                            });
                        } else if (employee.position == 'Admin') {
                            return req.session.save(err => {
                                console.log(err);
                                res.redirect('/addnotes');
                            });
                        } else if (employee.position == 'Lead') {
                            return req.session.save(err => {
                                console.log(err);
                                res.redirect('/addnotes');
                            });
                        } else if (employee.position == 'CA') {
                            return req.session.save(err => {
                                console.log(err);
                                res.redirect('/myinfo');
                            });
                        }
                    }
                    return res.status(422).render('pages/login', {
                            title: "Sloop - Login",
                            oldInput: {
                                email: email,
                                password: password,
                            },
                            errorMessage: 'Invalid Password!',
                            validationErrors: []
                        })
                        .catch(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

/***********************************************
 * EMPLOYEE NOTES | GET or POST
 ***********************************************/

/************GET -> Employee Notes *************/
exports.getEmployeeNotes = (req, res, next) => {

    //Check for proper access
    if (req.session.employee.position != "Manager") {
        return res.redirect('/');
    }

    //Find the Employees in the DataBase
    Employee.find().sort([
            ['name', 'ascending']
        ])
        .then(employees => {
            Note.find().sort([
                    ['date', 'descending']
                ])
                .then(notes => {

                    //Transform then into JSON
                    const notesList = JSON.stringify(notes);

                    return res.render('pages/employeenotes', {
                        title: "Sloop - Employee Notes",
                        position: req.session.employee.position,
                        user: req.session.employee.name,
                        employeeList: employees,
                        notesList: notesList,
                        searched: "",
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
}

/**************POST -> Search Employe **************/
exports.employeeNotesSearchEmployee = (req, res, next) => {

    //Get the employee searched
    const name = req.body.searched;

    //Get the data from the data base
    Employee.find().sort([
            ['name', 'ascending']
        ])
        .then(employees => {
            //Store the employee Searched
            var searchedEmployee = [];
            var tempName;

            //Search Logic
            employees.forEach(employeeFound => {
                tempName = employeeFound.name;

                if (tempName.toLowerCase().includes(name.toLowerCase())) {
                    searchedEmployee.push(employeeFound)
                }
            });

            Note.find().sort([
                    ['date', 'descending']
                ])
                .then(notes => {

                    //Transform then into JSON
                    const notesList = JSON.stringify(notes);

                    return res.render('pages/employeenotes', {
                        title: "Sloop - Employee Notes",
                        position: req.session.employee.position,
                        user: req.session.employee.name,
                        employeeList: searchedEmployee,
                        notesList: notesList,
                        searched: name,
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
}

/**************POST -> Delete a note **************/
exports.postDeleteNote = (req, res, next) => {

    //get the note Id sent
    const noteId = req.body.noteId;

    //Delete the Item in the Database
    Note.findByIdAndDelete(noteId)
        .catch(err => {
            console.log(err);
        });
}

/**************GET -> Update Notes Served */
exports.getUpDatedNotes = (req, res, next) => {

    //Check if is the manager requesting the notes

    //Check for proper access
    if (req.session.employee.position != "Manager") {
        return res.redirect('/');
    }

    //Get the notes from the data base and sort them
    Note.find().sort([
            ['date', 'descending']
        ])
        .then(notes => {
            //Transform then into JSON
            const notesList = JSON.stringify(notes);
            //Render a small component with updated Notes
            return res.render('pages/smallcomponents/notes', {
                notesList: notesList,
            });
        })
        .catch(err => {
            console.log(err);
        });
}

/***********************************************
 * ADD NOTES | GET or POST
 ***********************************************/

/***********GET -> Add Notes********************/
exports.getAddNotes = (req, res, next) => {

    //Check for proper access
    if (req.session.employee.position == "Manager" || req.session.employee.position == "Lead" ||
        req.session.employee.position == "Admin") {
        Employee.find().sort([
                ['name', 'ascending']
            ])
            .then(employees => {
                return res.render('pages/addnotes', {
                    title: "Sloop - Add Notes",
                    position: req.session.employee.position,
                    user: req.session.employee.name,
                    employeeList: employees,
                    searched: "",
                    noteAddedMessage: ""
                });
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.redirect('/');
    }
}

/*********** POST -> Search Employee ***************/
exports.addNoteSearchEmployee = (req, res, next) => {

    //Get the employee searched
    const name = req.body.searched;

    //Get the data from the data base
    Employee.find().sort([
            ['name', 'ascending']
        ])
        .then(employees => {
            //Store the employee Searched
            var searchedEmployee = [];
            var tempName;

            //Search Logic
            employees.forEach(employeeFound => {
                tempName = employeeFound.name;

                if (tempName.toLowerCase().includes(name.toLowerCase())) {
                    searchedEmployee.push(employeeFound)
                }
            });
            return res.render('pages/addnotes', {
                title: "Sloop - Add Notes",
                position: req.session.employee.position,
                user: req.session.employee.name,
                employeeList: searchedEmployee,
                searched: name,
                noteAddedMessage: ""
            });
        })
        .catch(err => {
            console.log(err);
        });
}

/*****************Submit Note*******************/
exports.submitNote = (req, res, next) => {

    //Get the info
    const employeeName = req.body.employeeName;
    const lead = req.session.employee.name;
    const date = req.body.date;
    const otherLead = req.body.otherLead;
    const type = req.body.noteType;
    const issue = req.body.issue;
    const discussed = req.body.discussed;
    const description = req.body.noteDescription;

    //Save the note on the data base
    const note = new Note({
        employeeName: employeeName,
        lead: lead,
        date: date,
        otherLead: otherLead,
        type: type,
        issue: issue,
        discussed: discussed,
        description: description
    });
    note.save();

    //Find and send an email to each manager
    Employee.find({ position: "Manager" })
        .then(managers => {
            managers.forEach(manager => {
                var mailOptions = {
                    from: PrivInfo.email,
                    to: manager.email,
                    subject: lead + " Submitted a Note on " + employeeName + "!",
                    html: '<div style="text-align: center; padding-top: 75px; margin-bottom: 75px">' +
                        '<div style="display:inline-block; width: 500px; text-align: left; background-color: #F6F6F8; padding: 1.5em; border-radius: 8px; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);">' +
                        '<h1>This is what ' + lead + ' said about ' + employeeName + ':</h1>' +
                        '<p>Issue: ' + issue + '</p>' +
                        '<p>Description: ' + description + '</p>' +
                        '<a href="http://sloopnotes.herokuapp.com/employeenotes">' +
                        '<p>Go to Sloop App to get get more information!</p></a></div></div>'
                }
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                    }
                });
            });
        })
        .catch(err => {
            console.log(err)
        });

    //Render the page again with a sucess message
    Employee.find().sort([
            ['name', 'ascending']
        ])
        .then(employees => {
            return res.render('pages/addnotes', {
                title: "Sloop - Add Notes",
                position: req.session.employee.position,
                user: req.session.employee.name,
                employeeList: employees,
                searched: "",
                noteAddedMessage: "Note Submitted Successfully!"
            });
        })
        .catch(err => {
            console.log(err);
        });
}

/***********************************************
 * MY NOTES | GET or POST
 ***********************************************/
//GET -> My Notes
exports.getMyNotes = (req, res, next) => {

    //Check for proper access
    if (!(req.session.employee.position == "Manager" ||
            req.session.employee.position == "Lead" || req.session.employee.position == "Admin")) {
        return res.redirect('/');
    }

    //Get the user
    const user = req.session.employee.name;

    //Get the notes from the data base
    Note.find().sort([
            ['date', 'descending']
        ])
        .then(notes => {

            //Store this user notes
            var userNotes = [];

            //Find notes that matches this user
            notes.forEach(note => {
                if (note.lead == user) {
                    userNotes.push(note)
                }
            });

            //Render the page with the notes from this user
            return res.render('pages/mynotes', {
                title: "Sloop - My Notes",
                position: req.session.employee.position,
                user: user,
                notesList: userNotes
            });
        })
        .catch(err => {
            console.log(err);
        });
}

/****************************************
 * MANAGE EMPLOYEE ROUTER | GET & POST
 ****************************************/

/********GET -> Manage Employee Page**************/
exports.getManageEmployee = (req, res, next) => {

    //Check for proper access
    if (!(req.session.employee.position == "Manager" || req.session.employee.position == "Admin")) {
        return res.redirect('/');
    }

    //check the error array
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    //rend the manage employee pages
    Employee.find().sort([
            ['name', 'ascending']
        ])
        .then(employees => {
            //Render the page
            return res.render('pages/manageEmployee', {
                title: "Sloop - Manage Employee",
                position: req.session.employee.position,
                user: req.session.employee.name,
                oldInput: {
                    name: '',
                    email: '',
                    password: '',
                },
                validationErrors: [],
                errorMessage: message,
                searched: "",
                employeeList: employees,
            });
        })
        .catch(err => {
            console.log(err);
        });
}

/**************POST-> Add Employee************/
exports.postAddEmployee = (req, res, next) => {

    //Get the Employee Info
    const name = req.body.name;
    const email = req.body.email;
    const position = req.body.position;
    const password = req.body.password;

    //Get the error array
    const errors = validationResult(req);

    //Check for errors in the validation array
    //If there is any error retur the page
    if (!errors.isEmpty()) {

        Employee.find().sort([
                ['name', 'ascending']
            ])
            .then(employees => {
                console.log(errors.array());
                return res.status(422).render('pages/manageEmployee', {
                    title: "Sloop | Manage Employee",
                    position: req.session.employee.position,
                    user: req.session.employee.name,
                    oldInput: {
                        name: name,
                        email: email,
                        password: password,
                    },
                    validationErrors: errors.array(),
                    errorMessage: errors.array()[0].msg,
                    searched: "",
                    employeeList: employees,
                })
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        //bcrypt to incrypt the password
        bcrypt
            .hash(password, 12)
            .then(incyptedPassword => {
                const employee = new Employee({
                    name: name.trim(),
                    email: email.trim(),
                    position: position,
                    password: incyptedPassword
                });
                employee.save();

                setTimeout(() => {
                    //Render the page with a sucesfull Message
                    Employee.find().sort([
                            ['name', 'ascending']
                        ])
                        .then(employees => {
                            return res.render('pages/manageEmployee', {
                                title: "Sloop - Manage Employee",
                                position: req.session.employee.position,
                                user: req.session.employee.name,
                                oldInput: {
                                    name: '',
                                    email: '',
                                    password: '',
                                },
                                validationErrors: [],
                                errorMessage: "Employee Added Successfully!",
                                searched: "",
                                employeeList: employees,
                            })
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }, 1000);

            })
    }
}

/*********** POST -> Search Employee ***************/
exports.ManageEmployeeSearchEmployee = (req, res, next) => {

    //check the error array
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    //Get the employee searched
    const name = req.body.searched;

    //Get the data from the data base
    Employee.find().sort([
            ['name', 'ascending']
        ])
        .then(employees => {
            //Store the employee Searched
            var searchedEmployee = [];
            var tempName;

            //Search Logic
            employees.forEach(employeeFound => {
                tempName = employeeFound.name;

                if (tempName.toLowerCase().includes(name.toLowerCase())) {
                    searchedEmployee.push(employeeFound)
                }
            });

            return res.render('pages/manageEmployee', {
                title: "Sloop - Manage Employee",
                position: req.session.employee.position,
                user: req.session.employee.name,
                oldInput: {
                    name: '',
                    email: '',
                    password: '',
                },
                validationErrors: [],
                errorMessage: message,
                searched: name,
                employeeList: searchedEmployee,
            });
        })
        .catch(err => {
            console.log(err);
        });
}

/************POST -> Delete Employee ***********/
exports.manageEmployeeDeleteEmployee = (req, res, next) => {

    //Get the employee Id
    const id = req.body.id;

    //Delete in the data base
    Employee.findByIdAndDelete(id)
        .catch(err => {
            console.log(err);
        });
}

/************POST -> Edit Empoye ************/
exports.editEmployee = (req, res, next) => {

    //Get the info
    const name = req.body.name;
    const email = req.body.email;
    const position = req.body.position;
    const id = req.body.editId;

    //Find the Employee to Edit
    Employee.findById(id)
        .then(employee => {

            //Update the notes first
            //Get the notes from the data base
            Note.find()
                .then(notes => {
                    //Loop and update the notes
                    notes.forEach(note => {
                        //If the note macthed my employee I want to find and update the note
                        if (note.employeeName == employee.name) {
                            Note.findById(note._id)
                                .then(noteFound => {
                                    noteFound.employeeName = name;
                                    noteFound.save();
                                })
                        }
                    });

                    // update the employee info
                    employee.name = name;
                    employee.email = email;
                    employee.position = position;
                    employee.save();

                    //Handle the page back with a message 
                    setTimeout(() => {
                        //Render the page with a sucesfull Message
                        Employee.find().sort([
                                ['name', 'ascending']
                            ])
                            .then(employees => {
                                return res.render('pages/manageEmployee', {
                                    title: "Sloop - Manage Employee",
                                    position: req.session.employee.position,
                                    user: req.session.employee.name,
                                    oldInput: {
                                        name: '',
                                        email: '',
                                        password: '',
                                    },
                                    validationErrors: [],
                                    errorMessage: "Employee's Information Updated Successfully!",
                                    searched: "",
                                    employeeList: employees,
                                })
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    }, 1000);
                })
        })
}

/***********************************************
 * MY INFOR | GET or POST
 ***********************************************/
//GET -> My Infor
exports.getMyInfo = (req, res, next) => {

    //Check if there is nothing on the array message of errors
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('pages/myinfo', {
        title: "Sloop - My Info",
        position: req.session.employee.position,
        user: req.session.employee.name,
        email: req.session.employee.email,
        userId: req.session.employee._id,
        pageType: "",
        oldInput: {
            password: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationErrors: [],
        errorMessage: message,
    });
}

//POST -> Change Password
exports.infoChangePassword = (req, res, next) => {

    //get the info
    const password = req.body.currentPassword;
    const newPassword = req.body.confirmPassword;
    const id = req.body.id;

    //Check for errrors passed if error are 
    //passed the page is rended back with the erros
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('pages/myinfo', {
            title: "Sloop - My Info",
            position: req.session.employee.position,
            user: req.session.employee.name,
            email: req.session.employee.email,
            userId: req.session.employee._id,
            pageType: "error",
            oldInput: {
                password: password,
                newPassword: newPassword,
                confirmPassword: newPassword,
            },
            validationErrors: errors.array(),
            errorMessage: errors.array()[0].msg,
        });
    }

    //Find the employee
    Employee.findById(id.trim())
        .then(employee => {
            //Check the encryption on the password matches
            bcrypt
                .compare(password, employee.password)
                .then(doMatch => {
                    //If the password Macth Encript the new one
                    if (doMatch) {
                        bcrypt.hash(newPassword, 12)
                            .then(incyptedPassword => {
                                employee.password = incyptedPassword;
                                employee.save();
                            })

                        //Handle the page back
                        return res.render('pages/myinfo', {
                            title: "Sloop - My Info",
                            position: req.session.employee.position,
                            user: req.session.employee.name,
                            email: req.session.employee.email,
                            userId: req.session.employee._id,
                            pageType: "error",
                            oldInput: {
                                password: "",
                                newPassword: "",
                                confirmPassword: "",
                            },
                            validationErrors: errors.array(),
                            errorMessage: "Password Successfully Updated!",
                        });

                    } else {
                        //Handle the page back
                        return res.render('pages/myinfo', {
                            title: "Sloop - My Info",
                            position: req.session.employee.position,
                            user: req.session.employee.name,
                            email: req.session.employee.email,
                            userId: req.session.employee._id,
                            pageType: "error",
                            oldInput: {
                                password: password,
                                newPassword: newPassword,
                                confirmPassword: newPassword,
                            },
                            validationErrors: errors.array(),
                            errorMessage: "Incorrect Current Password! If you forgot your password please talk to your manager!",
                        });
                    }
                })
        })
}

/***********************************************
 * LOGOUT
 ***********************************************/
//GET -> My Infor
exports.getLogout = (req, res, next) => {
    //Detroy the Session
    req.session.destroy(err => {
        res.redirect('/');
    });
}