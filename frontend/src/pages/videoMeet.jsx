import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { io } from "socket.io-client";
import IconButton from "@mui/material/IconButton";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import Badge from "@mui/material/Badge";
import ChatIcon from '@mui/icons-material/Chat';
import videostyles from "../styles/videoComponent.module.css";
import usernamestyles from "../styles/username.module.css";
import chatstyles from "../styles/chatbox.module.css";
import server from "../environment"

const server_url = server;


const peerConfigConnections = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

function VideoMeetComponent() {

    const connections = useRef({});
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef(null);

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [videos, setVideos] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModel, setShowModel] = useState(false);
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("")
    let [newMessage, setNewMessage] = useState(3);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [videoEnabled, setVideoEnabled] = useState(true);
    let [audioEnabled, setAudioEnabled] = useState(true);
    const videoRef = useRef([]);
    const redirectTo = useNavigate();
    async function getPermission() {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false);
            };
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }
            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }
            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                console.log(userMediaStream);
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;

                    }
                }

            }

        } catch (err) {
            console.log(err);

        }
    }

    useEffect(() => {
        getPermission();
    }, []);


    let getUserMediaSuccess = (stream) => {
        // Stop old tracks if any
        try {
            window.localStream?.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.log("Error stopping old tracks:", err);
        }

        // Set new local stream
        window.localStream = stream;
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        // Update tracks for all peer connections
        for (let id in connections.current) {
            if (id === socketIdRef.current) continue; // Skip self

            const pc = connections.current[id];
            const senders = pc.getSenders();

            // Replace existing tracks if present, otherwise add track
            stream.getTracks().forEach((track, i) => {
                if (senders[i]) {
                    senders[i].replaceTrack(track);
                } else {
                    pc.addTrack(track, stream);
                }
            });
        }

        // Optional: handle track end (e.g., user stops camera/mic)
        stream.getTracks().forEach((track) => {
            track.onended = () => {
                console.log(`${track.kind} track ended`);
                // Set black/silent track or handle UI updates here
            };
        });
    };


    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas", { width, height }))

        canvas.getContext("2d").fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    let getUserMedia = () => {
        if ((videoEnabled && videoAvailable) || (audioEnabled && audioAvailable)) {
            return navigator.mediaDevices.getUserMedia({
                video: videoEnabled && videoAvailable,
                audio: audioEnabled && audioAvailable
            })
                .then(stream => {
                    getUserMediaSuccess(stream);
                    return stream; // IMPORTANT
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });
        } else {
            try {
                let tracks = localVideoRef.current?.srcObject?.getTracks();
                tracks?.forEach(track => track.stop());
            } catch (err) {
                console.log(err);
            }
            return Promise.resolve(null); // IMPORTANT
        }
    };


    useEffect(() => {
        getUserMedia();
    }, [videoEnabled, audioEnabled]);

    function gotMessageFromServer(fromId, message) {
        const signal = message;

        if (fromId === socketIdRef.current) return; // ignore self

        const pc = connections.current[fromId];
        if (!pc) {
            console.warn("No peer connection for", fromId);
            return;
        }

        if (signal.sdp) {
            pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(() => {
                    if (signal.sdp.type === "offer") {
                        pc.createAnswer()
                            .then(answer => pc.setLocalDescription(answer))
                            .then(() => {
                                socketRef.current.emit("signal", fromId, {
                                    sdp: pc.localDescription
                                });
                            })
                            .catch(err => console.error("Answer error:", err));
                    }
                })
                .catch(err => console.error("Remote description error:", err));
        }

        if (signal.ice) {
            pc.addIceCandidate(new RTCIceCandidate(signal.ice))
                .catch(err => console.error("ICE error:", err));
        }
    }

    function getMessage(data, sender, socketIdSender) {
        console.log("getMessage fired:", data, sender, socketIdSender);
        setMessages(prev => {
            const updated = [...prev, { sender, data, time: new Date().toLocaleTimeString() }];
            console.log("Updated messages:", updated);
            return updated;
        });
        if (socketIdSender !== socketIdRef.current) {
            setNewMessage(prev => prev + 1);
        }
    }


    let connectToSocketServer = () => {
        socketRef.current = io(server_url);

        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.on("connect", () => {
            const roomId = window.location.pathname.replace("/", "");
            console.log(roomId)
            socketRef.current.emit("join-call", roomId);
            console.log("User connected:", socketRef.current.id);

            socketIdRef.current = socketRef.current.id;

            socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
                console.log("Client received chat-message:", data, sender, socketIdSender);
                getMessage(data, sender, socketIdSender);
            });

            socketRef.current.on("user-left", (id) => {
                setVideo((videos) => videos.filter((video) => video.socketId !== id));
            });

            socketRef.current.on("user-joined", (id, clients) => {
                if (!window.localStream) return;

                clients.forEach(socketListId => {
                    if (socketListId === socketIdRef.current) return;

                    connections.current[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    const pc = connections.current[socketListId];

                    pc.onicecandidate = (event) => {
                        if (event.candidate) {
                            socketRef.current.emit("signal", socketListId, {
                                ice: event.candidate
                            });
                        }
                    };

                    pc.ontrack = (event) => {

                        setVideos(prev => {
                            if (prev.find(v => v.socketId === socketListId)) return prev;
                            return [...prev, { socketId: socketListId, stream: event.streams[0] }];
                        });
                    };

                    window.localStream.getTracks().forEach(track => {
                        pc.addTrack(track, window.localStream);
                    });
                });

                // Only existing users create offer to the NEW user
                if (id !== socketIdRef.current) {

                    connections.current[id]
                        .createOffer()
                        .then(offer => connections.current[id].setLocalDescription(offer))
                        .then(() => {
                            socketRef.current.emit("signal", id, {
                                sdp: connections.current[id].localDescription
                            });
                        })
                        .catch(err => console.log("Offer error:", err));
                }
            });
        })
    }
    let getMedia = async () => {
        await getUserMedia();
        connectToSocketServer();
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    let handleVideo = () => {
        setVideoEnabled(!videoEnabled);
    }
    let handleAudio = () => {
        setAudioEnabled(!audioEnabled);
    }
    let handleScreen = () => {
        setScreen(!screen);
    }
    let handleEndCall = () => {
        if (window.localStream) {
            window.localStream.getTracks().forEach(track => track.stop());
            redirectTo("/")
        }
    }
    let handleChat = () => {
        setShowModel(!showModel)
    }
    let sendMessage = () => {
        if (socketRef.current) {
            console.log(message, username);
            socketRef.current.emit("chat-message", message, username);
            setMessage("");
        } else {
            console.error("Socket not connected");
        }
    }


    let getDisplayMediaSuccess = (stream) => {
        // Stop old tracks if any
        try {
            window.localStream?.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.log("Error stopping old tracks:", err);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections.current) {
            if (id === socketIdRef.current) continue;

            // Modern API: add tracks
            stream.getTracks().forEach(track => {
                connections.current[id].addTrack(track, stream);
            });

            connections.current[id].createOffer().then(description => {
                connections.current[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections.current[id].localDescription }));
                }).catch(err => console.log(err));
            });
        }

        // Replace tracks in existing senders
        stream.getTracks().forEach((track, i) => {
            if (senders[i]) {
                senders[i].replaceTrack(track);
            }
        });

        // Optional: handle track end
        stream.getTracks().forEach(track => {
            track.onended = () => {
                console.log(`${track.kind} track ended`);
                // Handle UI updates here
            };
        });
    };

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen]);

    let getDisplayMedia = async () => {
        if (screen && navigator.mediaDevices.getDisplayMedia) {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                getDisplayMediaSuccess(stream);
            } catch (err) {
                console.error("Error getting display media:", err);
            }
        }
    };


    return (
        <div>
            {askForUsername ? (
                /* ================= PRE-JOIN LOBBY ================= */
                <div className={usernamestyles.userContainer}>
                    <div className={usernamestyles.enterUserContainer}>
                        {/* Video Preview */}
                        <div className={usernamestyles.previewBox}>
                            <video ref={localVideoRef} autoPlay muted playsInline />
                            <div className={usernamestyles.previewControls}>
                                <IconButton onClick={handleVideo}>
                                    {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                                </IconButton>
                                <IconButton onClick={handleAudio}>
                                    {audioEnabled ? <MicIcon /> : <MicOffIcon />}
                                </IconButton>
                            </div>
                        </div>

                        {/* Username Input */}
                        <div className={usernamestyles.usernameContainer}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <Button variant="contained" onClick={connect}>
                                Join Room
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                /* ================= CONFERENCE ================= */
                <div className={videostyles.stage}>
                    <div className={videostyles.videoStage}>
                        <div className={videostyles.videoGrid}>
                            {/* Local Video */}
                            <div className={videostyles.videoWrapper}>
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className={videostyles.videoElement}
                                />
                                {!audioEnabled && (
                                    <div className={videostyles.videoIcon}>
                                        <MicOffIcon />
                                    </div>
                                )}
                            </div>

                            {/* Remote Videos */}
                            {videos.map(v => (
                                <div key={v.socketId} className={videostyles.videoWrapper}>
                                    <video
                                        autoPlay
                                        playsInline
                                        ref={(el) => el && (el.srcObject = v.stream)}
                                        className={videostyles.videoElement}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Control Dock */}
                        <div className={videostyles.controlDock}>
                            <IconButton onClick={handleVideo}>
                                {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                            <IconButton onClick={handleAudio}>
                                {audioEnabled ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>
                            {screenAvailable && (
                                <IconButton onClick={handleScreen}>
                                    {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                                </IconButton>
                            )}
                            <Badge badgeContent={newMessage} color="secondary">
                                <IconButton onClick={handleChat}>
                                    <ChatIcon />
                                </IconButton>
                            </Badge>
                            <IconButton onClick={handleEndCall} className={videostyles.endBtn}>
                                <CallEndIcon />
                            </IconButton>
                        </div>
                    </div>

                    {/* Chat Panel */}
                    {showModel && (
                        <div className={chatstyles.glassChat}>
                            <h2>Chat</h2>

                            <div className={chatstyles.chatbox}>
                                {messages.map((m, i) => {
                                    const isMe = m.sender === username;
                                    return (
                                        <div
                                            key={i}
                                            className={isMe ? chatstyles.me : chatstyles.other}
                                        >
                                            <span>{m.sender}</span>
                                            <p>{m.data}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={chatstyles.chatSendContainer}>
                                <TextField
                                    fullWidth
                                    label="Message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <Button onClick={sendMessage}>Send</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

    );
}

export default VideoMeetComponent;