import { ThemeProvider } from '@emotion/react'
import './App.css'
import { darkTheme } from './styles/darkTheme '
import AirplanesTableData from './Components/AirplanesTableData'
function App() {
  return (
    <>
      <ThemeProvider theme={darkTheme}>
          <AirplanesTableData />
      </ThemeProvider>
    </>
  )
}

export default App
