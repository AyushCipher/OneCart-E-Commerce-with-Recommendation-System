import React, { useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { authDataContext } from '../context/AuthContext'
import { userDataContext } from '../context/UserContext'
import { AiOutlineClose } from 'react-icons/ai'

export default function ProfileModal({ show, onClose }) {
  const { serverUrl } = useContext(authDataContext)
  const { userData, getCurrentUser } = useContext(userDataContext)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    gender: '',
    dateOfBirth: '',
    profession: '',
    bio: ''
  })

  useEffect(() => {
    if (show && userData) {
      setProfile({
        name: userData?.name || '',
        gender: userData?.gender || '',
        dateOfBirth: userData?.dateOfBirth ? userData?.dateOfBirth.split('T')[0] : '',
        profession: userData?.profession || '',
        bio: userData?.bio || ''
      })
    }
  }, [show, userData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await axios.put(
        `${serverUrl}/api/user/profile`,
        profile,
        { withCredentials: true }
      )
      
      if (response.status === 200) {
        getCurrentUser()
        setIsEditing(false)
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white/10 backdrop-blur-lg rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto border border-white/20 shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-white/10'>
          <h2 className='text-2xl font-bold text-white'>My Profile</h2>
          <AiOutlineClose 
            className='w-6 h-6 cursor-pointer text-white/80 hover:text-white transition' 
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className='p-6'>
          {!isEditing ? (
            <div className='space-y-5'>
              <div className='pb-4 border-b border-white/10'>
                <label className='text-xs font-semibold text-white/60 uppercase tracking-wider'>Name</label>
                <p className='text-lg text-white font-medium mt-2'>{profile.name}</p>
              </div>
              <div className='pb-4 border-b border-white/10'>
                <label className='text-xs font-semibold text-white/60 uppercase tracking-wider'>Gender</label>
                <p className='text-lg text-white font-medium mt-2'>{profile.gender || 'Not specified'}</p>
              </div>
              <div className='pb-4 border-b border-white/10'>
                <label className='text-xs font-semibold text-white/60 uppercase tracking-wider'>Date of Birth</label>
                <p className='text-lg text-white font-medium mt-2'>{profile.dateOfBirth || 'Not specified'}</p>
              </div>
              <div className='pb-4 border-b border-white/10'>
                <label className='text-xs font-semibold text-white/60 uppercase tracking-wider'>Profession</label>
                <p className='text-lg text-white font-medium mt-2'>{profile.profession || 'Not specified'}</p>
              </div>
              <div>
                <label className='text-xs font-semibold text-white/60 uppercase tracking-wider'>Bio</label>
                <p className='text-sm text-white/90 mt-2 leading-relaxed'>{profile.bio || 'Not specified'}</p>
              </div>
              
              <button
                onClick={() => setIsEditing(true)}
                className='w-full mt-8 bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] text-white py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition font-semibold'
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className='space-y-4'>
              <div>
                <label className='text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2'>Name</label>
                <input
                  type='text'
                  name='name'
                  value={profile.name}
                  onChange={handleChange}
                  className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                  placeholder='Enter your name'
                />
              </div>

              <div>
                <label className='text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2'>Gender</label>
                <select
                  name='gender'
                  value={profile.gender}
                  onChange={handleChange}
                  className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                >
                  <option value='' className='bg-gray-900'>Select Gender</option>
                  <option value='Male' className='bg-gray-900'>Male</option>
                  <option value='Female' className='bg-gray-900'>Female</option>
                  <option value='Other' className='bg-gray-900'>Other</option>
                </select>
              </div>

              <div>
                <label className='text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2'>Date of Birth</label>
                <input
                  type='date'
                  name='dateOfBirth'
                  value={profile.dateOfBirth}
                  onChange={handleChange}
                  className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                />
              </div>

              <div>
                <label className='text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2'>Profession</label>
                <input
                  type='text'
                  name='profession'
                  value={profile.profession}
                  onChange={handleChange}
                  className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                  placeholder='Enter your profession'
                />
              </div>

              <div>
                <label className='text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2'>Bio</label>
                <textarea
                  name='bio'
                  value={profile.bio}
                  onChange={handleChange}
                  className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                  placeholder='Tell us about yourself'
                />
              </div>

              <div className='flex gap-3 mt-8'>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className='flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className='flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-lg hover:bg-white/20 transition font-semibold'
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
