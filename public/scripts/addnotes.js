$(function() {

    //On selected employee -> get the form readdy for submition
    $(".employee-basic-info").click(function() {

        //Get the Info of the Employee
        var name = $(this).find('span.employee').text();
        var position = $(this).find('span.position').text();

        //Check if a name has been passed before haddling the form
        if (name.length < 2) {
            return;
        }

        //Hide the Pan image giph
        $(".in-ritght-side-content-pencil").css("display", "none")

        //Make the form visible
        var form = $(".add-note-form");
        form.css("display", "block")

        //Set the content of the form
        $("#selectedEmployeeName").html(name);
        $("#selectedEmployeePosition").html(position);

        //The clicked div get a background color marked
        $(".employee-basic-info").css("background-color", "#F6F6F8");
        $(".employee-basic-info").css("color", "");
        $(this).css("background-color", "#ffffff");
        $(this).css("color", "#0080F6");

        //Set the hidden value for employeeName
        $("#employeeName").val(name);
    });

    //Get the text area
    $("#note").change(function() {
        //get the time of the change
        var d = new Date();
        var date = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " +
            (d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());

        //Get the text od description
        var description = $("#note").val();

        //Set the hidden Input
        $("#date").val(date);
        $("#noteDescription").val(description);
    });
})