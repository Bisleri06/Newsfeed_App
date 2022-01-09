import axios from 'axios';
import React from 'react';
import styles from './app.module.css'
import {Auth} from './auth.js'

class SignIn extends React.Component{                                           //HANDLES AUTH
    constructor(props)
    {
        super(props);
        this.state={wrongcreds:false};                                          //STATE TO CHECK IF WRONG CREDENTIALS ARE ENTERED
        Auth.isSignedIn(this.props.Success);                                    //CHECK IF ALREADY SIGNED IN

        this.validate=this.validate.bind(this);
    }

    credset=(val)=>{                                                            //GO BACK TO COMPOSE IF CORRECT CREDS ENTERED
        this.setState({wrongcreds:val});
        if(!this.state.wrongcreds)
            this.props.Success();
    }

    async validate(event)                                                       //PERFORM THE SIGN IN FUNCTIONALITY
    {
        event.preventDefault();
        Auth.SignIN(event,this.credset);
            
    }


    render()
    {
        let isWrong="";
        if(this.state.wrongcreds)                                                //DISPLAY MESSAGE IF WRONG CREDS ARE ENTERED
            isWrong=<p>WRONG CREDS</p>;
                                                                                 //LOGIN WINDOW
        return (
            <div className={styles.modal}>
                <div className={styles.modalcontent}>
                    <span className={styles.close} onClick={this.props.MainMenu}>&times;</span>
                    <h1>LOGIN</h1>
                    {isWrong}
                    <form onSubmit={this.validate}>
                        <input className={styles.modalinput} name="email" type="text" placeholder="USERNAME"></input>
                        <input className={styles.modalinput} name="pass" type="password" placeholder="PASSWORD"></input>
                        <input className={styles.modalbutton} type="submit" value="SIGN IN"></input>
                    </form>
                </div>
            </div>
        );
    }
}




class Composer extends React.Component{                                         //COMPOSER MENU TO CREATE NEW ARTICLES
    constructor(props)                                                          
    {
        super(props);                                                           
        this.url="https://test-e55af-default-rtdb.firebaseio.com/ARTICLES.json";//DEFAULT URL
        this.state={verify:false};

        this.compose_data={                                                     //DATA TO POST
            date:"",
            img:"",
            link:"",
            load:true,
            news:"",
            title:""
        }

        this.compose_article_handler=this.compose_article_handler.bind(this);
        this.fill_fields=this.fill_fields.bind(this);
        this.publish_article=this.publish_article.bind(this);
    }


    fill_fields(data)                                                           //FILL FIELDS AFTER DATA IS VALIDATED
    {

        this.compose_data.date=data.date.value;
        this.compose_data.img=data.imglnk.value;
        this.compose_data.link=data.mainlink.value;
        this.compose_data.news=data.content.value;
        this.compose_data.title=data.title.value;
    }


    compose_article_handler(event)                                               //FUNCTION PERFORMING FIELD FILLING AND VALIDATING AFTER DATA IS POSTED
    {
        event.preventDefault();
        this.fill_fields(event.target);
        if(Auth.validate(this.compose_data))
        {
            console.log(this.compose_data);
            this.setState({verify:true});
        }
    }



    async publish_article()                                                     //PUBLISHES ARTICLE WITH INDEX LEN AND INCREASES DATABASE ARTICLES LENGTH BY ONE
    {
        let len=await axios.get("https://test-e55af-default-rtdb.firebaseio.com/ARTICLES/LEN.json").then((resp)=>resp.data).catch((err)=>console.log(err));    //Get Total article length
        
        axios.patch(this.url,{"LEN":len+1}).then(()=>console.log("Increased length")).catch(()=>console.log("Length change failed"));
        
        console.log(this.compose_data);
        await axios.patch(this.url,{[len]:this.compose_data}).then(()=>{console.log("Published")});     //ARTICLE DATA UPDATE
        
        this.props.Success();
    }



    render()                                                                    //RENDER FUNCTION
    {
        if(this.state.verify)
        {                                                                       //SEE HOW THE ARTICLE LOOKS IN THE FEED
            return (
                <div>
                    <Card load={this.compose_data.load} img={this.compose_data.img} title={this.compose_data.title} news={this.compose_data.news} link={this.compose_data.link} date={this.compose_data.date} scrollfunc={undefined}/>
                    <button className={styles.composemodalbutton} onClick={this.publish_article}>POST</button>
                    <button className={styles.modalbutton} onClick={()=>{this.setState({verify:false})}}>CANCEL</button>
                </div>);
        }


        else                                                                    //WRITE ARTICLE
        {
            return (
                <div className={styles.modal}>
                    <div className={styles.composemodalcontent}>
                        <span className={styles.close} onClick={this.props.MainMenu}>&times;</span>
                        <h1>COMPOSE</h1>
                        <form onSubmit={this.compose_article_handler}>
                            <input className={styles.composemodalinput} name="title" type="text" defaultValue={this.compose_data.title} placeholder="Title"></input>
                            <input className={styles.composemodalinput} name="date" type="text" defaultValue={this.compose_data.date} placeholder="Date"></input>
                            <input className={styles.composemodalinput} name="imglnk" type="text" defaultValue={this.compose_data.img} placeholder="ImageLink"></input>
                            <input className={styles.composemodalinput} name="mainlink" type="text" defaultValue={this.compose_data.link} placeholder="StoryLink"></input>
                            <textarea className={styles.newscontent} name="content" type="text" defaultValue={this.compose_data.news} placeholder="Content"></textarea>
                            <input className={styles.composemodalbutton} type="submit" value="POST"></input>
                        </form>
                    </div>
                </div>
            );   
        } 
    }
}




class Card extends React.Component                                            //INDIVIDUAL ARTICLES LOADED ON CARDS
{
   render()
   {
      if(!this.props.load)                                                    //DONT LOAD IF DISABLED
         return <div className={styles.outer} id={this.props.id}></div>;

      return (
         <div className={styles.outer} id={this.props.id}>
            <div onScroll={this.props.scrollfunc} className={styles.card} onClick={()=>window.open(this.props.link)}>
                  <img src={this.props.img} className={styles.img} alt=""/>
                  <div className={styles.container}>
                     <h1><b>{this.props.title}</b></h1> 
                     <p className={styles.date}>{this.props.date}</p>
                     <p><b>{this.props.news}</b></p>
                  </div>
            </div>
         </div>
      )
   }
}

export {Composer,SignIn,Card};
let pack={Composer,SignIn,Card};
export default pack;