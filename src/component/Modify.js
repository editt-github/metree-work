import React, { useState, useEffect, useRef } from 'react'
import { useRouteMatch, Link } from "react-router-dom";
import '@toast-ui/editor/dist/toastui-editor.css';
import firebase from '../firebase';
import { Editor } from '@toast-ui/react-editor';
import { Button, Form, Input, Radio, Select, DatePicker, Checkbox } from 'antd';
import { getFormatDate } from './CommonFunc'
import uuid from "react-uuid";
import moment from 'moment';
import { useSelector } from "react-redux";
const { Option } = Select;
const { RangePicker } = DatePicker;

function Modify() {
  const match = useRouteMatch("/modify/:uid");
  const userInfo = useSelector((state) => state.user.currentUser);
  const editorRef = React.useRef();
  const btnToView = React.useRef();
  const [Type, setType] = useState()

  const [ViewData, setViewData] = useState();
  useEffect(() => {
    firebase.database().ref(`work_list/${match.params.uid}`)
    .once("value")
    .then(snapshot => {
      setViewData(snapshot.val())
      setType(snapshot.val().type)
    })
    return () => {
    }
  }, [])

  const onTypeChange = (e) => {
    const type = e.target.value;
    setType(type);
  }  
  
  const [DatePic, setDatePic] = useState()
  const onDatePicker = (e) => {
    setDatePic(e)
  }

  const onsubmit = (values) => {
    
    if(values.project_date){
      let date = [];
      date.push(getFormatDate(values.project_date[0]._d));
      date.push(getFormatDate(values.project_date[1]._d));
      values.project_date = date;
    }else{
      values.project_date = ViewData.project_date ? ViewData.project_date : null
    } 
    const getEditor = editorRef.current.getInstance();
    const getHtml = getEditor.getHTML();
    values.title === "" && window.alert('제목을 입력해 주세요.')
    values.title = values.title ? values.title : ViewData.title; 
    values.emergency = values.emergency ? true : false;
    values.type = Type ? Type : ViewData.type; 
    values.modify_log = values.modify_log ? values.modify_log : "";
    if(values.type === "1"){
      values.project_date = null;
    }
    
    firebase.database().ref(`work_list/${match.params.uid}`)
    .update({
      ...values,
      content:getHtml,
    })

// 상태기록
    let arr = [];
    let obj = {}
    if(ViewData.log){
      arr = ViewData.log
    }
    
    obj = {
      date:getFormatDate(new Date()),
      name:userInfo.displayName,
      part:userInfo.photoURL,
      state:"9",
      desc:values.modify_log
    }
    arr.push(obj);
    firebase.database().ref(`work_list/${match.params.uid}`)
    .update({
      log:arr
    })
    
    
    btnToView.current && btnToView.current.click();
  }
  return (
    <>
      {ViewData &&
      <Form name="dynamic_form_nest_item" className="work-list-form"
      initialValues={{
        'emergency': ViewData.emergency,
        'basic_type': ViewData.basic_type,
        'project_type': ViewData.project_type,
      }} 
      onFinish={onsubmit} autoComplete="off">
        <Form.Item
          name="title"
        >
          <Input placeholder="제목" defaultValue={ViewData.title} />
        </Form.Item>
        <Form.Item 
          name="type"
          onChange={onTypeChange}
        >
          <Radio.Group defaultValue={ViewData.type}>
            <Radio.Button value="1">일반</Radio.Button >
            <Radio.Button value="2">프로젝트</Radio.Button >
          </Radio.Group>
        </Form.Item>

        {Type && Type === "1" && 
          <>
            <div className="flex-box">
              <Form.Item
                name="basic_type"
                style={{width:"100%",maxWidth:"120px",marginRight:"10px"}}
                rules={[{ required: true, message: '유형을 선택해 주세요.'}]}
              >
                <Select placeholder="유형선택">
                  <Option value="1">오류</Option>
                  <Option value="2">수정/추가</Option>
                </Select>
              </Form.Item>
              <Form.Item 
                name="emergency" valuePropName="checked">
                <Checkbox>긴급사항</Checkbox>
              </Form.Item>
            </div>
          </>
        }

        {Type && Type === "2" && 
          <>
            <div className="flex-box">
              <Form.Item
                name="project_type"
                style={{marginRight:"5px"}}
                rules={[{ required: true, message: '유형을 선택해 주세요.'}]}
              >
                <Select placeholder="유형선택">
                  <Option value="1">개편</Option>
                  <Option value="2">추가</Option>
                </Select>
              </Form.Item>
                {ViewData.project_date ? (
                  <>
                  <Form.Item
                    name="project_date"                                    
                  > 
                    <RangePicker onCalendarChange={onDatePicker} defaultValue={[moment(ViewData.project_date[0].full_,'YYYY-MM-DD'),moment(ViewData.project_date[1].full_,'YYYY-MM-DD')]}/>
                  </Form.Item>
                  </>
                ):(
                  <>
                  <Form.Item
                    name="project_date"                               
                  > 
                    <RangePicker onCalendarChange={onDatePicker} />
                  </Form.Item>
                  </>
                )}
            </div>
          </>
        }
        
        <Editor
          initialValue={ViewData.content}
          previewStyle="vertical"
          height="600px"
          initialEditType="wysiwyg"
          useCommandShortcut={true}
          ref={editorRef}
        />
        <Form.Item name="modify_log" style={{marginTop:"15px"}}>
          <Input placeholder="수정사항 기록" />
        </Form.Item>
        <div className="flex-box j-center" style={{margin:"20px 0"}}>
          <Button style={{marginRight:"5px"}}>
            <Link to="/">목록으로</Link>
          </Button>
          <Button style={{marginRight:"5px"}}>
            <Link ref={btnToView} to={`/view/${match.params.uid}`}>게시물로</Link>
          </Button>
          <Button type="primary" htmlType="submit">확인</Button>
        </div>
      </Form>
      }
    </>
  )
}

export default Modify
