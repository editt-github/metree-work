import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "@toast-ui/editor/dist/toastui-editor.css";
import firebase, { app2 } from "../firebase";
import { Editor } from "@toast-ui/react-editor";
import {
  Button,
  Form,
  Input,
  Radio,
  Select,
  DatePicker,
  Checkbox,
  Spin,
  message,
} from "antd";
import * as antIcon from "react-icons/ai";
import { getFormatDate } from "./CommonFunc";
import uuid from "react-uuid";
import moment from "moment";
import { useSelector } from "react-redux";
const { Option } = Select;
const { RangePicker } = DatePicker;

function Write() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const editorRef = React.useRef();
  const btnToList = React.useRef();

  const [Type, setType] = useState("1");
  const onTypeChange = (e) => {
    const type = e.target.value;
    setType(type);
  };

  const [Loading, setLoading] = useState(false);
  const onsubmit = async (values) => {
    console.log(values);
    if (!values.csCheck) {
      message.error("타부서 협의사항을 선택해 주세요");
      return;
    }
    if (values.csCheck == 2 && !values.csCheckName) {
      message.error("협의 담당자명을 입력해 주세요.");
      return;
    }
    setLoading(true);
    let d_regis = getFormatDate(new Date());
    if (values.project_date) {
      let date = [];
      date.push(getFormatDate(values.project_date[0]._d));
      date.push(getFormatDate(values.project_date[1]._d));
      values.project_date = date;
    }
    const uid = uuid();
    const getEditor = editorRef.current.getInstance();
    const getHtml = getEditor.getHTML();
    values.hidden = values.hidden ? true : false;
    values.secret = values.secret ? true : false;
    values.emergency = values.emergency ? true : false;
    values.type = Type;
    const time = new Date().getTime();
    let number;

    await firebase
      .database(app2)
      .ref(`work_list_number`)
      .child("count")
      .transaction((pre) => {
        number = pre + 1;
        return pre + 1;
      });

    await firebase
      .database(app2)
      .ref(`work_list/${uid}`)
      .set({
        ...values,
        number: number,
        content: getHtml,
        og_content: getHtml,
        d_regis: d_regis,
        state: "0",
        uid: uid,
        name: userInfo.displayName,
        part: userInfo.photoURL,
        timestamp: time,
        user_uid: userInfo.uid,
      })
      .then((data) => {
        setLoading(false);
        btnToList.current && btnToList.current.click();
      });
  };

  const [csCheck, setCsCheck] = useState();
  const onCsCheckChange = (e) => {
    console.log(e.target.value);
    setCsCheck(e.target.value);
    if (e.target.value == 2) {
    }
  };
  return (
    <>
      <Form
        name="dynamic_form_nest_item"
        className="work-list-form"
        onFinish={onsubmit}
        autoComplete="off"
      >
        <Form.Item
          name="title"
          rules={[{ required: true, message: "제목을 입력해 주세요." }]}
        >
          <Input placeholder="제목" />
        </Form.Item>
        <div className="flex-box wrap">
          <Form.Item
            name="site"
            style={{ width: "100%", maxWidth: "120px", marginRight: "10px" }}
            rules={[{ required: true, message: "사이트" }]}
          >
            <Select placeholder="사이트선택">
              <Option value="미트리">미트리</Option>
              <Option value="미트리 오피스">미트리 오피스</Option>
              <Option value="미에르">미에르</Option>
              <Option value="미에르 오피스">미에르 오피스</Option>
              <Option value="마이닭">마이닭</Option>
              <Option value="카페">카페</Option>
              <Option value="기타">기타</Option>
            </Select>
          </Form.Item>
          <Form.Item name="type" onChange={onTypeChange}>
            <Radio.Group defaultValue={Type} style={{ marginRight: "10px" }}>
              {((userInfo && userInfo.role > 2) ||
                (userInfo && userInfo.auth && userInfo.auth === "it")) && (
                <Radio.Button value="0">공지</Radio.Button>
              )}
              <Radio.Button value="1">일반</Radio.Button>
              <Radio.Button value="3">CS</Radio.Button>
              <Radio.Button value="2">프로젝트</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="hidden" valuePropName="checked">
            <Checkbox>숨김</Checkbox>
          </Form.Item>
          <Form.Item name="secret" valuePropName="checked">
            <Checkbox>비밀글(작성자 부서와 IT부서만 볼 수 있습니다.)</Checkbox>
          </Form.Item>
        </div>
        {Type && Type === "1" && (
          <>
            <div className="flex-box">
              <Form.Item
                name="basic_type"
                style={{
                  width: "100%",
                  maxWidth: "120px",
                  marginRight: "10px",
                }}
                rules={[{ required: true, message: "유형을 선택해 주세요." }]}
              >
                <Select placeholder="유형선택">
                  <Option value="1">오류</Option>
                  <Option value="2">수정/추가</Option>
                  <Option value="3">문의</Option>
                </Select>
              </Form.Item>
              <Form.Item name="emergency" valuePropName="checked">
                <Checkbox>긴급사항</Checkbox>
              </Form.Item>
            </div>
          </>
        )}

        {Type && Type === "2" && (
          <>
            <div className="flex-box">
              <Form.Item
                name="project_type"
                style={{ marginRight: "5px" }}
                rules={[{ required: true, message: "유형을 선택해 주세요." }]}
              >
                <Select placeholder="유형선택">
                  <Option value="1">개편</Option>
                  <Option value="2">추가</Option>
                </Select>
              </Form.Item>
              <Form.Item name="project_date">
                <RangePicker />
              </Form.Item>
            </div>
          </>
        )}
        <div
          className="flex-box"
          style={{ marginBottom: "15px", alignItems: "center" }}
        >
          <span
            style={{ marginRight: "10px", fontWeight: "600", color: "#eb1717" }}
          >
            * 타부서 협의사항
          </span>
          <Form.Item
            name="csCheck"
            onChange={onCsCheckChange}
            style={{ margin: 0 }}
          >
            <Radio.Group style={{ marginRight: "10px" }}>
              <Radio.Button value="1">타부서와 무관한 내용</Radio.Button>
              <Radio.Button value="2">타부서(CS부서)와 협의완료</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {csCheck == 2 && (
            <Form.Item style={{ margin: 0 }} name="csCheckName">
              <Input placeholder="담당자명" />
            </Form.Item>
          )}
        </div>
        <Editor
          previewStyle="vertical"
          height="600px"
          initialEditType="wysiwyg"
          useCommandShortcut={true}
          ref={editorRef}
        />
        <div className="flex-box j-center" style={{ margin: "20px 0" }}>
          <Button style={{ marginRight: "5px" }}>
            <Link ref={btnToList} to="/">
              <antIcon.AiOutlineBars />
              목록으로
            </Link>
          </Button>
          <Spin spinning={Loading}>
            <Button type="primary" htmlType="submit">
              확인
            </Button>
          </Spin>
        </div>
      </Form>
    </>
  );
}

export default Write;
