import express from "express";
import BodyParser from "body-parser";
import * as FirebaseService from "./FirebaseService"
import Expo from "expo-server-sdk";

const app = express();
const port = 8000;
const expo = new Expo();

const jsonParser = BodyParser.json();

app.post('/registerPushToken', jsonParser, async(req, res)=>{
    const userId = String(req.body.userId);
    const token = String(req.body.token);
    await FirebaseService.saveToken(userId, token);
    res.status(200).send("success");
})

app.post(`/sample`, jsonParser, async(_, res) => {
    expo.sendPushNotificationsAsync([
        {
            to : ["ExponentPushToken[tNKtAtJ1TG8P1KX0AIPc8z]", "ExponentPushToken[sq1UZBB8C5JYubZFRPRBFx]", "ExponentPushToken[7g-DWtOVu-QUq-exg_o3Ys]"],
            title : "Urgent Call from Paramedis",
            body : "Terdapat pasien darurat pada ambulans!",
        }
    ]);
    res.status(200).send("success")
})

app.listen(port, () => console.log(`running on port ${port}`))