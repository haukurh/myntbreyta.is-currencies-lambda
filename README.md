# myntbreyta.is-currencies-lambda

A small AWS lambda function that fetches currency rates in XML format from a credit-card vendor in Iceland,
parses the data then stores it in an AWS S3 bucket for [myntbreyta.is](https://myntbreyta.is) to use.

## ToDo

- [ ] Validate env variables before starting

## Prerequisite

### Create a AWS lambda function

Here I'm following the [AWS documentation](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-awscli.html)
and adjusting the commands to add the necessary permissions and variables.

Create a AWS IAM role with a trust relationship with lambda

```shell
aws iam create-role --role-name myntbreyta-is-currencies-lambda --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
```

Give the role 'AWSLambdaBasicExecutionRole' permission policy

```shell
aws iam attach-role-policy --role-name myntbreyta-is-currencies-lambda --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

Add a custom policy to the role to allow the lambda to update the object in our S3 and create a CloudFront invalidation

```shell
aws iam put-role-policy --role-name myntbreyta-is-currencies-lambda --policy-name allow-s3-cf-invalidation --policy-document '{"Version":"2012-10-17","Statement":[{"Action":"cloudfront:CreateInvalidation","Effect":"Allow","Resource":"arn:aws:cloudfront::<AWS_ACCOUNT_ID>:distribution/<CLOUDFRONT_ID>"},{"Action":["s3:PutObject","s3:GetObject","s3:ListBucket","s3:DeleteObject"],"Effect":"Allow","Resource":"arn:aws:s3:::<S3_BUCKET_ID>/currency-rates.json"}]}'
```

Prepare the code to create our new lambda

```shell
yarn install --production
zip -r myntbreyta-is-currencies-lambda.zip . -x ".git/*" -x ".idea/*"
```

Create the lambda using the role we just created

```shell
aws lambda create-function --function-name myntbreyta-is-currencies-lambda \
    --environment '{"Variables":{"xml_url":"<XML_URL>","bucket":"<S3_BUCKET_ID>"}}' \
    --zip-file fileb://myntbreyta-is-currencies-lambda.zip \
    --handler index.handler \
    --runtime nodejs18.x \
    --role arn:aws:iam::<AWS_ACCOUNT_ID>:role/myntbreyta-is-currencies-lambda
```

Test that everything works

```shell
aws lambda invoke --function-name myntbreyta-is-currencies-lambda --log-type Tail --query 'LogResult' --output text /dev/null | base64 -d
```

### Creating a scheduled event with EventBridge

```shell
aws events put-rule --name myntbreyta-is-currencies-lambda-scheduled-rule --schedule-expression 'cron(45 06 * * ? *)'
```

```shell
aws lambda add-permission \
    --function-name myntbreyta-is-currencies-lambda \
    --statement-id myntbreyta-is-currencies-lambda-scheduled-event \
    --action 'lambda:InvokeFunction' \
    --principal events.amazonaws.com \
    --source-arn arn:aws:events:eu-west-1:<AWS_ACCOUNT_ID>:rule/myntbreyta-is-currencies-lambda-scheduled-rule
```

```shell
aws events put-targets --rule myntbreyta-is-currencies-lambda-scheduled-rule --targets '[{"Id": "1","Arn": "arn:aws:lambda:eu-west-1:<AWS_ACCOUNT_ID>:function:myntbreyta-is-currencies-lambda"}]'
```

## Sources

- [docs.aws.amazon.com: Using Lambda with the AWS CLI](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-awscli.html)
- [docs.aws.amazon.com: Deploy Node.js Lambda functions with .zip file archives](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html)
- [docs.aws.amazon.com: Schedule expressions using rate or cron](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents-expressions.html)
- [docs.aws.amazon.com: Schedule AWS Lambda functions using EventBridge](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-run-lambda-schedule.html)
