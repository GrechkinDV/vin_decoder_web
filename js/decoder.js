let vin_decoder = document.getElementById("vin_decoder");
let vin_input = vin_decoder.children[0];
let vin_info = document.getElementById("vin_info");
let printPdf = document.createElement("button");
printPdf.id = "exportPdf"
printPdf.onclick = printDiv;
printPdf.innerHTML = "Export PDF";

function html2Element(html) {
    let el = document.createElement("div")
    el.innerHTML = html
    return el
}

function parseDecodeResults(data, id) {
    return data['Results'][id]['Value'] || undefined;
}

function printDiv() {
    let exportPdf = window.open('', '');
    exportPdf.document.write(`
    <html>
    <head>
        <title>${vin_input.value}</title>
        <style>
        @media print {
            header {
            background-color: #eff1f2!important;
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact;
            }
            @page {
                margin: 0
            }
        }

        * {
            font-family: Verdana;
            margin: 0;
        }

        header {
            background-color: #eff1f2!important;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10 30px;
            box-sizing: border-box;
            margin-bottom: 40px;
        }

        #exportPdf {
            display: none;
        }

        #vin_info div {
            color: #5f6062;
            margin: 0 40px;
            box-sizing: border-box;
            font-family: Verdana;
            margin-bottom: 7px;
            font-size: 21px;
        }

        #vin_info div:first-child {
            display: none;
        }

        #created_by {
            margin: 30px 40px;
        }

        a {
            color: #0088c4;
        }
        </style>
    </head>
    <body>
        <header>
        <img src="img/logo.jpg" />
        <h1>VIN DECODER</h1>
        </header>
        <div id="vin_info">
        ${vin_info.innerHTML}
        </div>

        <div id="created_by">
        Document created by <a href="https://vintelligent.com/">Vintelligent</a>
        </div>
        </body>
    </html>
    `);
    exportPdf.document.close();
    exportPdf.print();
}

function transliterate(x) {
    return "0123456789.ABCDEFGH..JKLMN.P.R..STUVWXYZ".indexOf(x) % 10;
};

function validateVin(x) {
    const map = '0123456789X';
    const weights = '8765432X098765432';

    var sum = 0;

    for (var i = 0; i < 17; ++i) {
        sum += transliterate(x.charAt(i)) * map.indexOf(weights.charAt(i));
    }

    if(x.charAt(8) == map.charAt(sum % 11)) {
        return true
    } else {
        return false
    }
}

function displayDecodeError(htmlStatus) {
    vin_info.innerHTML = '';
    decodeStatusEl = html2Element(htmlStatus)
    vin_info.appendChild(decodeStatusEl);
}

vin_decoder.addEventListener("submit", (evt) => {
    evt.preventDefault();

    try {
        fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin_input.value.toUpperCase()}?format=json`)
        .then((response) => response.json())
        .then((data) => {
            vin_info.innerHTML = '';
            console.log(data['Results'][1], parseDecodeResults(data, 1))
            let model = parseDecodeResults(data, 9);
            let year = parseDecodeResults(data, 10);
            let make = parseDecodeResults(data, 7);
            console.log(model, year, make);
            if (!model && !year && !make)  { // Check if error code is false
                displayDecodeError('<b>VIN can\'t be decoded.</b>');
            } 
            else if (!validateVin(vin_input.value)) {
                displayDecodeError('<b>VIN isn\'t valid.</b>');
            }
            else {
                decodeStatusEl = html2Element('<b>VIN decoded successfully</b>')
                decodeStatusEl.appendChild(printPdf);
                
                vinEl = html2Element(`<b>VIN:</b> ${vin_input.value.toUpperCase()}`)
                modelEl = html2Element(`<b>Model:</b> ${model || "Can't decode"}`)
                yearEl = html2Element(`<b>Model Year:</b> ${year || "Can't decode"}`)
                makeEl = html2Element(`<b>Make:</b> ${make || "Can't decode"}`)

                vin_info.appendChild(decodeStatusEl);
                vin_info.appendChild(vinEl);
                vin_info.appendChild(modelEl);
                vin_info.appendChild(yearEl);
                vin_info.appendChild(makeEl);
            }
        });
    } catch (e) {
        displayDecodeError('<b>VIN can\'t be decoded.</b>');
    }
})
