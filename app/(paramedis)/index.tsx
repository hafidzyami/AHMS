import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import DropDownPicker from "react-native-dropdown-picker";

const patientdata = () => {
  const [fullName, setFullName] = useState<string>("");
  const [age, setAge] = useState<any>(0);
  const [gender, setGender] = useState<string>("");
  const [height, setHeight] = useState<any>();
  const [weight, setWeight] = useState<any>();
  const [bmi, setBmi] = useState<any>();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ]);

  useEffect(() => {
    calculateBMI();
  }, [height, weight]);

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
        <TouchableOpacity
          onPress={() => {}}
          className="bg-[#70E2DF] py-4 flex items-center rounded-xl"
        >
          <Text className="text-textButton font-bold">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default patientdata;
