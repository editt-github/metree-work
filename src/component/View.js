import React, { useState, useEffect, useRef } from "react";
import firebase, { app2 } from "../firebase";
import { useRouteMatch, Link } from "react-router-dom";
import { Descriptions, Button, Input } from "antd";
import * as antIcon from "react-icons/ai";
import styled from "styled-components";
import { Select } from "antd";
import { useSelector } from "react-redux";
import { getFormatDate, kakaoSend } from "./CommonFunc";
import ReplyBox from "./ReplyBox";
import axios from "axios";
import uuid from "react-uuid";
const { Option } = Select;
export const OderModalPopup = styled.div`
  width: auto;
  min-width: 400px;
  padding: 20px;
  border: 1px solid #ddd;
  position: absolute;
  left: 50%;
  top: 40px;
  transform: translateX(-50%);
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
    width: 90vw;
    min-width: 0;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
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
  const match = useRouteMatch("/view/:uid");
  const [ViewData, setViewData] = useState();
  const [Rerender, setRerender] = useState(false);

  useEffect(() => {
    firebase
      .database(app2)
      .ref(`work_list/${match.params.uid}`)
      .on("value", (snapshot) => {
        let replyArr = [];
        let resData = snapshot.val();
        if (resData) {
          if (resData.reply) {
            for (let key in resData.reply) {
              const val = resData.reply[key];
              replyArr.push(val);
            }
            replyArr.sort((a, b) => a.timestamp - b.timestamp);
          }
          resData.reply = replyArr;
        }
        if (typeof resData.log === "object") {
          let tempArr = [];
          for (let key in resData.log) {
            tempArr.push(resData.log[key]);
          }
          tempArr.sort((a, b) => {
            return a.timestamp - b.timestamp;
          });
          resData.log = tempArr;
        }
        setViewData(resData);
      });
    return () => {};
  }, [Rerender]);

  const onRerender = () => {
    setRerender(!Rerender);
  };

  const contentDesc = () => {
    let content;
    if (OgContent) {
      content = ViewData.og_content;
    } else {
      content = ViewData.content;
    }
    return { __html: content };
  };
  const [OgContent, setOgContent] = useState(false);
  const onOgContent = () => {
    setOgContent(!OgContent);
  };

  const [StatePop, setStatePop] = useState(false);
  const onStatePop = () => {
    setStatePop(true);
  };

  const [StateSelect, setStateSelect] = useState();
  const onStateChange = (e) => {
    setStateSelect(e.target.value);
  };

  const [StateInput, setStateInput] = useState();
  const onStateInput = (e) => {
    setStateInput(e.target.value);
  };

  const onStateModify = () => {
    if (StateSelect === "4") {
      const sender = ViewData.log?.find((el) => {
        return el.state == "3";
      });
      sender &&
        firebase
          .database()
          .ref(`users/${sender.user_uid}`)
          .child("call_number")
          .once("value", (data) => {
            console.log(data.val());
            kakaoSend(
              {
                type: "confirm",
                call_num: data.val(),
                title: ViewData.title,
                name: ViewData.name,
              },
              "confirm"
            );
          });
    }
    if (StateSelect === "3") {
      firebase
        .database()
        .ref(`users/${ViewData.user_uid}`)
        .child("call_number")
        .once("value", (data) => {
          kakaoSend(
            {
              type: "confirm",
              call_num: data.val(),
              title: ViewData.title,
              name: ViewData.name,
            },
            "confirm"
          );
        });
    }
    let arr = [];
    let obj = {};
    if (ViewData.log) {
      arr = ViewData.log;
    }
    const logUid = uuid();
    obj = {
      date: getFormatDate(new Date()),
      timestamp: new Date().getTime(),
      name: userInfo.displayName,
      part: userInfo.photoURL,
      state: stateSel.current.value,
      desc: StateInput ? StateInput : "",
      hidden: false,
      uid: logUid,
      user_uid: userInfo.uid,
    };
    //arr.push(obj);
    const stateNum = stateSel.current.value;
    if (stateNum === "6") {
      const agree = window.confirm("완료처리 하시겠습니까?");
      if (agree) {
        let curData = ViewData;
        curData.state = "6";
        curData.log = arr;

        let dataContent = ViewData.content;
        let removeImg = /<IMG(.*?)>/gi;
        let rmImgData = ViewData.content.replace(removeImg, ""); //이미지 제거된 콘텐츠
        dataContent = dataContent.split('src="');
        let imgArr = []; // 이미지 url
        let imgName = []; // 이미지 이름
        dataContent = dataContent.map((el, idx) => {
          if (idx != 0) {
            let url = el.split('" alt=')[0];
            imgArr.push(url);
            imgName.push(`image${idx - 1}.png`);
          }
        });
        curData.content = rmImgData;
        curData.og_content = "";
        curData.imgName = imgName ? imgName : "";

        axios
          .post("https://metree.co.kr/_sys/_xml/attr_src.php", {
            imgList: imgArr ? imgArr : "",
            uid: curData.uid,
          })
          .then((res) => console.log(res))
          .catch(function (error) {
            console.log(error);
          });

        firebase
          .database(app2)
          .ref(`work_finish_list/${match.params.uid}`)
          .update({ ...curData });
        firebase.database(app2).ref(`work_list/${match.params.uid}`).remove();
        window.alert("완료처리 되었습니다.");

        setStatePop(false);
        btnToList.current && btnToList.current.click();
      }
    } else {
      firebase.database(app2).ref(`work_list/${match.params.uid}`).update({
        state: stateSel.current.value,
      });
      firebase
        .database(app2)
        .ref(`work_list/${match.params.uid}/log/${logUid}`)
        .update({ ...obj });
      setRerender(!Rerender);
      setStatePop(false);
    }
  };
  const onCloseStatePop = () => {
    setStatePop(false);
  };

  const onDelete = () => {
    const agree = window.confirm(
      "삭제시 복구가 불가능합니다. 삭제하시겠습니까?"
    );
    if (agree) {
      firebase.database(app2).ref(`work_list/${match.params.uid}`).remove();
      window.alert("삭제되었습니다.");
      btnToList.current && btnToList.current.click();
    }
  };

  const onModify = () => {
    btnToModify.current && btnToModify.current.click();
  };

  const onLogHidden = (uid) => {
    firebase
      .database(app2)
      .ref(`work_list/${match.params.uid}/log/${uid}`)
      .transaction((pre) => {
        let res = pre;
        res.hidden = res.hidden ? false : true;
        return res;
      });
  };
  const onLogDelete = (uid) => {
    let lastState;
    if (ViewData.log.length > 2) {
      lastState = ViewData.log[ViewData.log.length - 2].state;
    } else {
      lastState = "0";
    }
    const agree = window.confirm("삭제 하시겠습니까?");
    if (agree) {
      firebase
        .database(app2)
        .ref(`work_list/${match.params.uid}/log/${uid}`)
        .remove();

      setViewData({
        ...ViewData,
        state: lastState,
      });

      firebase.database(app2).ref(`work_list/${match.params.uid}`).update({
        state: lastState,
      });
    }
  };

  const onReplySubmit = (data) => {
    const uid = uuid();
    firebase
      .database(app2)
      .ref(`work_list/${match.params.uid}/reply/${uid}`)
      .update({
        name: userInfo.displayName,
        part: userInfo.photoURL,
        date: getFormatDate(new Date()),
        desc: data,
        uid: uid,
        user_uid: userInfo.uid,
        depth: 0,
        timestamp: new Date().getTime(),
      });
    firebase
      .database(app2)
      .ref(`work_list_reply_count`)
      .transaction((pre) => pre + 1);
    firebase.database(app2).ref(`work_list_reply_alarm`).update({
      alarm: true,
      title: ViewData.title,
      number: ViewData.number,
      writrer: ViewData.user_uid,
    });
  };

  return (
    <>
      {ViewData && (
        <>
          <Descriptions
            title={ViewData.title}
            bordered
            column={{ xxl: 4, xl: 4, lg: 4, md: 3, sm: 2, xs: 1 }}
          >
            <Descriptions.Item label="상태">
              <div style={{ position: "relative" }}>
                {ViewData.state === "0" ? (
                  <span className="state-txt0">대기</span>
                ) : ViewData.state === "1" ? (
                  <span className="state-txt1">접수</span>
                ) : ViewData.state === "2" ? (
                  <span className="state-txt2">진행</span>
                ) : ViewData.state === "3" ? (
                  <span className="state-txt2">확인요청</span>
                ) : ViewData.state === "4" ? (
                  <span className="state-txt2">수정요청</span>
                ) : ViewData.state === "5" ? (
                  <span className="state-txt4">확인완료</span>
                ) : ViewData.state === "6" ? (
                  <span className="state-txt3">완료</span>
                ) : (
                  ""
                )}
                {ViewData.type != "0" && (
                  <Button
                    className="has-icon"
                    style={{ marginLeft: "5px" }}
                    onClick={onStatePop}
                  >
                    <>상태변경</>
                  </Button>
                )}
                <div className="state_guide_box">
                  <button type="button" className="state_guide">
                    ?
                  </button>
                  <div className="guide_box">
                    <ul>
                      <li>
                        IT부서에서 작업완료가 되면 확인요청으로 상태변경을
                        하게됩니다.
                      </li>
                      <li>
                        확인요청 상태에서 요청자가 확인 후 수정사항이 있으면
                        수정요청, <br />
                        수정사항이 없으면 확인완료 부탁드립니다.
                      </li>
                    </ul>
                  </div>
                </div>
                {StatePop && (
                  <OderModalPopup>
                    <div className="flex-box a-center">
                      <select
                        ref={stateSel}
                        defaultValue={ViewData.state}
                        onChange={onStateChange}
                        style={{ width: "80px", marginRight: "5px" }}
                      >
                        <option value="0">대기</option>
                        <option value="1">접수</option>
                        <option value="2">진행</option>
                        <option value="3">확인요청</option>
                        <option value="4">수정요청</option>
                        <option value="5">확인완료</option>
                        {userInfo?.auth.includes("it") && (
                          <option value="6">완료</option>
                        )}
                      </select>
                      <Input
                        placeholder="기록사항"
                        style={{ marginRight: "5px", flex: 1 }}
                        onChange={onStateInput}
                      />
                    </div>
                    <div
                      className="flex-box j-center"
                      style={{ marginTop: "10px" }}
                    >
                      <Button
                        type="primary"
                        style={{ marginRight: "5px" }}
                        onClick={onStateModify}
                      >
                        확인
                      </Button>
                      <Button onClick={onCloseStatePop}>닫기</Button>
                    </div>
                  </OderModalPopup>
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="작성자">
              {ViewData.name}
            </Descriptions.Item>
            <Descriptions.Item
              label="작성일"
              span={2}
            >{`${ViewData.d_regis.full_} ${ViewData.d_regis.hour}:${ViewData.d_regis.min}`}</Descriptions.Item>
            {ViewData.type === "1" ? (
              <>
                <Descriptions.Item label="번호">
                  {ViewData.number}
                </Descriptions.Item>
                <Descriptions.Item label="유형1">일반</Descriptions.Item>
                <Descriptions.Item label="유형2">
                  {ViewData.basic_type === "1"
                    ? "오류"
                    : ViewData.basic_type === "2"
                    ? "수정/추가"
                    : ""}
                </Descriptions.Item>
                <Descriptions.Item label="긴급">
                  {ViewData.emergency ? "O" : ""}
                </Descriptions.Item>
              </>
            ) : ViewData.type === "2" ? (
              <>
                <Descriptions.Item label="번호">
                  {ViewData.number}
                </Descriptions.Item>
                <Descriptions.Item label="유형1">프로젝트</Descriptions.Item>
                <Descriptions.Item label="유형2">
                  {ViewData.project_type === "1"
                    ? "개편"
                    : ViewData.project_type === "2"
                    ? "추가"
                    : ""}
                </Descriptions.Item>
                <Descriptions.Item label="기간">
                  {ViewData.project_date ? (
                    <>
                      {ViewData.project_date[0].full_} ~{" "}
                      {ViewData.project_date[1].full_}
                    </>
                  ) : (
                    "미정"
                  )}
                </Descriptions.Item>
              </>
            ) : (
              <>
                <Descriptions.Item label="유형1" span={2}>
                  공지
                </Descriptions.Item>
                <Descriptions.Item label="번호" span={2}>
                  {ViewData.number}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="내용" span={4}>
              <div dangerouslySetInnerHTML={contentDesc()}></div>
            </Descriptions.Item>
            <Descriptions.Item label="부서협의" span={2}>
              {ViewData.csCheck == 1
                ? "타부서와 무관"
                : ViewData.csCheck == 2
                ? "협의완료"
                : ""}
            </Descriptions.Item>
            <Descriptions.Item label="협의 담당자명" span={2}>
              {ViewData.csCheckName}
            </Descriptions.Item>
            {ViewData.type != "0" && (
              <Descriptions.Item label={"상태기록"} span={4}>
                <ul className="log-list">
                  {ViewData.log &&
                    ViewData.log.map((el, idx) => (
                      <>
                        <li
                          className={
                            (el.hidden &&
                              userInfo.auth &&
                              userInfo.auth.includes("it")) ||
                            (el.hidden && userInfo.role > 2)
                              ? `hide flex-box a-center`
                              : el.hidden
                              ? `hidden flex-box a-center`
                              : `flex-box a-center`
                          }
                          key={idx}
                        >
                          {((userInfo && userInfo.role > 2) ||
                            (userInfo &&
                              userInfo.auth &&
                              userInfo.auth === "it")) && (
                            <>
                              <button
                                type="button"
                                title="숨김"
                                style={{ marginRight: "5px" }}
                                className="btn-init"
                                onClick={() => onLogHidden(el.uid)}
                              >
                                <antIcon.AiOutlineEyeInvisible
                                  style={{ fontSize: "16px" }}
                                />
                              </button>
                              <button
                                type="button"
                                title="삭제"
                                className="btn-init"
                                onClick={() => onLogDelete(el.uid)}
                              >
                                <antIcon.AiOutlineCloseSquare
                                  style={{ fontSize: "16px" }}
                                />
                              </button>
                            </>
                          )}
                          <div className="state shrink">
                            {el.state === "9" ? (
                              <span className="state-txt9">수정</span>
                            ) : el.state === "0" ? (
                              <span className="state-txt0">대기</span>
                            ) : el.state === "1" ? (
                              <span className="state-txt1">접수</span>
                            ) : el.state === "2" ? (
                              <span className="state-txt2">진행</span>
                            ) : el.state === "3" ? (
                              <span className="state-txt2">확인요청</span>
                            ) : el.state === "4" ? (
                              <span className="state-txt2">수정요청</span>
                            ) : el.state === "5" ? (
                              <span className="state-txt4">확인완료</span>
                            ) : el.state === "6" ? (
                              <span className="state-txt3">완료</span>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="shrink" style={{ color: "#888" }}>
                            {`${el.date.full_} ${el.date.hour}:${el.date.min}`}
                          </div>
                          <div
                            className="shrink part"
                            style={{ color: "#555" }}
                          >
                            {el.name}({el.part})
                          </div>
                          <div style={{ color: "#333", fontWeight: "600" }}>
                            {el.desc ? el.desc : ""}
                          </div>
                        </li>
                      </>
                    ))}
                </ul>
              </Descriptions.Item>
            )}
          </Descriptions>
          {userInfo && (
            <ReplyBox
              onRerender={onRerender}
              uid={userInfo.uid}
              ViewData={ViewData}
              onReplySubmit={onReplySubmit}
            />
          )}
          <div className="view-btn-box">
            <Button>
              <Link ref={btnToList} to="/">
                <antIcon.AiOutlineBars />
                전체목록
              </Link>
            </Button>
            <Button>
              <Link to="/mylist">
                <antIcon.AiOutlineBars />내 목록
              </Link>
            </Button>
            {((userInfo && userInfo.role > 2) ||
              (userInfo && userInfo.auth && userInfo.auth === "it")) &&
              ViewData.og_content !== ViewData.content && (
                <Button onClick={onOgContent}>
                  {!OgContent ? (
                    <>
                      <antIcon.AiOutlineSwap />
                      원본보기
                    </>
                  ) : (
                    <>
                      <antIcon.AiOutlineSwap />
                      수정본보기
                    </>
                  )}
                </Button>
              )}
            {((userInfo && userInfo.role > 2) ||
              (userInfo && userInfo.uid === ViewData.user_uid)) && (
              <Button onClick={onModify}>
                <Link ref={btnToModify} to={`/modify/${match.params.uid}`}>
                  <antIcon.AiOutlineTool />
                  수정
                </Link>
              </Button>
            )}
            {((userInfo && userInfo.role > 2) ||
              ViewData.user_uid === userInfo.uid) && (
              <Button onClick={onDelete}>
                <>
                  <antIcon.AiOutlineDelete />
                  삭제
                </>
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default View;
