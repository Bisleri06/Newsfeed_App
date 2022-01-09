import React from 'react';
import reactDom from 'react-dom';
import styles from './app.module.css'
import axios from 'axios'
import {Composer,SignIn,Card} from './components.js';
import AsyncLock from 'async-lock'



class App extends React.Component{

   constructor(props)                        //setup everything
   {
      super(props);         
      this.threshold=3;                      //Number of articles to load at start
      this.state={arr:[],composerMenu:false,signedIn:false};         //USED FOR RENDERING SPECIFIC PAGES

      this.lock=new AsyncLock({timeout:1000});
      
      this.checkelem=this.checkelem.bind(this);
      this.cardLoader=this.cardLoader.bind(this);
      this.renderCardsOrComposer=this.renderCardsOrComposer.bind(this);
      this.refresh=this.refresh.bind(this);

      window.onscroll=this.checkelem;        //ROOT SCROLL EVENT
   }



   async componentDidMount()                 //LOAD ARTICLES 
   {
      console.log(this.threshold);
      this.firsttime=false;

      let len=await axios.get("https://test-e55af-default-rtdb.firebaseio.com/ARTICLES/LEN.json").then((resp)=>resp.data).catch((err)=>console.log(err));    //Get Total article length
      let tmparr=[];

      console.log("TOTAL ARTICLES: "+len);

      for(let i=0;i<parseInt(len);i++)
         if(i<this.threshold)
         {
            console.log("start lodarer loaded "+(parseInt(len)-i-1));
            let content=await axios.get("https://test-e55af-default-rtdb.firebaseio.com/ARTICLES/"+(parseInt(len)-i-1)+".json").then((resp)=>resp.data);    //Get articles below threshold index   
            tmparr.push(content);
            console.log("Fetched: "+content.title);
         }
         else
            tmparr.push(0);                                                                    //DONT LOAD

      this.setState({arr:tmparr});
   }



   async cardLoader()
   {
      let count=this.state.arr.length;
      let temparr=this.state.arr;
      let thresh=false;

      for(let i=0;i<count;i++)
      {
         if(thresh)
            break;
         
         let elem=document.getElementById("card"+i);                                            //ID NUMBER
         
         let bot=elem.getBoundingClientRect().bottom+100;                                       //GET RELATIVE COORDS
         let top=elem.getBoundingClientRect().top-100;

         if(temparr[i]===0)                                                                     //LOAD IF NOT LOADED
         {
            console.log("card lodarer loaded "+(count-i-1));
            let content=await axios.get("https://test-e55af-default-rtdb.firebaseio.com/ARTICLES/"+(count-i-1)+".json").then((resp)=>resp.data);
            temparr[i]=content;
            console.log("NEW Fetched: "+content.title);
            thresh=true;
         }

         if(bot<=0 || top>=window.screen.height)                                                //DISABLE IF OUT OF VIEW
            temparr[i].load=false;
         else
            temparr[i].load=true;
         
      }

      this.setState({arr:temparr});
   }



   async checkelem()                                                                            //IF SCROLLED THEN CHECK WHICH CARDS TO DISPLAY WHICH NOT TO
   {
      if(this.state.composerMenu)
         return;
         
      let key="";
      if(!this.lock.isBusy())                                                                   //Prevent multiple fetches due to multiple events and REDUCE load on database
         this.lock.acquire(key,this.cardLoader);
   }

   
   async refresh(){                                                                             //REFRESH FEED AFTER NEW ARTICLE IS POSTED
      console.log(this.state.arr.length);
      let content=await axios.get("https://test-e55af-default-rtdb.firebaseio.com/ARTICLES/"+this.state.arr.length+".json").then((resp)=>resp.data).catch(()=>{console.log("Not updated")});
      let tmparr=[content,...this.state.arr];
      console.log(tmparr);
      this.setState({composerMenu:false,arr:tmparr});
   }


                                                                                                //FUNCTIONS TO NAVIGATE THROUGH THE WEBSITE FOR 
   signinStateChange=()=>{                                                                      //CONDITIONAL RENDERING
      this.setState({signedIn:true});
   }

   returnToMainMenu=()=>{
      this.setState({composerMenu:false});
   }

   goToComposer=()=>{
      this.setState({composerMenu:true});
   }


   
   renderCardsOrComposer()                                                                      //RENDER BASED ON WINDOW STATE
   {
      if(!this.state.composerMenu)                                                              //LOAD FEED
      {
         return <div>{this.state.arr.map((i,index)=><Card key={i.title} load={i.load} id={"card"+index} img={i.img} title={i.title} news={i.news} link={i.link} date={i.date} scrollfunc={this.checkelem}/>)}</div>;
      }

      else if(!this.state.signedIn)                                                             
      {
         return <SignIn Success={this.signinStateChange} MainMenu={this.returnToMainMenu}/>
      }

      else
      {
         return <Composer Success={this.refresh} MainMenu={this.returnToMainMenu}/>
      }
   }



   render()
   {
      let renderWindow=this.renderCardsOrComposer();                                   //WHAT TO RENDER
                                                                                       //RENDER DEFAULT TOP NAV BAR WITH OTHER STUFF
      return (
         <div>
            <div className={styles.navbar}>
            <h1>THE DAILY NEWS</h1>
            <button className={styles.btn} onClick={this.goToComposer}>Compose</button>
            </div>
            {renderWindow}
         </div>
      );
   }
}



reactDom.render(<App/>,document.getElementById('root'));