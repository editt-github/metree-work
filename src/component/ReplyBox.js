import React, { useState } from 'react'
import { Button, Input } from 'antd';
import * as antIcon from "react-icons/ai";
const { TextArea } = Input;

function ReplyBox(props) {

  const [ReplyTxt, setReplyTxt] = useState()
  const replyChange = (e) => {
    setReplyTxt(e.target.value)
  }
  const onClearTxt = () => {
    setReplyTxt()
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
                <span>{el.date.full_}</span>
                <span>{el.date.hour}:{el.date.min}</span>
                {
                  el.user_uid === props.uid &&
                  <button type="button" className="btn-init">
                    <antIcon.AiOutlineCloseSquare style={{fontSize:"16px"}} />
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
