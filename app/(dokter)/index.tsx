import { View, Text, Button } from 'react-native'
import React from 'react'
import { signOut } from 'firebase/auth'
import { FIREBASE_AUTH } from '../../FirebaseConfig'

const index = () => {
  return (
    <View>
      <Text>index</Text>
      <Button
              title="Sign Out"
              onPress={() => signOut(FIREBASE_AUTH)}
            ></Button>
    </View>
  )
}

export default index