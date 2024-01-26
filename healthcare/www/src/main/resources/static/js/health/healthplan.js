//슬라이드 라이브러리
$(document).ready(function () {
    $('.slide-wrapper').slick({
        infinite: true, //무한반복 옵션
        slidesToShow: 6,    //한 화면에 보여질 컨텐츠 개수
        slidesToScroll: 2,   //스크롤 한번에 움직일 컨텐츠 개수
        dots: false, // 좌우 arrow 네비게이션 안보이게 하기
        arrows: false, // 아래 dost 네비게이션 안보이게 하기
    });
});

let speradPlanList;

//계획리스트 불러오기
function getEventList()
{
    $.ajax({
        type: "GET",            // HTTP method type(GET, POST) 형식이다.
        url: "/health/getEventList?userNo=1",      // 컨트롤러에서 대기중인 URL 주소이다.  로그인한 id(수정할예정)
        async: true,
        success: function (res) { // 비동기통신의 성공일경우 success콜백으로 들어옵니다. 'res'는 응답받은 데이터이다.
            speradPlanList = new Array();
            for (let i = 0; i < res.length; i++) {
                // events: [    이런형태의 json을 만들어준다
                //     {
                //         title: 'BCH237',
                //         start: '2024-01-12',
                //         extendedProps: {
                //             department: 'BioChemistry'
                //         },
                //         description: 'Lecture'
                //     }
                // ]
                let plan = new Object();
                //표준속성
                plan.title = res[i].title;
                plan.start = res[i].start;
    
                //비표준속성객체
                let extendedProps = new Object();
    
                //userPlan
                let userPlanJSON = new Object();
                userPlanJSON.userPlanNo = res[i].userPlan.userPlanNo;
                userPlanJSON.planDate = res[i].userPlan.planDate;
                userPlanJSON.userNo = res[i].userPlan.userNo;
                userPlanJSON.planNo = res[i].userPlan.planNo;
    
                //planCalendar
                let planCalendarJSON = new Object();
                planCalendarJSON.planNo = res[i].planCalendar.planNo;
                planCalendarJSON.exerciseName = res[i].planCalendar.exerciseName;
    
                //exerciseSetList
                let exerciseSetListJSONARRAY = new Array();
                for (let j = 0; j < res[i].exerciseSetList.length; j++) {
                    let exerciseSetListJSON = new Object();
                    exerciseSetListJSON.exerciseSetNo = res[i].exerciseSetList[j].exerciseSetNo;
                    exerciseSetListJSON.planNo = res[i].exerciseSetList[j].planNo;
                    exerciseSetListJSON.exerciseWeight = res[i].exerciseSetList[j].exerciseWeight;
                    exerciseSetListJSON.exerciseCount = res[i].exerciseSetList[j].exerciseCount;
                    exerciseSetListJSON.exerciseCheck = res[i].exerciseSetList[j].exerciseCheck;
                    exerciseSetListJSONARRAY.push(exerciseSetListJSON);
                }
    
                //만든 JSON객체들을 비표준속성 객체에 추가
                extendedProps.userPlan = userPlanJSON;
                extendedProps.planCalendar = planCalendarJSON;
                extendedProps.exerciseSetList = exerciseSetListJSONARRAY;
    
                plan.extendedProps = extendedProps;
    
                speradPlanList.push(plan);

            }
            calendar.setOption('events', speradPlanList);
            calendar.render();
    
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) { // 비동기 통신이 실패할경우 error 콜백으로 들어옵니다.
            alert("통신 실패.");
        }
    });

}

// calendar element 취득
let calendarEl = $('#calendar')[0];
let selectDate;

// full-calendar 생성하기
let calendar = new FullCalendar.Calendar(calendarEl, {

    height: '1000px', //calendar 높이 설정
    aspectRatio: 0.6,
    expandRows: true, //화면에 맞게 높이 재설정
    slotMinTime: '08:00', // Day 캘린더에서 시작 시간
    slotMaxTime: '20:00', // Day 캘린더에서 종료 시간
    //헤더에 표시할 툴바
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    initialView: 'dayGridMonth', // 초기 로드 될때 보이는 캘린더 화면(기본 설정: 달)
    //initialDate: '2021-07-15', // 초기 날짜 설정 (설정하지 않으면 오늘 날짜가 보인다.)
    // navLinks: true, // 날짜를 선택하면 Day 캘린더나 Week 캘린더로 링크
    editable: true, // 수정 가능?
    // selectable: true, // 달력 일자 드래그 설정가능
    // nowIndicator: true, // 현재 시간 마크
    // dayMaxEvents: true, // 이벤트가 오버되면 높이 제한 (+ 몇 개식으로 표현)
    locale: 'ko', // 한국어 설정

    eventAdd: function (obj) { // 이벤트가 추가되면 발생하는 이벤트
        console.log(obj);
    },
    eventChange: function (obj) { // 이벤트가 수정되면 발생하는 이벤트
        console.log(obj);
    },
    eventRemove: function (obj) { // 이벤트가 삭제되면 발생하는 이벤트
        console.log(obj);
        getEventList();
    },
    dateClick: function (info) {
        //모달창 띄우기
        let modal = document.getElementById("modal");
        modal.style.display = "flex";
        let planlist = document.querySelector('.planlist');
        planlist.style.display = "flex";
        //모달창에 날짜뿌려주기
        let title = document.querySelector("#modal .title h2");
        title.innerHTML = info.dateStr;
        selectDate = info.dateStr;

        //모달창에 계획리스트 뿌려주기
        let clickedEventlist = new Array();

        for (let i = 0; i < speradPlanList.length; i++) {
            if (speradPlanList[i].start == info.dateStr) {
                clickedEventlist.push(speradPlanList[i]);
            }
        }
        spreadPlanListContent(clickedEventlist);
    },
    // select: function(arg) { // 캘린더에서 드래그로 이벤트를 생성할 수 있다.
    //     var title = prompt('Event Title:');
    //     if (title) {            
    //         calendar.addEvent({
    //             title: title,
    //             start: arg.start,
    //             end: arg.end,
    //             allDay: arg.allDay
    //         })          
    //     }          
    //     calendar.unselect()
    // }

    events: getEventList()
});
calendar.render();

let exerciseSelectDiv = document.querySelector('.exercise-select'); //운동선택div
let planlistDiv = document.querySelector('.planlist');  //
let setsettingdiv = document.querySelector('.set-setting'); //세트설정div

let nextPageExerciseListBtn = document.getElementById('next-page'); //운동리스트 다음페이지버튼
let previousPageExerciseListBtn = document.getElementById('previous-page'); //운동리스트 이전페이지버튼

//계획리스트 뿌려주는 function
function spreadPlanListContent(clickedEventlist) {
    let content = document.querySelector('.content');
    content.innerHTML = ``;
    if (clickedEventlist.length != 0) {
        for (let i = 0; i < clickedEventlist.length; i++) {
            let extendedProps = JSON.stringify(clickedEventlist[i].extendedProps);
            content.innerHTML += `<div>
            <span>${clickedEventlist[i].title}</span>
            <button type="button" class="setDetail" data-ep='${extendedProps}'>자세히 보기</button>
            <button type="button" class="planModify">수정</button>
            <button type="button" class="planDelete" 
                data-upn='${clickedEventlist[i].extendedProps.userPlan.userPlanNo}'>삭제</button>
            </div>`;
        }
    }
    else {
        content.innerHTML += `<div>
        계획이 없습니다.
        </div>`;
    }

    //플랜 자세히보기
    let setDetailBtns = document.querySelectorAll('.setDetail');
    setDetailBtns.forEach(function (setDetailBtn) {
        setDetailBtn.addEventListener('click', (e) => {
            let setDetailDiv = document.querySelector('.set-detail');
            setDetailDiv.style.display = 'flex';

            //json으로 파싱해서 function에 매개변수로 전달
            let extendedProps = JSON.parse(setDetailBtn.dataset.ep);
            spreadSetDetail(extendedProps);
        });
    });

    //플랜 삭제
    let planDeleteBtns = document.querySelectorAll('.planDelete');
    planDeleteBtns.forEach(function (planDeleteBtn) {
        planDeleteBtn.addEventListener('click', (e) => {
            let userPlanNo = planDeleteBtn.dataset.upn;
            DeletePlan(userPlanNo);
        });
    });

}

//모달창 닫기
let closeBtns = modal.querySelectorAll(".close-area")
closeBtns.forEach(function (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
        closeModal();
    })
});

//set detail div 닫기
let closeSetdetailBtn = document.querySelector('.close-setdetail');
closeSetdetailBtn.addEventListener('click', (e) => {
    let setDetailDiv = document.querySelector('.set-detail');
    setDetailDiv.style.display = 'none';
})

//모달창 바깥부분 눌렀을때 닫기
modal.addEventListener("click", (e) => {

    if (e.target.classList.contains("modal-overlay")) {
        closeModal();
    }
})

//모달창 닫는 function
function closeModal() {
    modal.style.display = "none"
    exerciseSelectDiv.style.display = "none";
    setsettingdiv.style.display = "none";

    //모든 부위버튼 배경색 검은색으로 초기화
    let targetSelectBtns = document.querySelectorAll('.target-select');
    targetSelectBtns.forEach(function (targetSelectBtn) {
        targetSelectBtn.style.backgroundColor = 'black';
    })


    //운동 list 지우기
    let exerciseListDiv = document.querySelector('.exercise-list');
    exerciseListDiv.innerHTML = '';
    //input값 지우기
    document.getElementById('target').value = '';
    document.getElementById('offset').value = '';
    document.getElementById('exercise-name-input').value = '';

    nextPageExerciseListBtn.style.display = 'none';
    previousPageExerciseListBtn.style.display = 'none';

    //세트 초기화
    let setDiv = document.querySelector('.set-setting .set-table tbody');
    setDiv.innerHTML = `<tr class="set-list">
    <td>1</td>
    <td><input type="text" name="Weight"> kg</td>
    <td><input type="text" name="count"></td>
    <td><input type="checkbox" name="check"></td>
    </tr>`;

    //set detail창 닫기
    let setDetailDiv = document.querySelector('.set-detail');
    setDetailDiv.style.display = 'none';

}

//모달창 운동추가 버튼눌렀을때 div변경
let exaddBtn = document.querySelector(".exercise-add");
exaddBtn.addEventListener('click', (e) => {
    exerciseSelectDiv.style.display = 'flex'
    $('.slide-wrapper').slick('setPosition');
    planlistDiv.style.display = "none";
})

//세팅설정 버튼을 눌렀을때
let setBtn = document.querySelector('.setBtn');
setBtn.addEventListener('click', (e) => {
    let exerciseNameInpunt = document.getElementById('exercise-name-input');
    if (exerciseNameInpunt.value != '') {
        setsettingdiv.style.display = "flex";
        exerciseSelectDiv.style.display = "none";
    }
    else {
        alert('운동을 선택해주세요!');
    }
})


//뒤로가기 버튼
let backBtns = document.querySelectorAll('.backBtn');
backBtns.forEach(function (backBtn) {

    backBtn.addEventListener('click', (e) => {

        if (exerciseSelectDiv.style.display == "flex") {    //현재 modal창이 exercise-select div일때
            exerciseSelectDiv.style.display = "none"
            planlistDiv.style.display = "flex";
        }
        else if (setsettingdiv.style.display == "flex") {   //현재 modal창이 set-setting div일때
            exerciseSelectDiv.style.display = "flex";
            setsettingdiv.style.display = "none";
        }
    })
})

//운동부위 선택해서 불러오기
let targetSelectBtns = document.querySelectorAll('.target-select');
targetSelectBtns.forEach(function (targetSelectBtn) {
    targetSelectBtn.addEventListener('click', function () {
        let targetinput = document.getElementById('target');
        let offsetinput = document.getElementById('offset');
        let target = targetSelectBtn.getAttribute('data-target');

        targetinput.value = target;
        offsetinput.value = 0;   //페이지번호 0으로 초기화

        //모든 부위버튼 배경색 검은색으로 초기화
        targetSelectBtns.forEach(function (targetSelectBtn) {
            targetSelectBtn.style.backgroundColor = 'black';
        })
        //누른 부위버튼 배경색 빨간색으로 변경
        targetSelectBtn.style.backgroundColor = 'red';

        //다음페이지 버튼 보이게하기
        nextPageExerciseListBtn.style.display = "block";

        $.ajax({
            async: true,
            crossDomain: true,
            method: 'GET',
            url: `https://exercisedb.p.rapidapi.com/exercises/target/${targetinput.value}?limit=5`,
            headers: {
                'X-RapidAPI-Key': '9b7b13c7f5mshfd8b94a88797e77p1a4080jsnd904ca818f96',
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            },
            success: function (res) { // 비동기통신의 성공일경우 success콜백으로 들어옵니다. 'res'는 응답받은 데이터이다.
                console.log(res);
                spreadExerciseList(res);
                let nextPageDiv = document.querySelector('.next-page-div');
                nextPageDiv.style.display = "flex";

                if (res.length < 5) {   //받아온 배열의길이가 5보다 작으면(=마지막페이지)
                    nextPageDiv.style.display = "none";
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) { // 비동기 통신이 실패할경우 error 콜백으로 들어옵니다.
                alert("통신 실패.");
            }
        });

    })
})

//api로 받아온 운동리스트 div에 뿌려주는 function
function spreadExerciseList(list) {
    let exerciseListDiv = document.querySelector('.exercise-list');
    exerciseListDiv.innerHTML = '';
    for (let i = 0; i < list.length; i++) {
        let str = `<div class="exercise-item ${list[i].name}" data-name="${list[i].name}">`;
        str += `<div class="exercise-image"><image src="${list[i].gifUrl}" class="eximg"/></div>`
        str += `<div class="exercise-detail">`
        str += `<div class="exercise-name">${list[i].name}</div>`
        str += `<div>${list[i].secondaryMuscles.join(",")}</div>`
        str += `</div></div>`

        exerciseListDiv.innerHTML += str;
    }
}

//다음 페이지의 운동리스트 받아오기


nextPageExerciseListBtn.addEventListener('click', (e) => {
    let targetinput = document.getElementById('target');
    let offsetinput = document.getElementById('offset');
    offsetinput.value = parseInt(offsetinput.value) + 1;

    $.ajax({
        async: true,
        crossDomain: true,
        method: 'GET',
        url: `https://exercisedb.p.rapidapi.com/exercises/target/${targetinput.value}?limit=5&offset=${offsetinput.value}`,
        headers: {
            'X-RapidAPI-Key': '9b7b13c7f5mshfd8b94a88797e77p1a4080jsnd904ca818f96',
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        },
        success: function (res) { // 비동기통신의 성공일경우 success콜백으로 들어옵니다. 'res'는 응답받은 데이터이다.
            spreadExerciseList(res);

            //이전페이지 버튼 활성화
            previousPageExerciseListBtn.style.display = "block";

            if (res.length < 5) {   //받아온 배열의길이가 5보다 작으면(=마지막페이지)
                nextPageExerciseListBtn.style.display = "none";
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) { // 비동기 통신이 실패할경우 error 콜백으로 들어옵니다.
            alert("통신 실패.");
        }
    });
})

//이전 페이지의 운동리스트 받아오기
previousPageExerciseListBtn.addEventListener('click', (e) => {
    let targetinput = document.getElementById('target');
    let offsetinput = document.getElementById('offset');
    console.log(offsetinput);
    if (offsetinput.value > 0) {
        offsetinput.value = parseInt(offsetinput.value) - 1;
        $.ajax({
            async: true,
            crossDomain: true,
            method: 'GET',
            url: `https://exercisedb.p.rapidapi.com/exercises/target/${targetinput.value}?limit=5&offset=${offsetinput.value}`,
            headers: {
                'X-RapidAPI-Key': '9b7b13c7f5mshfd8b94a88797e77p1a4080jsnd904ca818f96',
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            },
            success: function (res) { // 비동기통신의 성공일경우 success콜백으로 들어옵니다. 'res'는 응답받은 데이터이다.
                spreadExerciseList(res);

                //다음페이지 버튼 활성화
                nextPageExerciseListBtn.style.display = "block";

                //현재페이지가 0이면 이전페이지버튼 비활성화
                if (offsetinput.value == 0) {
                    previousPageExerciseListBtn.style.display = "none";

                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) { // 비동기 통신이 실패할경우 error 콜백으로 들어옵니다.
                alert("통신 실패.");
            }
        });
    }



})


//운동 선택 이벤트
let exerciseSelect = document.querySelector('.exercise-select');
document.addEventListener('click', (e) => {
    if (exerciseSelect.style.display == 'flex')//현재div가 운동선택div일때만
    {
        let selectDiv;
        if (e.target.classList.contains('exercise-item')) {   //운동div를 눌렀을때
            selectDiv = e.target; //현재 타겟을 selectDiv에 저장
        }
        else if (e.target.parentNode.classList.contains('exercise-item')) {//운동div의 하위div를 눌렀을때
            selectDiv = e.target.parentNode;  //현재 타겟의 부모 노드를 selectDiv에 저장
        }
        else if (e.target.parentNode.parentNode.classList.contains('exercise-item')) {//운동div의 하위div의 하위div를 눌렀을때
            selectDiv = e.target.parentNode.parentNode;   //현재 타겟의 부모의 부모 노드를 selectDiv에 저장
        }
        if (selectDiv.classList.contains('exercise-item')) {
            //선택 표시된 style들 초기화
            let exerciseItems = document.querySelectorAll('.exercise-item');
            exerciseItems.forEach(function (exerciseItem) {
                exerciseItem.style.backgroundColor = 'black';
            })

            selectDiv.style.backgroundColor = 'red';   //선택 표시

            //input창에 운동이름 넣어주기
            let exerciseName = selectDiv.dataset.name;
            let exerciseNameInpunt = document.getElementById('exercise-name-input');
            exerciseNameInpunt.value = `${exerciseName}`;
        }
    }
})



//세트 추가 버튼
let setAddBtn = document.querySelector('.setAddBtn');
setAddBtn.addEventListener('click', (e) => {
    let tbody = document.querySelector('.set-setting .set-table tbody');
    let childCount = tbody.childElementCount + 1;

    //innerHTML을 사용하면 새로운 행을 추가할 때, 
    //tbody의 전체 내용을 새로운 HTML 문자열로 대체하기 때문에 이전 행의 기존 입력 값이 손실된다.
    //이 문제를 해결하려면 새로운 행을 추가할 때 기존 행을 대체하는 것이 아니라,
    //새로운 행을 기존 행 뒤에 추가해야 됨.

    let newRow = document.createElement('tr');
    newRow.className = 'set-list';
    newRow.innerHTML = `<td>${childCount}</td>
    <td><input type="text" name="Weight"> kg</td>
    <td><input type="text" name="count"></td>
    <td><input type="checkbox" name="check"></td>`;

    tbody.appendChild(newRow);
})


//세트 삭제 버튼
let setDelBtn = document.querySelector('.setDelBtn');
setDelBtn.addEventListener('click', (e) => {
    let tbody = document.querySelector('.set-setting .set-table tbody');
    let rowCount = tbody.rows.length;

    if (rowCount > 1) {
        tbody.deleteRow(rowCount - 1);
    } else {
        alert("더 이상 삭제할 행이 없습니다.");
    }
})

//계획 등록 버튼 이벤트
let submitBtn = document.querySelector('.submit');
submitBtn.addEventListener('click', (e) => {
    let exerciseName = document.getElementById('exercise-name-input').value;
    // let setlist;

    let dataArray = [];
    let setTableRows = document.querySelectorAll('.set-list'); // 각 행을 선택

    setTableRows.forEach(function (row) {
        let weight = row.querySelector('input[name="Weight"]').value;
        let count = row.querySelector('input[name="count"]').value;
        let checked = row.querySelector('input[name="check"]').checked;

        let rowData = {
            exerciseWeight: weight,
            exerciseCount: count,
            exerciseCheck: checked
        };
        dataArray.push(rowData);
    });

    let pdto = {
        userNo: "1",         //(수정할예정)
        exerciseName: exerciseName,
        planDate: selectDate,
        setVOList: dataArray
    };
    console.log(pdto);
    $.ajax({
        type: 'post',
        url: '/health/planSetting',
        data: JSON.stringify(pdto),
        // async: false,
        contentType: 'application/json',
        // processData: false,
        success: function (pdto) {
            alert('등록성공');
            getEventList();
            closeModal();
        }
    });
})

//set detail창에 뿌려주기
function spreadSetDetail(extendedProps) {

    let setH2 = document.querySelector('.set-detail .title h2')
    setH2.innerHTML = `${extendedProps.planCalendar.exerciseName}`

    let setDetailList = document.querySelector('.set-detail .set-table tbody');
    setDetailList.innerHTML = '';

    for (let i = 0; i < extendedProps.exerciseSetList.length; i++) {
        setDetailList.innerHTML += `<td>${i + 1}</td>
        <td><input type="text" name="Weight" value=${extendedProps.exerciseSetList[i].exerciseWeight} readonly="readonly"> kg</td>
        <td><input type="text" name="count" value=${extendedProps.exerciseSetList[i].exerciseCount} readonly="readonly"></td>
        <td><input type="checkbox" value=${extendedProps.exerciseSetList[i].exerciseCheck} name="check"></td>`;
    }
}

function DeletePlan(userPlanNo) {
    $.ajax({
        type: 'get',
        url: `/health/delPlan?userPlanNo=${userPlanNo}`,
        async:true,
        success: function () {
            alert('삭제성공');
            getEventList();
            closeModal();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) { // 비동기 통신이 실패할경우 error 콜백으로 들어옵니다.
            alert("통신 실패.");
        }
    })
}