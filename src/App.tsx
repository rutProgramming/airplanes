import { ThemeProvider } from '@emotion/react'
import './App.css'
import { darkTheme } from './styles/darkTheme '
import AirplanesTableData from './components/AirplanesTableData'
import { Provider } from 'react-redux'
import { store } from './store/store'

function App() {
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <Provider store={store}>
          <AirplanesTableData />
        </Provider>
      </ThemeProvider>
    </>
  )
}

export default App
