import React, { useContext, useEffect, useState } from 'react'
import Backgound from '../component/Backgound'
import Hero from '../component/Hero'
import Product from './Product'
import OurPolicy from '../component/OurPolicy'
import NewLetterBox from '../component/NewLetterBox'
import Footer from '../component/Footer'
import RecommendedProducts from '../component/RecommendedProducts'
import { userDataContext } from '../context/UserContext'

function Home() {
  const { userData } = useContext(userDataContext);
  
  let heroData=[
    {text1:"30% OFF Limited Offer",text2:"Style that"},
    {text1:"Discover the Best of Bold Fashion",text2:"Limited Time Only!"},
    {text1:"Explore Our Best Collection ",text2:"Shop Now!"},
    {text1:"Choose your Perfect Fasion Fit",text2:"Now on Sale!"}
  ]

  let [heroCount,setHeroCount] = useState(0)

  useEffect(()=>{
    let interval = setInterval(()=>{
      setHeroCount(prevCount => (prevCount === 3 ? 0 : prevCount + 1));
    },3000);
    return () => clearInterval(interval)
  },[])

  return (
    <div className='overflow-x-hidden relative top-[70px]'>
      {/* Hero Section with Image Background */}
      <div className='relative w-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[80vh] lg:min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] flex items-stretch'>
        {/* Background Image Container */}
        <div className='absolute inset-0 w-full h-full'>
          <Backgound heroCount={heroCount}/>
        </div>
        
        {/* Hero Text and Navigation Container */}
        <div className='relative z-10 w-full h-full flex items-center mt-12'>
          <Hero
            heroCount={heroCount}
            setHeroCount={setHeroCount}
            heroData={heroData[heroCount]}
          /> 
        </div>
      </div>
      
      {/* Products Section */}
      <Product/>
      
      {/* Recommendations */}
      {userData?._id && <RecommendedProducts userId={userData._id} strategy="hybrid" limit={8} />}
      
      {/* Footer Sections */}
      <OurPolicy/>
      <NewLetterBox/>
      <Footer/>
    </div>
  )
}

export default Home
