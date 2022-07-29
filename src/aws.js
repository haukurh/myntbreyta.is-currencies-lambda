const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});
const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();

const saveToS3 = (payload, bucket, filename) => {
    return new Promise((resolve, reject) => {
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 1);
        console.debug('Uploading to S3...');
        const s3params = {
            Body: JSON.stringify(payload),
            Bucket: bucket,
            Key: filename,
            CacheControl: 'public,max-age=86400',
            ContentType: 'application/json',
            Expires: expireDate,
        };
        s3.putObject(s3params, (AWSError, object) => {
            if (AWSError) {
                console.error(AWSError, AWSError.stack);
                reject(AWSError);
            } else {
                console.debug(`${filename} uploaded to AWS S3`);
                resolve(object);
            }
        });
    });
};

const createCloudfrontInvalidation = (distributionId, filename) => {
    return new Promise((resolve, reject) => {
        const params = {
            DistributionId: distributionId,
            InvalidationBatch: {
                CallerReference: (new Date()).toTimeString(),
                Paths: {
                    Quantity: '1',
                    Items: [
                        `/${filename}`,
                    ]
                }
            }
        };
        cloudfront.createInvalidation(params, (AWSError, data) => {
            if (AWSError) {
                console.error(AWSError, AWSError.stack);
                reject(AWSError);
            } else {
                console.log(`CloudFront Invalidation request created for '${filename}'`);
                resolve(data);
            }
        });
    });
};

module.exports = {
    saveToS3,
    createCloudfrontInvalidation,
};
