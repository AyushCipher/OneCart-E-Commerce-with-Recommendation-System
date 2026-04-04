import React from 'react'
import back1 from "../assets/back1.jpg"
import back2 from "../assets/back2.jpg"
import back3 from "../assets/back3.jpg"
import back4 from "../assets/back4.jpg"

function Backgound({heroCount}) {
  const images = [back2, back1, back3, back4];
  const currentImage = images[heroCount];
  
  return (
    <div className='absolute inset-0 w-full h-full overflow-hidden'>
      <img 
        src={currentImage} 
        alt="Hero Background" 
        className='w-full h-full object-cover transition-all duration-500 ease-in-out'
      />
      {/* Dark overlay for text readability */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/30 to-transparent'></div>
    </div>
  );
}

export default Backgound
