import React, { Fragment, useCallback, useState, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { usePapaParse } from 'react-papaparse'
import { Typography } from '@mui/material'
import { each, groupBy, first } from 'lodash'

import CSVDownloaderComponent from './CSVDownloaderComponent'

const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 4,
  borderRadius: 1,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  transition: 'border .15s ease-in-out',
  width: '85vw',
  height: '15vh',
  margin: '0 auto',
  marginBottom: '1rem'
}

const aggregateResults = element => {
  let tempObject = {
    distcode: Number(first(element).coddist),
    censo: element.map(e => e['Censo Total']).reduce((prev, curr) => Number(prev) + Number(curr), 0),
    votos_validos: element.map(e => e['Votos Electores']).reduce((prev, curr) => Number(prev) + Number(curr), 0),
    votos_blancos: element.map(e => e['Votos Blancos']).reduce((prev, curr) => Number(prev) + Number(curr), 0),
    votos_nulos: element.map(e => e['Votos Nulos']).reduce((prev, curr) => Number(prev) + Number(curr), 0),
    adelante: element.map(e => e['ADELANTE ANDALUCÍA-ANDALUCISTAS'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    levantaos: element.map(e => e['AL'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    crsxa: element.map(e => e['CRSxA'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    cs: element.map(e => e['Cs'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    escanos_blanco: element.map(e => e['ESCAÑOS EN BLANCO'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    falange: element.map(e => e['FE de las JONS'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    basta_ya: element.map(e => e['Federación BASTA YA!'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    izar: element.map(e => e['IZAR'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    jmm: element.map(e => e['JM+'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    jub_futuro: element.map(e => e['JUFUDI'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    jxg: element.map(e => e['LOS VERDES'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    nacion_andaluza: element.map(e => e['N.A.'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    pacma: element.map(e => e['PACMA'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    autonomos: element.map(e => e['PARTIDO AUTÓNOMOS'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    pcpa: element.map(e => e['PCPA'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    pcte: element.map(e => e['PCTE'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    por_andalucia: element.map(e => e['PorA'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    pp: element.map(e => e['PP'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    psoe: element.map(e => e['PSOE-A'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    pumj: element.map(e => e['PUM+J'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    rec_cero: element.map(e => e['RECORTES CERO'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    rec_ipal: element.map(e => e['RECORTES CERO-IPAL'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    rec_izqp: element.map(e => e['RECORTES CERO - IZQP'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    rec_jv: element.map(e => e['RECORTES CERO-JV'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    somos_futuro: element.map(e => e['SOMOS FUTURO'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    volt: element.map(e => e['VOLT'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    vox: element.map(e => e['VOX'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0),
    por_huelva: element.map(e => e['XH'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0)
  }
  
  tempObject.participacion = Number((((tempObject.votos_validos + tempObject.votos_blancos) / tempObject.censo)*100).toFixed(2)) 
  
  for (const key in tempObject) {
    if (isNaN(tempObject[key])) {
      tempObject[key] = 0
    }
  }
  
  return tempObject
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
            
            let dataByColegio = groupBy(grxData, 'codcolegio')
            let tempColegioData = []
            each(dataByColegio, colegio => {
              let colegioObject = aggregateResults(colegio)
              colegioObject.cod_colegio = first(colegio).codcolegio
              tempColegioData.push(colegioObject)
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
    <Typography variant="h4">Suelta el archivo o pincha para subir</Typography>
    </div>
    {
      distritoData.length > 0 ?
      <CSVDownloaderComponent data={distritoData} buttonText={'Descargar datos por distritos'} fileName={'datos_distritos'} />
      : null
    }
    {
      colegioData.length > 0 ? 
      <div>
      <hr></hr>
      <CSVDownloaderComponent data={colegioData} buttonText={'Descargar datos por colegios'} fileName={'datos_colegios'} />
      </div>
      : null
    }
    </Fragment>
    )
    
  }
  
  export default MesasComponent
  