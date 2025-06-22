import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./Pages/Login"
import ForgotPassword from "./Pages/ForgetPassword"
import ResetPassword from "./Pages/ResetPassword"
import Sidebar  from "./section/Sidebar"
import MainLayout from "./section/MainLayout"
import Dashboard from "./Pages/Dashboard"
import Student from "./Pages/student"

function App() {


  return (<>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/forgetpassword" element={<ForgotPassword/>} />
        <Route path="/resetpassword" element={<ResetPassword/>} />
        <Route path="/Dashboard" element={<Dashboard/>} />
        <Route path="/student" element={<Student/>} />



      </Routes>
    </BrowserRouter>
  </>
  )
}

export default App
