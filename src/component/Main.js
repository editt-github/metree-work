import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table, Radio, Select, Input, Switch } from "antd";
import * as antIcon from "react-icons/ai";
import { notify } from "./CommonFunc";
import firebase from '../firebase';
import { OderModalPopup } from './View';
import { useSelector } from "react-redux";
import Loading from "./Loading"
const { Option } = Select;
const { Search } = Input;

function Main() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const db = firebase.database();

  const [WorkList, setWorkList] = useState();
  const [Rerender, setRerender] = useState(false)
  const [Sort, setSort] = useState("8")
  const onSortChange = (e) => {
    setSort(e.target.value);
  }

  const [Site, setSite] = useState("")
  const onSiteChange = (e) => {
    const val = e.value;
    setSite(val)
  }

  const [SearchType, setSearchType] = useState("1")
  const onSearchType = (e) => {
    setSearchType(e)
  }

  const [SearchKey, setSearchKey] = useState()
  const onSearch = (e) => {
    setSearchKey(e)
    setRerender(!Rerender)
  }


  useEffect(() => {
      if(userInfo){        
        db.ref('work_list')
        .on("value", snapshot => {
          let arr = [];
          let searchArr = [];
          let siteArr = [];
          snapshot.forEach(el => {
            const value = el.val();
            
            //사이트 필터
            if(Site && Site === value.site || value.type === "0"){
              siteArr.push(value)
            }
            
            //검색 
            if(SearchKey){   
              if(SearchType === "1" && value.title.includes(SearchKey)){
                searchArr.push(value)
              }
              if(SearchType === "2" && value.content.includes(SearchKey)){
                searchArr.push(value)
              }
              if(SearchType === "3" && (value.content.includes(SearchKey) || value.title.includes(SearchKey))){
                searchArr.push(value)
              }
              if(SearchType === "4" && value.name.includes(SearchKey)){
                searchArr.push(value)
              }
              if(SearchType === "5" && String(value.number).includes(SearchKey)){
                searchArr.push(value)
              }
            }
            
            arr.push(value)        
            
          });
          
          if(Site){
            arr = siteArr
          }
          if(SearchKey){
            arr = searchArr
          }

          let emerCount = 0;
          let finishCount = 0;
          arr.map(el=>{        
            //긴급개수
            (el.emergency && el.state === "0" || el.state === "4") && emerCount++;     
            //완료개수
            (el.state === "3" && el.user_uid === userInfo.uid) && finishCount++;

            //숨김체크
            el.hidden = el.hidden ? el.hidden : false;              

            //공지사항,긴급 정렬순서
            if(el.type === "0"){
              el.index = 0;
              el.state = "all" 
            }else if(el.state != "6" && el.emergency){
              el.index = 1;
            }else{
              el.index = 2;
            }        
            
          })    
          arr = arr.filter(el=>el.hidden != true);
          // 긴급알림
          if(userInfo.photoURL === "IT개발부"){
            if(emerCount > 0){
              notify(`확인이 필요한 긴급 게시물이 ${emerCount}개 있습니다.`);
              document.title = `확인할 긴급 게시물 ${emerCount}개`;
            }else{
              document.title = "미트리 IT부서 유지보수"
            }
          }else{
            //완료알림
            if(finishCount > 0){
              notify(`확인요청 게시물 ${finishCount}개`);
              document.title = `확인요청 게시물 ${finishCount}개`;
            }else{
              document.title = "미트리 IT부서 유지보수"
            }
          }

  
          //부서별 게시물구분
          let temp = [];
          arr.map(el => {
            if(el.secret){
              if((el.part === userInfo.photoURL) || (userInfo.photoURL === "IT개발부")){
                temp.push(el)
              }
            }else{
              temp.push(el)
            }
          })
          arr = temp;
          
  
          //상태 필터
          if(Sort){
            if(Sort === "8"){        
              arr = arr.filter(el => el.state === "0" || el.state === "1" || el.state === "2" || el.state === "3" || el.state === "4" || el.state === "5" || el.state === "all")
            }else{
              arr = arr.filter(el => el.state === Sort || el.state === "all")
            }  
          }
  
          arr.sort((a,b) => {
            return b.timestamp - a.timestamp
          })
          
          arr.sort((a,b) => {
            return a.index - b.index
          })
  
          setWorkList(arr)
        })
      }

    return () => {
    }
  }, [Sort,Site,SearchKey,userInfo])

  const stateViewPop = useRef()
  const [StateView, setStateView] = useState(false)
  const [StateViewTxt, setStateViewTxt] = useState()
  const onStateOver = (e,log) => {
    let posX = e.clientX;
    let posY = e.clientY;
    setStateViewTxt(log)
    setStateView(true)
    stateViewPop.current.style.minWidth = "0";
    stateViewPop.current.style.left = (posX+135) + "px";
    stateViewPop.current.style.top = (posY) + "px";
    stateViewPop.current.style.transform = "translate(-50%,-45%)"
  }
  const stateViewClose = () => {
    setStateView(false)
  }

  const searchRef = useRef()
  const onSearchClear =() => {
    setSearchKey("")
    searchRef.current.state.value = ""
  }



  const columns = [
    {
      title: '번호',
      dataIndex: 'number',
      key: 'number',
      align: 'center',     
      width: '75px', 
      responsive: ['md'],
      sorter: (a, b) => a.number - b.number,
      render: data => data ? data : ""
    },
    {
      title: '상태',
      dataIndex: ['state','log','type'],
      key: 'state',
      align: 'center', 
      width: '80px',     
      sorter: (a, b) => a.state - b.state,
      render: (text,row) => {
        let data;
        if(row['type'] != "0") {
          data = row['state'] == '0' ? (<span onMouseLeave={stateViewClose} onMouseEnter={(e)=>onStateOver(e,row['log'])} className="state state-txt0">대기</span>) : 
          row['state'] == '1' ? (<span onMouseLeave={stateViewClose} onMouseEnter={(e)=>onStateOver(e,row['log'])}  className="state state-txt1">접수</span>) : 
          row['state'] == '2' ? (<span onMouseLeave={stateViewClose} onMouseEnter={(e)=>onStateOver(e,row['log'])}  className="state state-txt2">진행</span>) : 
          row['state'] == '3' ? (<span onMouseLeave={stateViewClose} onMouseEnter={(e)=>onStateOver(e,row['log'])}  className="state state-txt2">확인요청</span>) : 
          row['state'] == '4' ? (<span onMouseLeave={stateViewClose} onMouseEnter={(e)=>onStateOver(e,row['log'])}  className="state state-txt2">수정요청</span>) : 
          row['state'] == '5' ? (<span onMouseLeave={stateViewClose} onMouseEnter={(e)=>onStateOver(e,row['log'])}  className="state state-txt4">확인완료</span>) : 
          row['state'] == '6' ? (<span onMouseLeave={stateViewClose} onMouseEnter={(e)=>onStateOver(e,row['log'])}  className="state state-txt3">완료</span>) : '';    
        } 
        return data;
      }
    },
    {
      title: '사이트',
      dataIndex: 'site',
      key: 'site',
      align: 'center',     
      width: '100px', 
      responsive: ['md'],
      sorter: (a, b) => a.site.length - b.site.length,
      render: data => data ? data : ""
    },
    {
      title: '유형1',
      dataIndex: 'type',
      key: 'type',
      align: 'center',     
      width: '100px', 
      responsive: ['lg'],
      render: (text,row) => row["type"] === "1" ? '일반' : row["type"] === "2" ? '프로젝트' : '공지'
    },
    {
      title: '유형2',
      dataIndex: ['basic_type','project_type'],
      key: 'type2',
      align: 'center',     
      width: '100px', 
      responsive: ['lg'],
      render: (text,row) => row["basic_type"] === "1" ? "오류" : 
      row["basic_type"] === "2" ? "수정/추가" :
      row["project_type"] === "1" ? "개편" : 
      row["project_type"] === "2" ? "추가" : ""
    },
    {
      title: '제목',
      dataIndex: ['title','uid','emergency','type','secret'],
      key: 'title',
      align: 'left',      
      render: (text,row) => {
        let content;
        if(row["emergency"]){
          content = <Link className="emergency" to={`/view/${row["uid"]}`}>
            <antIcon.AiOutlineAlert />{row["title"]}</Link>
          if(row["secret"]){
            content = <Link className="emergency" to={`/view/${row["uid"]}`}>
            <antIcon.AiOutlineAlert /><antIcon.AiOutlineLock />{row["title"]}</Link>
          }
        }else if(row["type"] === "0"){
          content = <Link className="emergency notice" to={`/view/${row["uid"]}`}><antIcon.AiOutlineNotification />[공지] {row["title"]}</Link>
        }else if(row["secret"]){
          content = <Link className="secret" to={`/view/${row["uid"]}`}>
            <antIcon.AiOutlineLock />{row["title"]}</Link>
        }else{
          content = <Link to={`/view/${row["uid"]}`}>{row["title"]}</Link>
        }
        return content
      }
    },
    {
      title: '기한',
      dataIndex: 'project_date',
      key: 'project_date',
      align: 'center',     
      width: '180px', 
      responsive: ['lg'],
      render: data => data ? `${data[0].full_} ~ ${data[1].full_}` : '',
    },
    {
      title: '작성자',
      dataIndex: ['name','part'],
      key: 'project_date',
      align: 'center',     
      width: '150px', 
      responsive: ['md'], 
      render: (text,row) => `${row["name"]}(${row["part"]})`,
    },
    {
      title: '작성일',
      dataIndex: 'd_regis',
      key: 'd_regis',
      align: 'center', 
      width: '130px',   
      responsive: ['md'],  
      render: data => data ? `${data.full_} ${data.hour}:${data.min}` : '',
    },
  ]  
  return (
    <>
    {WorkList ? (
        <>
          <div className="flex-box wrap" style={{marginBottom:"15px"}}>
            <div className="list-top-filter">
              <Select
                labelInValue
                placeholder="사이트선택"
                onChange={onSiteChange}
              >
                <Option value="">전체</Option>
                <Option value="미트리">미트리</Option>
                <Option value="마이오피스">마이오피스</Option>
                <Option value="마이닭">마이닭</Option>
                <Option value="카페">카페</Option>
                <Option value="기타">기타</Option>
              </Select>            
            </div>          
            <Radio.Group className="top-state-radio" onChange={onSortChange} defaultValue={Sort} style={{marginRight:"10px"}}>
              <Radio.Button value="">전체</Radio.Button>
              <Radio.Button value="8">대기+접수+진행</Radio.Button>
              <Radio.Button value="0">대기</Radio.Button>
              <Radio.Button value="1">접수</Radio.Button>
              <Radio.Button value="2">진행</Radio.Button>
              <Radio.Button value="3">확인요청</Radio.Button>
              <Radio.Button value="4">수정요청</Radio.Button>
              <Radio.Button value="5">확인완료</Radio.Button>
              <Radio.Button value="6">완료</Radio.Button>
            </Radio.Group>            
          </div>
          <Table 
          className="list-table"
          rowKey={ item => { return item.uid } }
          pagination={{
            pageSize:15,
            position:"bottomCenter"
          }}
          align="center" columns={columns} dataSource={WorkList} 
          /> 
          <OderModalPopup style={{padding:"0"}} className={StateView ? "" : "hidden"} ref={stateViewPop}>
            {StateViewTxt && 
            <ul className="log-list" style={{padding:"15px"}}>        
            {
              StateViewTxt && StateViewTxt.map((el,idx) => (
                <li className={
                  el.hidden && userInfo.auth && userInfo.auth.includes("it") || el.hidden && userInfo.role > 2 ? `hide flex-box a-center` : 
                  el.hidden ? `hidden flex-box a-center` :
                  `flex-box a-center`} key={idx}>
                  <div>
                    {
                      el.state === "9" ? (<span className="state-txt9">수정</span>) :
                      el.state === "0" ? (<span className="state-txt0">대기</span>) :
                      el.state === "1" ? (<span className="state-txt1">접수</span>) :
                      el.state === "2" ? (<span className="state-txt2">진행</span>) :
                      el.state === "3" ? (<span className="state-txt2">확인요청</span>) :
                      el.state === "4" ? (<span className="state-txt2">수정요청</span>) :
                      el.state === "5" ? (<span className="state-txt4">확인완료</span>) :
                      el.state === "6" ? (<span className="state-txt3">완료</span>) : ''
                    }
                  </div>
                  <div>{el.name}({el.part})</div>
                </li>
              ))
            }
            </ul>
            }
          </OderModalPopup>
          {WorkList && WorkList.length == 0 &&
            <>
            <div style={{height:"15px"}}></div>
            </>
          }
          <div className="search-box">            
            <Select
              defaultValue="1"
              style={{ marginRight:"5px" }}
              onChange={onSearchType}
            >
              <Option value="1">제목</Option>
              <Option value="2">내용</Option>
              <Option value="3">제목+내용</Option>
              <Option value="4">작성자</Option>
              <Option value="5">번호</Option>
            </Select>
            <Search ref={searchRef} placeholder="검색어" onSearch={onSearch} allowClear enterButton />
            <Button onClick={onSearchClear} style={{ marginLeft:"5px" }}><antIcon.AiOutlineClear style={{position:"relative",top:"3px",fontSize:"15px",marginRight:"3px"}} /><span style={{fontSize:"12px"}}>검색초기화</span></Button>
          </div>
          <div style={{textAlign:"right",marginTop:"15px"}}>
            <Button className="btn-m-100" type="primary">
              <Link to="/write">게시물 등록</Link>
            </Button>
          </div>
        </>
        )
      : (
        <>
          <Loading style={{position:"absolute"}} />
        </>
      )
    }  
      
    </>
  )
}

export default Main
