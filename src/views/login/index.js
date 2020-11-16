import React, { useState } from 'react';
import { login, register } from "../../services/user";
import Cookies from 'universal-cookie';
import { useHistory } from "react-router-dom";

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [cpassword, setCpassword] = useState("");
    const [pwdMismatch, setPwdMismatch] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const cookies = new Cookies();
    let history = useHistory();
    
    const handleInput = (e) => {
        if (e.target.name === "email") {
            setEmail(e.target.value);
        } else if (e.target.name === "password") {
            setPassword(e.target.value);
        } else {
            setCpassword(e.target.value);
        }
    }

    const handleView = (mode) => {
        if (mode === "register") {
            setIsLogin(false);
        } else {
            setIsLogin(true);
        }
    }

    const handleSubmit = (e, type) => {
        e.preventDefault();

        let payload = {
            email,
            password
        }
        
        if (type === "register") {
            if (password !== cpassword) {
                setPwdMismatch(true);
                // console.log("pwd mismatch");
            } else {
                payload.offsetForTz = new Date().getTimezoneOffset();
                // make register fetch request
                register(payload).then(res => {
                    // console.log("successfully registered", res);
                    cookies.set("token", res.token);
                    storeCredsLocally(res);
                })
                .catch(e => {
                    console.log("e::", e);
                    if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                        this.props.history.push("/");
                    }
                });
            }
        } else {
            // make login fetch request
            login(payload).then(res => {
                // console.log("successfully logged in", res);
                storeCredsLocally(res);
                history.push("/workspaces");
            })
            .catch(e => {
                console.log("e::", e);
                if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                    this.props.history.push("/");
                }
            });
        }
    }

    const storeCredsLocally = (res) => {
        debugger;
        localStorage.setItem("token", res.token);
        localStorage.setItem("user_id", res.user_id);
        localStorage.setItem("offsetForTz", res.offsetForTz);
    }

    return (<div>
        {isLogin ?
            <form onSubmit={($event) => handleSubmit($event, "login")}>
                <span>Login:</span>
                <div>
                    <label>
                        Email:
            </label>
                    <input type="email"
                        name="email"
                        value={email}
                        onChange={handleInput}
                        required
                    />
                </div>
                <div>
                    <label>
                        Password:
            </label>
                    <input type="password"
                        name="password"
                        value={password}
                        onChange={handleInput}
                        required
                    />
                </div>
                <div>
                    <input type="submit" value="Submit" />
                </div>
                <span onClick={() => handleView("register")}>New to tthroo? register</span>
            </form> :
            <form onSubmit={($event) => handleSubmit($event, "register")}>
                <span>Register:</span>
                <div>
                    <label>
                        Email:
                </label>
                    <input type="email"
                        name="email"
                        value={email}
                        onChange={handleInput}
                        required
                    />
                </div>
                <div>
                    <label>
                        Password:
                </label>
                    <input type="password"
                        name="password"
                        value={password}
                        onChange={handleInput}
                        required
                    />
                </div>
                <div>
                    <label>
                        Confirm Password:
                    </label>
                    <input type="password"
                        name="cpassword"
                        value={cpassword}
                        onChange={handleInput}
                        required
                    />
                </div>
                <input type="submit" value="Submit" />
                {pwdMismatch ? <div>Passwords won't match, Please check again.</div> : null}
                <span onClick={() => handleView("login")}>Existing User? Login.</span>
            </form>
        }
    </div>)
}

export default Login;