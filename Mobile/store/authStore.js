import {create} from 'zustand'

export const useAuthStore = create((set)=>({
    user:null,
    token:null,
    isLoading:false,
    register : async()=>{}
}))