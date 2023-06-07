/* eslint-disable  */
import axios from 'axios';

import { showAlert } from './alerts';

export const login =async (email,password) =>{
    try{
        const res =  await axios({
            method:'POST',
            url:'http://127.0.0.1:3000/api/v1/users/login',
            data:{
                email,password
            }
        });
        /// we need to go to the home page after looging in
        if(res.data.status === 'success'){
            showAlert('success','logged in successfully')
            window.setTimeout(()=>{
                /// '/' refer to the home page
                location.assign('/')
            },1500)
        }
        // console.log(res);

    }catch(err){
        // console.log(err.response.data);
        showAlert('error',err.response.data.message);
    };
};

export const  logout = async()=>{
    try {
        const res =  await axios({
            method:'Get',
            url:'http://127.0.0.1:3000/api/v1/users/logout'
        });
        if(res.data.status === 'success') location.reload(true);
        
    } catch (error) {
        showAlert('error' , 'Error logging out! try again.')
    };
};

