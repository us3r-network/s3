import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import reportWebVitals from './reportWebVitals'

import './index.css'
import './styles/tab.css'
import './styles/playground.css'
import './styles/menu.css'
import './styles/checkbox.css'
import './styles/prism-vsc-dark-plus.css'

import '@graphiql/plugin-explorer/dist/style.css'
import 'graphiql/graphiql.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
