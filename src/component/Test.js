import React, {useState, useEffect} from 'react'
import { Button, Form, Input } from 'antd';
import firebase, {app2} from '../firebase';
import axios from 'axios';

function Test() {
  const [FinishData, setFinishData] = useState()
  const [TestData, setTestData] = useState()
  const [TestImg, setTestImg] = useState()
  useEffect(() => {
    

    let arr = [];
    firebase.database().ref('work_list')
    .once("value",data => {
      data.forEach(el => {
        arr.push(el.val())
      })
      arr = arr.filter(el=>el.state == '6')
      setFinishData(arr)
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



  const changeUid = () => {
    return;
    firebase.database(app2).ref('work_list')
    .once("value",data => {
      let newDb = []
      data.forEach(el => {

        let ViewData = el.val();
        if(!ViewData.imgName){
          let dataContent = ViewData.content;
          let removeImg = /<IMG(.*?)>/gi;
          let rmImgData = ViewData.content.replace(removeImg, "") //이미지 제거된 콘텐츠
          dataContent = dataContent.split('src="')
          let imgArr = []; // 이미지 url
          let imgName = []; // 이미지 이름
          dataContent = dataContent.map((el,idx)=>{
            if(idx != 0){
              let url = el.split("\" alt=")[0]
              imgArr.push(url)
              imgName.push(`image${idx-1}.png`)
            }
          })
          ViewData.content = rmImgData;
          ViewData.imgName = imgName ? imgName : "";

          if(imgArr.length > 0){
            axios.post('https://metree.co.kr/_sys/_xml/attr_src.php', {
              imgList : imgArr ? imgArr : "",
              uid : ViewData.uid
            })
            .then(res => console.log(res))
            .catch(function (error) {
              console.log(error);
            });    
            
            firebase.database(app2).ref(`work_list/${ViewData.uid}`)
            .update({...ViewData})
          }
          
        }
      })

    })
  }

  const delOgCon = () => {
    firebase.database(app2).ref('work_list')
    .once("value",data => {
      data.forEach(el => {
        let ViewData = el.val();
        console.log(ViewData)
        firebase.database(app2).ref(`work_list/${ViewData.uid}`)
        .update({
          ...ViewData,
          og_content:""
        })
      })
    })
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
      <Button onClick={changeUid}>기존게시물 이미지 이동</Button>
      <Button onClick={delOgCon}>og콘텐츠삭제</Button>
      </>
      }
    </>
  )
}

export default Test
