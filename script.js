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
    const date = document.getElementById("invoiceDate").value.trim();
  
    if (!name || !date || items.length === 0) {
      alert("Please enter the customer's name, today's date, and add at least one item before generating the invoice.");
      return;
    }
  
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    doc.setFont("times", "bolditalic");
    doc.setFontSize(18);
    doc.text("Shri Tirupati Gems & Jewels Pvt. Ltd.", 105, 15, { align: "center" });
  
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.text("Designers & Manufacturers of Quality Jewellery", 105, 20, { align: "center" });
    doc.text("Tirupati Bhawan, M1/8A Sector B, Opp Indian Oil Corporation Office", 105, 25, { align: "center" });
    doc.text("Kapoorthala, Aliganj, Lucknow - 226024, UP, India", 105, 30, { align: "center" });
    doc.text("Phone: 2324052, +91 9415011658, +91 9415548877", 105, 35, { align: "center" });
  
    doc.setDrawColor(150);
    doc.line(15, 38, 195, 38);
  
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    const titleY = 55;
    const subtitleY = 63;
  
    doc.text("TO WHOM IT MAY CONCERN", 105, titleY, { align: "center" });
    doc.text(`GOLD JEWELLERY ${name.toUpperCase()} AS ON ${date}`, 105, subtitleY, { align: "center" });
  
    const underline = (text, y) => {
      const textWidth = doc.getTextWidth(text);
      doc.line(105 - textWidth / 2, y + 1, 105 + textWidth / 2, y + 1);
    };
    underline("TO WHOM IT MAY CONCERN", titleY);
    underline(`GOLD JEWELLERY (${name.toUpperCase()}) AS ON ${date}`, subtitleY);
  
    const tableData = items.map((i) => [
      `${i.pieces} pcs`,
      i.desc,
      `${i.gross.toFixed(2)} gms`,
      `${i.net.toFixed(2)} gms`,
      i.carat,
      `Rs ${i.rate.toFixed(2)}`,
      `Rs ${i.value.toFixed(2)}`
    ]);
  
    const totalPieces = items.reduce((sum, i) => sum + (parseFloat(i.pieces) || 0), 0);
    const totalGross = items.reduce((sum, i) => sum + (parseFloat(i.gross) || 0), 0);
    const totalNet = items.reduce((sum, i) => sum + (parseFloat(i.net) || 0), 0);
    const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.value) || 0), 0);
  
    const totalRow = [
      `${totalPieces} pcs`,
      "TOTAL",
      `${totalGross.toFixed(2)} gms`,
      `${totalNet.toFixed(2)} gms`,
      "",
      "",
      `Rs ${totalValue.toFixed(2)}`
    ];
  
    tableData.push(totalRow);
  
    doc.autoTable({
      startY: 70, 
      head: [["No of Pieces", "Description", "Gross Weight in Gms", "Net Weight in Gms", "Carat", "Rate / Gram", "Market Value in Rs"]],
      body: tableData,
      theme: "grid",
      styles: { font: "times", fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [230, 200, 150] },
      didParseCell: (data) => {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [255, 245, 204];
        }
      },
    });
  
    const totalInWords = numberToWords(Math.round(totalValue));
    let finalY = doc.lastAutoTable.finalY + 12;
  
    const totalText1 = `Total valuation of gold jewellery is `;
    const totalText2 = `Rupees ${totalInWords} only`;
  
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.text(totalText1, 15, finalY);
  
    const textWidth = doc.getTextWidth(totalText1);
  
    doc.setFont("times", "bold");
    doc.text(totalText2, 15 + textWidth, finalY);
    doc.setFont("times", "normal");
  
    const paragraph = `I hereby certify that I have tested/appraised the above and that the gross weight of the article, net weight of gold, carat, purity of fineness, rate per gram and market value shown against the ornaments mentioned above are to the best of my knowledge correct and in order.`;
  
    doc.text(paragraph, 15, finalY + 8, { maxWidth: 180 });
  
    doc.setFontSize(10);
    doc.text("Authorized Signatory", 160, 280);
  
    doc.save(`Gold_Jewellery_Valuation_${name}.pdf`);
  });
  
  
