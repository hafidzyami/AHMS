import { View, Text, Button } from 'react-native'
import React from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { usePushNotifications } from '../../usePushNotifications'
const index = () => {
  const {expoPushToken, notification} = usePushNotifications();
  const data = JSON.stringify(notification, undefined, 2);
  console.log(expoPushToken?.data)
  return (
    <View>
      <Text>Dokter</Text>
      <Text>Token : {expoPushToken?.data ?? ""}</Text>
      <Text>{data}</Text>
      <Button title='sign out' onPress={() => signOut(getAuth())}></Button>
    </View>
  )
}

export default index