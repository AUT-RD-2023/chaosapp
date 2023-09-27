// React
import React from 'react';
import { saveAs } from 'file-saver';
import { pdf, Page, Text, Document } from '@react-pdf/renderer';

// Redux
import { useSelector } from "react-redux";

// Components
import { ReactComponent as Download } from '../styles/images/download.svg';

const CreateDocument = (props) => (
    <Document>
        <Page size="A4">
            <Text>
            Session Results (GamePin: { props.gamePin })
            
            Date: { props.date }
            
            Scenario: { props.scenario }
            </Text>
        </Page>
    </Document>
)

export default function DownloadButton(props) {
    const gamePin = useSelector((state => state.session.gamePin));
    const scenario = useSelector((state => state.session.scenario));
    const date = new Date().toLocaleString() + "";

    return (
        <>
            <Download
                className={ props.className } 
                onClick={ 
                    async () => {
                    const document = <CreateDocument gamePin={ gamePin } date={ date } scenario={ scenario } />
                    const asPDF = pdf();
                    asPDF.updateContainer(document);
                    const blob = await asPDF.toBlob();
                    saveAs(blob, `Chaotic-${gamePin}_game_results.pdf`);
                }}    
            />
        </>
    );
}

/*function DocumentLink() {
    const gamePin = useSelector((state => state.session.gamePin));
    const scenario = useSelector((state => state.session.scenario));

    return (
      <div>
        <PDFDownloadLink document={<CreateDocument gamePin={ gamePin } scenario={ scenario }/>} fileName={`Chaotic-${gamePin}_game_results.pdf`}>
            {({ blob, url, loading, error }) => (loading ? 'Loading...' : 'Download')}
        </PDFDownloadLink>
      </div>
    );
}*/