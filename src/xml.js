const { XMLParser } = require('fast-xml-parser');

const validatePayload = (payload) => {
    if (!payload.hasOwnProperty('Rates')) {
        throw new Error('xml response contains no rates');
    }
    if (!payload.Rates.hasOwnProperty('Status')) {
        throw new Error('xml response contains no status message');
    }
    if (!payload.Rates.hasOwnProperty('Rate')) {
        throw new Error('xml response contains no rates');
    }
    if (!payload.Rates.Status.hasOwnProperty('ResultCode')) {
        throw new Error('xml response contains no Result code');
    }
    if ((payload.Rates.Status.ResultCode !== 0)) {
        throw new Error('Invalid result code in xml');
    }
};

const parseXml = (xml) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Parsing data and saving as JSON');
            const parser = new XMLParser();
            const data = parser.parse(xml.body);
            validatePayload(data);

            const rates = {};
            data.Rates.Rate.forEach(rate => {
              if (!(rate['CurrencyCode'] in rates)) {
                rates[rate['CurrencyCode']] = rate['CurrencyRate'];
              }
            });
            resolve(rates);
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
