import React from 'react'
import { useCSVDownloader } from 'react-papaparse'
import { Button } from '@mui/material'
import { Download } from '@mui/icons-material'

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

export default function CSVDownloaderComponent(props) {

  const { CSVDownloader, Type } = useCSVDownloader();

  return (
    <div style={containerStyle}>
    <CSVDownloader data={props.data} type={Type.Link} filename={props.fileName} bom={true} config={{delimiter: ','}}>
      <Button variant="contained" size="medium" endIcon={<Download />} style={{ minWidth: '65vw', minHeight: '2rem' }}>
        { props.buttonText }
      </Button>
    </CSVDownloader>
    </div>
  )
}
