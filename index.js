const { fetch } = require('./src/fetch');
const { parseXml } = require('./src/xml');
const { saveToS3 } = require('./src/aws');

const filename = 'currency-rates.json';
const bucket = process.env.bucket;
const url = process.env.xml_url;

exports.handler = async(event) => {
    console.log(`Fetching data from '${url}'`);
    await fetch(url)
        .then((data) => parseXml(data))
        .then((payload) => saveToS3(payload, bucket, filename))
        .catch((e) => {
            console.error('Unhandled error', {
                error: e,
            });
        });
};
