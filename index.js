const { fetch } = require('./src/fetch');
const { parseXml } = require('./src/xml');
const { parseBorgunData } = require('./src/borgun');
const { saveToS3 } = require('./src/aws');

fetch(process.env.borgun_xml_url)
    .then((data) => parseXml(data))
    .then((xml) => parseBorgunData(xml))
    .then((payload) => saveToS3(payload))
    .catch((e) => {
        console.error('Unhandled error', {
            error: e,
        });
    });
