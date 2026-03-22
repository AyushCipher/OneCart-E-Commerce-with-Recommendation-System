import React, { useState } from 'react'
import { Check } from 'lucide-react'

function NewLetterBox() {
  const [status, setStatus] = useState("normal") 
  const [email, setEmail] = useState("") 

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus("loading")

    // After 3s → success
    setTimeout(() => {
      setStatus("success")
      setEmail("") 

      // After 2s → back to normal
      setTimeout(() => {
        setStatus("normal")
      }, 2000)
    }, 3000)
  }

  return (
    <div className='w-[100%] h-[40vh] bg-gradient-to-l from-[#141414] to-[#0c2025] flex items-center justify-start gap-[10px] flex-col'>
      <p className='md:text-[30px] text-[20px] text-[#a5faf7] font-semibold px-[20px]'>
        Subscribe now & get 20% off
      </p>
      <p className='md:text-[18px] text-[14px] text-center text-blue-100 font-semibold px-[20px]'>
        Subscribe now and enjoy exclusive savings, special deals, and early access to new collections.
      </p>

      <form
        onSubmit={handleSubmit}
        className='w-[100%] h-[30%] md:h-[50%] flex items-center justify-center mt-[20px] gap-[20px] px-[20px]'
      >
        <input
          type="email"
          placeholder='Enter Your Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='placeholder:text-[black] bg-slate-300 w-[600px] max-w-[60%] h-[40px] px-[20px] rounded-lg shadow-sm shadow-black'
          required
        />

        <button
          type='submit'
          disabled={status !== "normal"} 
          className={`text-[15px] md:text-[16px] px-[20px] py-[12px] md:py-[10px] 
            cursor-pointer flex items-center justify-center gap-[10px] 
            border-[1px] border-[#80808049] rounded-lg shadow-sm shadow-black 
            transition-all duration-150
            ${
              status === "loading" ? "bg-slate-500 animate-pulse" :
              status === "success" ? "bg-green-600" :
              "bg-[#2e3030c9] text-white hover:bg-slate-500"
            }`}
        >
          {status === "loading" && "Subscribing..."}
          {status === "success" && <Check className="text-white w-5 h-5" />}
          {status === "normal" && "Subscribe"}
        </button>
      </form>
    </div>
  )
}

export default NewLetterBox
