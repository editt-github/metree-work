import React, { useState, useEffect, useRef} from 'react'
import { useSelector } from "react-redux";
import firebase from '../firebase';
import { Button, Input, Form, Table, message,Select, Checkbox, Switch } from "antd";
import { OderModalPopup } from './View';
import * as XLSX from 'xlsx/xlsx.mjs';
import { SiMicrosoftexcel } from "react-icons/si";
const { Option } = Select;

function UserAdmin() {
  const userInfo = useSelector((state) => state.user.currentUser);   
  const [Rerender, setRerender] = useState(false)
  const [UserData, setUserData] = useState();
  const fileRef = useRef();
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
    setPosY(e.pageY);
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
    values.role = values.role ? parseInt(values.role) : selUserData.role
    firebase.database().ref(`users/${selUserData.uid}`)
    .update({...values})

    firebase.database().ref(`lunch/user/${selUserData.uid}`).update({
        part: values.part
      })
    setRerender(!Rerender)
    setmodifyPop(false)
    message.success('업데이트 완료');
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
      title: '소속',
      dataIndex: 'sosok',
      key: 'sosok',
      align: 'center',     
      width: '130px', 
      sorter: (a, b) => a.sosok < b.sosok ? -1 : 1,
      render: data => data === '1' ? '미트리' : data === '2' ? '푸드킹' : '미에르'
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
      title: '복지이용',
      dataIndex: 'welfare_able',
      key: 'welfare_able',
      align: 'center',
      width: '120px',       
      render: data => data === false ? '이용불가' : '이용가능'
    },
    {
      title: '복지대상자',
      dataIndex: 'welfare_range',
      key: 'welfare_range',
      align: 'center',       
      render: data => data ? `${data.join(', ')}` : ''
    },
    {
      title: '관리',
      dataIndex: 'uid',
      key: 'uid',
      align: 'center',     
      render: data => data ? <Button onClick={(e)=>onUserModify(e,data)}>수정</Button> : ""
    },
  ]  

  const [uploadData, setUploadData] = useState([])
  const onParseExel = (event) => {
    let input = event.target;
    let reader = new FileReader();
    reader.onload = function(){
        let fileData = reader.result;
        let wb = XLSX.read(fileData, {type : 'binary'});
        wb.SheetNames.forEach(function(sheetName){
	        let rowObj =XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
	        setUploadData(rowObj);
        })
    };
    reader.readAsBinaryString(input.files[0]);
  }

  const exelDowonload = () => {
    const ws = XLSX.utils.json_to_sheet(UserData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Sheet1');
    XLSX.writeFile(wb,`test.xlsx`)
  }

  const onUpdateData = () => {
    
    if(uploadData.length > 0){
      uploadData.map(el=>{
        //기본 유저정보
        firebase.database().ref(`users/${el.uid}`).update({
          auth: el.auth ? el.auth : '',
          part: el.part,
          sosok: el.sosok
        })
        //식단체크 유저정보
        firebase.database().ref(`lunch/user/${el.uid}`).update({
          part: el.part,
        })
      })
      message.success('업데이트 완료');
      fileInit();
    }else{
      message.error('엑셀을 업로드 해주세요')
    }
  }
  const fileInit = () => {
    fileRef.current.value = '';
    setUploadData([]);
  }
  return (
    <>
      <div style={{marginBottom:"10px"}}>sosok참고 : 1 미트리 / 2 푸드킹 / 3 미에르</div>
      <div className='flex-box' style={{marginBottom:"10px"}}>
        <Button onClick={exelDowonload}><SiMicrosoftexcel style={{marginRight:"4px",position:"relative",top:"2px",fontSize:"15px"}} />엑셀다운</Button>
        <div style={{marginLeft:"auto"}}>
          <Button style={{marginRight:"5px"}} onClick={fileInit}>파일 초기화</Button>
          <input ref={fileRef} type="file" id="excelFile" onChange={onParseExel}/>
          <Button onClick={onUpdateData}><SiMicrosoftexcel style={{marginRight:"4px",position:"relative",top:"2px",fontSize:"15px"}} />엑셀적용</Button>
        </div>
      </div>
      {UserData &&
      <>
        <Table
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
           style={{position:"absolute",minWidth:"100px",top:PosY,left:PosX,transform:"translate(-115%,-80px)"}}
          >
            <Form 
              initialValues={{
                'role':selUserData.role,
                'auth':selUserData.auth,
                'part':selUserData.part,
                'sosok':selUserData.sosok,
                'welfare_range':selUserData.welfare_range,
                'welfare_able':selUserData.welfare_able === false ? false : true
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
              <Form.Item name="sosok" label="소속" style={{marginBottom:"10px"}}>
                <Select>                  
                  <Option value="1">미트리</Option>
                  <Option value="2">푸드킹</Option>
                  <Option value="3">미에르</Option>
                </Select>
              </Form.Item>
              <Form.Item name="part" label="부서" style={{marginBottom:"10px"}}>
                <Select>
                  <Option value="photoUrl" disabled hidden>
                    부서
                  </Option>
                  <Option value="총괄">총괄</Option>
                  <Option value="R&D운영본부">R&D운영본부</Option>
                  <Option value="영업지원본부">영업지원본부</Option>
                  <Option value="총괄기획본부">총괄기획본부</Option>
                  <Option value="IT개발본부">IT개발본부</Option>
                  <Option value="온라인사업본부">온라인사업본부</Option>
                  <Option value="경영관리본부">경영관리본부</Option>
                  <Option value="문화사업본부">문화사업본부</Option>
                  <Option value="푸드킹">푸드킹</Option>
                  <Option value="미에르">미에르</Option>
                </Select>
              </Form.Item>
              <Form.Item name="welfare_range" label="복지" style={{marginBottom:"10px"}}>
                <Checkbox.Group>
                <Checkbox value="배우자(부)">배우자(부)</Checkbox>
                <Checkbox value="배우자(처)">배우자(처)</Checkbox>
                <Checkbox value="자녀(자)">자녀(자)</Checkbox>
                <Checkbox value="자녀(여)">자녀(여)</Checkbox>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item 
                name="welfare_able" 
                label="이용" 
                valuePropName="checked">
                <Switch />
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
