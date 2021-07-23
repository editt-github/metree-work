export const commaNumber = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const getFormatDate = (date) => {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  month = month >= 10 ? month : '0' + month;
  let og_month = date.getMonth();
  let day = date.getDate();
  day = day >= 10 ? day : '0' + day;    
  let og_day = date.getDate();
  let weeek = date.getDay();
  let weekArr = ['일','월','화','수','목','금','토'];
  let hour = date.getHours();
  hour = hour >= 10 ? hour : '0' + hour; 
  let min = date.getMinutes();
  min = min >= 10 ? min : '0' + min; 
  let sec = date.getSeconds();
  let obj = {
      'year':year,
      'month':month,
      'day':day,
      'og_month':og_month,
      'og_day':og_day,
      'week':weekArr[weeek],
      'weekNum':weeek,
      'hour':hour,
      'min':min,
      'sec':sec,
      'full': year + '' + month + '' + day,
      'full_': year + '-' + month + '-' + day
  }

  return obj;  
}

export const getNotificationPermission = () => {
  // 브라우저 지원 여부 체크
  if (!("Notification" in window)) {
      alert("데스크톱 알림을 지원하지 않는 브라우저입니다.");
  }
  // 데스크탑 알림 권한 요청
  Notification.requestPermission(function (result) {
      // 권한 거절
      if(result == 'denied') {
          alert('알림을 차단하셨습니다.\n브라우저의 사이트 설정에서 변경하실 수 있습니다.');
          return false;
      }
  });
}

// 알림 띄우기
export function notify(msg) {
  var options = {
      body: msg
  }
  var notification = new Notification("주문알림", options);
  
  setTimeout(function(){
      notification.close();
  }, 3000);
}