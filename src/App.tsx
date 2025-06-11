import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./Pages/Login"
import ForgotPassword from "./Pages/ForgetPassword"
import ResetPassword from "./Pages/ResetPassword"

function App() {


  return (<>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/forgetpassword" element={<ForgotPassword/>} />
        <Route path="/resetpassword" element={<ResetPassword/>} />


      </Routes>
    </BrowserRouter>
  </>
  )
}

export default App
