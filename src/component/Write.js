import React, { useState, useRef } from 'react'
import { Link } from "react-router-dom";
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

function Write() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const editorRef = React.useRef();
  const btnToList = React.useRef();

  const [Type, setType] = useState("1")
  const onTypeChange = (e) => {
    const type = e.target.value;
    setType(type);
  }


  const onsubmit = (values) => {
    let d_regis = getFormatDate(new Date());
    if(values.project_date){
      let date = [];
      date.push(getFormatDate(values.project_date[0]._d));
      date.push(getFormatDate(values.project_date[1]._d));
      values.project_date = date;
    } 
    const uid = uuid();
    const getEditor = editorRef.current.getInstance();
    const getHtml = getEditor.getHTML();
    values.emergency = values.emergency ? true : false;
    values.type = Type; 
    const time = new Date().getTime();
    firebase.database().ref(`work_list/${uid}`)
    .set({
      ...values,
      content:getHtml,
      d_regis:d_regis,
      state:"0",
      uid:uid,
      name:userInfo.displayName,
      part:userInfo.photoURL,
      timestamp:time,
      user_uid:userInfo.uid
    })
    btnToList.current && btnToList.current.click();
  }
  return (
    <>
      <Form name="dynamic_form_nest_item" className="work-list-form" onFinish={onsubmit} autoComplete="off">
        <Form.Item
          name="title"
          rules={[{ required: true, message: '제목을 입력해 주세요.'}]}
        >
          <Input placeholder="제목" />
        </Form.Item>
        <Form.Item 
          name="type"
          onChange={onTypeChange}
        >
          <Radio.Group defaultValue={Type}>
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
              <Form.Item
                name="project_date"
              >
                <RangePicker />
              </Form.Item>
            </div>
          </>
        }
        
        <Editor
          initialValue="hello react editor world!"
          previewStyle="vertical"
          height="600px"
          initialEditType="wysiwyg"
          useCommandShortcut={true}
          ref={editorRef}
        />
        <div className="flex-box j-center" style={{margin:"20px 0"}}>
          <Button style={{marginRight:"5px"}}>
            <Link ref={btnToList} to="/">목록으로</Link>
          </Button>
          <Button type="primary" htmlType="submit">확인</Button>
        </div>
      </Form>
    </>
  )
}

export default Write
