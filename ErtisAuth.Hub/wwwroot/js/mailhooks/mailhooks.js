"use strict";

function initCreateMailHookStepper() {
    let createMailHookForm = $("#CreateMailHookForm");
    let nextButton = $('button.stepper-next');
    let previousButton = $('button.stepper-previous');
    let submitButton = $('button[type="submit"].stepper-finish');

    function validateForm(currentStepperContainer) {
        let validator = createMailHookForm.validate();
        let validatedElements = $(currentStepperContainer).find('[data-val-required]');
        let isValid = true;
        validatedElements.each(function() {
            isValid &= validator.element($(this));
        });

        return isValid;
    }

    function onStepForwardChanging() {
        let currentStepperContainer = $('div[data-kt-stepper-element="content"].current');
        return validateForm(currentStepperContainer);
    }

    function onStepBackwardChanging() {

    }

    function onStepChanged() {
        let stepperItem = $('div[data-kt-stepper-element="nav"].stepper-item.current');
        if (stepperItem.is('.stepper-item:first-child')) {
            previousButton.hide();
        }
        else {
            previousButton.show();
        }

        if (stepperItem.is('.stepper-item:last-child')) {
            nextButton.hide();
            submitButton.show();
            updateSummaryPanel();
        }
        else {
            nextButton.show();
            submitButton.hide();
        }

        if (stepperItem.is('.stepper-item:nth-child(2)')) {
            initMonacoEditor('mailHookRequestBodyEditor', 'html', '../../', '', function(code) {
                $('#mailTemplatePreviewFrame').contents().find('html').html(code);
                let mailTemplateHtmlInput = document.getElementById('mail_template_html_input');
                mailTemplateHtmlInput.value = code;
            });
        }
    }

    function nextStep() {
        let isValid = onStepForwardChanging();
        if (!isValid) {
            return;
        }

        let stepperItem = $('div[data-kt-stepper-element="nav"].stepper-item.current');
        stepperItem.removeClass('current');
        let nextStepperItem = stepperItem.next('div[data-kt-stepper-element="nav"].stepper-item')
        nextStepperItem.addClass('current');

        let stepperContentDiv = $('div[data-kt-stepper-element="content"].current');
        stepperContentDiv.removeClass('current');
        let nextStepperContentDiv = stepperContentDiv.next('div[data-kt-stepper-element="content"]')
        nextStepperContentDiv.addClass('current');
    }

    function previousStep() {
        onStepBackwardChanging();

        let stepperItem = $('div[data-kt-stepper-element="nav"].stepper-item.current');
        stepperItem.removeClass('current');
        let prevStepperItem = stepperItem.prev('div[data-kt-stepper-element="nav"].stepper-item')
        prevStepperItem.addClass('current');

        let stepperContentDiv = $('div[data-kt-stepper-element="content"].current');
        stepperContentDiv.removeClass('current');
        let prevStepperContentDiv = stepperContentDiv.prev('div[data-kt-stepper-element="content"]')
        prevStepperContentDiv.addClass('current');
    }

    function updateSummaryPanel() {
        $('#createMailHookSummary_Name').text($('#createMailHookForm_NameInput').val());
        $('#createMailHookSummary_Description').text($('#createMailHookForm_DescriptionInput').val());
        $('#createMailHookSummary_EventType').text($('#eventTypesDropdown').find(":selected").text());
        $('#createMailHookSummary_IsActive').text($('#isActiveCheckBox').is(":checked"));
        $('#createMailHookSummary_SenderName').text($('#createMailHookForm_SenderNameInput').val());
        $('#createMailHookSummary_SenderAddress').text($('#createMailHookForm_SenderAddressInput').val());
        $('#createMailHookSummary_MailSubject').text($('#createMailHookForm_MailSubjectInput').val());
    }

    nextButton.on('click', function () {
        nextStep();
        onStepChanged();
    });

    previousButton.on('click', function () {
        previousStep();
        onStepChanged();
    });

    onStepChanged();
}

KTUtil.onDOMContentLoaded((function() {
    initCreateMailHookStepper();
    
    $('.mail-template-radio-button').each(function() {
        $(this).on('change', function() {
            if (this.checked) {
                let htmlTemplateEditor = monacoEditorInstances['mailHookRequestBodyEditor'];
                if (htmlTemplateEditor) {
                    let selectedTemplateName = $(this).attr('value');
                    
                    $.ajax({
                        url: '/mail-templates/' + selectedTemplateName + '.html',
                        method: "GET"
                    }).done(function (result) {
                        htmlTemplateEditor.getModel().setValue(result);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        htmlTemplateEditor.getModel().setValue(errorThrown);
                    });
                }
            }
        })
    });
    
    $('#testConnectionButton').click(function() {
        let testConnectionButton = $(this);
        testConnectionButton.attr("data-kt-indicator", "on");
        testConnectionButton.attr("disabled", "disabled");

        let host = $('#smtpServerSettingsHostInput').val();
        let port = parseInt($('#smtpServerSettingsPortInput').val());
        let tlsEnabled = $('#smtpServerSettingsTlsEnabledInput').is(":checked");
        let username = $('#smtpServerSettingsUsernameInput').val();
        let password = $('#smtpServerSettingsPasswordInput').val();
        
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                "host": host,
                "port": port,
                "tls_enabled": tlsEnabled,
                "username": username,
                "password": password
            }),
            success: function (data) {
                Swal.fire({
                    title: 'Connection Test Success',
                    text: 'Successfully connected to smtp server',
                    icon: "success",
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Ok'
                });

                testConnectionButton.removeAttr("data-kt-indicator");
                testConnectionButton.removeAttr("disabled");
            },
            error: function (param1, param2, param3) {
                Swal.fire({
                    title: 'Connection Test Failed',
                    text: param1.responseText,
                    icon: "error",
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Ok'
                });

                testConnectionButton.removeAttr("data-kt-indicator");
                testConnectionButton.removeAttr("disabled");
            },
            processData: false,
            type: 'POST',
            url: '/api/memberships/smtp-server/test-connection'
        });
    })
}));