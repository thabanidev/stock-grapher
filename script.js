const xlabels = [];
const closingPriceData = [];
const ctx = document.getElementById("chart");
let chart = null;
const button = document.getElementById("search");
const ticker = document.getElementById("ticker");

document.addEventListener("DOMContentLoaded",async function () {
    await getData("AAPL");
    drawChart("AAPL", xlabels, closingPriceData)
    createStockTable("AAPL");
    button.addEventListener("click", async function () {
        button.disabled = true;
        button.textContent = "Loading...";
        let tickerValue = ticker.value.toString().toUpperCase();
        chart.destroy();
        xlabels.length = 0;
        closingPriceData.length = 0;
        await getData(tickerValue);
        createStockTable(tickerValue);
        drawChart(tickerValue, xlabels, closingPriceData);
        button.disabled = false;
        button.textContent = "Search";
    });
});

async function drawChart(ticker, xlabels, closingPriceData) {
    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: xlabels,
            datasets: [
                {
                    label: ticker + " Stock Prices",
                    data: closingPriceData,
                    borderWidth: 1,
                },
            ],
        },
    });
}

async function getData(ticker) {
    const response = await fetch(ticker + ".csv");
    const data = await response.text();
    console.log(data);
    const table = data.split("\n").slice(1); // Splice is there to remove the first row of the csv file which is the header
    table.forEach((row) => {
        const columns = row.split(",");
        const date = columns[0];
        xlabels.push(date);
        const closingPrice = columns[4];
        closingPriceData.push(closingPrice);
        console.log(date, closingPrice);
    });
}

async function createStockTable(ticker) {
    const response = await fetch(ticker + ".csv");
    const data = await response.text();
    const parsedData = Papa.parse(data, { header: true, skipEmptyLines: true });

    // Get the container and table elements
    const tableContainer = document.getElementById("table-container");
    const stockTable = document.getElementById("stock-table");

    // Clear any previous table data
    stockTable.innerHTML = "";

    // Create table headers
    const headers = Object.keys(parsedData.data[0]);
    const headerRow = document.createElement("tr");
    headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    stockTable.appendChild(headerRow);

    // Create table rows with stock data
    parsedData.data.forEach((row) => {
        const dataRow = document.createElement("tr");
        headers.forEach((header) => {
            const td = document.createElement("td");
            // Skip the date column
            if (header === "Date") {
                td.textContent = row[header];
                dataRow.appendChild(td);
                return;
            }
            td.textContent = parseFloat(row[header]).toFixed(2);
            dataRow.appendChild(td);
        });
        stockTable.appendChild(dataRow);
    });

    // Add the table to the container
    tableContainer.appendChild(stockTable);
}
