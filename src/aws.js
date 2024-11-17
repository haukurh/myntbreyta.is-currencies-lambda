const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const awsConfig = { region: 'eu-west-1' };
const s3 = new S3Client(awsConfig);

const saveToS3 = (payload, bucket, filename) => {
  return new Promise((resolve, reject) => {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 1);
    expireDate.setSeconds(expireDate.getSeconds() - 6);
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

module.exports = {
  saveToS3,
};
