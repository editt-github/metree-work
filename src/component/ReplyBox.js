import React, { useState } from 'react'
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
                  <button type="button" className="btn-init">
                    <antIcon.AiOutlineCloseSquare onClick={()=>replyDel(el.uid)} style={{fontSize:"16px"}} />
                  </button>  
                }
              </div>    
              <div className="desc">
                {el.desc}
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
