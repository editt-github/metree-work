import React, { useState, useRef } from 'react'
import { Button, Input } from 'antd';
import * as antIcon from "react-icons/ai";
import firebase from 'firebase';
const { TextArea } = Input;

function ReplyBox(props) {

  const [ReplyTxt, setReplyTxt] = useState()
  const replyChange = (e) => {
    setReplyTxt(e.target.value)
  }
  const onClearTxt = () => {
    setReplyTxt()
  }

  const [ModyfyText, setModyfyText] = useState();
  const modifyChange = (e) => {
    setModyfyText(e.target.value)
  }
  const [InputModify, setInputModify] = useState(false);
  const [ModifyUid, setModifyUid] = useState();
  const [ModifyData, setModifyData] = useState()
  const replyModify = (uid) => {
    setInputModify(!InputModify);
    setModifyUid(uid);
    firebase.database().ref(`work_list/${props.ViewData.uid}/reply/${uid}`)
    .once("value", data => {
      setModifyData(data.val())
    })
  }
  const modyfySubmit = () => {
     let desc = ModyfyText ? ModyfyText : ModifyData.desc
     firebase.database().ref(`work_list/${props.ViewData.uid}/reply/${ModifyUid}`)
    .update({
      ...ModifyData,
      desc:desc
    });    
    setModyfyText();
    setInputModify(false);
  }

  const replyDel = (uid) => {
    const agree = window.confirm("삭제 하시겠습니까?")
    agree && 
    firebase.database().ref(`work_list/${props.ViewData.uid}/reply/${uid}`).remove()
  }

  return (
    <>
      {props.ViewData.reply && 
        <>
        <ul className="reply-list">
        {
          props.ViewData.reply.map((el,idx)=>(
            <li>
              <div className="top">
                <span className="name">{el.name}({el.part})</span>
                <span className="date">
                  {el.date.full_} {el.date.hour}:{el.date.min}
                </span>
                {
                  el.user_uid === props.uid &&
                  <>
                  <button type="button" className="btn-init">
                    <antIcon.AiOutlineEdit onClick={()=>replyModify(el.uid)} style={{fontSize:"16px"}} />
                  </button> 
                  <button type="button" className="btn-init">
                    <antIcon.AiOutlineCloseSquare onClick={()=>replyDel(el.uid)} style={{fontSize:"16px"}} />
                  </button>  
                  </>
                }
              </div>    
              <div className={InputModify && el.uid === ModifyUid ? "desc on" : "desc"}>
                {el.desc}
                {InputModify && el.uid === ModifyUid &&
                  <div className="flex-box modify-box">
                    <TextArea defaultValue={ModifyData.desc} value={ModyfyText} onChange={modifyChange} />
                    <Button onClick={modyfySubmit}>수정</Button>
                  </div>
                }
              </div>
            </li>
          ))
        }
        </ul>
        </>
      }  
      <div className="reply-box">
        <TextArea value={ReplyTxt} onChange={replyChange} />
        <Button onClick={()=>{
          props.onReplySubmit(ReplyTxt);
          onClearTxt()
        }} type="primary">댓글달기</Button>
      </div>
    </>
  )
}

export default ReplyBox
