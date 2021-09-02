import React, {useState, useEffect} from 'react'
import { Button, Form, Input } from 'antd';
import firebase, {app2} from '../firebase';
import axios from 'axios';

function Test() {
  const [FinishData, setFinishData] = useState()
  const [TestData, setTestData] = useState()
  const [TestImg, setTestImg] = useState()
  useEffect(() => {

    axios.get('https://cors-anywhere.herokuapp.com/http://metreeplus.co.kr/index/_upload/metree_it_work/ae0254-ef8c-aa0-8b7e-ee52cae670a')
    .then(res=>console.log(res))
    

    let arr = [];
    firebase.database().ref('work_list')
    .once("value",data => {
      data.forEach(el => {
        arr.push(el.val())
      })
      arr = arr.filter(el=>el.state == '6')
      setFinishData(arr)
    })

    firebase.database(app2).ref('work_list/ae0254-ef8c-aa0-8b7e-ee52cae670a')
    .once("value",data => {
      let res = data.val().content;
      
      let img_tag = /<IMG(.*?)>/gi;
      let result = res
      console.log(result)
      result = result.split('src="')
      let arr = [];
      result = result.map((el,idx)=>{
        if(idx != 0){
          let url = el.split("\" alt=")[0]
          arr.push(url)
        }
      })
      console.log(arr)
      setTestImg(arr);
      console.log(res.replace(img_tag, ""))
      

      setTestData(data.val())
    })

    return () => {
      
    }
  }, [])

  const contentDesc = () => {
    return {__html: TestData.content}
  }

  const onSubmit = (val) => {
    console.log(val)
    firebase.database(app2).ref('test')
    .update({
      ...val
    })
  }
  const moveData = () => {
    firebase.database(app2).ref('work_list')
    .update({
      ...FinishData
    })
  }

  const delData = () => {
    firebase.database().ref('work_list')
    .once("value",data => {
      data.forEach(el => {
        if(el.val().state == "6"){
          firebase.database().ref('work_list').child(el.val().uid).remove()
        }
      })
    })
  }

  const changeUid = () => {
    firebase.database(app2).ref('work_list')
    .once("value",data => {
      let newDb = {}
      data.forEach(el => {
        newDb[el.val().uid] = el.val();
      })
      firebase.database(app2).ref('work_list')
      .update({
        ...newDb
      })
      console.log(newDb)
    })
  }


  const uploadImg = () => {
    axios.post('https://cors-anywhere.herokuapp.com/http://metreeplus.co.kr/_sys/_xml/attr_src.php', {
      imgList : TestImg,
      uid : "ae0254-ef8c-aa0-8b7e-ee52cae670a"
    })
    .then(res => console.log(res))
    .catch(function (error) {
      console.log(error);
    });
  }

  const uploadStorage = () => {
    Promise.all(
      // Array of "Promises"
      TestImg.map(item => upload(item))
    )
    .then((url) => {
      console.log(`All success`,url)
    })
    .catch((error) => {
      console.log(`Some failed: `, error.message)
    });
  }
  const upload = (item) => {    
    return firebase.storage().ref(`work_list/finish/ae0254-ef8c-aa0-8b7e-ee52cae670a`).putString(item,'data_url')
    .then(res => {
      console.log(res)
    }).catch((error) => {
      console.log('One failed:', item, error.message)
    });
  }

  return (
    <> 
      {TestData &&
        <>
        <div dangerouslySetInnerHTML={contentDesc()}></div>
        <Button onClick={uploadImg}>upload</Button>
        <Button onClick={uploadStorage}>스토리지 업로드</Button>
        <img src="http://metreeplus.co.kr/index/_upload/metree_it_work/ae0254-ef8c-aa0-8b7e-ee52cae670a/image1.png"></img>
        </>
      }
      <Form onFinish={onSubmit}>
        <Form.Item name="test">
          <Input />
        </Form.Item>
         {/* <Button htmlType="submit">submit</Button> */}
      </Form>
      {FinishData &&
      <>
      {/* <Button onClick={moveData}>완료옮기기</Button>
      <Button onClick={delData}>완료삭제</Button>
      <Button onClick={changeUid}>uid</Button> */}
      </>
      }
    </>
  )
}

export default Test
