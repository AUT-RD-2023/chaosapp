// React
import React, { useState, useEffect } from 'react';
import { useChannel } from "@ably-labs/react-hooks";

// Redux
import { useSelector, useDispatch } from "react-redux";
import { setActivity } from '../Redux/sessionSlice.js';

// Database
import { ref, set, onValue } from "firebase/database";
import { database } from '../database.js';

// Variables
import { scenario } from '../components/Scenarios.js';

// Components
import Button from '../components/Button.js'
import Textarea from '../components/Textarea.js'
import TimerBar from '../components/TimerBar.js'
import Header from '../components/Header.js'
import HowToPlay from '../components/HowToPlay'
import ReadMoreReact from 'read-more-react';

// Styles
import styles from '../styles/ScenarioPage.module.css';
import '../App.css';

function ScenarioPage() {
    /* REDUX */

    const gamePin = useSelector((state) => state.session.gamePin);
    const round = useSelector((state) => state.session.round);
    const playerId = useSelector((state) => state.session.playerId);        
    const isHost = useSelector((state) => state.session.isHost);

    const dispatch = useDispatch();
    dispatch(setActivity("discussion"))

    /* SCENARIO */

    const [scenarioText, setScenarioText] = useState("");

    useEffect(() => {
        // Randomly generates an index num for scenario type & its scenario.
        const randType = Math.floor(Math.random() * 3) + 1;
        const randScenario = Math.floor(Math.random() * 2 );         

        // Finds scenario object by type.
        const scenarioObj = scenario.find(obj => { 
            return obj.type === randType;
        }); 
        
        channel.publish("Set Scenario", { text: scenarioObj.scenarioArray[randScenario] });
        // eslint-disable-next-line
    }, []);

    /* ABLY */

    const [channel] = useChannel(gamePin + "", (message) => {
        if(message.name === "Set Scenario") {      
            setScenarioText(message.data.text);
        }
    });  

    /* BUTTON */

    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [textAreaDisabled, setTextAreaDisabled] = useState(false);

    const handleSubmit = () => {
        setButtonDisabled(true);
        setTextAreaDisabled(true);

        updateDatabase();
    }   

    /* DATABASE */
    
    const [message, setMessage] = useState('');

    const updateDatabase = () => {
        set(ref(database, `lobby-${gamePin}/responses/round-${round}/${playerId}`), {
            response: message // Add the users message to the database while tracking the current round and the users id
        }); 
    }

    // eslint-disable-next-line
    const [responseTime, setResponseTime] = useState();

    const responseTimeData = ref(database, 'lobby-' + gamePin + '/responseTime');

    useEffect(() => {
        onValue(responseTimeData, (snapshot) => {
            const data = snapshot.val();
            if (data !== null) {
                setResponseTime(data);
            }
        });
    }, [responseTimeData]);
        
    /* RENDER */

    return(
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.subheader}>
                    <Header />
                </div>
                <TimerBar timeLength= {200}/*{ responseTime }*/ addTime="0" path="/Bridge" />
                <HowToPlay />
            </div>
            <div className={styles.content}>
                <div className={styles.buttons}>
                    <Button
                        name= { buttonDisabled ? "✓" : "SUBMIT"}
                        static={ false }
                        press={ handleSubmit}
                        disabled={ buttonDisabled }/>
                </div>
                <div className={styles.container}>
                    <div className={styles.subtitle}>SCENARIO</div>


                    {/*<div className={styles.scenario}>{ scenarioText }</div>*/}
                    <div className={styles.scenario}><ReadMoreReact  min={3} max={10} text={scenarioText} /></div>


                    <div className={styles.prompt}>What do you do...?</div>
                    <Textarea
                        placeholder="Enter Response..."
                        disabled ={ textAreaDisabled }
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
export default ScenarioPage;