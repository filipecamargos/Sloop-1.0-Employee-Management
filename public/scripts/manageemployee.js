$(function() {

    //Change the content of the page on the click of the Add Employee Button
    $(".add-employee-button").click(function() {

        //On Click hid this button with this div and display the form
        $("#employeeAdd").css("display", "none")

        //Make the form visible
        var form = $("#add-employee-form");
        form.css("display", "flex")

    });
});

//Warn the user about deleting this employee
function removeEmployee(event) {
    //Get the employee name
    var employeeName = event.path[4].childNodes[1].childNodes[1]
        .childNodes[3].innerText;

    //Custome message box!
    swal({
            title: "Are you sure you want to remove " + employeeName,
            text: "This employee will not long be part of your list of employees!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                swal(employeeName + " has been removed!", {
                    icon: "success",
                });
                //Call the function to delete and pass the event
                deleteEmployee(event)
            } else {
                swal("Canceled Successfully!");
                return;
            }
        });

}

//Changes the DOM and send to the data base to remove
function deleteEmployee(event) {

    //Get the received div where the employee is in the dom
    var received = event.path[4];

    //get the id of the employee and the token
    var employeeId = received.childNodes[1].childNodes[7].childNodes[3].childNodes[1].value;
    var token = received.childNodes[1].childNodes[7].childNodes[3].childNodes[3].value;

    //Send a post to request to update the data base
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/managemployee-deleteemployee', true)
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        id: employeeId,
        _csrf: token
    }))

    //remove employee from the DOM
    received.remove();
}

//Edit Employee Functionallity
function editEmployee(event) {

    //Set the layout of the DOM with the edit employee Form
    document.getElementById("employeeAdd").style.display = "none";
    document.getElementById("add-employee-form").style.display = "none";
    document.getElementById("edit-employee-form").style.display = "flex";

    //Get the values of the employee to be edited
    //Get the received div where the employee is in the dom
    var received = event.path[2];

    //get the id of the employee and the token
    var employeeID = received.childNodes[7].childNodes[3].childNodes[1].value;
    var employeeName = received.childNodes[1].outerText;
    var employeeEmail = received.childNodes[5].outerText;

    //Set the content of the form
    document.getElementById("editName").value = employeeName.trim();
    document.getElementById("editEmail").value = employeeEmail.trim();
    document.getElementById("editId").value = employeeID;
}