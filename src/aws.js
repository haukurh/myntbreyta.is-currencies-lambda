const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { CloudFrontClient, CreateInvalidationCommand } = require("@aws-sdk/client-cloudfront");
const awsConfig = { region: 'eu-west-1' };
const s3 = new S3Client(awsConfig);
const cloudfront = new CloudFrontClient(awsConfig);

const saveToS3 = (payload, bucket, filename) => {
    return new Promise((resolve, reject) => {
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 1);
        console.log('Uploading to S3...');
        const command = new PutObjectCommand({
            Body: JSON.stringify(payload),
            Bucket: bucket,
            Key: filename,
            ContentType: 'application/json',
            Expires: expireDate,
        });

        s3.send(command)
            .then((data) => {
                console.log(`${filename} uploaded to AWS S3`);
                resolve(data);
            })
            .catch((error) => {
                console.error(error, error.stack);
                reject(error);
            });
    });
};

const createCloudfrontInvalidation = (distributionId, filename) => {
    return new Promise((resolve, reject) => {
        const command = new CreateInvalidationCommand({
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
        });
        cloudfront.send(command)
            .then((data) => {
                console.log(`CloudFront Invalidation request created for '${filename}'`);
                resolve(data);
            })
            .catch((error) => {
                console.error(error, error.stack);
                reject(error);
            });
    });
};

module.exports = {
    saveToS3,
    createCloudfrontInvalidation,
};
