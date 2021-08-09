import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table, Radio } from "antd";
import firebase from '../firebase';

function Main() {
  const db = firebase.database();

  const [WorkList, setWorkList] = useState();
  const [Sort, setSort] = useState("3")
  const onSortChange = (e) => {
    setSort(e.target.value);
  }

  useEffect(() => {
    db.ref('work_list')
    .once("value")
    .then(snapshot => {
      let arr = [];
      snapshot.forEach(el => {
        if(Sort === ""){
          arr.push(el.val())
        }else if(Sort === "3"){
          if(el.val().state === "0" || el.val().state === "1"){
            arr.push(el.val())
          }
        }else if(Sort === el.val().state){
          arr.push(el.val())
        }
      });
      arr.sort((a,b) => {
        return b.timestamp - a.timestamp
      })
      setWorkList(arr)
    })
    return () => {
    }
  }, [Sort])
  


  const columns = [
    {
      title: '상태',
      dataIndex: 'state',
      key: 'state',
      align: 'center', 
      width: '80px',     
      render: data => {
        data = data == '0' ? (<span className="state-txt0">대기</span>) : 
        data == '1' ? (<span className="state-txt1">진행</span>) : 
        data == '2' ? (<span className="state-txt2">완료</span>) : '';
        return data
      }
    },
    {
      title: '유형1',
      dataIndex: 'type',
      key: 'type',
      align: 'center',     
      width: '100px', 
      render: (text,row) => row["type"] === "1" ? '일반' : '프로젝트'
    },
    {
      title: '유형2',
      dataIndex: ['basic_type','project_type'],
      key: 'type2',
      align: 'center',     
      width: '100px', 
      render: (text,row) => row["basic_type"] === "1" ? "오류" : 
      row["basic_type"] === "2" ? "수정/추가" :
      row["project_type"] === "1" ? "개편" : 
      row["project_type"] === "2" ? "추가" : ""
    },
    {
      title: '제목',
      dataIndex: ['title','uid'],
      key: 'title',
      align: 'left',      
      render: (text,row) => <Link to={`/view/${row["uid"]}`}>{row["title"]}</Link>
    },
    {
      title: '기한',
      dataIndex: 'project_date',
      key: 'project_date',
      align: 'center',     
      width: '200px', 
      render: data => data ? `${data[0].full_} ~ ${data[1].full_}` : '',
    },
    {
      title: '작성일',
      dataIndex: 'd_regis',
      key: 'd_regis',
      align: 'center', 
      width: '130px',     
      render: data => data ? `${data.full_} ${data.hour}:${data.min}` : '',
    },
  ]  
  return (
    <>
      {WorkList && 
        <>
          <Radio.Group onChange={onSortChange} defaultValue={Sort} style={{marginBottom:"15px"}}>
            <Radio.Button value="">전체</Radio.Button>
            <Radio.Button value="3">대기+진행</Radio.Button>
            <Radio.Button value="0">대기</Radio.Button>
            <Radio.Button value="1">진행</Radio.Button>
            <Radio.Button value="2">완료</Radio.Button>
          </Radio.Group>
          <Table 
          rowKey={ item => { return item.key } }
          pagination={{
            pageSize:10,
            position:"bottomCenter"
          }}
          align="center" columns={columns} dataSource={WorkList} 
          /> 
        </>
      }
      
      <div style={{textAlign:"right",marginTop:"15px"}}>
        <Button style={{width:"100px"}} type="primary">
          <Link to="/write">게시물 등록</Link>
        </Button>
      </div>

      
    </>
  )
}

export default Main
