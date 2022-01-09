import axios from 'axios';

class Auth{
    static isSignedIn(callback)
    {
        let token=localStorage.getItem('token');                        //CHECK TOKEN

        if(!token)
        {
            console.log("No sign in detected");
            return;
        }

        let url="https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCwQwKVAxDcOeLsLwlFFObwxgLnqobmnCg";

        axios.post(url,{idToken:token})                                 //GET USERNAME CORRESPONDING TO TOKEN
        .then((response)=>{this.security(response,callback)})
        .catch((err)=>{
            console.log("Token recognition error")}
        )

    }



    static security(response,callback)                                //CHECK IF STORED USERNAME IS SAME AS RETRIEVED USERNAME FOR AUTH
    {
        let given=response.data.users[0].localId;
        let currUser=localStorage.getItem('userId');
        console.log(response.data.users[0].localId);
        
        if(currUser===given)
            callback();
        else
            console.log("WRONG USER ID")
    }



    static validate(data)                                               //ARTICLE LENGHT LIMIT CHECKING AND CAN ADD MORE REGEX STUFF HERE
    {
        if(data.title.length>20 || data.title.length<=0)
        {
            alert("Invalid title limit");
            return false;
        }
        
        if(data.date.length>20 || data.date.length<=0)
        {
            alert("Invalid date limit");
            return false;
        }

        if(data.img.length>500 || data.img.length<=0)
        {
            alert("Invalid imagelink limit");
            return false;
        }

        if(data.link.length>200 || data.link.length<=0)
        {
            alert("Invalid articlelink limit");
            return false;
        }

        if(data.news.length>900 || data.news.length<=0)
        {
            alert("Invalid Content limit");
            return false;
        }

        return true;
    }



    static SignIN(event,callback)
    {
        let username=event.target.email.value;                                     //GET EMAIL AND PASSWORD FROM THE LOGIN FORM
        let password=event.target.pass.value;
        event.target.email.value="";
        event.target.pass.value="";

        const authData = {
            email: username,
            password: password,
            returnSecureToken: true
        }
        
        let url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCwQwKVAxDcOeLsLwlFFObwxgLnqobmnCg";

        axios.post(url,authData)                                                    //PERFORM AUTH REQUEST
        .then((response)=>{
            const expirationDate = new Date(new Date().getTime() + response.data.expiresIn * 1000);                 //EXPIRES IN 1 HR
            localStorage.setItem('token', response.data.idToken);                   
            localStorage.setItem('expirationDate', expirationDate);                              //SETS COOKIES IN LOCALSTORAGE TO REMEMBER LOGIN
            localStorage.setItem('userId', response.data.localId);
            console.log("LOGGED IN");
            callback(false);
        })
        .catch((err)=>{
            console.log(err.response.data.error.message);
            callback(true);
        })
    }
}


let authClass={Auth}
export default authClass;
export {Auth};