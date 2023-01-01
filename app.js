const express = require('express')
const app = express()
const jwt=require('jsonwebtoken');
const { initializeApp } = require('firebase-admin/app');
var admin = require("firebase-admin");
// const functions = require("firebase-admin/functions");
const { getMessaging } = require("firebase-admin/messaging");
const models=require('./models/index');
const {registerUser, getUser}=require('./routes/users');
const {createGroup, acceptRequest, rejectRequest, sendLocation, groupList, uninstallApp}=require('./routes/messages');
var serviceAccount = require("./location-tracker-cf504-firebase-adminsdk-s2kkm-bd532baeb7.json");
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
const router= express.Router();
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader;
  console.log(token);

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, user) {
      console.log(err);

      if (err)
        return res.sendStatus(403);

      req.user = user;

      next();
    })
}
app.post('/auth/register',registerUser);
app.get('/users/getuser', authenticateToken, getUser);
app.post('/create_group', authenticateToken, createGroup);
app.post('/accept_request', authenticateToken, acceptRequest);
app.post('/reject_request', authenticateToken, rejectRequest);
app.post('/save_location', authenticateToken, sendLocation);
app.get('/list_groups', authenticateToken, groupList);
app.post('/uninstall', authenticateToken, uninstallApp);


app.listen(5000, ()=>{
    console.log("Listening on", 5000)
})