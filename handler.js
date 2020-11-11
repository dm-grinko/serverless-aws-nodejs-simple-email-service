const aws = require('aws-sdk');
const ses = new aws.SES();
const EMAIL = process.env.EMAIL;
const DOMAIN = process.env.DOMAIN;

const sendResponse = (payload) => {
  const {message} = payload;
  return {
    statusCode: payload.statusCode || 200,
    headers: {
      'Access-Control-Allow-Origin': DOMAIN,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({message})
  }
}

const getParams = (body) => {
  const {email, name, content, topic} = JSON.parse(body) || {};
  if (!(email && name && content && topic)) {
    throw {message: 'Missing required params from body', statusCode: 400};
  }

  return {
    Source: EMAIL,
    Destination: { ToAddresses: [EMAIL] },
    ReplyToAddresses: [email],
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `Email: ${email}\nName: ${name}\nMessage: ${content}`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: topic
      }
    }
  }
}

module.exports.send = async (event) => {
  try {
    const params = getParams(event.body);
    await ses.sendEmail(params).promise();
    return sendResponse({message: 'The request has succeeded'});
  } catch (error) {
    return sendResponse(error);
  }
}