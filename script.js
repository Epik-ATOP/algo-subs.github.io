const API_KEY = 'AIzaSyC10SQnKasYY6aHm7xtXm0t3LGA_BjsVPs'; // Replace with your YouTube Data API key

document.addEventListener('DOMContentLoaded', () => {
    fetch('data.tsv') // Fetch the main TSV file with channel info
        .then(response => response.text())
        .then(tsvData => {
            const rows = tsvData.split('\n').map(row => row.split('\t'));
            const table = document.getElementById('data-table');
            const tableBody = table.querySelector('tbody');

            // Add table rows
            rows.forEach((row, index) => {
                if (row.length < 4) return; // Skip invalid rows
                const [name, subscribers, creationDate, location] = row;

                const tableRow = document.createElement('tr');
                tableRow.setAttribute('data-channel-name', name);

                tableRow.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${name}</td>
                    <td class="subscriber-cell">${parseInt(subscribers).toLocaleString()}</td>
                    <td>${creationDate}</td>
                    <td class="location-cell">${getFlagHTML(location)} ${location}</td>
                `;
                tableBody.appendChild(tableRow);
            });

            // Fetch channel IDs and update subscriber counts
            fetch('channel-ids.tsv') // Fetch the TSV with channel names and IDs
                .then(response => response.text())
                .then(channelIdData => {
                    const channelRows = channelIdData.split('\n').map(row => row.split('\t'));

                    // Map channel names to their IDs
                    const channelIdMap = {};
                    channelRows.forEach(row => {
                        if (row.length < 2) return; // Skip invalid rows
                        const [name, channelId] = row;
                        channelIdMap[name] = channelId;
                    });

                    // Prepare a batch of requests to the YouTube API
                    const channelNames = Object.keys(channelIdMap);
                    const batchSize = 50;

                    for (let i = 0; i < channelNames.length; i += batchSize) {
                        const batchChannelIds = channelNames
                            .slice(i, i + batchSize)
                            .map(name => channelIdMap[name])
                            .join(',');

                        // Fetch subscriber counts for the batch
                        fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${batchChannelIds}&key=${API_KEY}`)
                            .then(response => response.json())
                            .then(apiData => {
                                apiData.items.forEach(channel => {
                                    const channelId = channel.id;
                                    const subscribers = channel.statistics.subscriberCount;

                                    // Find the row in the table for this channel
                                    const channelName = channelNames.find(name => channelIdMap[name] === channelId);
                                    const row = table.querySelector(`tr[data-channel-name="${channelName}"]`);

                                    if (row) {
                                        const subscriberCell = row.querySelector('.subscriber-cell');
                                        subscriberCell.textContent = parseInt(subscribers).toLocaleString();
                                    }
                                });
                            })
                            .catch(error => console.error('Error fetching subscriber counts:', error));
                    }
                })
                .catch(error => console.error('Error loading channel IDs:', error));
        })
        .catch(error => console.error('Error loading data.tsv:', error));
});

// Helper function to generate flag HTML
function getFlagHTML(country) {
    const countryCode = getCountryCode(country);
    if (!countryCode) return '';
    return `<img src="https://flagcdn.com/w40/${countryCode}.png" alt="${country}" class="flag-icon">`;
}

// Helper function to get country code (you can expand this as needed)
function getCountryCode(country) {
    const countryCodes = {
        "USA": "us",
        "Japan": "jp",
        "South Korea": "kr",
        "UK": "gb",
        "Italy": "it",
        "Ukraine": "ua",
        "Thailand": "th",
        "South Africa": "za",
        "Russia": "ru",
        "Poland": "pl",
        "Philippines": "ph",
        "Nigeria": "ng",
        "Mexico": "mx",
        "Malaysia": "my",
        "India": "in",
        "Germany": "de",
        "France": "fr",
        "Egypt": "eg",
        "Canada": "ca",
        "Brazil": "br",
        "Australia": "au"
    };
    return countryCodes[country] || '';
}
