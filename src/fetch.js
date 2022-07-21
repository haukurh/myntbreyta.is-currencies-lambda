const https = require('https');

const fetch = (url) => {
    return new Promise((resolve, reject) => {
        let data = '';
        https.get(url,(response) => {
            response.on('data', (chunk) => data += chunk);
            response.on('error', (error) => {
                reject('HTTPS request failed', {
                    error: error,
                })
            });
            response.on('end', () => resolve({
                headers: response.headers,
                statusCode: response.statusCode,
                body: data,
            }));
        });
    });
};

module.exports = { fetch };
