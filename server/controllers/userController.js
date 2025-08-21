import { generateToken } from '../lib/utils.js'
import User from '../models/User.js'
import bcrypt from 'bcrypt'
import cloudinary from '../lib/cloudinary.js'

//Signup a new user
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body

  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: 'Missing Details' })
    }

    const user = await User.findOne({ email })

    if (user) {
      return res.json({ success: false, message: 'Account already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio
    })

    const token = generateToken(newUser._id)

    res.header('Authorization', `Bearer ${token}`)
    res.json({ success: true, userData: newUser, token, message: 'Account created successfully' })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

//Login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const userData = await User.findOne({ email })

    const isPasswordCorrect = await bcrypt.compare(password, userData.password)

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: 'Invalid credentials' })
    }

    const token = generateToken(userData._id)

    res.header('Authorization', `Bearer ${token}`)
    res.json({ success: true, userData, token, message: 'Login successful' })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

//Controller to check if user is authenticated
export const checkAuth = async (req, res) => {
  res.header('Authorization', `Bearer ${req.user.token}`)
  res.json({ success: true, user: req.user })
}

//Controller to update userProfile details
export const updateUserProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body

    const userId = req.user._id
    let updatedUser

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true })
    } else {
      const upload = await cloudinary.uploader.upload(profilePic)

      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      )
    }
    res.header('Authorization', `Bearer ${req.user.token}`)
    res.json({ success: true, user: updatedUser })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}
