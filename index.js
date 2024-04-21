const { fetch } = require('./src/fetch');
const { parseXml } = require('./src/xml');
const { parseBorgunData } = require('./src/borgun');
const { saveToS3 } = require('./src/aws');

const filename = 'currency-rates.json';
const bucket = process.env.bucket;
const url = process.env.borgun_xml_url;
const distributionId = process.env.cloudfront_id;

exports.handler = async(event) => {
    console.log('Fetching data');
    await fetch(url)
        .then((data) => parseXml(data))
        .then((xml) => parseBorgunData(xml))
        .then((payload) => saveToS3(payload, bucket, filename))
        .catch((e) => {
            console.error('Unhandled error', {
                error: e,
            });
        });
};
