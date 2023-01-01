const models=require(__dirname +'/../models/index');
const dotenv = require('dotenv');
dotenv.config();
const jwt=require('jsonwebtoken');
const refreshTokens=[];
module.exports={
    registerUser:async (req,res)=>{
        let refreshToken,accessToken;
        const {mobile_number, device_id, device_os, brand_name, date_of_birth, downloaded_from, app_version, device_token}=req.body;
        console.log(req.body);
        const user= await models.User.findOne({where:{mobile_number:mobile_number}});
        if (user) {
            res.send({error:'User already exists'})
        }
        else {
            accessToken=jwt.sign({mobile_number},process.env.ACCESS_TOKEN_SECRET);
            refreshToken=jwt.sign({mobile_number},process.env.REFRESH_TOKEN_SECRET);
            data ={
                mobile_number:mobile_number,
                device_id:device_id,
                access_token:accessToken,
                device_os:device_os,
                brand_name:brand_name,
                status:'Active',
                date_of_birth:date_of_birth,
                downloaded_from:downloaded_from,
                app_version:app_version,
                refresh_token:refreshToken,
                device_token:device_token
            }
            const result= await models.User.create(data);
            res.json(result);
        }
    },
    getUser:async(req, res)=>{
        // console.log(req.user);
        const user= await models.User.findOne({where:{mobile_number:req.user.mobile_number}});
        res.json(user);
    }
    // loginUser:async(req,res)=>{
    //     const {email,password}=req.body;
    //     let userData={};
    //     let refreshToken,accessToken;
    //     const user=await models.User.findOne({where:{email:email}}).then(async(user)=>{
    //         if (user) {
    //             if (await user.validPassword(password)) {
    //                 userData=user;
    //                  accessToken=jwt.sign({email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1m'});
    //                  refreshToken=jwt.sign({email},process.env.REFRESH_TOKEN_SECRET);
    //                 const result=user.update({access_token:accessToken,refresh_token:refreshToken},{
    //                     where:{
    //                         email:email
    //                     }
    //                 })
    //             }
    //             else {
    //                 userData={'error':'Invalid Credentials'}
    //             }
    //         }
    //         else {
    //             userData={'error':'Invalid Credentials'}
    //         }
    //     });
    //     if(!userData.hasOwnProperty('error')) {
    //         refreshTokens.push(refreshToken)
    //         res.status(200).json({
    //             accessToken,
    //             refreshToken,
    //             userData
    //         });
    //     }
    //     else {
    //         res.send('Invalid user')
    //     }
    // }
};