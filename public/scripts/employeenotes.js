//Hold the list that will be used in both parts
var notes;

$(function() {

    //On selected employee -> get all the notes associated with that employee
    $(".employee-basic-info").click(function() {

        //Get the Info of the Employee
        var name = $(this).find('span.employee').text();
        var position = $(this).find('span.position').text();

        //Check if a name has been passed before displaying anything
        if (name.length < 2) {
            return;
        }

        //Hide the list image giph
        $(".in-ritght-side-content-list").css("display", "none")

        //Make the list visible
        var form = $(".employee-note-list");
        form.css("display", "block")

        //Set the content of the of the top with the employee info
        $("#selectedEmployeeName").html(name);
        $("#selectedEmployeePosition").html(position);

        //The clicked div get a background color marked
        $(".employee-basic-info").css("background-color", "#F6F6F8");
        $(".employee-basic-info").css("color", "");
        $(this).css("background-color", "#ffffff");
        $(this).css("color", "#0080F6");

        //Set the hidden value for employeeName
        $("#employeeName").val(name);

        //The Get the Json Notes From the Data Base
        var stringObjectNotes = $('#noteJsonList').text();
        notes = jQuery.parseJSON(stringObjectNotes);


        //Clean all the the Elements with notes on the div!
        $(".note-information").remove();

        //This variable keep track of the amount of notes
        var positive = 0;
        var negative = 0;

        //Display only the notes belong to that employee
        notes.forEach(note => {
            if (name == note.employeeName) {
                $(".noteList").append(
                    "<div class='note-information'>" +
                    "<input id='id' type='hidden' name='id' value='" + note._id + "'>" +
                    "<div class='note-information-first'>" +
                    "<div class='note-information-first-left'>" +
                    "<h4>Date: " + note.date + "</h4>" +
                    "<h4>" + note.type + "</h4>" +
                    "</div>" +
                    "<div class='note-information-first-right'>" +
                    "<h4>Lead: " + note.lead + "</h4>" +
                    "<h4>Other Lead Involved: " + note.otherLead + "</h4>" +
                    "</div>" +
                    "</div>" +
                    "<h4>Note on: " + note.issue + "</h4></br>" +
                    "<div class='issue-delete'>" +
                    "<h4>Note:</h4>" + "<h4 onclick=" + "removeNote(event)" + "><span id='test' class='glyphicon glyphicon-trash'></span></h4>" +
                    "</div><div class='note-description'>" +
                    note.description +
                    "</div>" +
                    "</div>"
                );
                //count the notes
                if (note.type == 'Happy') {
                    positive++;
                } else {
                    negative++;
                }
            }
        });

        //Display on the DOM the Number of Positive
        $('.postiveIcon').html('<span class="glyphicon glyphicon-thumbs-up"' +
            'style="color: #0F5E9C;"></span>' + " " + positive);

        //Display on the DOM the number of Negative Notes 
        $('.negativeIcon').html('<span class="glyphicon glyphicon-thumbs-down"' +
            'style="color: #FF0000;"></span>' + " " + negative);
    });


});

//Confirm if the Manager want to delete 
//the notes with a button APi from sweetAlert
function removeNote(event) {

    swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this note!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                swal("This note has been deleted!", {
                    icon: "success",
                });
                //Call the function to delete and pass the event
                deleteNote(event)
            } else {
                swal("Canceled Successfully!");
                return;
            }
        });
}

/*This Function Will be Renposible for removing the note out of the DOM
 * Manage the post request to remove from the data base and also play some 
 * nice Animation
 */
function deleteNote(event) {

    /*************** Set the Animation in Motion ******/
    //Get the path where the event is coming from
    var received = event.path[3];
    var nextOne = received.nextSibling;

    //Get the note id and token will be used bellow to send to the data base
    var noteId = received.firstChild.value;
    var token = document.getElementById("token").value;

    //Remove the Style added before if there where any
    received.classList.remove("animate__animated");
    received.classList.remove("animate__slideInUp")

    //Add Some Animation to slid out
    received.classList.add("animate__animated");
    received.classList.add("animate__backOutRight");


    //Some check for what node I am in
    var checker = document.querySelectorAll('.note-information')


    //Set a time before removing so the animation plays and the next one is added
    setTimeout(function() {
        received.remove();
        //Check if there is no more to add to the next - In this case if this is the lest node
        if (checker.length > 1 && nextOne != null) {
            nextOne.classList.add("animate__animated");
            nextOne.classList.add("animate__slideInUp");
        }
    }, 1000);

    /********** Send to update the Data base ****/
    //Using AJAX to send it
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/employeenotes-deletenote', true)
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        noteId: noteId,
        _csrf: token
    }))

    /************** Update the Note count on the top****************/

    //Set one second before gettting the info so we make sure the top  one has got to the database
    setTimeout(function() {
        //Make sure to load the updated Json with the notes into the page
        var xhr1 = new XMLHttpRequest();
        xhr1.onreadystatechange = function(e) {
            if (xhr1.readyState == 4 && xhr1.status == 200) {
                //Update the document so it can be used
                document.getElementById("noteJsonList").innerText = this.response;
                notes = JSON.parse(this.response);

                //This variable keep track of the amount of notes
                var positive = 0;
                var negative = 0;

                //Loop through it to update the count
                notes.forEach(note => {
                    if (document.getElementById("selectedEmployeeName").innerText == note.employeeName) {
                        //count the notes
                        if (note.type == 'Happy') {
                            positive++;
                        } else {
                            negative++;
                        }
                    }
                });

                //Update the DOM on the top counting notes
                document.getElementById('postiveIcon').innerHTML = '<span class="glyphicon glyphicon-thumbs-up"' +
                    'style="color: #0F5E9C;"></span>' + " " + positive;
                document.getElementById('negativeIcon').innerHTML = '<span class="glyphicon glyphicon-thumbs-down"' +
                    'style="color: #FF0000;"></span>' + " " + negative;
            }
        }

        xhr1.open("GET", "/getupdatednotes", true);
        xhr1.send();
    }, 2000);
}