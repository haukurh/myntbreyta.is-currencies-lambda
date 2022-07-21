const { XMLParser } = require('fast-xml-parser');

const parseXml = (xml) => {
    return new Promise(async (resolve, reject) => {
        try {
            const parser = new XMLParser();
            resolve(parser.parse(xml.body));
        } catch (e) {
            reject({
                msg: 'Unable to parse XML',
                xml: xml,
                error: e,
            });
        }
    });
};

module.exports = { parseXml };
