import React from 'react'
import Logo from "../assets/logo.png"
import { useNavigate } from 'react-router-dom'
import google from '../assets/google.png'
import { IoEyeOutline } from "react-icons/io5";
import { IoEye } from "react-icons/io5";
import { useState } from 'react';
import { useContext } from 'react';
import { authDataContext } from '../context/AuthContext';
import axios from 'axios'
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../utils/Firebase';
import { userDataContext } from '../context/UserContext';
import { toast } from 'react-toastify';
import Loading from '../component/Loading';

function Registration() {
    let [show,setShow] = useState(false)
    let {serverUrl} = useContext(authDataContext)
    let [name,setName] = useState("")
    let [email,setEmail] = useState("")
    let [password,setPassword] = useState("")
    let [gender,setGender] = useState("")
    let [dateOfBirth,setDateOfBirth] = useState("")
    let [profession,setProfession] = useState("")
    let [bio,setBio] = useState("")
    let {userdata , getCurrentUser} = useContext(userDataContext)
    let [loading,setLoading] = useState(false)

    let navigate = useNavigate()

    const handleSignup = async (e) => {
        setLoading(true)
        e.preventDefault()
        try {
         const result = await axios.post(serverUrl + '/api/auth/register',{
            name,email,password,gender,dateOfBirth,profession,bio
         },{withCredentials:true})
            getCurrentUser()
            navigate("/")
            toast.success("User Registration Successful")
            console.log(result.data)
            setLoading(false)

        } catch (error) {
            console.log(error)
            toast.error("User Registration Failed")
        }
    }

    const googleSignup = async () => {
        try {
            const response = await signInWithPopup(auth, provider)
            let user = response.user
            let name = user.displayName;
            let email = user.email

            const result = await axios.post(serverUrl + "/api/auth/googlelogin" ,{name , email} , {withCredentials:true})
            console.log(result.data)
            getCurrentUser()
            navigate("/")
            toast.success("User Registration Successful")

        } catch (error) {
            console.log(error)
            toast.error("User Registration Failed")
        }
        
    }
  
  return (
    <div className='w-[100vw] h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-[white] flex flex-col items-center justify-start'>
    <div className='w-[100%] h-[80px] flex items-center justify-start px-[30px] gap-[10px] cursor-pointer' onClick={()=>navigate("/")}>
    <img className='w-[40px]' src={Logo} alt="" />
    <h1 className='text-[22px] font-sans'>OneCart</h1>
    </div>

    <div className='w-[100%] h-[100px] flex items-center justify-center flex-col gap-[10px]'>
        <span className='text-[25px] font-semibold'>Registration Page</span>
        <span className='text-[16px]'>Welcome to OneCart, Place your order</span>

    </div>
    <div className='max-w-[600px] w-[90%] max-h-[90vh] bg-[#00000025] border-[1px] border-[#96969635] backdrop:blur-2xl rounded-lg shadow-lg flex items-center justify-center overflow-y-auto'>
        <form action="" onSubmit={handleSignup} className='w-[90%] flex flex-col items-center justify-start gap-[15px] py-[20px]'>
            <div className='w-[90%] h-[50px] bg-[#42656cae] rounded-lg flex items-center justify-center gap-[10px] py-[20px] cursor-pointer' onClick={googleSignup} >
                <img src={google}  alt="" className='w-[20px]'/> Registration with Google
            </div>
            <div className='w-[100%] h-[20px] flex items-center justify-center gap-[10px]'>
             <div className='w-[40%] h-[1px] bg-[#96969635]'></div> OR <div className='w-[40%] h-[1px] bg-[#96969635]'></div>
            </div>
            <div className='w-[90%] flex flex-col items-center justify-center gap-[15px] relative'>
                <input type="text" className='w-[100%] h-[45px] border-[2px] border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-[20px] font-semibold text-[14px]' placeholder='Full Name' required onChange={(e)=>setName(e.target.value)} value={name}/>
                 <input type="email" className='w-[100%] h-[45px] border-[2px] border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-[20px] font-semibold text-[14px]' placeholder='Email' required onChange={(e)=>setEmail(e.target.value)} value={email}/>
                  <div className='w-[100%] relative'>
                    <input type={show? "text":"password"} className='w-[100%] h-[45px] border-[2px] border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-[20px] font-semibold text-[14px]' placeholder='Password' required onChange={(e)=>setPassword(e.target.value)} value={password}/>
                    {!show && <IoEyeOutline className='w-[20px] h-[20px] cursor-pointer absolute right-[5%] top-[12px]' onClick={()=>setShow(prev => !prev)}/>}
                    {show && <IoEye className='w-[20px] h-[20px] cursor-pointer absolute right-[5%] top-[12px]' onClick={()=>setShow(prev => !prev)}/>}
                  </div>
                  
                  <select className='w-[100%] h-[45px] border-[2px] border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-[20px] font-semibold text-[14px] text-[#ffffffc7]' onChange={(e)=>setGender(e.target.value)} value={gender}>
                    <option value="" disabled>Select Gender</option>
                    <option value="Male" className='bg-[#141414]'>Male</option>
                    <option value="Female" className='bg-[#141414]'>Female</option>
                    <option value="Other" className='bg-[#141414]'>Other</option>
                  </select>

                  <input type="date" className='w-[100%] h-[45px] border-[2px] border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-[20px] font-semibold text-[14px] text-[#ffffffc7] cursor-pointer' onChange={(e)=>setDateOfBirth(e.target.value)} value={dateOfBirth}/>

                  <input type="text" className='w-[100%] h-[45px] border-[2px] border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-[20px] font-semibold text-[14px]' placeholder='Profession (Optional)' onChange={(e)=>setProfession(e.target.value)} value={profession}/>

                  <textarea className='w-[100%] h-[60px] border-[2px] border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-[20px] py-[10px] font-semibold text-[14px] resize-none' placeholder='Bio (Optional)' onChange={(e)=>setBio(e.target.value)} value={bio}/>

                  <button className='w-[100%] h-[45px] bg-[#6060f5] rounded-lg flex items-center justify-center mt-[10px] text-[17px] font-semibold'>{loading? <Loading/> :"Create Account"}</button>
                  <p className='flex gap-[10px] text-[14px]'>Already have an account? <span className='text-[#5555f6cf] font-semibold cursor-pointer' onClick={()=>navigate("/login")}>Login</span></p>
            </div>
        </form>
    </div>
    </div>
  )
}

export default Registration
