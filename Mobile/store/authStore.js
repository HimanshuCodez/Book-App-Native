import {create} from 'zustand'

export const useAuthStore = create((set)=>({
    user:null,
    token:null,
    isLoading:false,
    register : async(username, email, password, address)=>{
        set({isLoading:true})
        try {
            const response = await fetch("http://localhost:3000/api/v1/register",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({
                    username,
                    email,
                    password
                }),
            })
        } catch (error) {
            
        }
    }
}))