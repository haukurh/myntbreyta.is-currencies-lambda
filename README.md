# lambda-borgun

A small AWS lambda function that fetches currency conversions in XML from credit-card vendor in Iceland,
parses the data then stores it in an AWS S3 bucket for [myntbreyta.is](https://myntbreyta.is) to use.

## ToDo

- [ ] Validate env variables before starting

## Prerequisite

### Create a AWS lambda function

Here I'm following the [AWS documentation](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-awscli.html)
and adjusting the commands to add the necessary permissions and variables.

Create a AWS IAM role with a trust relationship with lambda

```shell
aws iam create-role --role-name lambda-borgun --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
```

Give the role 'AWSLambdaBasicExecutionRole' permission policy

```shell
aws iam attach-role-policy --role-name lambda-borgun --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

Add a custom policy to the role to allow the lambda to update the object in our S3 and create a CloudFront invalidation

```shell
aws iam put-role-policy --role-name lambda-borgun --policy-name allow-s3-cf-invalidation --policy-document '{"Version":"2012-10-17","Statement":[{"Action":"cloudfront:CreateInvalidation","Effect":"Allow","Resource":"arn:aws:cloudfront::<AWS_ACCOUNT_ID>:distribution/<CLOUDFRONT_ID>"},{"Action":["s3:PutObject","s3:GetObject","s3:ListBucket","s3:DeleteObject"],"Effect":"Allow","Resource":"arn:aws:s3:::<S3_BUCKET_ID>/currency-rates.json"}]}'
```

Prepare the code to create our new lambda

```shell
yarn install --production
zip -r lambda-borgun.zip . -x ".git/*" -x ".idea/*"
```

Create the lambda using the role we just created

```shell
aws lambda create-function --function-name lambda-borgun \
    --environment '{"Variables":{"xml_url":"<XML_URL>","bucket":"<S3_BUCKET_ID>"}}' \
    --zip-file fileb://lambda-borgun.zip \
    --handler index.handler \
    --runtime nodejs18.x \
    --role arn:aws:iam::<AWS_ACCOUNT_ID>:role/lambda-borgun
```

Test that everything works

```shell
aws lambda invoke --function-name lambda-borgun --log-type Tail --query 'LogResult' --output text /dev/null | base64 -d
```

### Creating a scheduled event with EventBridge

```shell
aws events put-rule --name lambda-borgun-scheduled-rule --schedule-expression 'cron(45 06 * * ? *)'
```

```shell
aws lambda add-permission \
    --function-name lambda-borgun \
    --statement-id lambda-borgun-scheduled-event \
    --action 'lambda:InvokeFunction' \
    --principal events.amazonaws.com \
    --source-arn arn:aws:events:eu-west-1:<AWS_ACCOUNT_ID>:rule/lambda-borgun-scheduled-rule
```

```shell
aws events put-targets --rule lambda-borgun-scheduled-rule --targets '[{"Id": "1","Arn": "arn:aws:lambda:eu-west-1:<AWS_ACCOUNT_ID>:function:lambda-borgun"}]'
```

## Sources

- [docs.aws.amazon.com: Using Lambda with the AWS CLI](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-awscli.html)
- [docs.aws.amazon.com: Deploy Node.js Lambda functions with .zip file archives](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html)
- [docs.aws.amazon.com: Schedule expressions using rate or cron](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents-expressions.html)
- [docs.aws.amazon.com: Schedule AWS Lambda functions using EventBridge](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-run-lambda-schedule.html)
