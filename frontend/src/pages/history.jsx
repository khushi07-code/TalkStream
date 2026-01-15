import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from "@mui/material/IconButton";
import HomeIcon from '@mui/icons-material/Home';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([])
    const routeTo = useNavigate();
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history)
            } catch (e) {
                console.log("Something went wrong!")
            }
        }
        fetchHistory()
    }, [])
    const formatDate = (dateString) => {
        const date = new Date(dateString);

        const day = date.getDate();        // ✅ Day of month (1–31)
        const month = date.getMonth() + 1; // ✅ Month (1–12)
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };


    return (<>
        <IconButton onClick={() => {
            routeTo("/home")
        }}>
            <HomeIcon />
        </IconButton>
        {
            meetings.length !== 0 ? meetings.map((e, i) => {
                return <>
                    <Card variant="outlined" key={i}>
                        <CardContent>
                            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                                Code:{e.meetingCode}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>Date:{formatDate(e.date)}</Typography>
                        </CardContent>
                    </Card>
                </>
            }) :
                <>
                    <h6>no history</h6>
                </>
        }
    </>);
}

export default History;