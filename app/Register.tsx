import { View, Text, TextInput, Button, Pressable } from "react-native";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { router } from "expo-router";
import Checkbox from "expo-checkbox";
import { arrayUnion, doc, getFirestore, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH } from "../FirebaseConfig";

const RegisterScreen = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isChecked, setChecked] = useState(false);

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      await updateProfile(FIREBASE_AUTH.currentUser!!, {
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${name}&background=F8E800&color=fff&length=1`,
      });

      if (name.startsWith("dr. ")) {
        await setDoc(
          doc(getFirestore(), "dokter", FIREBASE_AUTH.currentUser!!.uid),
          {
            id: FIREBASE_AUTH.currentUser!!.uid,
            nama: FIREBASE_AUTH.currentUser!!.displayName,
            telepon: FIREBASE_AUTH.currentUser!!.phoneNumber,
            photoURL: FIREBASE_AUTH.currentUser!!.photoURL,
          }
        ).then(() => {
          alert("Berhasil daftar");
          router.replace("/(dokter)/");
        });
      } else {
        await setDoc(
          doc(getFirestore(), "paramedis", FIREBASE_AUTH.currentUser!!.uid),
          {
            id: FIREBASE_AUTH.currentUser!!.uid,
            nama: FIREBASE_AUTH.currentUser!!.displayName,
            telepon: FIREBASE_AUTH.currentUser!!.phoneNumber,
          }
        ).then(() => {
          alert("Berhasil daftar");
          router.replace("/(paramedis)/");
        });
      }
    } catch (err) {
      alert(err);
    }
  };

  const handleCheckBox = (newValue: boolean) => {
    setChecked(newValue);
    if (newValue) {
      setName("dr. " + name);
    } else {
      setName(name.substring(4));
    }
  };

  return (
    <View className="flex flex-col gap-y-20 ">
      <View className="flex flex-col gap-y-4">
        <View>
          <Text className="text-base">Fullname</Text>
          <TextInput
            placeholder="name"
            onChangeText={(text) => setName(text)}
            value={name}
            className="text-base py-2 border-b-2 border-gray-400"
          />
        </View>
        <View>
          <Text className="text-base">Email Address</Text>
          <TextInput
            placeholder="username@gmail.com"
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text)}
            value={email}
            className="text-base py-2 border-b-2 border-gray-400"
          />
        </View>
        <View>
          <Text className="text-base">Password</Text>
          <TextInput
            placeholder="********"
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
            className="text-base py-2 border-b-2 border-gray-400"
          />
        </View>
        <View className="flex flex-row gap-x-4 items-center">
          <Text className="text-base font-bold">Dokter?</Text>
          <Checkbox value={isChecked} onValueChange={handleCheckBox} />
        </View>
        <Pressable
          onPress={handleRegister}
          className="bg-[#70E2DF] py-4 flex items-center rounded-xl mt-12"
        >
          <Text className="text-lg text-textButton font-bold">Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default RegisterScreen;
