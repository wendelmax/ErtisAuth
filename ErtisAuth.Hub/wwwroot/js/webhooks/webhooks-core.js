"use strict";

const headersTable = document.getElementById('headersTable');

function initWebhookRequestBody(elementId) {
    let json = document.getElementById('request_body_json_input').value;
    initMonacoEditor(elementId, 'json', '../', json, function(code) {
        document.getElementById('request_body_json_input').value = code;
    });

    $('input[type="radio"][name="body_name"]').change(function() {
        let monacoEditorContainer = $('#webhookRequestBodyEditor');
        let monacoEditor = monacoEditorInstances[elementId];

        if (this.value === 'none') {
            monacoEditorContainer.hide();
        }
        else {
            monacoEditorContainer.show();
            monaco.editor.setModelLanguage(monacoEditor.getModel(), this.value);
        }
    });
}

function addHeader() {
    let row = headersTable.getElementsByTagName('tbody')[0].insertRow(headersTable.rows.length - 1);

    let cells = [];
    let keyCell = createCell(row.insertCell(0), "");
    let valueCell = createCell(row.insertCell(1), "");
    cells.push(keyCell);
    cells.push(valueCell);

    createRemoveButtonCell(row.insertCell(2));
    updateHeadersJson();

    cells[0].focus();
    selectCellText(cells[0]);
}

function createCell(cell, text) {
    let txt = document.createTextNode(text);
    cell.appendChild(txt);
    cell.setAttribute('contenteditable', 'true');
    return cell;
}

let deleteRow = function() {
    let row = $(this).closest('tr');
    row.remove();
    updateHeadersJson();
};

function updateHeadersJson() {
    let headers = $(headersTable).tableToJSON({ ignoreColumns: [2], ignoreHiddenRows: false });
    let jsonPayloadInput = document.getElementById('headers_json_input');
    jsonPayloadInput.value = JSON.stringify(headers);
}

function selectCellText(cell) {
    let range = new Range();
    range.setStart(cell, 0);
    range.setEnd(cell, cell.childNodes.length);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
}

function createRemoveButtonCell(cell) {
    let button = document.createElement('button');
    button.setAttribute('type', 'button');

    let classList = ['btn', 'btn-icon-xsm', 'btn-light-danger'];
    for (let index in classList) {
        button.classList.add(classList[index]);
    }

    button.addEventListener('click', deleteRow, false);
    button.innerHTML = '<i class="fas fa-times fs-6"></i>';

    cell.appendChild(button);
    return cell;
}

KTUtil.onDOMContentLoaded((function() {
    headersTable.addEventListener("input", function(e) {
        updateHeadersJson();
    }, false);
}));