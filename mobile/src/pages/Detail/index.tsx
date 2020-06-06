import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, Text, SafeAreaView, Linking } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon, FontAwesome } from '@expo/vector-icons'
import * as MailComposer from 'expo-mail-composer';
import { AppLoading } from 'expo';

import api from '../../services/api'
import styles from './styles'

interface Data {
  id: 5,
  image: string,
  image_url: string,
  name: string,
  email: string,
  whatsapp: string,
  latitude: number,
  longitude: number,
  city: string,
  uf: string,
  items: {
      title: string
    }[]
}

interface Params {
  point_id: number
}

const Detail = () => {
  const navigation = useNavigation()
  const route = useRoute()
  
  const [data, setData] = useState<Data>({} as Data)
  
  const routeParams = route.params as Params

  useEffect( () => {
    api.get(`points/${routeParams.point_id}`).then( res => {
      setData(res.data)
    })
  })

  function handleNavigateBack () {
    navigation.goBack()
  }

  function handleWhatsapp () {
    Linking.openURL(`whatsapp://send?phone=${data.whatsapp}&text=Tenho interesse sobre a coleta de resíduos`)
  }

  function handleComposeMail () {
    MailComposer.composeAsync({
      subject: 'Interesse na coleta de resíduos',
      recipients: [data.email]
    })
  }

  if(!data.id) {
    return <AppLoading/>
  }

  return (
    <SafeAreaView style={{ flex: 1}}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" color="#34cb79" size={20}/>
        </TouchableOpacity>

        <Image 
          style={styles.pointImage} 
          source={{ uri: data.image_url }}
        />

        <Text style={styles.pointName}>{ data.name }</Text>
        <Text style={styles.pointItems}>
          { data.items.map( item => item.title ).join( ', ') }
        </Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>{data.city}, {data.uf} </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={ handleWhatsapp }>
          <FontAwesome name="whatsapp" color="#fff" size={20} />
          <Text style={styles.buttonText}>WhatAapp</Text>
        </RectButton>
        <RectButton style={styles.button} onPress={ handleComposeMail }>
          <FontAwesome name="envelope-o" color="#fff" size={19} />
          <Text style={styles.buttonText}>Email</Text>
        </RectButton>
      </View>
    </SafeAreaView>
  )
}

export default Detail