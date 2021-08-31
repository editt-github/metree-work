import React, { useState, useEffect} from 'react'
import { useSelector } from "react-redux";
import firebase from '../firebase';
import { Button, Input, Form, Table } from "antd";
import { OderModalPopup } from './View';

function UserAdmin() {
  const userInfo = useSelector((state) => state.user.currentUser);   
  const [Rerender, setRerender] = useState(false)
  const [UserData, setUserData] = useState()
  useEffect(() => {
    let arr = [];
    firebase.database().ref('users')
    .once("value",snapshot => {
      snapshot.forEach(el=>{
        let obj = {};
        obj = el.val();
        obj.uid = el.key
        arr.push(obj)
      })
      setUserData(arr)
    })
    
    return () => {
      firebase.database().ref('users').off()
    }
  }, [Rerender])

  const [PosX, setPosX] = useState(0);
  const [PosY, setPosY] = useState(0);  
  const [modifyPop, setmodifyPop] = useState(false)
  const [selUserData, setselUserData] = useState()
  const onUserModify = (e,uid) => {
    setselUserData('');
    setPosX(e.clientX);
    setPosY(e.clientY);
    firebase.database().ref(`users/${uid}`)
    .once("value",snapshot => {
      let obj = {
        ...snapshot.val(),
        uid:uid
      }
      setselUserData(obj)
      setmodifyPop(true)
    })
  }

  const onClosePop = () => {
    setmodifyPop(false)
  }

  const onsubmit = (values) => {
    console.log(values)
    values.role = values.role ? parseInt(values.role) : selUserData.role
    firebase.database().ref(`users/${selUserData.uid}`)
    .update({...values})
    setRerender(!Rerender)
    setmodifyPop(false)
  }


  const columns = [
    {
      title: 'uid',
      dataIndex: 'uid',
      key: 'uid',
      align: 'center',    
      width:'200px', 
      render: data => data
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      align: 'center',     
      width: '130px', 
      sorter: (a, b) => a.name < b.name ? -1 : 1,
      render: data => data ? data : ""
    },
    {
      title: '부서',
      dataIndex: 'part',
      key: 'part',
      align: 'center',     
      width: '130px', 
      sorter: (a, b) => a.part < b.part ? -1 : 1,
      render: data => data ? data : ""
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      align: 'center',     
      render: data => data
    },
    {
      title: 'role',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
      sorter: (a, b) => b.role - a.role,     
      render: data => data !== "" ? data : ""
    },
    {
      title: 'auth',
      dataIndex: 'auth',
      key: 'auth',
      align: 'center', 
      sorter: (a, b) => {
        let a_leng = a.auth ? a.auth.length : 0;
        let b_leng = b.auth ? b.auth.length : 0;
        return a_leng < b_leng ? -1 : 1
      },    
      render: data => data ? data : ""
    },
    {
      title: '관리',
      dataIndex: 'uid',
      key: 'uid',
      align: 'center',     
      render: data => data ? <Button onClick={(e)=>onUserModify(e,data)}>수정</Button> : ""
    },
  ]  
  return (
    <>
      {UserData &&
      <>
        <Table
          style={{maxWidth:"1000px"}}
          rowKey={ item => { return item.uid } }
          pagination={{
            pageSize:50,
            position:"bottomCenter"
          }}
          align="center" columns={columns} dataSource={UserData} 
        >

        </Table>        
        {modifyPop && selUserData &&
          <OderModalPopup className="user-admin-pop"
           style={{minWidth:"100px",top:PosY,left:PosX,transform:"translate(-115%,-80px)"}}
          >
            <Form 
              initialValues={{
                'role':selUserData.role,
                'auth':selUserData.auth,
              }}
              onFinish={onsubmit}
            >
              {selUserData.name}({selUserData.part})
              {userInfo && userInfo.role > 2 &&
                <Form.Item name="role" label="role" style={{marginBottom:"5px"}}>
                  <Input type="number" />
                </Form.Item>
              }
              <Form.Item name="auth" label="auth" style={{marginBottom:"10px"}}>
                <Input />
              </Form.Item>
              <div className="flex-box j-center">
                <Button type="primary" htmlType="submit">수정하기</Button>
                <Button style={{marginLeft:"5px"}} onClick={onClosePop}>닫기</Button>
              </div>
            </Form>
          </OderModalPopup>
        }
      </>
      }
    </>
  )
}

export default UserAdmin
