import React, { Fragment, useCallback, useState, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { usePapaParse } from 'react-papaparse'
import { Typography } from '@mui/material'
import { each, groupBy, first, isUndefined, uniqBy } from 'lodash'

import CSVDownloaderComponent from './CSVDownloaderComponent'
import { colegios } from '../Static/Colegios'

const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderRadius: 3,
  borderColor: '#748d9a',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  transition: 'border .15s ease-in-out',
  width: '90vw',
  height: '8vh',
  margin: '0 auto',
  marginBottom: '1rem'
}

const handlePossibleResults = (element, candidatura) => element.length > 1 ? element.map(e => e[candidatura]).reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)[candidatura])

const aggregateResults = element => {
  const resObject = { distcode: Number(first(element).coddist) }
  const propertyNameToColumnNames = {
    censo: 'Censo Total',
    votos_validos: 'Votos Electores',
    votos_blancos: 'Votos Blancos',
    votos_nulos: 'Votos Nulos',
    adelante: 'ADELANTE ANDALUCÍA-ANDALUCISTAS',
    levantaos: 'AL',
    crsxa: 'CRSxA',
    cs: 'Cs',
    escanos_blanco: 'ESCAÑOS EN BLANCO',
    falange: 'FE de las JONS',
    basta_ya: 'Federación BASTA YA!',
    izar: 'IZAR',
    jmm: 'JM+',
    jub_futuro: 'JUFUDI',
    jxg: 'JxG',
    verdes: 'LOS VERDES',
    nacion_andaluza: 'N.A.',
    pacma: 'PACMA',
    autonomos: 'PARTIDO AUTÓNOMOS',
    pcpa: 'PCPA',
    pcte: 'PCTE',
    por_andalucia: 'PorA',
    pp: 'PP',
    psoe: 'PSOE-A',
    pumj: 'PUM+J',
    rec_cero: 'RECORTES CERO',
    rec_ipal: 'RECORTES CERO-IPAL',
    rec_izqp: 'RECORTES CERO - IZQP',
    rec_jv: 'RECORTES CERO-JV',
    somos_futuro: 'SOMOS FUTURO',
    volt: 'VOLT',
    vox: 'VOX'
  }
  
  each(Object.entries(propertyNameToColumnNames), keyValuePair => {
    resObject[keyValuePair[0]] = handlePossibleResults(element, keyValuePair[1])
  })
  
  resObject.participacion = Number((((resObject.votos_validos + resObject.votos_blancos) / resObject.censo)*100).toFixed(2)) 
  
  for (const key in resObject) {
    if (isNaN(resObject[key])) {
      resObject[key] = 0
    }
  }
  
  return resObject
}

const activeStyle = { borderColor: '#2196f3' }
const acceptStyle = { borderColor: '#00e676' }
const rejectStyle = { borderColor: '#ff1744' }

const MesasComponent = props => {
  
  const [distritoData, setDistritoData] = useState([])
  const [colegioData, setColegioData] = useState([])
  
  const { readString } = usePapaParse()
  
  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader()
      
      reader.onabort = () => console.log('File reading aborted')
      reader.onerror = () => console.log('File reading failed')
      
      reader.onload = () => {
        const fileAsText = reader.result
        
        readString(fileAsText, {
          worker: true,
          skipEmptyLines: true,
          encoding: 'utf-8',
          header: true,
          
          complete: results => {
            let baseData = results.data
            
            let grxData = baseData.filter(v => v.Codmun === '87').map(element => {
              element.codcolegio = element.Mesa.substring(0,5)
              element.coddist = element.Mesa.substring(0,1)
              return element
            })
            
            let dataByDistrito = groupBy(grxData, 'coddist')
            let tempDistritoData = []
            each(dataByDistrito, distrito => tempDistritoData.push(aggregateResults(distrito)))
            setDistritoData(tempDistritoData)
            
            
            const aggregateMesas = (mesas, colegio) => {
              let sumOfMesas = aggregateResults(mesas)
              let tempObject = {
                id: colegio.id,
                colegio: colegio.nombre,
                direccion: colegio.direccion,
                lat: colegio.lat,
                lng: colegio.lng,
                distcode: sumOfMesas.distcode,
                censo: sumOfMesas.censo,
                participacion: sumOfMesas.participacion,
                pp: sumOfMesas.pp,
                psoe: sumOfMesas.psoe,
                vox: sumOfMesas.vox,
                por_andalucia: sumOfMesas.por_andalucia,
                adelante: sumOfMesas.adelante,
                cs: sumOfMesas.cs,
                autonomos: sumOfMesas.autonomos,
                basta_ya: sumOfMesas.basta_ya,
                crsxa: sumOfMesas.crsxa,
                escanos_blanco: sumOfMesas.escanos_blanco,
                falange: sumOfMesas.falange,
                izar: sumOfMesas.izar,
                jmm: sumOfMesas.jmm,
                jub_futuro: sumOfMesas.jub_futuro,
                jxg: sumOfMesas.jxg,
                verdes: sumOfMesas.verdes,
                levantaos: sumOfMesas.levantaos,
                nacion_andaluza: sumOfMesas.nacion_andaluza,
                pacma: sumOfMesas.pacma,
                pcpa: sumOfMesas.pcpa,
                pcte: sumOfMesas.pcte,
                pumj: sumOfMesas.pumj,
                rec_cero: sumOfMesas.rec_cero,
                rec_ipal: sumOfMesas.rec_ipal,
                rec_jv: sumOfMesas.rec_jv,
                somos_futuro: sumOfMesas.somos_futuro,
                volt: sumOfMesas.volt
              }
              
              return tempObject
            }
            
            const tempColegioData = []
            each(uniqBy(colegios, 'nombre'), colegio => {
              let mesas = grxData.filter(e => e.codcolegio === colegio.id)
              if (!isUndefined(mesas) && mesas.length) {
                tempColegioData.push(aggregateMesas(mesas, colegio))
              }
            })
            setColegioData(tempColegioData)
            
          }
        })
      }
      reader.readAsText(file)
    })
  }, [readString])
  
  const { getRootProps, getInputProps, isDragAccept, isDragActive, isDragReject } = useDropzone({ onDrop })
  
  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [isDragActive, isDragReject, isDragAccept])
  
  
  return (
    <Fragment>
    <div {...getRootProps({style})}>
    <input {...getInputProps()} />
    <Typography variant="h6">Suelta el archivo o pincha para subir</Typography>
    </div>
    {
      distritoData.length > 0 ?
      <CSVDownloaderComponent data={distritoData} buttonText={'Datos por distritos'} fileName={'datos_distritos'} />
      : null
    }
    {
      colegioData.length > 0 ? 
      <div style={{ marginTop: '1rem' }}>
      <CSVDownloaderComponent data={colegioData} buttonText={'Datos por colegios'} fileName={'datos_colegios'} />
      </div>
      : null
    }
    </Fragment>
    )
    
  }
  
  export default MesasComponent
  