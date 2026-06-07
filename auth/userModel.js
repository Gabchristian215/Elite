import 'dotenv/config';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';




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
role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
},
password: {
    type: String,
    required: true,
    select: false
},
passwordChangedAt: Date,

passwordResetToken: String,
passwordResetExpires: Date
})
userInfo.pre('save', async function() {
    if(!this.isModified("password")) return;

    this.password = await bcryptjs.hash(this.password, 12);
    this.passwordChangedAt = new Date(Date.now() - 1000);
})
userInfo.pre('save', async function(){
    if(!this.isModified("password") || this.isNew) return;
    this.passwordChanged = Date.now() - 1000;
})


userInfo.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcryptjs.compare(candidatePassword, userPassword);
}

userInfo.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
        
    }
    return false;
}

userInfo.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}


const User = mongoose.model('User', userInfo);

export default User;



