// import axios from "axios";

let last_one_label = new Array(31).fill(0);
let last_two_label = new Array(31).fill(0);
let last_three_label = new Array(31).fill(0);
let last_four_label = new Array(31).fill(0);
let last_five_label = new Array(31).fill(0);

const last_label_list = [
  last_one_label,
  last_two_label,
  last_three_label,
  last_four_label,
  last_five_label,
];

let current_one_label = new Array(31).fill(0);
let current_two_label = new Array(31).fill(0);
let current_three_label = new Array(31).fill(0);
let current_four_label = new Array(31).fill(0);
let current_five_label = new Array(31).fill(0);

const current_label_list = [
  current_one_label,
  current_two_label,
  current_three_label,
  current_four_label,
  current_five_label,
];

let date = new Date();
let current_month = date.getMonth() + 1;
let current_day = date.getDay() + 1;

const myChart1 = new Chart(
  document.getElementById("myChart1").getContext("2d"),
  {
    type: "line",
    data: {},
    options: {
      responsive: true,

      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            stepSize: 1,
          },
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        // 범례 설정
        legend: {
          display: true,
          position: "top",
          align: "end",
          labels: {
            boxWidth: 20, // 범례 아이콘 크기
            font: {
              size: 25, // 범례 폰트 크기
            },
            fontFamily: "Helvetica", // 폰트 스타일
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
        title: {
          display: true,
          text: "지난 달 감정 상태",
        },
      },
      hover: {
        mode: "index",
        intersec: false,
      },
    },
  }
);

const myChart2 = new Chart(document.getElementById("myChart2"), {
  type: "line",
  data: {},
  options: {
    responsive: true,

    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          stepSize: 1,
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true, // 범례 차트에 표시
        position: "top",
        align: "end",
        labels: {
          boxWidth: 20,
          font: {
            size: 25,
          },
          fontFamily: "Helvetica",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      title: {
        display: true,
        text: "이번 달 감정 상태",
      },
    },
    hover: {
      mode: "index",
      intersec: false,
    },
  },
});

const cnt = 1000;
let acc_fetch_time = 0;
let acc_ajax_time = 0;
let acc_axios_time = 0;

let fetchPromises = [];
let ajaxPromises = [];
let axiosPromises = [];

$(document).ready(function () {
  show_last_month();
  show_current_month();
  show_user_name();
  get_session_user_info();

  // //// 비동기 소요 시간 테스트 시작 지점 ////
  // const cnt = 1000;
  // let acc_fetch_time = 0;
  // let acc_ajax_time = 0;
  // let acc_axios_time = 0;

  // let fetchPromises = [];
  // let ajaxPromises = [];
  // let axiosPromises = [];
  // // fetch 응답 평균 소요 시간 //
  // for (let i = 0; i < cnt; i++) {
  //   fetchPromises.push(test_fetch());
  // }
  // Promise.all(fetchPromises).then(() => {
  //   console.log("fetch 1000번 했을 때 소요시간:", acc_fetch_time); // 100번 했을 때 : 61314.09999999 , 1000번 했을 때 : 6698949.199999869
  // });

  // // // ajax 응답 평균 소요 시간 //
  // for (let i = 0; i < cnt; i++) {
  //   ajaxPromises.push(test_ajax());
  // }
  // Promise.all(ajaxPromises).then(() => {
  //   console.log("ajax 1000번 했을 때 소요시간:", acc_ajax_time); // 100번 했을 때 : 58350.1999999 , 1000번 했을 때 : 5648221.50000006
  // });

  // // // axios 응답 평균 소요 시간 //
  // for (let i = 0; i < cnt; i++) {
  //   axiosPromises.push(test_axios());
  // }
  // Promise.all(axiosPromises).then(() => {
  //   console.log("axios 1000번 했을 때 소요시간:", acc_axios_time); // 100번 했을때 : 61438.60000002384 , 1000번 했을 때 : 5801829.299999833
  // });
});

function test_fetch() {
  const start = performance.now();
  return fetch("/show_diary")
    .then((res) => res.json())
    .then((data) => {
      const end = performance.now();
      acc_fetch_time += end - start;
    });
}
function test_ajax() {
  const start = performance.now();
  return $.ajax({
    type: "GET",
    url: "/show_diary",
    data: {},
    success: function (data) {
      const end = performance.now();
      acc_ajax_time += end - start;
    },
  });
}
function test_axios() {
  const start = performance.now();
  return axios.get("/show_diary").then(() => {
    const end = performance.now();
    acc_axios_time += end - start;
  });
}
//// 비동기 소요 시간 테스트 종료 지점 ////

// 현황판에 보여줄 사용자 이름
function show_user_name() {
  $.ajax({
    type: "GET",
    url: "/get_username",
    data: {},
    success: function (res) {
      let id = res["result"]["id"];
      const notice_user = document.querySelector("#notice_user");
      notice_user.textContent = id + "님은";
    },
  });
}

// 감정별 합계
function sum_emotion_label(label_list) {
  let one_label_sum = label_list[0].reduce((acc, cur) => acc + cur, 0);
  let two_label_sum = label_list[1].reduce((acc, cur) => acc + cur, 0);
  let three_label_sum = label_list[2].reduce((acc, cur) => acc + cur, 0);
  let four_label_sum = label_list[3].reduce((acc, cur) => acc + cur, 0);
  let five_label_sum = label_list[4].reduce((acc, cur) => acc + cur, 0);

  let label_sum_list = [
    one_label_sum,
    two_label_sum,
    three_label_sum,
    four_label_sum,
    five_label_sum,
  ];

  return label_sum_list;
}

// 특정 유저의 데이터 받아오기

async function get_session_user_info() {
  const response = await $.ajax({
    type: "GET",
    url: "/show_diary",
  });
  let data = response["result"];
  data.forEach((a) => {
    let emoji = a["emoji"];
    let day = a["day"];
    console.log(emoji, day);
  });
}
get_session_user_info();
// const result = get_session_user_info();
// console.log(result);

// get_session_user_info().then((data) => {
//   console.log(data);
// });

// 저번 달 감정 상태를 보여주는 차트 기능
function show_last_month() {
  $.ajax({
    type: "GET",
    url: "/show_diary",
    data: { month: current_month - 1 },
    success: function (res) {
      let data = res["result"];

      data.forEach((a) => {
        if (a["month"] === (current_month - 1).toString()) {
          let emoji = a["emoji"];
          let day = a["day"];

          // 저번달 유저의 감정상태 담기
          switch (emoji) {
            case "1":
              last_one_label[day - 1]++;
              break;
            case "2":
              last_two_label[day - 1]++;
              break;
            case "3":
              last_three_label[day - 1]++;
              break;
            case "4":
              last_four_label[day - 1]++;
              break;
            case "5":
              last_five_label[day - 1]++;
              break;
            default:
              break;
          }

          //// 바뀐 부분 2 ////

          // 이번 달 각 감정 총합
          let last_label_sum_list = sum_emotion_label(last_label_list);

          // 이번 달 가장 많이 느꼈던 감정을 변수에 담았음.
          const last_month_maxEmotion_label = Math.max(...last_label_sum_list);

          // 이번 달 가장 많은 감정의 인덱스(실제 감정값)
          const last_month_maxEmotion_index = last_label_sum_list.indexOf(
            last_month_maxEmotion_label
          );

          // 이번 달 가장 많은 감정의 이름
          const last_month_maxEmotion_name =
            last_month_maxEmotion_index + 1 === 1
              ? "홀가분"
              : last_month_maxEmotion_index + 1 === 2
              ? "좋음"
              : last_month_maxEmotion_index + 1 === 3
              ? "보통"
              : last_month_maxEmotion_index + 1 === 4
              ? "언짢음"
              : "화남";

          // 저번 달 가장 많은 감정의 데이터를 담은 배열.
          const last_month_maxEmotion_data =
            last_label_list[last_month_maxEmotion_index];

          const last_month_emotion = document.querySelector(
            "#last_month_emotion"
          );

          // 바꾼 부분 3
          last_month_emotion.textContent = `지난달 주요 감정은 ${last_month_maxEmotion_name}입니다.`;

          const notice_last_month =
            document.querySelector("#notice_last_month");
          notice_last_month.textContent = `지난 달 ${last_month_maxEmotion_name} 을`;

          const labels = new Array(31).fill(0).map((_, i) => i + 1);

          myChart1.data.labels = labels;

          myChart1.data.datasets[0] = {
            label: last_month_maxEmotion_name,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",

              "rgba(255, 159, 64, 0.2)",

              "rgba(255, 205, 86, 0.2)",

              "rgba(75, 192, 192, 0.2)",

              "rgba(54, 162, 235, 0.2)",

              "rgba(153, 102, 255, 0.2)",

              "rgba(201, 203, 207, 0.2)",
            ],
            borderColor: [
              "rgb(255, 99, 132)",

              "rgb(255, 159, 64)",

              "rgb(255, 205, 86)",

              "rgb(75, 192, 192)",

              "rgb(54, 162, 235)",

              "rgb(153, 102, 255)",

              "rgb(201, 203, 207)",
            ],
            data: last_month_maxEmotion_data,
          };

          myChart1.update();
        }
      });
    },
  });
}

// 이번 달 감정 상태를 보여주는 차트 기능
function show_current_month() {
  $.ajax({
    type: "GET",
    url: "/show_diary",
    data: { month: current_month },
    success: function (res) {
      let data = res["result"];
      data.forEach((a) => {
        if (a["month"] === current_month.toString()) {
          let emoji = a["emoji"];
          let day = a["day"];
          // let month = a["month"];

          // 이번달 유저의 감정상태 담기

          switch (emoji) {
            case "1":
              current_one_label[day - 1]++;
              break;
            case "2":
              current_two_label[day - 1]++;
              break;
            case "3":
              current_three_label[day - 1]++;
              break;
            case "4":
              current_four_label[day - 1]++;
              break;
            case "5":
              current_five_label[day - 1]++;
              break;
            default:
              break;
          }

          //// 바뀐 부분 2 ////

          // 이번 달 각 감정 총합
          let current_label_sum_list = sum_emotion_label(current_label_list);

          // 이번 달 가장 많이 느꼈던 감정을 변수에 담았음.
          const current_month_maxEmotion_label = Math.max(
            ...current_label_sum_list
          );

          // 이번 달 가장 많은 감정의 인덱스(실제 감정값)
          const current_month_maxEmotion_index = current_label_sum_list.indexOf(
            current_month_maxEmotion_label
          );

          // 이번 달 가장 많은 감정의 이름
          const current_month_maxEmotion_name =
            current_month_maxEmotion_index + 1
              ? "홀가분"
              : current_month_maxEmotion_index + 1 === 2
              ? "좋음"
              : current_month_maxEmotion_index + 1 === 3
              ? "보통"
              : current_month_maxEmotion_index + 1 === 4
              ? "언짢음"
              : "화남";

          // 이번 달 가장 많은 감정의 데이터를 담은 배열.
          const current_month_maxEmotion_data =
            current_label_list[current_month_maxEmotion_index];

          const current_month_emotion = document.querySelector(
            "#current_month_emotion"
          );

          current_month_emotion.textContent = `이번 달 주요 감정은 ${current_month_maxEmotion_name}입니다.`;

          const notice_current_month = document.querySelector(
            "#notice_currnet_month"
          );

          notice_current_month.textContent = `이번 달 ${current_month_maxEmotion_name} 을`;

          const labels = new Array(31).fill(0).map((_, i) => i + 1);

          myChart2.data.labels = labels;

          myChart2.data.datasets[0] = {
            label: current_month_maxEmotion_name,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",

              "rgba(255, 159, 64, 0.2)",

              "rgba(255, 205, 86, 0.2)",

              "rgba(75, 192, 192, 0.2)",

              "rgba(54, 162, 235, 0.2)",

              "rgba(153, 102, 255, 0.2)",

              "rgba(201, 203, 207, 0.2)",
            ],
            borderColor: [
              "rgb(255, 99, 132)",

              "rgb(255, 159, 64)",

              "rgb(255, 205, 86)",

              "rgb(75, 192, 192)",

              "rgb(54, 162, 235)",

              "rgb(153, 102, 255)",

              "rgb(201, 203, 207)",
            ],
            data: current_month_maxEmotion_data,
          };

          myChart2.update();
        }
      });
    },
  });
}
