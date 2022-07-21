
const validatePayload = (payload) => {
    if (!payload.hasOwnProperty('Rates')) {
        throw new Error('Borgun response contained no rates');
    }
    if (!payload.Rates.hasOwnProperty('Status')) {
        throw new Error('Borgun response contained no status message');
    }
    if (!payload.Rates.hasOwnProperty('Rate')) {
        throw new Error('Borgun response contained no rates');
    }
    if (!payload.Rates.Status.hasOwnProperty('ResultCode')) {
        throw new Error('Borgun response contained no Result code');
    }
    if ((payload.Rates.Status.ResultCode !== 0)) {
        throw new Error('Invalid Borgun result code');
    }
};

const parseBorgunData = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            validatePayload(data);
            resolve({
                updatedAt: new Date(),
                rates: data.Rates.Rate.map((rate) => {
                    delete rate['GroupNo'];
                    delete rate['RateDate'];
                    delete rate['CurrencyNum'];
                    return rate;
                }),
            });
        } catch (e) {
            reject(e);
        }
    });
};



module.exports = { parseBorgunData };
