import React, {useState} from 'react';
import './App.css';
import ImageUploader from "react-images-upload";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";

import ItsHotDog from "./images/itshotdog.gif";
import TooBadGif from "./images/toobad.gif";

const urlToRequestUpload = process.env.BASE_URL || 'https://localhost/upload';
const tokenToRequest = process.env.TOKEN_TO_REQUEST || 'token';

function App(props) {
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState();
    const [labels, setLabels] = useState([]);
    const [isHotDog, setIsHotDog] = useState(false);
    const [requested, setRequested] = useState(false);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [snackBarMsg, setSnackBarMsg] = useState('');
    const [presentationText, setPresentationText] = useState("Select an image to identify it's items");

    const getResultFromAPI = async () => {
        if (loading || !images || !images.length) {
            return;
        }

        setLoading(true);

        try {

            let formData = new FormData();
            formData.append('file', images[0]);

            const fetchResp = await fetch(urlToRequestUpload, {
                method: 'post',
                headers: {
                    'Authorization': tokenToRequest
                },
                body: formData
            });

            if (fetchResp.status === 200) {
                const respJson = await fetchResp.json();

                setIsHotDog(respJson.hotdog || false);
                setLabels(respJson.labelsFound || []);
                setPresentationText("Here's your results!");
                setRequested(true);
            } else {
                //eslint-disable-next-line
                throw 'status != 200';
            }
        } catch (e) {
            console.error("Error fetching data", e);
            setSnackBarMsg('Error requesting information =(');
            setOpenSnackBar(true);
        } finally {
            setLoading(false);
        }
    };

    const onDrop = (selectedImage) => {
        setImages(selectedImage)
    };

    const tryAgain = () => {
        setImages();
        setRequested(false);
    };

    const printLabels = () => {
        return (
            <div>
                Labels found on image:
                <ul>
                    {labels.map((val, idx) => {
                        return <li key={idx}>{val}</li>
                    })}
                </ul>
            </div>
        )
    };

    let body;
    let footer;
    if (!requested) {
        body = <ImageUploader
            {...props}
            withPreview={true}
            singleImage={true}
            withIcon={true}
            onChange={onDrop}
            imgExtension={[".jpg", ".gif", ".png", ".gif"]}
            maxFileSize={5242880}
        />;
        footer = <Button color="primary" variant={"contained"} onClick={getResultFromAPI} disabled={loading}>Submit</Button>;
    } else {
        if (isHotDog) {
            body =
                <div className="result-container">
                    <img alt={"is-a-hot-dog"} className="succes-img" src={ItsHotDog}></img>
                    <span className={"result-text"}>YEEEEEEAH! IT'S A FUCKIN' HOTDOG!!!</span>
                    <Button color="primary" variant={"contained"} onClick={tryAgain} disabled={loading}>Try
                        Again</Button>
                </div>
            ;
        } else {
            body =
                <div className="result-container">
                    <img alt={"too-bad"} className="succes-img" src={TooBadGif}></img>
                    <span className={"result-text"}>TOO BAAAAAD =( IT'S NOT A HOT DOG =(</span>
                    <Button color="primary" variant={"contained"} onClick={tryAgain} disabled={loading}>Try
                        Again</Button>
                </div>
        }
        footer = <div>{printLabels()}</div>
    }

    return (
        <div className="container">
            <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                spacing={2}
            >
                <Grid item xs={6} sm={3}>
                    <div className="banner">
                        <h1>Image identifier</h1>
                        {presentationText}
                    </div>
                </Grid>

                <Grid item>
                    {body}
                </Grid>

                <Grid item>
                    {footer}
                </Grid>
            </Grid>
            <Snackbar
                open={openSnackBar}
                onClose={() => setOpenSnackBar(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                autoHideDuration={6000}
                message={snackBarMsg}
            />
        </div>
    );
}

export default App;
