import React, { useState, useEffect } from "react";
import { View, Image, Text, ImageBackground, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { RectButton } from 'react-native-gesture-handler';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import { Feather as Icon } from "@expo/vector-icons";
import axios from "axios";

import styles from './styles'

interface IBGEUFResponse {
  id: number,
  sigla: string,
  nome: string,
  regiao: object 
}

interface IBGECityResponse {
  id: number,
  nome: string,
  microrregiao: {
    id: number,
    nome: String,
    mesorregiao: {
      id: number,
      nome: string,
      UF: {
        id: number,
        sigla: string,
        nome: string,
        regiao: object
      }
    } 
  }
}

interface UF {
  initial: string,
  name: string,
}

const Home = () => {
  const [ ufs, setUfs] = useState<UF[]>([])
  const [ cities, setCities] = useState<string[]>([])
  const [ ufSelected, setUfSelected] = useState('')
  const [ citySelected, setCitySelected] = useState('')
  const navigation = useNavigation()

  const [allCities, setAllCities] = useState<IBGECityResponse[]>([]) 

  useEffect( ()=>{
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then((res) => {
        const ufsResponse = res.data
          .map( uf => {
            return {
              name: uf.nome, 
              initial: uf.sigla,
            }
          })

        setUfs( ufsResponse )
      })

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios`)
      .then((res) => { 
        setAllCities ( res.data )
      })
  }, [])

  useEffect(()=>{
    if(ufSelected === '') return

    setCities([])

    const citiesList = allCities.filter( city => {
        if(city.microrregiao.mesorregiao.UF.sigla === ufSelected) 
          return String( city.nome)
      }).map(city => city.nome)

    setCities(citiesList)

    // axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`)
    //   .then((res) => {
    //     const citiesNames = res.data
    //       .map( city => city.nome)
        
    //     setCities( citiesNames )
    //   })
  }, [ufSelected])

  function handleNavigateToPoints(){
    if ( !ufSelected || ufSelected === '' || !citySelected || citySelected === '' ) return

    navigation.navigate('Points', { uf: ufSelected, city: citySelected})
  }

  return (
    <KeyboardAvoidingView style ={{ flex: 1}} behavior={ Platform.OS ? 'padding' : undefined}>
      <ImageBackground 
        source={require('../../assets/home-background.png')} 
        style={styles.container}
        imageStyle={{ width: 274, height: 368}}
        >
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')} />
          <View>
            <Text style={styles.title}>Seu marketplace de coleta de residuos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
          </View>
        </View>

        <View style={styles.footer}>
          
          <RNPickerSelect
            useNativeAndroidPickerStyle={false}
            style={ pickerSelectStyles }
            onValueChange={(value) => setUfSelected(value) }
            placeholder={{ label: 'Selecione a UF' }}
            items={ ufs.map(uf => {return {label: uf.name, value: uf.initial, key: uf.initial}} ) }
          />
          <RNPickerSelect
            useNativeAndroidPickerStyle={false}
            style={ pickerSelectStyles }
            onValueChange={(value) => setCitySelected(value) }
            placeholder={{ label: 'Selecione a Cidade ' }}
            items={ cities.map(city => {return {label: city, value: city, key: city}} ) }
          />
          <RectButton style={styles.button} onPress={ handleNavigateToPoints }>
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name="arrow-right" color="#FFF" size={24} />
              </Text>
            </View>
              <Text style={styles.buttonText}>Entrar</Text>
          </RectButton>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    backgroundColor: '#fff',
    height: 50,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    backgroundColor: '#fff',
    height: 50,
    fontSize: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default Home