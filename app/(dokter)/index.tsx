import { View, Text, Button } from 'react-native'
import React from 'react'
import { getAuth, signOut } from 'firebase/auth'

const index = () => {
  return (
    <View>
      <Text>Dokter</Text>
      <Button title='sign out' onPress={() => signOut(getAuth())}></Button>

    </View>
  )
}

export default index