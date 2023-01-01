const models=require(__dirname +'/../models/index');
const { initializeApp, getApps } = require('firebase-admin/app');
var admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const dotenv = require('dotenv');
const { response } = require("express");
var serviceAccount = require("../location-tracker-cf504-firebase-adminsdk-s2kkm-bd532baeb7.json");
const { Op } = require("sequelize");
dotenv.config(); 
    createGroup = async(req, res) =>{
        const user= await models.User.findOne({where:{mobile_number:req.user.mobile_number}});
        const{participantId, location} = req.body;
        let groupName = user.id + '_' + participantId;
        const groupExist= await models.Group.findOne({attributes: ['id'],where:{group_name:groupName}});
        if(groupExist) {
            return res.json({"message": "Group already Created"});
        }
        let data = {
            group_name : groupName,
            status:0
        }
        const group= await models.Group.create(data);
        const participantUser= await models.User.findOne({where:{id:participantId}});
        let participantData = [{
            group_id : group.id,
            user_id : user.id
        },
        {
            group_id : group.id,
            user_id : participantUser.id
        }
    ];
        const participants= await models.Participants.bulkCreate(participantData);
        saveMessage(user.id, participantUser.id, location, group.id);
        const messageData = {
            from_id : user.id,
            to_id : participantUser.id,
            from_mobile : user.mobile_number,
            to_mobile : participantUser.mobile_number,
            from_location : location,
            group_id : group.id
        };
        const registrationToken = participantUser.device_token;
       const response2 = await sendMessage(messageData, registrationToken);
       let message = response2=='Success' ? 'Successfully sent Request' : 'Error Sending Request';
        res.json({"message" : message});
    };
    sendMessage = async(messageData, registrationToken) => {
        if ( !getApps().length ) {
            initializeApp({credential: admin.credential.cert(serviceAccount)});
        }
            msg = JSON.stringify( messageData);
        let message = {
            data : {
                msg
            },
            token: registrationToken
          };
        // Send a message to the device corresponding to the provided
        // registration token.
      const result = await getMessaging().send(message)
        .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
        return 'Success';
        })
        .catch((error) => {
        console.log('Error sending message:', error);
        return 'Error';
        }); 
        return result
    };
    saveMessage = (from, to, location, groupId) => {
        const message= models.Message.create({
            group_id : groupId,
            from : from,
            to: to,
            data : location,
            status : 1
        });
    };
    acceptRequest = async(req, res) => {
        const user= await models.User.findOne({where:{mobile_number:req.user.mobile_number}});
        const{participantId, location, groupId} = req.body;
        let groupName =  participantId+ '_' + user.id;
        const groupExist= await models.Group.findOne({where:{group_name:{[Op.eq]:groupName}, status:{[Op.eq]:1}}});
        if(groupExist) {
            return res.json({"message": "Group already Created"});
        }
        const group= await models.Group.findOne({where:{group_name:{[Op.eq]:groupName}, status:{[Op.eq]:0}}});
        group.status=1;
        await group.save();
        saveMessage(user.id, participantId, location, groupId);
        const participantUser= await models.User.findOne({where:{id:participantId}});
        const messageData = {
            from_id : user.id,
            to_id : participantUser.id,
            from_mobile : user.mobile_number,
            to_mobile : participantUser.mobile_number,
            from_location : location,
            group_id : groupId
        };
        const registrationToken = participantUser.device_token;
        const response2 = await sendMessage(messageData, registrationToken);
        let message = response2=='Success' ? 'Successfully accepted Request' : 'Error Accepting Request';
        res.json({"message" : message});
    };
    rejectRequest = async(req, res) => {
        const{ groupId} = req.body;
        const groupExist= await models.Group.findOne({attributes: ['id'],where:{id:groupId}});
        if(groupExist) {
            await models.Message.destroy({where:{group_id:groupId}});
            await models.Participants.destroy({where:{group_id:groupId}});
            await models.Group.destroy({where:{id:groupId}});
            return res.json({"message": "Request Rejected"});
        }
    };
    sendLocation = async(req, res) => {
        const user= await models.User.findOne({where:{mobile_number:req.user.mobile_number}});
        const{participantId, location, groupId} = req.body;
        const groupExist= await models.Group.findOne({attributes: ['id'],where:{id:groupId}});
        if (groupExist) {
            saveMessage(user.id, participantId, location, groupId);
            const participantUser= await models.User.findOne({where:{id:participantId}});
            const messageData = {
                from_id : user.id,
                to_id : participantUser.id,
                from_mobile : user.mobile_number,
                to_mobile : participantUser.mobile_number,
                from_location : location,
                group_id : groupId
            };
            const registrationToken = participantUser.device_token;
            const response2 = await sendMessage(messageData, registrationToken);
            let message = response2=='Success' ? 'Successfully Sent Data' : 'Error Sending Data';
            res.json({"message" : message});
        }
    };
    groupList = async(req, res) => {
        const user= await models.User.findOne({where:{mobile_number:req.user.mobile_number}});
        const participants= await models.Participants.findAll({attributes: ['group_id'],where:{user_id: {
            [Op.in]:[user.id]}}});
        let groups =  participants.map(function (item) {
            return item.group_id
        })
        const participants2= await models.Participants.findAll({attributes: ['user_id'],where:{group_id: {
                [Op.in]:[groups]}}});
        let users =  participants2.map(function (item) {
            return item.user_id
            });
        const allUsers= await models.User.findAll({attributes: ['id', 'mobile_number'], where:{id: {
            [Op.in]:[users]}}});    
        res.json({"participants" : allUsers});
    };
    uninstallApp = async(req, res) => {
        const user= await models.User.findOne({where:{mobile_number:req.user.mobile_number}});
        const group_ids= await models.Participants.findAll({attributes: ['group_id'],where:{user_id: {
            [Op.in]:[user.id]}}});
        let groups =  group_ids.map(function (item) {
            return item.group_id
        })    
        await models.Message.destroy({where:{group_id:{[Op.in]:groups}}});
        await models.Participants.destroy({where:{group_id:{[Op.in]:groups}}});
        await models.Group.destroy({where:{id:{[Op.in]:groups}}});
        return res.json({"message": "App Uninstalled successfully"});  
    };
    module.exports = {createGroup, sendMessage, acceptRequest, rejectRequest, sendLocation, groupList, uninstallApp};
