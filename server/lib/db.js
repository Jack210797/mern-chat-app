import mongoose from 'mongoose'

//Function to connect to the mongodb database
export const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB is connected')
    })

    const mongoUrl = `mongodb+srv://suvorov21079:${process.env.MONGODB_PASSWORD}@cluster0.dv8qf3e.mongodb.net/chat-app?retryWrites=true&w=majority&appName=Cluster0`
    await mongoose.connect(mongoUrl)
  } catch (error) {
    console.log(error)
  }
}
