fetch('data.tsv')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        const rows = data.split('\n'); // Split into lines
        const headers = rows.shift().split('\t'); // Extract column headers

        // Add a new "Number" column at the start
        headers.unshift('#');

        // Parse rows into an array of arrays
        const parsedRows = rows.map(row => row.split('\t')).filter(row => row.length > 1);

        // Sort rows by the "Subscribers" column (index 1)
        parsedRows.sort((a, b) => {
            const aSubscribers = parseInt(a[1], 10); // Convert to number
            const bSubscribers = parseInt(b[1], 10);
            return bSubscribers - aSubscribers; // Descending order
        });

        // Create the table
        const table = document.getElementById('data-table');

        // Add the headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.trim();
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Add the rows
        const tbody = document.createElement('tbody');
        parsedRows.forEach((row, index) => {
            const dataRow = document.createElement('tr');

            // Add the row number as the first column
            const numberCell = document.createElement('td');
            numberCell.textContent = index + 1; // Row numbers start at 1
            dataRow.appendChild(numberCell);

            // Add the remaining cells
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell.trim();
                dataRow.appendChild(td);
            });
            tbody.appendChild(dataRow);
        });
        table.appendChild(tbody);
    })
    .catch(error => console.error('Error loading TSV file:', error));
