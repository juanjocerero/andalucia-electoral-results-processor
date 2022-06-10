import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { usePapaParse } from 'react-papaparse'
import { Typography, Checkbox, FormGroup, FormControlLabel } from '@mui/material'

import CSVDownloaderComponent from './CSVDownloaderComponent'

/**
* ids de columnas:
* Código de municipio: 4
* Nombre de municipio: 6
* Código de la primera candidatura: 21
* Porcentaje de la primera candidatura: 24 (Partir por 100)
* [21, 24, 25, 28, 29, 32, 33, 36, 37, 40, 41, 44, 45, 48, 49, 52, 53, 56, 57, 60, 61, 64, 65, 68, 69, 72, 73, 76, 77, 80, 81, 84, 85, 88, 89, 92, 93, 96, 97]
*/

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
  height: '25vh',
  margin: '0 auto',
  marginBottom: '1rem'
}

const activeStyle = { borderColor: '#2196f3' }

const acceptStyle = { borderColor: '#00e676' }

const rejectStyle = { borderColor: '#ff1744' }

const handleBaseData = data => {
  
  const mappedData = data.map(e => {
    
    let tempObject = {
      codmun: e[4], mun: e[6].trim(),
      ids: [e[21], e[25], e[29], e[33], e[37], e[41], e[45], e[49], e[53], e[57], e[61], e[65], e[69], e[73], e[77], e[81], e[85], e[89], e[93], e[97]],
      percs: [e[24], e[28], e[32], e[36], e[40], e[44], e[48], e[52], e[56], e[60], e[64], e[68], e[72], e[76], e[80], e[84], e[88], e[92], e[96]]
    }
    
    return tempObject
    
  })
  
  return mappedData
}

function DropzoneComponent(props) {
  
  const [downloadData, setDownloadData] = useState(null)
  const [jaenChecked, setJaenChecked] = useState(true)
  const [fullReportChecked, setFullReportChecked] = useState(true)
  
  const handleJaenCheckbox = event => {
    setJaenChecked(event.target.checked)
  }
  
  const handleFullReportCheckbox = event => {
    setFullReportChecked(event.target.checked)
  }
  
  const { readString } = usePapaParse()

  // Very gypsy
  useEffect(() => {
    setJaenChecked(false)
    setFullReportChecked(false)
  }, [])
  
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
          
          complete: results => {
            
            setDownloadData(handleBaseData(results.data).map(element => {

              const finalObject = {
                codmun: element.codmun, 
                mun: element.mun, 
                psoe: null, 
                pp: null, 
                vox: null, 
                porand: null, 
                adelante: null, 
                cs: null,
              }
              
              finalObject.pp = Number((Number(element.percs[element.ids.indexOf("0020")])/100).toFixed(2)).toLocaleString('es-ES')
              finalObject.psoe = Number((Number(element.percs[element.ids.indexOf("0021")])/100).toFixed(2)).toLocaleString('es-ES')
              finalObject.vox = Number((Number(element.percs[element.ids.indexOf("0029")])/100).toFixed(2)).toLocaleString('es-ES')
              finalObject.porand = Number((Number(element.percs[element.ids.indexOf("0019")])/100).toFixed(2)).toLocaleString('es-ES')
              finalObject.adelante = Number((Number(element.percs[element.ids.indexOf("0001")])/100).toFixed(2)).toLocaleString('es-ES')
              finalObject.cs = Number((Number(element.percs[element.ids.indexOf("0004")])/100).toFixed(2)).toLocaleString('es-ES')
              
              if (jaenChecked) {
                finalObject.jmm = Number((Number(element.percs[element.ids.indexOf("0010")])/100).toFixed(2)).toLocaleString('es-ES');
              }
          
              if (fullReportChecked) {
                // TODO: implementar el resto de candidaturas
              }
              
              return finalObject
            }));
            
          }
        })
        
      }
      reader.readAsText(file)
    })
    
  }, [readString, jaenChecked, fullReportChecked])
  
  const { 
    getRootProps, 
    getInputProps, 
    isDragAccept, 
    isDragActive, 
    isDragReject 
  } = useDropzone({ onDrop })
  
  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [isDragActive, isDragReject, isDragAccept])
  
  return (
    <div>
    
    <FormGroup>
    <FormControlLabel 
    control={<Checkbox checked={jaenChecked} onChange={handleJaenCheckbox} />} 
    label="Incluir Jaén Merece Más" 
    sx={{ '& .MuiSvgIcon-root': { fontSize: 32 } }} />
    
    <FormControlLabel 
    control={<Checkbox checked={fullReportChecked} onChange={handleFullReportCheckbox} />} 
    label="Incluir datos de todas las candidaturas" 
    sx={{ '& .MuiSvgIcon-root': { fontSize: 32 } }} />
    
    </FormGroup>
    
    <div {...getRootProps({style})}>
    <input {...getInputProps()} />
    <Typography variant="h4">Suelta el archivo o pincha para subir</Typography>
    </div>
    {
      downloadData ? 
      <CSVDownloaderComponent data={downloadData} /> : null
    }
    
    </div>
    )
    
  }
  
  export default DropzoneComponent;