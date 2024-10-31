const https = require('https');

const apiKey = process.env.IPGEOLOCATION_API_KEY; 


function getGeolocation(ipAddress) {
    return new Promise((resolve, reject) => {
        if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
            ipAddress = '8.8.8.8'; // Google's public DNS as a placeholder for testing
        }

        const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ipAddress}`;

        https.get(url, (response) => {
            let data = '';

            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            response.on('end', () => {
                try {
                    const locationData = JSON.parse(data);
                    resolve(locationData);
                } catch (error) {
                    reject(new Error('Error parsing location data'));
                }
            });
        }).on('error', (error) => {
            reject(new Error('Error fetching location data'));
        });
    });
}

module.exports = getGeolocation;
