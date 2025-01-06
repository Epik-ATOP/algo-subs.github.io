// Fetch the TSV file
fetch('data.tsv')
    .then(response => response.text())
    .then(data => {
        const rows = data.split('\n'); // Split into lines
        const headers = rows.shift().split('\t'); // Get column headers
        
        // Create the table
        const table = document.getElementById('data-table');
        
        // Add the headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Add the rows
        const tbody = document.createElement('tbody');
        rows.forEach(row => {
            if (row.trim() === '') return; // Skip empty rows
            const dataRow = document.createElement('tr');
            row.split('\t').forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                dataRow.appendChild(td);
            });
            tbody.appendChild(dataRow);
        });
        table.appendChild(tbody);
    })
    .catch(error => console.error('Error loading TSV file:', error));
