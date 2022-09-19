# Serverless URL Shortener using AWS S3

This is an extremely simple serverless url shortener that relies on S3's ability to add a forwarding URL to objects.

https://docs.aws.amazon.com/AmazonS3/latest/userguide/how-to-page-redirect.html#redirect-requests-object-metadata

## How to Use

Send a POST request to the lambda URL containing the following JSON:

```json
{ "url": "https://very-long-url-to.be-shortened.com" }
```

The service will respond with the following JSON:
```json
{ "key": "ka2jlk35", "url": "https://short.com/ka2jlk35" }
```

## How to Setup

1. Register a custom domain with your preferred registrar.

2. Create an S3 bucket which has precisely the same name as your domain name.
    - Be sure to un-check all of the "private-only" boxes, as this will be a public bucket.

3. In bucket properties, turn on "Static website hosting"
    - Hosting type: Host a static website
    - Index document: index.html

4. In bucket permissions, update the policy to allow public reads:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicReadGetObject",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::BUCKET_NAME/*"
           }
       ]
   }
   ```
    - Replace "BUCKET_NAME" in the above with your bucket/domain 
5. Create a new Lambda function
    - Runtime: Node.js
    - Execution role: Create a new role with basic Lambda permissions
    - Advanced Settings - Check Enable function URL
6. Build and upload this lambda function code
    - Check-out this repository from GIT
    - Run `npm install`
    - Open `index.js` and replace constants (eg. your bucket name)
    - Compress entire folder (including node_modules) into a .zip
    - Click "Upload from" > .zip in the Lambda UI
7. Update lambda permissions to access S3 bucket
    - Open IAM Roles, find the newly created role for this lambda
    - Add permissions > Create inline policy, with following:
      ```json
      {
          "Version": "2012-10-17",
          "Statement": [
              {
                  "Sid": "ListObjectsInBucket",
                  "Effect": "Allow",
                  "Action": [
                      "s3:ListBucket"
                  ],
                  "Resource": [
                      "arn:aws:s3:::BUCKET_NAME"
                  ]
              },
              {
                  "Sid": "AllObjectActions",
                  "Effect": "Allow",
                  "Action": "s3:*Object",
                  "Resource": [
                      "arn:aws:s3:::BUCKET_NAME/*"
                  ]
              }
          ]
      }
      ```
    - Replace "BUCKET_NAME" in the above with your bucket/domain name.
8. (OPTIONAL) Configure an object for responding to requests at the root. 
    - You can use the S3 UI to upload a `index.html` file. This can be a static website, or you can forward it to another domain.
    - To forward requests to index.html elsewhere, open the object properties, Edit Metadata, Add new System defined metadata, Key: `x-amz-website-redirect-location`

