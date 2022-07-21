# lambda-borgun

A small AWS lambda function that fetches currency conversions in XML from Borgun creditcard vendor in Iceland,
parses the data and stores it in a AWS S3 bucket


## Convinent way to build and zip it for AWS

```shell
yarn install --production
zip -r lambda-borgun.zip . -x ".git/*" -x ".idea/*"
```

