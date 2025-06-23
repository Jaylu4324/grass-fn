import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./Pages/Login"
import ForgotPassword from "./Pages/ForgetPassword"
import ResetPassword from "./Pages/ResetPassword"
import Sidebar from "./section/Sidebar"
import MainLayout from "./section/MainLayout"
import Dashboard from "./Pages/Dashboard"
import Student from "./Pages/student"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { adminProfile } from "./apis/masterAdminApis"
import Exam from "./Pages/Exam"

function App() {
  const disp = useDispatch()
  const { isLogin } = useSelector((state) => (state))
  const fetchAdminData = async () => {
    try {
      let res = await adminProfile()
      if (res.status == 200) {
        disp({ type: "login", payload: { userData: res.data.masterAdminProfile } })
      } else {
        disp({ type: "logout" })

      }
    } catch (error) {
      disp({ type: "logout" })

      console.log(error)
    }
  }
  useEffect(() => {
    fetchAdminData()
  }, [])


  const IsAuth = (props) => {
    return isLogin ? props.children : <Navigate to="/" />
  }
  const IsLoggedIn = (props) => {
    return !isLogin ? props.children : <Navigate to="/student" />
  }

  return (<>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IsLoggedIn><Login /></IsLoggedIn>} />
        <Route path="/forgetpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/Dashboard" element={<IsAuth><Dashboard /></IsAuth>} />
        <Route path="/student" element={<IsAuth><Student /></IsAuth>} />
        <Route path="/Exam" element={<IsAuth>< Exam/></IsAuth>} />




      </Routes>
    </BrowserRouter>
  </>
  )
}

export default App
