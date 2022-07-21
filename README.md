# lambda-borgun

A small AWS lambda function that fetches currency conversions in XML from Borgun creditcard vendor in Iceland,
parses the data then stores it in an AWS S3 bucket and then creates a CloudFront invalidation for that object.

## Convinent way to build and zip it for AWS

```shell
yarn install --production
zip -r lambda-borgun.zip . -x ".git/*" -x ".idea/*"
```

## ToDo

- [ ] Validate env variables before starting
