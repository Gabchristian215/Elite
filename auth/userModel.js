import 'dotenv/config';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';


 const url = process.env.MONGO_URI;

mongoose.connect(url, {dbName: 'elite'})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB', error.message));

const userInfo = new mongoose.Schema({
username: {
    type: String,
    required: true,
    unique: true
},
email: {
    type: String,
    required: true,
    unique: true
},
password: {
    type: String,
    required: true,
    select: false
}
})
userInfo.pre('save', async function(next) {
    if(!this.isModified("password")) return next();

    this.password = await bcryptjs.hash(this.password, 12);
})

userInfo.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcryptjs.compare(candidatePassword, userPassword);
}




const User = mongoose.model('User', userInfo);

export default User;






