import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Edit from './pages/Edit'
import Add from './pages/Add'
import Lists from './pages/Lists'
import Orders from './pages/Orders'
import Coupons from './pages/Coupons'
import Login from './pages/Login'
import { adminDataContext } from './context/AdminContext'
import { ToastContainer, toast } from 'react-toastify';

function App() {
  let {adminData} = useContext(adminDataContext)
  return (
    <>
      <ToastContainer />
      {!adminData ? <Login/> : <>

      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/add' element={<Add/>}/>
        <Route path='/lists' element={<Lists/>}/>
        <Route path='/orders' element={<Orders/>}/>
        <Route path='/coupons' element={<Coupons/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/edit/:id' element={<Edit/>}/>
      </Routes>
      </>
      }
    </>
  )
}

export default App
