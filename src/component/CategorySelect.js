import { Radio, Select } from 'antd';
import React from 'react';
const { Option } = Select;

function CategorySelect({onSiteChange,Sort,onSortChange,onTypeChange,onTypeChange2,type}) {
  return (
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
        <Select
          labelInValue
          placeholder="유형"
          onChange={onTypeChange}
        >
          <Option value="">전체</Option>
          <Option value="0">공지</Option>
          <Option value="1">일반</Option>
          <Option value="3">CS</Option>
          <Option value="2">프로젝트</Option>
        </Select> 
        <Select
          labelInValue
          placeholder="유형2"
          onChange={onTypeChange}
        >
          <Option value="">전체</Option>
          <Option value="1">오류</Option>
          <Option value="2">수정/추가</Option>
          <Option value="3">문의</Option>
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
        {type === 'my' && <Radio.Button value="6">완료</Radio.Button>}
      </Radio.Group>            
    </div>
  )
}

export default CategorySelect