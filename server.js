const express = require('express');
const app = express();
const path = require('path');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
require('dotenv').config();

const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const MAX_ALLOWED_SESSION_DURATION = 14400;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKeySID = process.env.TWILIO_API_KEY_SID;
const twilioApiKeySecret = process.env.TWILIO_API_KEY_SECRET;


app.use(express.static(path.join(__dirname, 'build')));


app.get('/start', (req, res) => {
  const { phoneNumber } = req.query;
  client.verify.services(process.env.VERIFY_SERVICE_SID)
    .verifications
    .create({to: phoneNumber, 'channel': 'sms'})
    .then(verification => {
      console.log(`Started verification: '${verification.sid}'`);
      res.send(verification.sid);
    })
    .catch(err => {
      console.log(err);
      res.send('error');
    });
});

app.get('/check', (req, res) => {
  const { phoneNumber, otp } = req.query;
  client.verify.services(process.env.VERIFY_SERVICE_SID)
    .verificationChecks
    .create({ to: phoneNumber, code: otp })
    .then(check => {
      console.log(`Verification status: '${check.status}'`);
      res.send(check.status);
    })
    .catch((err) => {
      res.send('error');
    });
});


app.get('/token', (req, res) => {
  const { identity, roomName } = req.query;

  const token = new AccessToken(twilioAccountSid, twilioApiKeySID, twilioApiKeySecret, {
    ttl: MAX_ALLOWED_SESSION_DURATION,
  });
  token.identity = identity;
  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);
  res.send(token.toJwt());
  console.log(`issued token for ${identity} in room ${roomName}`);
});

app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'build/index.html')));

app.listen(8081, () => console.log('token server running on 8081'));
