$(function() {
    //When the page is load make sure where it is coming from so it display correct the info
    var pageType = $("#servingFrom").val();

    //Check if is a error message type
    if (pageType == "error") {
        $(".passwordForm").css("display", "block");
        $("#mynotes-container").css("height", "100%");
    }


    //Display the change password form
    $("#editPasswordBtn").click(function() {
        $(".passwordForm").css("display", "block");
        $("#mynotes-container").css("height", "100%");
    });

    //Display the change password form
    $("#save").click(function(e) {

        e.preventDefault();

        //Get the values
        var id = $("#editId").val();
        var token = $("#token").val();
        var password = $("#currentPassword").val();
        var newPassword = $("#newPassword").val();
        var confirmPassword = $("#confirmPassword").val();

        //Set the error message if new and confir does not match
        var errorMessage = "";
        if (newPassword !== confirmPassword) {
            message = "New and Confirm password do not match!";
            $("#errorMessage").html(message);
            return;
        }

        if (newPassword.length < 4) {
            message = "Please enter at least 4 characters password containing only letters and numbers.";
            $("#errorMessage").html(message)
            return;
        }

        //Submit form
        $("#password-change-form").submit();
    });
})