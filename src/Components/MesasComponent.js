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

const aggregateResults = element => {
  let tempObject = {
    distcode: element.length > 1 ? Number(first(element).coddist) : element.coddist,
    censo: element.length > 1 ? element.map(e => e['Censo Total']).reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['Censo Total']),
    votos_validos: element.length > 1 ? element.map(e => e['Votos Electores']).reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['Votos Electores']),
    votos_blancos: element.length > 1 ? element.map(e => e['Votos Blancos']).reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['Votos Blancos']),
    votos_nulos: element.length > 1 ? element.map(e => e['Votos Nulos']).reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['Votos Nulos']),
    adelante: element.length > 1 ? element.map(e => e['ADELANTE ANDALUCÍA-ANDALUCISTAS'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['ADELANTE ANDALUCÍA-ANDALUCISTAS']),
    levantaos: element.length > 1 ? element.map(e => e['AL'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['AL']),
    crsxa: element.length > 1 ? element.map(e => e['CRSxA'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['CRSxA']),
    cs: element.length > 1 ? element.map(e => e['Cs'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['Cs']),
    escanos_blanco: element.length > 1 ? element.map(e => e['ESCAÑOS EN BLANCO'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['ESCAÑOS EN BLANCO']),
    falange: element.length > 1 ? element.map(e => e['FE de las JONS'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['FE de las JONS']),
    basta_ya: element.length > 1 ? element.map(e => e['Federación BASTA YA!'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['Federación BASTA YA!']),
    izar: element.length > 1 ? element.map(e => e['IZAR'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['IZAR']),
    jmm: element.length > 1 ? element.map(e => e['JM+'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['JM+']),
    jub_futuro: element.length > 1 ? element.map(e => e['JUFUDI'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['JUFUDI']),
    jxg: element.length > 1 ? element.map(e => e['LOS VERDES'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['LOS VERDES']),
    nacion_andaluza: element.length > 1 ? element.map(e => e['N.A.'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['N.A.']),
    pacma: element.length > 1 ? element.map(e => e['PACMA'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['PACMA']),
    autonomos: element.length > 1 ? element.map(e => e['PARTIDO AUTÓNOMOS'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['PARTIDO AUTÓNOMOS']),
    pcpa: element.length > 1 ? element.map(e => e['PCPA'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['PCPA']),
    pcte: element.length > 1 ? element.map(e => e['PCTE'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['PCTE']),
    por_andalucia: element.length > 1 ? element.map(e => e['PorA'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['PorA']),
    pp: element.length > 1 ? element.map(e => e['PP'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['PP']),
    psoe: element.length > 1 ? element.map(e => e['PSOE-A'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['PSOE-A']),
    pumj: element.length > 1 ? element.map(e => e['PUM+J'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['PUM+J']),
    rec_cero: element.length > 1 ? element.map(e => e['RECORTES CERO'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['RECORTES CERO']),
    rec_ipal: element.length > 1 ? element.map(e => e['RECORTES CERO-IPAL'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['RECORTES CERO-IPAL']),
    rec_izqp: element.length > 1 ? element.map(e => e['RECORTES CERO - IZQP'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['RECORTES CERO - IZQP']),
    rec_jv: element.length > 1 ? element.map(e => e['RECORTES CERO-JV'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['RECORTES CERO-JV']),
    somos_futuro: element.length > 1 ? element.map(e => e['SOMOS FUTURO'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['SOMOS FUTURO']),
    volt: element.length > 1 ? element.map(e => e['VOLT'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['VOLT']),
    vox: element.length > 1 ? element.map(e => e['VOX'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['VOX']),
    // por_huelva: element.length > 1 ? element.map(e => e['XH'])?.reduce((prev, curr) => Number(prev) + Number(curr), 0) : Number(first(element)['XH'])
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


            const aggregateMesas = (mesas, colegio) => {
              let sumOfMesas = aggregateResults(mesas)
              let tempObject = {
                id: colegio.id,
                colegio: colegio.nombre,
                direccion: colegio.direccion,
                lat: colegio.lat,
                lng: colegio.lng,
                // distcode: sumOfMesas.distcode,
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
              // console.log(colegio)
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
  