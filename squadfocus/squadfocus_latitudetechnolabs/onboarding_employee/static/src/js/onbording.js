odoo.define("onboarding_employee.tmp_employee_form", function(require){
    "use strict";

    var publicWidget = require('web.public.widget');
    var core = require('web.core');
    var QWeb = core.qweb;

    publicWidget.registry.tmp_employee_form = publicWidget.Widget.extend({
        selector: '.pf_account_div',
        events: {
            'click #pf_account': '_onClick',
        },
        _onClick: function (event) {
            var node = event.view.$('.uan');
            var check = document.getElementById("pf_account").checked
            console.log("check",check)
            if (check == true) {
                console.log(check)
                $('#uan').show();
                $('#uan_val').show();
            } else {
                $('#uan').hide();
                $('#uan_val').hide();
             }
        },
    });
    
});
function toggleEducationField() {
    var studyField = document.getElementById("study_field");
    var educationFieldContainer = document.getElementById("education_field_container");
    var otherEducationField = document.getElementById("other_education");

    if (studyField) {
        var selectedValue = studyField.value;
        if (selectedValue === "Graduate - Other" || selectedValue === "Post Graduate - Other") {
            educationFieldContainer.style.display = "block";
            if (otherEducationField) {
                otherEducationField.setAttribute("required", "true");
            }
        } else {
            educationFieldContainer.style.display = "none";
            if (otherEducationField) {
                otherEducationField.removeAttribute("required");
            }
        }
    }
}
$(document).ready( function() {
    $('#uan').hide();
    toggleEducationField();
    $('#uan_val').hide();
    var pf = document.getElementById("pf_account")
    
    if (pf){
        pf.checked = false
    }
});