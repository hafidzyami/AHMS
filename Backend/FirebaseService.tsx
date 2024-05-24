
import { initializeApp } from "firebase/app";
import { child, get, getDatabase, ref, set } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyB89VBU-mgv8RgUNxkXIG-TN5OkRpmPrOo",
  authDomain: "ahms-a493d.firebaseapp.com",
  projectId: "ahms-a493d",
  databaseURL: "https://ahms-a493d-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "ahms-a493d.appspot.com",
  messagingSenderId: "604557704284",
  appId: "1:604557704284:web:a3c615e4f207ebade67a99",
  measurementId: "G-RX4J4PHS5T"
};

// Initialize Firebase
export const _ = initializeApp(firebaseConfig);
const db = getDatabase();
const dbRef = ref(db);

export const saveToken = async(userId : string, token : string) => {
    const values = (await get(child(dbRef, `userTokens/${userId}`))).val() ?? {};
    const payload = {...values, token};
    set(ref(db, `userTokens/${userId}`), payload)
}

export const getToken = async(userId : string) => {
    const values = (await get(child(dbRef, `userTokens/${userId}`))).val()
    return values ?? {};
}
