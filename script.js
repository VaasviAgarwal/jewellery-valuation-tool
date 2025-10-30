const itemForm = document.getElementById("itemForm");
const itemsTableBody = document.querySelector("#itemsTable tbody");

const totalPiecesCell = document.getElementById("totalPieces");
const totalGrossCell = document.getElementById("totalGross");
const totalNetCell = document.getElementById("totalNet");
const totalValueCell = document.getElementById("totalValue");

const saveRatesBtn = document.getElementById("saveRates");
const loadRatesBtn = document.getElementById("loadRates");
const clearAllBtn = document.getElementById("clearAll");
const generateBtn = document.getElementById("generate");

let rates = {};
let items = [];
let ratesSaved = true; 

const caratMap = {
  22: "91.6% / 22k",
  20: "83.2% / 20k",
  18: "75% / 18k"
};

function toggleControls(disabled) {
    const allControls = [
      ...itemForm.querySelectorAll("input, select, button"),
      clearAllBtn,
      generateBtn
    ];
  
    allControls.forEach((el) => {
      if (el.id !== "saveRates" && el.id !== "loadRates") {
        el.disabled = disabled;
        el.classList.toggle("disabled", disabled);
      }
    });
  
    itemForm.style.opacity = disabled ? "0.6" : "1";
  }
  

window.addEventListener("DOMContentLoaded", () => {
  const stored = JSON.parse(localStorage.getItem("rates"));
  if (stored) {
    rates = stored;
    document.getElementById("rate24").value = rates[24] || "";
    document.getElementById("rate22").value = rates[22] || "";
    document.getElementById("rate20").value = rates[20] || "";
    document.getElementById("rate18").value = rates[18] || "";
  }
});

["rate24", "rate22", "rate20", "rate18"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    ratesSaved = false;
    toggleControls(true);
  });
});

saveRatesBtn.addEventListener("click", () => {
  rates = {
    24: parseFloat(document.getElementById("rate24").value) || 0,
    22: parseFloat(document.getElementById("rate22").value) || 0,
    20: parseFloat(document.getElementById("rate20").value) || 0,
    18: parseFloat(document.getElementById("rate18").value) || 0
  };
  localStorage.setItem("rates", JSON.stringify(rates));
  ratesSaved = true;
  toggleControls(false);
  alert("Rates saved for today.");
});

loadRatesBtn.addEventListener("click", () => {
  const stored = JSON.parse(localStorage.getItem("rates"));
  if (stored) {
    rates = stored;
    document.getElementById("rate24").value = rates[24] || "";
    document.getElementById("rate22").value = rates[22] || "";
    document.getElementById("rate20").value = rates[20] || "";
    document.getElementById("rate18").value = rates[18] || "";
    ratesSaved = true;
    toggleControls(false);
    alert("Rates loaded.");
  } else {
    alert("No saved rates found.");
  }
});

itemForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!ratesSaved) {
    alert("Please save the rates before adding items.");
    return;
  }

  const pieces = parseInt(document.getElementById("pieces").value);
  const desc = document.getElementById("itemDesc").value;
  const gross = parseFloat(document.getElementById("grossWeight").value);
  const net = parseFloat(document.getElementById("netWeight").value);
  const karat = Number(document.getElementById("karat").value);

  const rate = rates[karat] || 0;
  const value = net * rate;

  const item = {
    pieces,
    desc,
    gross,
    net,
    carat: caratMap[karat],
    rate,
    value
  };

  items.push(item);
  renderTable();
  itemForm.reset();
});

function renderTable() {
  itemsTableBody.innerHTML = "";

  let totalPieces = 0,
    totalGross = 0,
    totalNet = 0,
    totalValue = 0;

  items.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.pieces} pcs</td>
      <td>${item.desc}</td>
      <td>${item.gross.toFixed(2)} gms</td>
      <td>${item.net.toFixed(2)} gms</td>
      <td>${item.carat}</td>
      <td>Rs ${item.rate.toFixed(2)}</td>
      <td>Rs ${item.value.toFixed(2)}</td>
      <td><button onclick="deleteItem(${index})">🗑️</button></td>
    `;
    itemsTableBody.appendChild(tr);

    totalPieces += item.pieces;
    totalGross += item.gross;
    totalNet += item.net;
    totalValue += item.value;
  });

  totalPiecesCell.textContent = `${totalPieces} pcs`;
  totalGrossCell.textContent = `${totalGross.toFixed(2)} gms`;
  totalNetCell.textContent = `${totalNet.toFixed(2)} gms`;
  totalValueCell.textContent = `Rs ${totalValue.toFixed(2)}`;
}

function deleteItem(index) {
  items.splice(index, 1);
  renderTable();
}

clearAllBtn.addEventListener("click", () => {
  if (!ratesSaved) {
    alert("Please save the rates first.");
    return;
  }
  if (confirm("Clear all items?")) {
    items = [];
    renderTable();
  }
});

function numberToWords(num) {
    const a = [
      "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
      "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
      "seventeen", "eighteen", "nineteen"
    ];
    const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  
    if ((num = num.toString()).length > 9) return "overflow";
    const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; 
    let str = "";
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " crore " : "";
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " lakh " : "";
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " thousand " : "";
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " hundred " : "";
    str += (n[5] != 0) ? ((str != "") ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) + " " : "";
    
    str = str.trim();
    return str.charAt(0).toUpperCase() + str.slice(1);

  }

generateBtn.addEventListener("click", async () => {
  if (!ratesSaved) {
    alert("Please save the rates first.");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  let date = document.getElementById("invoiceDate").value.trim();
  if (date) {
    const [year, month, day] = date.split("-");
    date = `${day}-${month}-${year}`;
  }
  if (!name || !date || items.length === 0) {
    alert("Please enter the customer's name, today's date, and add at least one item before generating the document.");
    return;
  }

  const totalPieces = items.reduce((s, i) => s + (parseFloat(i.pieces) || 0), 0);
  const totalGross = items.reduce((s, i) => s + (parseFloat(i.gross) || 0), 0);
  const totalNet = items.reduce((s, i) => s + (parseFloat(i.net) || 0), 0);
  const totalValue = items.reduce((s, i) => s + (parseFloat(i.value) || 0), 0);
  const totalInWords = numberToWords(Math.round(totalValue));

  const colPercents = ["10%", "25%", "13%", "13%", "11%", "13%", "15%"];

  const rowsHtml = items.map(i => `
    <tr>
      <td style="width:${colPercents[0]}; padding:6px; text-align:center;">${i.pieces} pcs</td>
      <td style="width:${colPercents[1]}; padding:6px; text-align:left;">${escapeHtml(i.desc)}</td>
      <td style="width:${colPercents[2]}; padding:6px; text-align:right;">${i.gross.toFixed(2)} gms</td>
      <td style="width:${colPercents[3]}; padding:6px; text-align:right;">${i.net.toFixed(2)} gms</td>
      <td style="width:${colPercents[4]}; padding:6px; text-align:center;">${escapeHtml(i.carat)}</td>
      <td style="width:${colPercents[5]}; padding:6px; text-align:right;">Rs ${i.rate.toFixed(2)}</td>
      <td style="width:${colPercents[6]}; padding:6px; text-align:right;">Rs ${i.value.toFixed(2)}</td>
    </tr>`).join("");

  const totalRowHtml = `
    <tr style="background:#fff6e6; font-weight:700;">
      <td style="padding:8px; text-align:center;">${totalPieces} pcs</td>
      <td style="padding:8px; text-align:left;"></td>
      <td style="padding:8px; text-align:right;">${totalGross.toFixed(2)} gms</td>
      <td style="padding:8px; text-align:right;">${totalNet.toFixed(2)} gms</td>
      <td style="padding:8px; text-align:center;"></td>
      <td style="padding:8px; text-align:right;"></td>
      <td style="padding:8px; text-align:right;">Rs ${totalValue.toFixed(2)}</td>
    </tr>`;

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Gold Jewellery Valuation - ${escapeHtml(name)}</title>
    <style>
      body { font-family: "Times New Roman", serif; color:#222; }
      .header { text-align:center;}
      .company { font-style:italic; color:#a67c00; margin:0; letter-spacing:1px; font-size:18 }
      .sub { font-style:italic; margin:2px 0; font-size:14px; }
      .addr { margin:6px 0 8px 0; font-size:12px; line-height:1.4; }
      hr.divider {
        border-bottom: 5px solid #a67c00;
        width: 85%;
        margin-bottom: 10px
      }
      h2, h3, table, .valuation, .footer {
        font-size: 11;
      }
      h2 { text-align:center; margin:12px 0 6px 0; text-decoration:underline; font-weight:700; }
      h3 { text-align:center; margin:0 0 12px 0; text-decoration:underline; font-weight:700; }
      table { width:100%; border-collapse:collapse; margin-top:10px; table-layout:fixed; }
      th { background:#f3e4c6; padding:8px; border:1px solid #e2cf9b; font-weight:700; text-align:center; }
      td { border:1px solid #eae0c1; vertical-align:middle; padding:6px; text-align:center;}
      .valuation { margin-top:16px; text-align:justify; line-height:1.4; }
      .footer { padding-top:100px; text-align:right; font-weight:600; } 
    </style>
  </head>
  <body>
    <div class="header">
      <p class="company">Shri Tirupati Gems & Jewels Pvt. Ltd.</p>
      <p class="sub">Designers & Manufacturers of Quality Jewellery</p>
      <p class="addr">
        Tirupati Bhawan, M1/8A Sector B, Opp Indian Oil Corporation Office, Kapoorthala, Aliganj, Lucknow - 226024, UP, India<br>
        Phone: 2324052, +91 9415011658, +91 9415548877
      </p>
      <hr class="divider">
    </div>


    <h2>TO WHOM IT MAY CONCERN</h2>
    <h3>GOLD JEWELLERY ${escapeHtml(name.toUpperCase())} AS ON ${escapeHtml(date)}</h3>

    <table>
      <thead>
        <tr>
          <th style="width:${colPercents[0]};">No. of Pieces</th>
          <th style="width:${colPercents[1]};">Description</th>
          <th style="width:${colPercents[2]};">Gross Weight (gms)</th>
          <th style="width:${colPercents[3]};">Net Weight (gms)</th>
          <th style="width:${colPercents[4]};">Carat</th>
          <th style="width:${colPercents[5]};">Rate / Gram</th>
          <th style="width:${colPercents[6]};">Market Value (Rs)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        ${totalRowHtml}
      </tbody>
    </table>

    <div class="valuation">
      <p><strong>Total valuation of gold jewellery is Rs ${totalValue.toFixed(2)}, </strong><strong>Rupees ${escapeHtml(totalInWords)} only</strong><strong>.</strong></p>
      <p>I hereby certify that I have tested/appraised the above and that the gross weight of the article, net weight of gold, carat, purity of fineness, rate per gram and market value shown against the ornaments mentioned above are to the best of my knowledge correct and in order.</p>
    </div>

    <div class="footer">Authorized Signatory</div>
  </body>
  </html>
  `;

  const blob = new Blob([html], { type: "application/msword" });
  const filename = `Gold_Jewellery_Valuation_${name.replace(/\s+/g, "_")}_${date}.doc`;
  saveAs(blob, filename);

  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
});
