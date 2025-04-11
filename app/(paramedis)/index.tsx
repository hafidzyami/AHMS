import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { router } from "expo-router";

const patientdata = () => {
  const [fullName, setFullName] = useState<string>("");
  const [nik, setNik] = useState<any>("");
  const [age, setAge] = useState<any>("");
  const [gender, setGender] = useState<string>("");
  const [height, setHeight] = useState<any>("");
  const [weight, setWeight] = useState<any>("");
  const [bmi, setBmi] = useState<any>("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ]);

  const [loading, setLoading] = useState(true);
  const [hasPatient, setHasPatient] = useState(false);

  const firstNames = ["John", "Jane", "Alex", "Emily", "Chris"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Taylor"];
  const genders = ["Male", "Female"];
  const getRandomElement = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)];
  const getRandomNumber = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const handleSave = async () => {
    if (nik !== "") {
      // Generate random values and store them in local variables
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const randomFullName = `${firstName} ${lastName}`;
      const randomAge = getRandomNumber(18, 80);
      const randomGender = getRandomElement(genders);
      const randomHeight = getRandomNumber(140, 180);
      const randomWeight = getRandomNumber(50, 120);
      const bmi = randomWeight / (randomHeight / 100) ** 2;

      // Update state with random values
      if (fullName === "") {
        setFullName(randomFullName);
      }
      if (age === "") {
        setAge(randomAge.toString());
      }
      if (gender === "") {
        setGender(randomGender);
      }
      if (height === "") {
        setHeight(randomHeight.toString());
      }
      if (weight === "") {
        setWeight(randomWeight.toString());
      }
      try {
        // Save data to Firebase using the local variables
        await setDoc(
          doc(getFirestore(), "pasien", getAuth().currentUser!!.uid),
          {
            name: fullName || randomFullName,
            age: age || randomAge,
            gender: gender || randomGender,
            height: height || randomHeight,
            weight: weight || randomWeight,
            bmi: bmi,
            nik: nik,
          }
        ).then(() => {
          alert("Berhasil Input Data Pasien!");
          setHasPatient(true);
        });
      } catch (error) {
        alert(error);
      }
    } else {
      try {
        await setDoc(
          doc(getFirestore(), "pasien", getAuth().currentUser!!.uid),
          {
            name: fullName,
            age: age,
            gender: gender,
            height: height,
            weight: weight,
            bmi: bmi,
            nik: nik,
          }
        ).then(() => {
          alert("Berhasil Input Data Pasien!");
          // router.replace("./condition");
        });
      } catch (error) {
        alert(error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      deleteDoc(
        doc(getFirestore(), "pasien", getAuth().currentUser!!.uid)
      ).then(() => {
        alert("Berhasil Menghapus Data Pasien!");
        setHasPatient(false);
        setFullName("");
        setAge("");
        setHeight("");
        setWeight("");
        setGender("");
        setNik("");
      });
      deleteDoc(doc(getFirestore(), "notif", "daftar"));
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    calculateBMI();
  }, [height, weight]);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const docRef = doc(getFirestore(), "pasien", getAuth().currentUser!!.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFullName(data.name || "");
        setAge(data.age.toString() || "");
        setHeight(data.height.toString() || "");
        setWeight(data.weight.toString() || "");
        setGender(data.gender.toString() || "");
        setNik(data.nik || "");
        setHasPatient(true);
        console.log("data", data);
        console.log(data.height, data.weight, data.age);
        console.log("data hilang:", height, weight, age);
      }
    } catch (error) {
      console.error("Error fetching document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100; // converting cm to meters
      const weightInKg = parseFloat(weight);

      const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(
        2
      );
      setBmi(bmiValue);
    } else {
      setBmi("");
    }
  };

  return (
    <ScrollView className="mt-8 mb-16">
      <View className="mt-8 flex flex-row items-center justify-between px-7">
        <Text className="font-extrabold text-xl">Fill Patient Data</Text>
        <Image
          source={require("../../assets/circle-logo.png")}
          style={{ width: 80, height: 80 }}
        ></Image>
      </View>
      <View className=" px-7 gap-5">
        {loading === true ? (
          <ActivityIndicator size="large" color="#70E2DF" />
        ) : (
          <View>
            <View className="gap-5">
              <View>
                <Text className="text-base font-bold">NIK</Text>
                <TextInput
                  placeholder="NIK"
                  keyboardType="number-pad"
                  onChangeText={(text) => setNik(text)}
                  value={nik}
                  editable={hasPatient === false}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base font-bold">Fullname</Text>
                <TextInput
                  placeholder="name"
                  onChangeText={(text) => setFullName(text)}
                  value={fullName}
                  editable={hasPatient === false}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base font-bold">Age</Text>
                <TextInput
                  placeholder="age"
                  keyboardType="number-pad"
                  onChangeText={(text) => setAge(text)}
                  value={age}
                  editable={hasPatient === false}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base font-bold">Height (cm)</Text>
                <TextInput
                  placeholder="cm"
                  keyboardType="decimal-pad"
                  onChangeText={(text) => setHeight(text)}
                  value={height}
                  editable={hasPatient === false}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base font-bold">Weight (kg)</Text>
                <TextInput
                  placeholder="kg"
                  keyboardType="decimal-pad"
                  onChangeText={(text) => setWeight(text)}
                  value={weight}
                  editable={hasPatient === false}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base font-bold">BMI</Text>
                <TextInput
                  placeholder="Auto-generated"
                  editable={false}
                  value={bmi}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base mb-2">Gender</Text>
                <DropDownPicker
                  placeholder="Choose Gender!"
                  open={open}
                  value={gender}
                  items={items}
                  setOpen={setOpen}
                  setValue={setGender}
                  setItems={setItems}
                  zIndex={1000}
                  zIndexInverse={1000}
                />
              </View>
            </View>
            <View className="px-7 mt-8">
              {hasPatient === true ? (
                <TouchableOpacity
                  onPress={handleDelete}
                  className="bg-red-500 py-4 flex items-center rounded-xl"
                >
                  <Text className="text-textButton font-bold">Delete</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-[#70E2DF] py-4 flex items-center rounded-xl"
                >
                  <Text className="text-textButton font-bold">Save</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default patientdata;
