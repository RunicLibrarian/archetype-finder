let dataJson = [];
let dataHeaders = [];
let checkboxValues = {};

async function csvJSON() {
    let csvText = "";

    await fetch("data.csv")
        .then(response => response.text())
        .then(data => {
            csvText = data;

        });

    let lines = [];
    const linesArray = csvText.split('\n');

    // for trimming and deleting extra space 
    linesArray.forEach((e) => {
        const row = e.replace(/[\s]+[,]+|[,]+[\s]+/g, ',').trim();
        lines.push(row);
    });

    const result = [];
    const headers = lines[0].split(",");
    dataHeaders = headers;

    for (let i = 1; i < lines.length; i++) {

        const obj = {};
        const currentline = lines[i].split(",");

        for (let j = 0; j < headers.length; j++) {
            let value = currentline[j];
            // check for undefined
            if (!value) {
                value = false;
            }
            // check for true/false
            else if (value.toLowerCase() === "true") {
                value = true;
            } else if (value.toLowerCase() === "false") {
                value = false;
            }
            obj[headers[j]] = value;
        }
        result.push(obj);
    }
    return result;
}

function updateDataHTML(data) {
    const mainElem = document.querySelector('#main');
    mainElem.innerText = "";
    data.forEach((item) => {
        const newDiv = document.createElement('div');
        newDiv.innerText = item.archetypeName;
        mainElem.appendChild(newDiv);
    })
}

function updateCheckboxValues(field, value) {
    checkboxValues[field] = value;
    updateFilteredData();
}

function updateFilteredData() {
    let newDataJson = dataJson.filter((obj) => {
        let shouldReturn = false
        Object.keys(obj).forEach((key) => {
            if (checkboxValues[key] === true && obj[key] === checkboxValues[key]) {
                console.log(`${key} matches checkboxValues: ${obj[key]}=${checkboxValues[key]}`);
                shouldReturn = true;
            }
        })
        if (shouldReturn) {
            return obj;
        }
    });
    updateDataHTML(newDataJson);
}

async function initData() {
    dataJson = await csvJSON();

    const skillCheckboxes = document.querySelector('#skillCheckboxes');
    // Loop to create skill checkboxes
    const skillHeaders = dataHeaders.splice(1);
    for (let i = 0; i <= skillHeaders.length - 1; i++) {
        // Create the checkbox element
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = skillHeaders[i];
        checkbox.checked = true;
        checkbox.addEventListener('change', (event) => {
            updateCheckboxValues(skillHeaders[i], event.target.checked);
        })
        // Create a label for accessibility
        const label = document.createElement('label');
        label.htmlFor = skillHeaders[i];
        label.appendChild(document.createTextNode(skillHeaders[i]));
        // Append to the container
        skillCheckboxes.appendChild(checkbox);
        skillCheckboxes.appendChild(label);
        skillCheckboxes.appendChild(document.createElement('br')); // New line

        checkboxValues[skillHeaders[i]] = true;
    }

    updateFilteredData();
}

initData();
