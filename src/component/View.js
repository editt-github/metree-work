import React, { useState, useEffect, useRef } from 'react'
import firebase from '../firebase';
import { useRouteMatch, Link } from "react-router-dom";
import { Descriptions, Button, Input } from 'antd';
import styled from "styled-components";
import { Select } from 'antd';
import { useSelector } from "react-redux";
import { getFormatDate } from './CommonFunc'
const { Option } = Select;
export const OderModalPopup = styled.div`
  width: auto;
  min-width:400px;
  padding: 20px;
  border: 1px solid #ddd;
  position: absolute;
  left: 50%;bottom:40px;transform: translateX(-50%);
  z-index: 150;
  border-radius: 10px;
  background: #fff;
  transition: all 0.2s;
  box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.25);
  .modal-loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  @media all and (max-width: 640px) {
    width: 90vw;min-width:0;
    max-width: 300px;
    bottom:135px;
  }
  .num {
    width: 40px;
    text-align: center;
    margin: 0 -1px;
  }
  .tit {
    display: inline-block;
    margin-right: 5px;
    flex-shrink: 0;
  }
  .btn-box {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    button {
      width: 100px;
    }
  }
`;

function View() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const btnToList = useRef();
  const btnToModify = useRef();
  const stateSel = useRef();
  const [UserDb, setUserDb] = useState();  
  const match = useRouteMatch("/view/:uid");
  const [ViewData, setViewData] = useState();
  const [Rerender, setRerender] = useState(false);

  useEffect(() => {
    if(userInfo){
      firebase
      .database()
      .ref("users")
      .child(userInfo.uid)
      .once("value", (snapshot) => {
        setUserDb(snapshot.val());
      });
    }
    
    firebase.database().ref(`work_list/${match.params.uid}`)
    .once("value")
    .then(snapshot => {
      setViewData(snapshot.val())
    })
    return () => {
    }
  }, [Rerender]);
  const contentDesc = () => {
    let content;
    if(OgContent){
      content = ViewData.og_content
    }else{
      content = ViewData.content
    }
    return {__html: content}
  }
  const [OgContent, setOgContent] = useState(false);
  const onOgContent = () => {
    console.log(OgContent)
    setOgContent(!OgContent)
  }

  const [StatePop, setStatePop] = useState(false)
  const onStatePop = () => {
    setStatePop(true);
  }

  const [StateSelect, setStateSelect] = useState();
  const onStateChange = (e) => {
    setStateSelect(e.target.value)
  }

  const [StateInput, setStateInput] = useState();
  const onStateInput = (e) => {
    setStateInput(e.target.value)
  }

  const onStateModify = () => {
    let arr = [];
    let obj = {}
    if(ViewData.log){
      arr = ViewData.log
    }
    obj = {
      date:getFormatDate(new Date()),
      name:userInfo.displayName,
      part:userInfo.photoURL,
      state:stateSel.current.value,
      desc:StateInput ? StateInput : ""
    }
    arr.push(obj);

    firebase.database().ref(`work_list/${match.params.uid}`)
    .update({
      state:stateSel.current.value,
      log:arr
    })
    setRerender(!Rerender)
    setStatePop(false)
  }
  const onCloseStatePop = () => {
    setStatePop(false);
  }

  const onDelete = () => {
    const agree = window.confirm("삭제시 복구가 불가능합니다. 삭제하시겠습니까?");
    if(agree){
      firebase.database().ref(`work_list/${match.params.uid}`).remove()
      window.alert("삭제되었습니다.")
      btnToList.current && btnToList.current.click();
    }
  }

  const onModify = () => {
    btnToModify.current && btnToModify.current.click();
  }
  return (
    <>
      {ViewData &&
        <>
          <Descriptions title={ViewData.title} bordered>
            <Descriptions.Item label="상태">
              <div style={{position:"relative"}}>              
                {
                  ViewData.state === "0" ? (<span className="state-txt0">대기</span>) :
                  ViewData.state === "1" ? (<span className="state-txt1">접수</span>) :
                  ViewData.state === "2" ? (<span className="state-txt2">진행</span>) :
                  ViewData.state === "3" ? (<span className="state-txt3">완료</span>) : ''
                }              
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="작성일">{`${ViewData.d_regis.full_} ${ViewData.d_regis.hour}:${ViewData.d_regis.min}`}</Descriptions.Item>
            <Descriptions.Item label="작성자">{ViewData.name}</Descriptions.Item>
            {ViewData.type === "1" ?
              (
                <>
                  <Descriptions.Item label="유형1">
                    일반
                  </Descriptions.Item>
                  <Descriptions.Item label="유형2">
                    {
                      ViewData.basic_type === "1" ? '일반' :
                      ViewData.basic_type === "2" ? '프로젝트' : ''
                    }
                  </Descriptions.Item>
                  <Descriptions.Item label="긴급">
                    {ViewData.emergency ? 'O' : ''}
                  </Descriptions.Item>
                </>
              ):
              (
                <>
                  <Descriptions.Item label="유형1">
                    프로젝트
                  </Descriptions.Item>
                  <Descriptions.Item label="유형2">
                    {
                      ViewData.project_type === "1" ? '개편' :
                      ViewData.project_type === "2" ? '추가' : ''
                    }
                  </Descriptions.Item>
                  <Descriptions.Item label="기간">
                    {ViewData.project_date[0].full_} ~ {ViewData.project_date[1].full_}
                  </Descriptions.Item>
                </>
              )
            }
            <Descriptions.Item span={3} label="내용">
                <div dangerouslySetInnerHTML={contentDesc()}></div>
            </Descriptions.Item>
            <Descriptions.Item span={3} label="상태기록">
              <ul className="log-list">
                {
                  ViewData.log && ViewData.log.map((el,idx) => (
                    <>
                      <li className="flex-box" key={idx}>
                        <div>
                          {
                            el.state === "9" ? (<span className="state-txt9">수정</span>) :
                            el.state === "0" ? (<span className="state-txt0">대기</span>) :
                            el.state === "1" ? (<span className="state-txt1">진행</span>) :
                            el.state === "2" ? (<span className="state-txt2">완료</span>) : ''
                          }
                        </div>
                        <div>
                          {`${el.date.full_} ${el.date.hour}:${el.date.min}`}
                        </div>
                        <div>{el.name}({el.part})</div>
                        <div>{el.desc ? el.desc : ""}</div>
                      </li>
                    </>
                  ))
                }
                </ul>
            </Descriptions.Item>
          </Descriptions>
          <div className="view-btn-box">
            <Button>
              <Link ref={btnToList} to="/">목록으로</Link>
            </Button> 
              <Button onClick={onOgContent}> {!OgContent ? '원본보기' : '수정본보기' }</Button>         
            <Button onClick={onStatePop}>
              상태변경
            </Button>
            {
              ViewData.user_uid === userInfo.uid &&
              <Button onClick={onModify}>
                <Link ref={btnToModify} to={`/modify/${match.params.uid}`}>수정</Link>
              </Button>
            }
            {
              (UserDb && UserDb.role) > 2 || (ViewData.user_uid === userInfo.uid) &&
              <Button onClick={onDelete}>
                삭제
              </Button>
            }
            {StatePop && 
              <OderModalPopup>
                <div className="flex-box a-center">
                  <select ref={stateSel} defaultValue={ViewData.state} onChange={onStateChange} style={{ width: "60px",marginRight:"5px" }}>
                    <option value="0">대기</option>
                    <option value="1">접수</option>
                    <option value="2">진행</option>
                    <option value="3">완료</option>
                  </select>
                  <Input placeholder="기록사항" style={{marginRight:"5px",flex:1}} onChange={onStateInput} />
                </div>
                <div className="flex-box j-center" style={{marginTop:"10px"}}>
                <Button style={{marginRight:"5px"}} onClick={onStateModify}>확인</Button>
                <Button onClick={onCloseStatePop}>닫기</Button>
                </div>
              </OderModalPopup>
            }
          </div>
      </>
      }
    </>
  )
}

export default View
