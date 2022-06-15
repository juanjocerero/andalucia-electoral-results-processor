import { Typography } from '@mui/material'
import DropzoneComponent from './Components/DropzoneComponent';
import MesasComponent from './Components/MesasComponent'
import Divider from '@mui/material/Divider';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './Styles/App.css';

function App() {
  return (
    <div className="App">

      <Typography fontWeight={900} variant="h5" margin={'0 auto'} marginBottom="0.5rem">
        Tratamiento de datos electorales
      </Typography>
      
      <DropzoneComponent />

      <Divider style={{ margin: '1.5rem 0' }}></Divider>

      <Typography fontWeight={900} variant="h5" margin={'0 auto'} marginBottom="1rem">
        Limpiar datos por mesas
      </Typography>

      <MesasComponent />

    </div>
  );
}

export default App;
