import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ScrollView, Image, Alert } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import Map, { Marker } from 'react-native-maps'
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location'
import { Feather as Icon } from '@expo/vector-icons'
import Axios from 'axios';

import api from '../../services/api'
import styles from './styles'

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface Point {
  id: number,
  image: string,
  image_url: string,
  name: string,
  email:string,
  whatsapp:string,
  latitude: number,
  longitude: number,
  city:string,
  uf: string,
}

interface Params {
  uf: string,
  city: string,
}

const Points = () => {
  const navigation = useNavigation()
  const [items, setItems] = useState<Item[]>([])
  const [ points, setPoints] = useState<Point[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([1,2,3,4,5,6])
  const [ initialPosition, setInitialPosition] = useState<[number, number]>([0,0] )

  const route = useRoute()
  const routeParams = route.params as Params

  useEffect(() => {
    async function loadPosition(){
      const { status } = await Location.requestPermissionsAsync()

      if(status !== 'granted') {
        Alert.alert('Ooops', 'Precisamos de sua permissão para obter a localização atual.')
        return
      }

      const { latitude, longitude} = (await Location.getCurrentPositionAsync()).coords

      setInitialPosition([ latitude, longitude])
    }

    Axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${routeParams.city},${routeParams.uf}&key=4d62e6cefd9f42bfa11e438e7cd5e2aa&pretty=1&no_annotations=1`)
      .then( res => {
        if( res.data.total_results <= 3){
          const { lat, lng}  = res.data.results[0].geometry
          console.log({ lat, lng })
          setInitialPosition([ lat, lng])
          return
        }
        loadPosition()
      })
      .catch(()=>{
        loadPosition()
      })
      
  }, [])

  useEffect(() => {
    api.get('items').then((res)=>{
      setItems(res.data)
    })
  }, [])

  useEffect( () => {
    api.get('points', {
      params: {
        city: routeParams.city,
        uf: routeParams.uf,
        items: selectedItems
      }
    }).then((res) => {
      setPoints(res.data)
    })
  }, [selectedItems])

  function handleNavigateBack () {
    navigation.goBack()
  }

  function handleNavigateToDetail (id: number) {
    navigation.navigate('Detail', { point_id: id })
  }

  function handleSelectItem(id: number) {
    if(selectedItems.includes(id)){
      const filteredItems = selectedItems.filter( item => item !== id)
      setSelectedItems(filteredItems)
    }else{
      setSelectedItems([ ...selectedItems, id]) 
    }
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" color="#34cb79" size={20}/>
        </TouchableOpacity>

        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          { initialPosition[0] !== 0 && (
            <Map style={styles.map} initialRegion={{ 
              latitude: initialPosition[0],
              longitude: initialPosition[1],
              latitudeDelta: 0.028,
              longitudeDelta: 0.028,
            }}>
              { points.map( point => (
                <Marker 
                  key={ String(point.id) }
                  style={styles.mapMarker}
                  onPress={ () => handleNavigateToDetail(point.id) }
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image 
                      style={ styles.mapMarkerImage } 
                      source={{ uri: point.image_url }}
                    />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                </Marker>
              ))}
            </Map>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 32}}
        >
          
          { items.map(item => (
            <TouchableOpacity 
              key={String(item.id)} 
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : []
              ]} 
              onPress={ () => handleSelectItem(item.id) }
              activeOpacity={0.6}
            >
              <SvgUri width={42} height={32} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}

        </ScrollView>
      </View>
    </>
  )
}

export default Points