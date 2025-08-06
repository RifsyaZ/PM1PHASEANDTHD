const SHEET_URL = "https://script.google.com/macros/s/AKfycbzLzDatUCJa86sgqfWywphXYDnL7GNFYrFlvV92Oy-XgThq87sKykq9TtOqVWWAucYP/exec";

async function loadData() {
  const statusEl = document.getElementById("status");
  const tableBody = document.getElementById("table-body");

  try {
    const res = await fetch(SHEET_URL);
    const data = await res.json();

    if (!data || data.length === 0) {
      statusEl.textContent = "Tidak ada data ditemukan.";
      return;
    }

    statusEl.textContent = "Data berhasil dimuat.";
    tableBody.innerHTML = ""; // Kosongkan dulu

    // Ambil 20 data terakhir
    const recent = data.slice(-20).reverse();

    recent.forEach(row => {
      const tr = document.createElement("tr");
      Object.values(row).forEach(val => {
        const td = document.createElement("td");
        td.textContent = val;
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });

  } catch (err) {
    statusEl.textContent = "Gagal mengambil data.";
    console.error(err);
  }
}

window.onload = loadData;
