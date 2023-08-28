// React
import React, { useState, useRef , useEffect } from 'react';
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

// Styles
import styles from '../styles/ScenarioPage.module.css';
import '../App.css';

function ScenarioPage() {
    /* REDUX */
    
    const dispatch = useDispatch();
    const playerId = useSelector((state) => state.session.playerId);
    const gamePin = useSelector((state) => state.session.gamePin);
    const nickname = useSelector((state) => state.session.nicknamed);
    const round = useSelector((state) => state.session.round);

    dispatch(setActivity("discussion"))

    /* SCENARIO */

    // Randomly generates an index num for scenario type & its scenario.
    const randType = useRef( Math.floor(Math.random() * 3) + 1 ).current;
    const randScenario = useRef( Math.floor(Math.random() * 2 )).current;
    
    // Finds scenario object by type.
    const scenarioObj = scenario.find(obj => {
        return obj.type === randType;
    });

    /* BUTTON */

    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [textAreaDisabled, setTextAreaDisabled] = useState(false);

    const handleSubmit = () => {
        setButtonDisabled(true);
        setTextAreaDisabled(true);
        
        sendMessage();
        updateDatabase();
    }

    /* ABLY */

    const [message, setMessage] = useState('');
    const [messages, updateMessages] = useState([]);

    const [channel] = useChannel(gamePin, (message) => {
        updateMessages((prev) => [...prev, message]);
    });

    const sendMessage = () => {
        if (channel && message.trim() !== '') {
            channel.publish("Response", { text: nickname + ": " + message });
        }
    };

    const messagePreviews = messages.map((msg, index) => <li key={index}>{msg.data.text}</li>);    

    /* DATABASE */
    
    const updateDatabase = () => {
        set(ref(database, 'lobby-' + gamePin + '/responses/round-' + round + '/' + playerId), {
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
                <TimerBar timeLength= { responseTime } addTime="0" path="/Bridge" />
            </div>
            <div className={styles.content}>
                <div className={styles.buttons}>
                <Button
                    name= { buttonDisabled ? "y" : "SUBMIT"}
                    static={ false }
                    press={ handleSubmit}
                    disabled={ buttonDisabled }/>
                </div>
                <div className={styles.container}>
                    <div className={styles.subtitle}>SCENARIO</div>
                    <div className={styles.scenario}>{scenarioObj.scenarioArray[randScenario]}</div>
                    <div className={styles.prompt}>What do you do...?</div>
                    <Textarea
                        placeholder="Enter Resopnse..."
                        disabled ={ textAreaDisabled }
                        onChange={(e) => setMessage(e.target.value)}
                        />
                </div>
            </div>
        </div>
    );
}
export default ScenarioPage;