import { Link, useNavigate } from "react-router-dom";

function LandingPage() {
    const navigate = useNavigate();
    function handleAuth() {
        navigate("/auth")
    }
    function generateMeetingCode(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    function handleJoinAsGuest(){
        const guestMeetingCode=generateMeetingCode();
        navigate(`/{guestMeetingCode}`)
    }

    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>TalkStream</h2>
                </div>
                <div className="navlist">
                    <button onClick={handleJoinAsGuest}>Join as Guest</button>
                    <button onClick={handleAuth}>Register</button>
                    <button onClick={handleAuth}>Login</button>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h2>
                        <span style={{ color: "#FF9839" }}>Connect</span> with your loved Ones
                    </h2>
                    <p>Cover a distance by TalkStream</p>
                    <div role="button">
                        <Link to="/home">Get Started</Link>
                    </div>
                </div>

                <div>
                    <img src="/mobile.png" alt="Mobile App Preview" />
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
