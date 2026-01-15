import { createContext, useState } from "react";
import axios from "axios";
export const AuthContext = createContext(null);
import server from "../environment";
const Client = axios.create({
    baseURL: `${server}/api/v1/users`, 
    headers: {
        "Content-Type": "application/json"
    }
});

export default function AuthProvider({ children }) {

    const [userData, setUserData] = useState(null);

    const handleRegister = async ({ username, name, password }) => {
        try {
            console.log(username, name, password, "Auth Register");

            const response = await Client.post("/register", {
                name,
                username,
                password
            });

            if (response.status === 201) {
                return response.data.message;
            }
        } catch (error) {
            console.error("Register Error:", error.response?.data || error.message);
            throw error;
        }
    };

    const handleLogin = async ({ username, password }) => {
        try {
            console.log(username, password, "Auth Login");

            const response = await Client.post("/login", {
                username,
                password
            });

            if (response.status === 200) {
                localStorage.setItem("token", response.data.token);
                setUserData(response.data.user); // optional
                console.log("User logged in!");
            }
        } catch (error) {
            console.error("Login Error:", error.response?.data || error.message);
            throw error;
        }
    };

    const getHistoryOfUser=async()=>{
        try{
            let request=await Client.get("/get_all_activity",{
                params:{
                    token:localStorage.getItem("token")
                }
            });
            return request.data;
        }catch(err){
            throw err
        }

    }
    const addToUserHistory=async(meetingcode)=>{
        try{
            let request=await Client.post("/add_to_activity",{
                token:localStorage.getItem("token"),
                meeting_code:meetingcode
            });
            return request.status;
        }catch(err){
            throw err
        }

    }

    return (
        <AuthContext.Provider
            value={{
                userData,
                setUserData,
                handleRegister,
                handleLogin,
                getHistoryOfUser,
                addToUserHistory
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
