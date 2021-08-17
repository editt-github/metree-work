import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table, Radio, Select, Input } from "antd";
import * as antIcon from "react-icons/ai";
import firebase from '../firebase';
const { Option } = Select;
const { Search } = Input;

function Main() {
  const db = firebase.database();

  const [WorkList, setWorkList] = useState();
  const [Rerender, setRerender] = useState(false)
  const [Sort, setSort] = useState("4")
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
    db.ref('work_list')
    .get("value")
    .then(snapshot => {
      let arr = [];
      let searchArr = [];
      let siteArr = [];
      snapshot.forEach(el => {
        const value = el.val();
        
        //사이트 필터
        if(Site && Site === value.site){
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
        }

        arr.push(value)        

      });

      if(Site){
        arr = siteArr
      }
      if(searchArr != ""){
        arr = searchArr
      }

      //상태 필터
      if(Sort){
        if(Sort === "4"){        
          arr = arr.filter(el => el.state === "0" || el.state === "1" || el.state === "2")
        }else{
          arr = arr.filter(el => el.state === Sort)
        }  
      }

      arr.sort((a,b) => {
        return b.timestamp - a.timestamp
      })
      arr.sort((a,b) => {
        return b.emergency - a.emergency
      })
      setWorkList(arr)
    })
    return () => {
    }
  }, [Sort,Rerender,Site])


  const columns = [
    {
      title: '상태',
      dataIndex: 'state',
      key: 'state',
      align: 'center', 
      width: '80px',     
      sorter: (a, b) => a.state - b.state,
      render: data => {
        data = data == '0' ? (<span className="state-txt0">대기</span>) : 
        data == '1' ? (<span className="state-txt1">접수</span>) : 
        data == '2' ? (<span className="state-txt2">진행</span>) : 
        data == '3' ? (<span className="state-txt3">완료</span>) : '';
        return data
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
      render: (text,row) => row["type"] === "1" ? '일반' : '프로젝트'
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
      dataIndex: ['title','uid','emergency'],
      key: 'title',
      align: 'left',      
      render: (text,row) => {
        let content;
        if(row["emergency"]){
          content = <Link className="emergency" to={`/view/${row["uid"]}`}>
            <antIcon.AiOutlineAlert />{row["title"]}</Link>
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
      responsive: ['md'],
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
          <Option value="기타">기타</Option>
        </Select>
        
      </div>
      {WorkList && 
        <>
          <Radio.Group onChange={onSortChange} defaultValue={Sort} style={{marginBottom:"15px"}}>
            <Radio.Button value="">전체</Radio.Button>
            <Radio.Button value="4">대기+접수+진행</Radio.Button>
            <Radio.Button value="0">대기</Radio.Button>
            <Radio.Button value="1">접수</Radio.Button>
            <Radio.Button value="2">진행</Radio.Button>
            <Radio.Button value="3">완료</Radio.Button>
          </Radio.Group>
          <Table 
          className="list-table"
          rowKey={ item => { return item.uid } }
          pagination={{
            pageSize:10,
            position:"bottomCenter"
          }}
          align="center" columns={columns} dataSource={WorkList} 
          /> 
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
          </Select>
          <Search placeholder="검색어" onSearch={onSearch} enterButton />
        </div>
      <div style={{textAlign:"right",marginTop:"15px"}}>
        <Button className="btn-m-100" type="primary">
          <Link to="/write">게시물 등록</Link>
        </Button>
      </div>

      
    </>
  )
}

export default Main
