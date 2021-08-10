import React, { useState, useEffect } from "react";
import { Route, Switch, useHistory, Link } from "react-router-dom";
import { Layout, Menu } from 'antd';
import './custom_antd.less';
import './App.css';
import firebase from './firebase';
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/actions/user_action";
import Login from "./component/Login";
import {
  DesktopOutlined,
  PieChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Main from "./component/Main";
import Write from "./component/Write";
import Modify from "./component/Modify";
import View from "./component/View";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

function App() {

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
  const [UserDb, setUserDb] = useState();

  let history = useHistory();
  let dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading);
  useEffect(() => {
    if(currentUser){  
      firebase
      .database()
      .ref("users")
      .child(currentUser.uid)
      .on("value", (snapshot) => {
        setUserDb(snapshot.val());
      });
    }
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        history.push("/");
        dispatch(setUser(user));
      } else {
        history.push("/login");
        dispatch(clearUser());
      }
    });
  }, []);




  const [LeftMenu, setLeftMenu] = useState(false);
  const onMenuHandler = () => {
    setLeftMenu(!LeftMenu);
  };

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
                  <Link to="/login" onClick={onMenuHandler}>
                    login
                  </Link>
                  <Link to="/join" onClick={onMenuHandler}>
                    join
                  </Link>
                </>
              ):(
                <>
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
                </>
              )}
            </div>
            {/* <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
              <Menu.Item key="1">nav 1</Menu.Item>
            </Menu> */}
          </div>
        </Header> 
        <Content className="content-box layout">
          <Switch>
            <Route exact path="/" component={Main} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/write" component={Write} />
            <Route exact path="/modify/:uid" component={Modify} />
            <Route exact path="/view/:uid" component={View} />
          </Switch>
        </Content>
      </Layout>
    </>
  );
}

export default App;
