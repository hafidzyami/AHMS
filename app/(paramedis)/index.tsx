import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { router } from "expo-router";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../components/UIComponents";

const PatientDataFormScreen = () => {
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
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});

  // Generate random data for quick testing
  const firstNames = [
    "John",
    "Jane",
    "Alex",
    "Emily",
    "Chris",
    "Sarah",
    "Michael",
    "Emma",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Taylor",
    "Davis",
    "Miller",
    "Wilson",
  ];
  const genders = ["Male", "Female"];
  const getRandomElement = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)];
  const getRandomNumber = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const validateForm = () => {
    const errors: any = {};

    if (!nik) errors.nik = "NIK is required";
    if (!fullName) errors.fullName = "Full name is required";
    if (!age) errors.age = "Age is required";
    else if (isNaN(Number(age)) || Number(age) <= 0)
      errors.age = "Enter a valid age";

    if (!height) errors.height = "Height is required";
    else if (isNaN(Number(height)) || Number(height) <= 0)
      errors.height = "Enter a valid height";

    if (!weight) errors.weight = "Weight is required";
    else if (isNaN(Number(weight)) || Number(weight) <= 0)
      errors.weight = "Enter a valid weight";

    if (!gender) errors.gender = "Gender is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please correct the errors in the form.");
      return;
    }

    setSaveLoading(true);

    try {
      // Calculate BMI before saving
      const heightInMeters = parseFloat(height) / 100;
      const weightInKg = parseFloat(weight);
      const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(
        2
      );

      // Save data to Firebase
      await setDoc(doc(getFirestore(), "pasien", getAuth().currentUser!!.uid), {
        name: fullName,
        age: parseInt(age),
        gender: gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        bmi: parseFloat(bmiValue),
        nik: nik,
      });

      setBmi(bmiValue);
      setHasPatient(true);
      Alert.alert("Success", "Patient data has been saved successfully!");
    } catch (error) {
      console.error("Error saving patient data:", error);
      Alert.alert("Error", "Failed to save patient data. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Patient Data",
      "Are you sure you want to delete this patient data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleteLoading(true);
            try {
              await deleteDoc(
                doc(getFirestore(), "pasien", getAuth().currentUser!!.uid)
              );
              await deleteDoc(doc(getFirestore(), "notif", "daftar"));

              setHasPatient(false);
              setFullName("");
              setAge("");
              setHeight("");
              setWeight("");
              setGender("");
              setNik("");
              setBmi("");
              setFormErrors({});

              Alert.alert(
                "Success",
                "Patient data has been deleted successfully!"
              );
            } catch (error) {
              console.error("Error deleting patient data:", error);
              Alert.alert(
                "Error",
                "Failed to delete patient data. Please try again."
              );
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRandomData = () => {
    // Generate random values
    const randomFirstName = getRandomElement(firstNames);
    const randomLastName = getRandomElement(lastNames);
    const randomFullName = `${randomFirstName} ${randomLastName}`;
    const randomAge = getRandomNumber(18, 80);
    const randomGender = getRandomElement(genders);
    const randomHeight = getRandomNumber(150, 190);
    const randomWeight = getRandomNumber(50, 100);

    // Update state with random values
    setFullName(randomFullName);
    setAge(randomAge.toString());
    setGender(randomGender);
    setHeight(randomHeight.toString());
    setWeight(randomWeight.toString());

    // Generate random NIK if not already set
    if (!nik) {
      const randomNIK = Array(16)
        .fill(0)
        .map(() => Math.floor(Math.random() * 10))
        .join("");
      setNik(randomNIK);
    }

    // Clear any form errors
    setFormErrors({});
  };

  useEffect(() => {
    calculateBMI();
  }, [height, weight]);

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100; // converting cm to meters
      const weightInKg = parseFloat(weight);

      if (!isNaN(heightInMeters) && !isNaN(weightInKg) && heightInMeters > 0) {
        const bmiValue = (
          weightInKg /
          (heightInMeters * heightInMeters)
        ).toFixed(2);
        setBmi(bmiValue);
      } else {
        setBmi("");
      }
    } else {
      setBmi("");
    }
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const docRef = doc(getFirestore(), "pasien", getAuth().currentUser!!.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFullName(data.name || "");
        setAge(data.age ? data.age.toString() : "");
        setHeight(data.height ? data.height.toString() : "");
        setWeight(data.weight ? data.weight.toString() : "");
        setGender(data.gender || "");
        setNik(data.nik || "");
        setBmi(data.bmi ? data.bmi.toString() : "");
        setHasPatient(true);
      }
    } catch (error) {
      console.error("Error fetching document: ", error);
      Alert.alert("Error", "Failed to fetch patient data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(getAuth()),
      },
    ]);
  };

  const getBMICategory = () => {
    if (!bmi) return "";

    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue < 25) return "Normal";
    if (bmiValue < 30) return "Overweight";
    return "Obese";
  };

  const getBMIColor = () => {
    if (!bmi) return Colors.textSecondary;

    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return "#2196F3"; // Blue for underweight
    if (bmiValue < 25) return "#4CAF50"; // Green for normal
    if (bmiValue < 30) return "#FF9800"; // Orange for overweight
    return "#F44336"; // Red for obese
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.primary} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Patient Data</Text>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            <FontAwesome name="sign-out" size={24} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section with Logo */}
        <View style={styles.formHeader}>
          <View>
            <Text style={styles.formHeaderTitle}>
              {hasPatient ? "Edit Patient Data" : "Create Patient Data"}
            </Text>
            <Text style={styles.formHeaderSubtitle}>
              {hasPatient
                ? "View or update existing patient information"
                : "Fill in the patient information form"}
            </Text>
          </View>
          <Image
            source={require("../../assets/circle-logo.png")}
            style={styles.formLogo}
          />
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>Loading patient data...</Text>
            </View>
          ) : (
            <>
              {/* NIK Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NIK (National ID)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    formErrors.nik && styles.inputError,
                    hasPatient && styles.disabledInput,
                  ]}
                  placeholder="Enter 16-digit National ID"
                  value={nik}
                  onChangeText={(text) => {
                    setNik(text);
                    if (formErrors.nik) {
                      setFormErrors({ ...formErrors, nik: null });
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={16}
                  editable={!hasPatient}
                />
                {formErrors.nik && (
                  <Text style={styles.errorText}>{formErrors.nik}</Text>
                )}
              </View>

              {/* Full Name Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    formErrors.fullName && styles.inputError,
                    hasPatient && styles.disabledInput,
                  ]}
                  placeholder="Enter patient full name"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (formErrors.fullName) {
                      setFormErrors({ ...formErrors, fullName: null });
                    }
                  }}
                  editable={!hasPatient}
                />
                {formErrors.fullName && (
                  <Text style={styles.errorText}>{formErrors.fullName}</Text>
                )}
              </View>

              {/* Age Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    formErrors.age && styles.inputError,
                    hasPatient && styles.disabledInput,
                  ]}
                  placeholder="Enter age"
                  value={age}
                  onChangeText={(text) => {
                    setAge(text);
                    if (formErrors.age) {
                      setFormErrors({ ...formErrors, age: null });
                    }
                  }}
                  keyboardType="number-pad"
                  editable={!hasPatient}
                />
                {formErrors.age && (
                  <Text style={styles.errorText}>{formErrors.age}</Text>
                )}
              </View>

              {/* Gender Field */}
              <View style={[styles.inputGroup, open && { zIndex: 1000 }]}>
                <Text style={styles.inputLabel}>Gender</Text>
                {hasPatient ? (
                  <TextInput
                    style={[styles.textInput, styles.disabledInput]}
                    value={gender}
                    editable={false}
                  />
                ) : (
                  <DropDownPicker
                    open={open}
                    value={gender}
                    items={items}
                    setOpen={setOpen}
                    setValue={setGender}
                    setItems={setItems}
                    placeholder="Select gender"
                    style={[
                      styles.dropdownStyle,
                      formErrors.gender && styles.inputError,
                    ]}
                    dropDownContainerStyle={styles.dropdownContainer}
                    textStyle={styles.dropdownText}
                    onChangeValue={() => {
                      if (formErrors.gender) {
                        setFormErrors({ ...formErrors, gender: null });
                      }
                    }}
                  />
                )}
                {formErrors.gender && (
                  <Text style={styles.errorText}>{formErrors.gender}</Text>
                )}
              </View>

              {/* Height and Weight Section */}
              <View style={styles.rowContainer}>
                {/* Height Field */}
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      formErrors.height && styles.inputError,
                      hasPatient && styles.disabledInput,
                    ]}
                    placeholder="cm"
                    value={height}
                    onChangeText={(text) => {
                      setHeight(text);
                      if (formErrors.height) {
                        setFormErrors({ ...formErrors, height: null });
                      }
                    }}
                    keyboardType="decimal-pad"
                    editable={!hasPatient}
                  />
                  {formErrors.height && (
                    <Text style={styles.errorText}>{formErrors.height}</Text>
                  )}
                </View>

                {/* Weight Field */}
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      formErrors.weight && styles.inputError,
                      hasPatient && styles.disabledInput,
                    ]}
                    placeholder="kg"
                    value={weight}
                    onChangeText={(text) => {
                      setWeight(text);
                      if (formErrors.weight) {
                        setFormErrors({ ...formErrors, weight: null });
                      }
                    }}
                    keyboardType="decimal-pad"
                    editable={!hasPatient}
                  />
                  {formErrors.weight && (
                    <Text style={styles.errorText}>{formErrors.weight}</Text>
                  )}
                </View>
              </View>

              {/* BMI Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>BMI (Body Mass Index)</Text>
                <View style={styles.bmiContainer}>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.disabledInput,
                      { flex: 1 },
                    ]}
                    placeholder="Auto-calculated"
                    value={bmi}
                    editable={false}
                  />
                  {bmi && (
                    <View
                      style={[
                        styles.bmiCategoryBadge,
                        { backgroundColor: getBMIColor() + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.bmiCategoryText,
                          { color: getBMIColor() },
                        ]}
                      >
                        {getBMICategory()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Buttons Section */}
              <View style={styles.buttonsContainer}>
                {!hasPatient && (
                  <TouchableOpacity
                    style={styles.randomButton}
                    onPress={handleRandomData}
                  >
                    <Ionicons name="shuffle" size={16} color={Colors.white} />
                    <Text style={styles.randomButtonText}>Random Data</Text>
                  </TouchableOpacity>
                )}

                {hasPatient ? (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <MaterialIcons
                          name="delete"
                          size={16}
                          color={Colors.white}
                        />
                        <Text style={styles.buttonText}>Delete Data</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <>
                        <MaterialIcons
                          name="save"
                          size={16}
                          color={Colors.white}
                        />
                        <Text style={styles.buttonText}>Save Data</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryDark,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.accent,
  },
  signOutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 80, // Extra padding for bottom tabs
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    ...Shadows.medium,
  },
  formHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.accent,
    marginBottom: 4,
  },
  formHeaderSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    maxWidth: 200,
  },
  formLogo: {
    width: 70,
    height: 70,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.warning,
  },
  disabledInput: {
    backgroundColor: Colors.gray100,
    color: Colors.textSecondary,
  },
  errorText: {
    color: Colors.warning,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  dropdownStyle: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  bmiContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bmiCategoryBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  bmiCategoryText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  buttonsContainer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
  },
  deleteButton: {
    backgroundColor: Colors.warning,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
  },
  randomButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    ...Shadows.small,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  randomButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default PatientDataFormScreen;
