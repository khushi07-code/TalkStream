import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import ForgotPassword from './ForgotPassword';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from './CustomIcons';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

export default function SignInCard() {
    const [error,setError]=React.useState();
    const [Message,setMessage]=React.useState();
    const [open, setOpen] = React.useState(false);
    const [formState,setFormState]=React.useState(0);
    const [username, setUsername]=React.useState();
    const [name,setName]=React.useState()
    const [password,setPassword]=React.useState();
    const {handleRegister,handleLogin}=React.useContext(AuthContext);
    const handleClickOpen = () => {
        setOpen(true);
    };
    let navigate=useNavigate();

    const handleClose = () => {
        setOpen(false);
    };

    async function handleAuth(){
        try {
            if(formState===0){
                const result=await handleLogin({username,password});
                setMessage(result);
                setError("");
                setFormState(0);
                setPassword("")
                navigate("/home")
            }
            if(formState===1){
                console.log(name,username,password)
                let result=await handleRegister({name,username,password});
                setMessage(result);
                console.log(result);
            }
            
        } catch (error) {
            let message=(error.responsive.data.message);
            setError(message);
        }

    }

    return (
        <Card variant="outlined">
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <SitemarkIcon />
            </Box>
            <Box
                sx={{ width: '100%',textAlign:"center", fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
               <LockPersonIcon fontSize="large"/>
               <br />
               <Button variant={formState===0?"contained":"outline"} onClick={()=>setFormState(0)}>Sign in</Button>
               <Button  variant={formState===1?"contained":"outline"} onClick={()=>setFormState(1)}>Sign up</Button>
            </Box>
            <Box
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
            >
                {formState===1?
                <FormControl>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <TextField
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Full name"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        onChange={(e)=>{setName(e.target.value)}}
                    />
                </FormControl>
                :<></>}
                <FormControl>
                    <FormLabel htmlFor="username">Username</FormLabel>
                    <TextField
                        id="username"
                        type="text"
                        name="username"
                        placeholder="@username"
                        autoComplete="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        onChange={(e)=>setUsername(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <Link
                            component="button"
                            type="button"
                            onClick={handleClickOpen}
                            variant="body2"
                            sx={{ alignSelf: 'baseline' }}
                        >
                            Forgot your password?
                        </Link>
                    </Box>
                    <TextField
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        onChange={(e)=>{setPassword(e.target.value)}}
                    />
                </FormControl>
                <ForgotPassword open={open} handleClose={handleClose} />
                <Button type="submit" fullWidth variant="contained" onClick={handleAuth}>
                    {formState===0 ? "Sign in":"Sign up"}
                </Button>
            </Box>
            <Divider>or</Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign in with Google')}
                    startIcon={<GoogleIcon />}
                >
                    Sign in with Google
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign in with Facebook')}
                    startIcon={<FacebookIcon />}
                >
                    Sign in with Facebook
                </Button>
            </Box>
        </Card>
    );
}