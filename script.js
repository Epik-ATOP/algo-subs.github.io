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

        // Map country names to country codes
        const countryToCode = {
            'Japan': 'jp',
            'USA': 'us',
            'UK': 'gb',
            'South Korea': 'kr',
            'Thailand': 'th',
            'Ukraine': 'ua',
            'Italy': 'it',
            'South Africa': 'za',
            'Canada': 'ca',
            'Australia': 'au',
            'Germany': 'de',
            'France': 'fr',
            'Spain': 'es',
            'Russia': 'ru',
            'Brazil': 'br',
            'India': 'in',
            'China': 'cn',
            'Mexico': 'mx',
            'Indonesia': 'id',
            'Vietnam': 'vn',
            'Philippines': 'ph',
            'Malaysia': 'my',
            'Turkey': 'tr',
            'Nigeria': 'ng',
            'Egypt': 'eg',
            'Saudi Arabia': 'sa',
            'Iran': 'ir',
        };

        // Parse rows into an array of arrays
        const parsedRows = rows.map(row => row.split('\t')).filter(row => row.length > 1);

        // Sort rows by the "Subscribers" column (index 1)
        parsedRows.sort((a, b) => {
            const aSubscribers = parseInt(a[1].replace(/,/g, ''), 10);
            const bSubscribers = parseInt(b[1].replace(/,/g, ''), 10);
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
            row.forEach((cell, cellIndex) => {
                const td = document.createElement('td');

            if (cellIndex === 1) {
                const subscribers = parseInt(cell.trim(), 10);
                td.textContent = subscribers.toLocaleString(); // Format number with commas
            }

                // Add flags to the "Location" column (last column)
                else if (cellIndex === row.length - 1) {
                    const countryName = cell.trim();
                    const countryCode = countryToCode[countryName]; // Get country code
                    if (countryCode) {
                        // Add a flag using an img tag
                        const flagImg = document.createElement('img');
                        flagImg.src = `https://flagpedia.net/data/flags/h40/${countryCode}.png`; // Flag URL
                        flagImg.alt = `${countryName} flag`;
                        flagImg.style.width = '20px';
                        flagImg.style.marginRight = '8px';

                        // Append flag image before country name
                        td.appendChild(flagImg);
                    }
                    td.textContent += countryName; // Add country name
                } else {
                    td.textContent = cell.trim();
                }

                dataRow.appendChild(td);
            });
            tbody.appendChild(dataRow);
        });
        table.appendChild(tbody);
    })
    .catch(error => console.error('Error loading TSV file:', error));