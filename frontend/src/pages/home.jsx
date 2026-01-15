import { useContext, useEffect, useRef, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import RestoreIcon from '@mui/icons-material/Restore';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import "../App.css";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    let { addToUserHistory } = useContext(AuthContext)
    let handleJoinVideoCall = async () => {
        addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }
    return (
        <>
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center" }}></div>
                <h3>TalkStream</h3>
                <div>
                    <IconButton onClick={() => navigate("/history")}>
                        <RestoreIcon style={{ color: "white" }} />
                    </IconButton>
                    <p>History</p>
                    <Button
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>
                            Providing Quality Video Call <br />
                            <span style={{ color: "#FF9839" }}>Just Like Quality Education</span>
                        </h2>

                        <div>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="meetingcode"
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value)}
                                placeholder="Enter Meeting Code"
                            />
                            <Button variant="contained" onClick={handleJoinVideoCall}>
                                Join
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="rightPanel">
                    <img src="logo3.png" alt="video preview" />
                </div>
            </div>
        </>

    );
}

export default withAuth(HomeComponent);