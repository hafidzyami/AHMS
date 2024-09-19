import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
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
  const [age, setAge] = useState<any>(0);
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

  const handleSave = async () => {
    if (!fullName || !age || !gender || !height || !weight || !bmi) {
      alert("Please fill all the fields!");
      return;
    }
    try {
      await setDoc(doc(getFirestore(), "pasien", getAuth().currentUser!!.uid), {
        name: fullName,
        age: age,
        gender: gender,
        height: height,
        weight: weight,
        bmi: bmi,
      }).then(() => {
        alert("Berhasil Input Data Pasien!");
        router.replace("./condition");
      });
    } catch (error) {
      alert(error);
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
      });
      deleteDoc(
        doc(getFirestore(), "notif", "daftar")
      )
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
        setAge(data.age || "");
        setHeight(data.height || "");
        setWeight(data.weight || "");
        setGender(data.gender || "");
        setHasPatient(true);
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
    <View className="mt-8">
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
                <Text className="text-base">Fullname</Text>
                <TextInput
                  placeholder="name"
                  onChangeText={(text) => setFullName(text)}
                  value={fullName}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base">Age</Text>
                <TextInput
                  placeholder="age"
                  keyboardType="number-pad"
                  onChangeText={(text) => setAge(text)}
                  value={age}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base">Height (cm)</Text>
                <TextInput
                  placeholder="cm"
                  keyboardType="decimal-pad"
                  onChangeText={(text) => setHeight(text)}
                  value={height}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base">Weight (kg)</Text>
                <TextInput
                  placeholder="kg"
                  keyboardType="decimal-pad"
                  onChangeText={(text) => setWeight(text)}
                  value={weight}
                  className="text-base py-2 border-b-2 border-gray-400"
                />
              </View>
              <View>
                <Text className="text-base">BMI</Text>
                <TextInput
                  placeholder="Auto-generated, please fill Height and Weight"
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
    </View>
  );
};

export default patientdata;