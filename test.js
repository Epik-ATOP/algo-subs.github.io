const API_KEY = 'YAIzaSyC10SQnKasYY6aHm7xtXm0t3LGA_BjsVPs'; // Replace with your YouTube Data API key

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
                    <td class="viewcount-cell">Fetching...</td>
                    <td>${creationDate}</td>
                    <td class="location-cell">${getFlagHTML(location)} ${location}</td>
                `;
                tableBody.appendChild(tableRow);
            });

            // Fetch channel IDs and update subscriber and view counts
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

                        // Fetch subscriber and view counts for the batch
                        fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${batchChannelIds}&key=${API_KEY}`)
                            .then(response => response.json())
                            .then(apiData => {
                                apiData.items.forEach(channel => {
                                    const channelId = channel.id;
                                    const stats = channel.statistics;
                                    const subscribers = stats.subscriberCount;
                                    const viewCount = stats.viewCount;

                                    // Find the row in the table for this channel
                                    const channelName = channelNames.find(name => channelIdMap[name] === channelId);
                                    const row = table.querySelector(`tr[data-channel-name="${channelName}"]`);

                                    if (row) {
                                        // Update subscriber count
                                        const subscriberCell = row.querySelector('.subscriber-cell');
                                        subscriberCell.textContent = parseInt(subscribers).toLocaleString();

                                        // Update view count
                                        const viewCountCell = row.querySelector('.viewcount-cell');
                                        viewCountCell.textContent = parseInt(viewCount).toLocaleString();
                                    }
                                });
                            })
                            .catch(error => console.error('Error fetching channel data:', error));
                    }
                })
                .catch(error => console.error('Error loading channel IDs:', error));
        })
        .catch(error => console.error('Error loading data.tsv:', error));

    // Add sorting functionality
    document.getElementById('sort-toggle').addEventListener('click', toggleSort);
});

let sortBy = 'subscribers'; // Default sort criteria

function toggleSort() {
    const tableBody = document.querySelector('#data-table tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const aValue = parseInt(a.querySelector(`.${sortBy === 'subscribers' ? 'subscriber-cell' : 'viewcount-cell'}`).textContent.replace(/,/g, ''));
        const bValue = parseInt(b.querySelector(`.${sortBy === 'subscribers' ? 'subscriber-cell' : 'viewcount-cell'}`).textContent.replace(/,/g, ''));

        return sortBy === 'subscribers' ? bValue - aValue : aValue - bValue; // Toggle between descending and ascending
    });

    // Reattach sorted rows
    rows.forEach(row => tableBody.appendChild(row));

    // Toggle sorting criteria
    sortBy = sortBy === 'subscribers' ? 'viewcount' : 'subscribers';
    document.getElementById('sort-toggle').textContent = `Sort by ${sortBy === 'subscribers' ? 'View Count' : 'Subscribers'}`;
}

// Helper function to generate flag HTML
function getFlagHTML(country) {
    const countryCode = getCountryCode(country);
    if (!countryCode) return '';
    return `<img src="https://flagcdn.com/w40/${countryCode}.png" alt="${country}" class="flag-icon">`;
}

// Helper function to get country code
function getCountryCode(country) {
    const countryCodes = {
            'Japan': 'jp',
            'USA': 'us',
            'UK': 'gb',
            'South Korea': 'kr',
            'Thailand': 'th',
            'Ukraine': 'ua',
            'Italy': 'it',
            'South Africa': 'za',
            'South Africa': 'za',
            'Australia': 'au',
            'Canada': 'ca',
            'Germany': 'de',
            'Russia': 'ru',
            'France': 'fr',
            'Brazil': 'br',
            'India': 'in',
            'China': 'cn',
            'Mexico': 'mx',
            'Indonesia': 'id',
            'Spain': 'es',
            'Turkey': 'tr',
            'Vietnam': 'vn',
            'Argentina': 'ar',
            'Philippines': 'ph',
            'Poland': 'pl',
            'Nigeria': 'ng',
            'Egypt': 'eg',
            'Pakistan': 'pk',
            'Bangladesh': 'bd',
            'Iran': 'ir',
    };
    return countryCodes[country] || '';
}
