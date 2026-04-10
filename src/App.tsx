import { Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/Layout'
import Registro from './app/Registro'
import Empleados from './app/Empleados'
import Lista from './app/Lista'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/registro" replace />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/lista" element={<Lista />} />
      </Route>
    </Routes>
  )
}
