import mongoose, { mongo } from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    token: {
        type: String
    }
});
const User = mongoose.model("User", userSchema);
export { User };