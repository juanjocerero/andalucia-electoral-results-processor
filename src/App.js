import { Typography } from '@mui/material'
import DropzoneComponent from './Components/DropzoneComponent';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './Styles/App.css';

function App() {
  return (
    <div className="App">

      <Typography fontWeight={900} variant="h3" margin={'0 auto'} marginBottom="2rem">
        Tratamiento de datos electorales
      </Typography>
      
      <DropzoneComponent />

    </div>
  );
}

export default App;
