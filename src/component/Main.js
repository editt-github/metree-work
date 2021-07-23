import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table } from "antd";
import firebase from '../firebase';

function Main() {
  const db = firebase.database();

  const [WorkList, setWorkList] = useState();
  useEffect(() => {
    db.ref('work_list')
    .once("value")
    .then(snapshot => {
      let arr = [];
      snapshot.forEach(el => {
        console.log(el.val())
        arr.push(el.val())
        console.log(arr)
      });
      setWorkList(arr)
    })
    return () => {
    }
  }, [])


  const columns = [
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      align: 'center',      
      render: data => data ? data : '',
    },
  ]  
  return (
    <>
      {WorkList && 
        <Table 
        pagination={{
          pageSize:10,
          position:"bottomCenter"
        }}
        align="center" columns={columns} dataSource={WorkList} 
        /> 
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
