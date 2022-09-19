var AWS = require("aws-sdk");
var rand = require("randomstring");

const bucketName = "clwd.app";
const bucketUrlRoot = "https://clwd.app/";
const keyLength = 8;
const awsRegion = "eu-west-2";

var s3 = new AWS.S3({ region: awsRegion });

// uncomment for local debugging
// const awsKeyId = "";
// const awsKeySecret = "";
// var s3 = new AWS.S3({
//     region: awsRegion,
//     credentials: new AWS.Credentials(awsKeyId, awsKeySecret),
// });

function checkObjectExists(key) {
    var params = { Bucket: bucketName, Key: key };
    return new Promise((resolve, reject) => {
        s3.headObject(params, (err, data) => {
            if (err) {
                if (err.statusCode == 404) {
                    resolve(false);
                } else {
                    console.log(err);
                    reject(err.toString());
                }
            } else {
                resolve(true);
            }
        });
    });
}

async function createRedirection(url) {
    // find an available random key
    var key;
    for (var i = 0; i < 10; i++) {
        key = rand.generate(keyLength);
        var exists = await checkObjectExists(key);
        if (!exists) {
            break;
        }
    }

    await s3.putObject({
        Bucket: bucketName,
        Key: key,
        WebsiteRedirectLocation: url

    }).promise();

    return key;
}

exports.handler = async function (event) {
    try {
        if (event.body !== null && event.body !== undefined) {
            let body = JSON.parse(event.body);
            if (body.url) {
                var key = await createRedirection(body.url);
                return {
                    statusCode: 200,
                    body: JSON.stringify({ key: key, url: bucketUrlRoot + key }),
                };
            }
        }
        return { statusCode: 400 };
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.toString() }),
        };
    }
};

// createRedirection("https://yahoo.com").then(console.log);