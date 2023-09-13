/*
* VotingPage.js
* Author: Jade Thompson-Tavai
* Date: 24-08-23
*
* Contributors:
*
*
*/

// React
import React, {useEffect, useState} from "react";

// Database
import { ref, onValue } from "firebase/database";
import { database } from '../database.js';

// Components
import Button from "../components/Button.js";
import TimerBar from "../components/TimerBar.js";
import VotingCard from "../components/VotingCard.js";
import Header from '../components/Header.js'
import HowToPlay from '../components/HowToPlay.js'

//variables
import { useSelector } from "react-redux";

// Styles
import styles from "../styles/VotingPage.module.css";
import "../App.css";


const VotingPage = () => {
    /* REDUX */
    //const nickname = useSelector((state) => state.session.nickname);
    const isHost = useSelector((state => state.session.isHost));
    const round = useSelector((state) => state.session.round);
    const gamePin = useSelector((state => state.session.gamePin));
    const ablyUsers = useSelector((state) => state.session.ablyUsers);


    const [responseArray, setResponseArray] = useState([]); 

    useEffect(() => {
        
          for(let i = 0; i < ablyUsers.length; i++) {
            const responseData = ref(database, `lobby-${gamePin}/responses/round-${round}/${ablyUsers[i]}/response`);
    
            onValue(responseData, (snapshot) => {
              setResponseArray(oldArray => [...oldArray, snapshot.val()]);
              console.log("Added response from User: " + ablyUsers[i] + ", Response: " + snapshot.val());
            }, {
              onlyOnce: true
            });  
          }      
        
        // eslint-disable-next-line
      }, []);

    const buttonsJSX = (
        <div className={styles.buttons}>
          <Button
              name="VOTE"
              static={ false } //button width decreases as page height increases
          />
          <div className={styles.button_spacer}/>
            <Button 
                name="SKIP"
                static={ false } //button width decreases as page height increases
              />
        </div>);

const hostButtonsJSX = (
    <div className={styles.buttons}>
      <Button
          name="VOTE"
          static={ false } //button width decreases as page height increases
      />
      <div className={styles.button_spacer}/>
        <Button 
            name="SKIP"
            static={ false } //button width decreases as page height increases
          />
    </div>);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.subheader}>
                    <Header />
                </div>
                <TimerBar />
                <HowToPlay />
            </div>
            <div className={styles.container}>
                <div className={styles.subtitle}>TAKE A VOTE</div>
            </div>

        {/* container for response cards*/}
        <div className={styles.carouselContainer}>
            <div className={styles.carousel}>
                {
                  responseArray.map(response =>
                    <VotingCard response = {response}/>)
                }
            </div>
        </div>
         { isHost ? hostButtonsJSX : buttonsJSX }
        </div>
    )
}



export default VotingPage;