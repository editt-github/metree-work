import React, { useState, useEffect } from "react";
import { Route, Switch, useHistory, Link } from "react-router-dom";
import { Layout, Menu } from 'antd';
import * as antIcon from "react-icons/ai";
import './custom_antd.less';
import './App.css';
import firebase from './firebase';
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/actions/user_action";
import Login from "./component/Login";
import { getNotificationPermission } from "./component/CommonFunc";
import Main from "./component/Main";
import Write from "./component/Write";
import Modify from "./component/Modify";
import View from "./component/View";
import Join from "./component/Join";
import MyList from "./component/MyList";
import UserAdmin from "./component/UserAdmin";
import Test from "./component/Test";
import Finish from "./component/Finish";
import FinishView from "./component/FinishView";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

function App() {
  function isDesktopOS(){
    return ( 'win16|win32|win64|windows|mac|macintel|linux|freebsd|openbsd|sunos'.indexOf(navigator.platform.toLowerCase()) >= 0 ); 
  }

  if(isDesktopOS()){
    getNotificationPermission();
  }

  const firebaseUserInfo = firebase.auth().currentUser;
  let name, email, photoUrl, uid, emailVerified;
  if (firebaseUserInfo != null) {
    name = firebaseUserInfo.displayName;
    email = firebaseUserInfo.email;
    photoUrl = firebaseUserInfo.photoURL;
    emailVerified = firebaseUserInfo.emailVerified;
    uid = firebaseUserInfo.uid; 
  }
  const currentUser = useSelector((state) => state.user.currentUser);

  let history = useHistory();
  let dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading);

  useEffect(() => {
    
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        firebase
        .database()
        .ref("users")
        .child(user.uid)
        .once("value", (snapshot) => {
          let addInfo = {
            ...user,
            auth:snapshot.val().auth,
            call_number:snapshot.val().call_number,
            favorite:snapshot.val().favorite,
            role:snapshot.val().role,
            sosok:snapshot.val().sosok,
          }
          history.push("/");
          dispatch(setUser(addInfo));
        });
      } else {
        history.push("/login");
        dispatch(clearUser());
      }
    });
  }, []);


  const onLogout = () => {
    firebase.auth().signOut();
  };  

  return (
    <>
      <Layout className="layout">
        <Header>
          <div className="content-box">
            <div className="flex-box nav-top-box">
              {!currentUser ? (
                <>
                  <Link to="/login" style={{marginRight:"10px"}}>
                    login
                  </Link>
                  <Link to="/join">
                    join
                  </Link>
                </>
              ):(
                <>
                  <div className="log-in">
                    <span style={{color:"#fff"}}>
                      {currentUser.displayName}님 반갑습니다.
                    </span>
                    <span
                      onClick={onLogout}
                      className="p-color-l"
                      style={{
                        cursor: "pointer",
                        marginLeft: "10px",
                      }}
                    >
                      logout
                    </span>
                  </div>
                </>
              )}
            </div>
            <Menu theme="dark" mode="horizontal" className="top-menu">
              <Menu.Item key="1"><Link to="/"><antIcon.AiOutlineHome style={{position:"relative",top:"3px"}} /> Total</Link></Menu.Item>
              <Menu.Item key="2"><Link to="/mylist"><antIcon.AiOutlineUser style={{position:"relative",top:"3px"}} /> My List</Link></Menu.Item>
              {(currentUser && currentUser.role > 2 || currentUser && currentUser.auth && currentUser.auth.includes('insa') || currentUser && currentUser.uid === "HWC2atFlYZfThocHHF7SH4a6MAt2") && 
              <Menu.Item key="9"><Link to="/user_admin">
                <antIcon.AiOutlineUser style={{position:"relative",top:"3px"}} /> User Admin</Link>
              </Menu.Item>
              }
              <Menu.Item key="3"><Link to="/finish">
                <antIcon.AiOutlineFileDone style={{position:"relative",top:"3px"}} /> Finish</Link>
              </Menu.Item>            
              {(currentUser && currentUser.role > 2 || currentUser && currentUser.uid === "HWC2atFlYZfThocHHF7SH4a6MAt2") && 
                  <Menu.Item key="99"><Link to="/test">
                    <antIcon.AiOutlineUser style={{position:"relative",top:"3px"}} /> test</Link>
                  </Menu.Item>
              }
            </Menu>
          </div>
        </Header> 
        <Content className="content-box layout">
          <Switch>
            <Route exact path="/" component={Main} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/join" component={Join} />
            <Route exact path="/write" component={Write} />
            <Route exact path="/modify/:uid" component={Modify} />
            <Route exact path="/view/:uid" component={View} />
            <Route exact path="/mylist" component={MyList} />
            <Route exact path="/user_admin" component={UserAdmin} />
            <Route exact path="/finish" component={Finish} />
            <Route exact path="/finish_view/:uid" component={FinishView} />
            <Route exact path="/test" component={Test} />
          </Switch>
        </Content>
      </Layout>
    </>
  );
}

export default App;
