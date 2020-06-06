import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import axios from 'axios'
import api from '../../services/api'

import './styles.css'
import logo from '../../assets/logo.svg'
import Dropzone from '../../components/Dropzone'

interface Item {
  id: number,
  title: string,
  image_url: string
}

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

const CreatePoint = () => {
  const history = useHistory()
  const [items, setItems] = useState<Item[]>([])
  const [ formData, setFormData ]= useState({
    name: '',
    email: '',
    whatsapp: ''
  })
  const [ufs, setUfs] = useState<UF[]>([])
  const [selectedUf, setSelectedUf] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [ initialPosition, setInitialPosition ] = useState<[number, number]>([-5.0905305, -42.8079749])
  const [ selectedPosition, setSelectedPosition ] = useState<[number, number]>([0,0])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [ selectedFile, setSelectedFile] = useState<File>()

  const [allCities, setAllCities] = useState<IBGECityResponse[]>([]) 

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition( position => {
      const { latitude, longitude } = position.coords

      setInitialPosition([latitude, longitude])
    } )
  }, [])

  useEffect(() => {
    api.get('items').then((res)=>{
      setItems(res.data)
    })
  }, [])

  useEffect( ()=>{
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then((res) => {
        const ufsResponse = res.data
          .map( uf => {
            return {
              initial: uf.sigla, 
              name: uf.nome
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
    if(selectedUf === '') return

    setCities([])

    const citiesList = allCities.filter( (city) => {
        if(city.microrregiao.mesorregiao.UF.sigla === selectedUf) 
          return String( city.nome)
        return undefined
      }).map(city => city.nome)

    console.log(citiesList)
    setCities(citiesList)

    // axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`)
    //   .then((res) => {
    //     const citiesNames = res.data
    //       .map( city => city.nome)
        
    //     setCities( citiesNames )
    //   })
  }, [selectedUf, allCities])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement> ){
    const uf = event.target.value

    setSelectedUf(uf)
  }

  function handleSelectcity(event: ChangeEvent<HTMLSelectElement> ){
    const city = event.target.value

    setSelectedCity(city)
  }

  function handleMapClick (event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat, 
      event.latlng.lng
    ])
  }

  function handleInputChange (event: ChangeEvent<HTMLInputElement>){
    const {name, value} = event.target
    setFormData({...formData, [name]: value })
  }

  function handleSelectItem(id:number) {
    if(selectedItems.includes(id)){
      const filteredItems = selectedItems.filter( item => item !== id)
      setSelectedItems(filteredItems)
    }else{
      setSelectedItems([ ...selectedItems, id]) 
    }
  }

   async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const { name, email, whatsapp } = formData
    const uf = selectedUf
    const city = selectedCity
    const [ latitude, longitude ] = selectedPosition
    const items = selectedItems

    const data = new FormData()

    data.append( 'name', name)
    data.append( 'email', email)
    data.append( 'whatsapp', whatsapp)
    data.append( 'uf', uf)
    data.append( 'city', city)
    data.append( 'latitude', String(latitude))
    data.append( 'longitude', String(longitude))
    data.append( 'items', items.join(','))

    if (selectedFile)
      data.append( 'image', selectedFile)

    await api.post('points', data)

    alert('Ponto de coleta criado com sucesso!')
    history.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft/>
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

        <Dropzone onFileUploaded={(file: File) => setSelectedFile(file)}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            {/* <label htmlFor="name">Nome da entidade</label> */}
            <input type="text" name="name" id="name" placeholder="Nome da entidade" onChange={handleInputChange}/>
          </div>

          <div className="field-group">
            <div className="field">
              {/* <label htmlFor="email">E-mail</label> */}
              <input type="email" name="email" id="email"placeholder="E-mail" onChange={handleInputChange}/>
            </div>
            <div className="field">
              {/* <label htmlFor="whatsapp">Whatsapp</label> */}
              <input type="text" name="whatsapp" id="whatsapp" placeholder="WhatsApp" onChange={handleInputChange}/>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço do mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={ handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                <option value="" hidden>UF</option>
                { ufs.map(uf => <option key={uf.initial} value={uf.initial}>{uf.name}</option> )}
              </select>
            </div>

            <div className="field">
              <select name="city" id="city" value={selectedCity} onChange={handleSelectcity} >
                <option value="" hidden>Cidade</option>
                { cities.map(city => <option key={city} value={city}>{city}</option> )}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            { items.map(item => {
              return (
                <li 
                  key={item.id} 
                  onClick={ () => handleSelectItem(item.id) }
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                >
                  <img src={ item.image_url } alt={item.title}/>
                  <span>{item.title}</span>
                </li>
              )
            })}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar Ponto de Coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint