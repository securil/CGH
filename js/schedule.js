// 2025년 모임 일정 데이터를 관리하고 표시하는 스크립트
document.addEventListener('DOMContentLoaded', function() {
    let allMeetings = [];
    
    // 일정 데이터 가져오기
    fetch('data/meetings.json')
        .then(response => response.json())
        .then(data => {
            // 2025년 데이터만 필터링
            allMeetings = data.filter(meeting => {
                const meetingDate = new Date(meeting.date);
                return meetingDate.getFullYear() === 2025;
            });

            // 날짜 오름차순으로 정렬
            allMeetings.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // 카드 뷰 렌더링
            renderCardView();
        })
        .catch(error => {
            console.error('일정 데이터를 가져오는 중 오류가 발생했습니다:', error);
            // 오류 발생 시 UI에 표시
            document.querySelector('#scheduleCards').innerHTML = 
                '<div class="error-message">일정 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</div>';
        });

    // 카드 뷰 렌더링
    function renderCardView() {
        const cardsContainer = document.getElementById('scheduleCards');
        cardsContainer.innerHTML = '';
        
        if(allMeetings.length === 0) {
            cardsContainer.innerHTML = '<div class="no-results">일치하는 일정이 없습니다.</div>';
            return;
        }
        
        allMeetings.forEach(meeting => {
            const meetingDate = new Date(meeting.date);
            const formattedDate = formatDate(meetingDate);
            const formattedTime = formatTime(meetingDate);
            const month = meetingDate.getMonth() + 1; // 월 추출 (0부터 시작하므로 +1)
            
            // 배경 이미지 경로 생성
            const bgImagePath = `assets/img/schedule/${month}m.jpg`;
            
            // 월과 일 추출
            const monthAbbr = getMonthAbbr(meetingDate.getMonth());
            const day = meetingDate.getDate();
            
            const card = document.createElement('div');
            card.className = `schedule-card ${meeting.type} ${meeting.status === '완료' ? 'completed' : ''}`;
            card.dataset.id = meeting.id;
            
            // 특별 대회 여부에 따라 배지 추가
            const specialBadge = meeting.is_special_tournament ? 
                '<span class="event-badge special">특별 대회</span>' : '';
            
            card.innerHTML = `
                <div class="card-bg" style="background-image: url('${bgImagePath}')">
                    <div class="date-badge">
                        <span class="month">${monthAbbr}</span>
                        <span class="day">${day}</span>
                    </div>
                    ${specialBadge}
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <h3>${meeting.name}</h3>
                        <span class="event-status ${meeting.status === '완료' ? 'completed' : 'upcoming'}">${meeting.status}</span>
                    </div>
                    <div class="card-body">
                        <div class="event-date">
                            <i class="fas fa-calendar-day"></i> ${formattedDate} ${formattedTime}
                        </div>
                        <div class="event-location">
                            <i class="fas fa-map-marker-alt"></i> ${meeting.location}
                        </div>
                        <div class="event-course">
                            <i class="fas fa-golf-ball"></i> ${meeting.course}
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-outline view-details" data-id="${meeting.id}">상세 정보</button>
                    </div>
                </div>
            `;
            
            cardsContainer.appendChild(card);
        });
        
        // 상세 정보 버튼에 이벤트 리스너 추가
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                openEventModal(this.dataset.id);
            });
        });
    }

    // 이벤트 모달 열기
    function openEventModal(eventId) {
        const meeting = allMeetings.find(m => m.id == eventId);
        
        if (!meeting) {
            alert('일정 정보를 찾을 수 없습니다.');
            return;
        }
        
        // 모달 데이터 채우기
        document.getElementById('modalTitle').textContent = meeting.name;
        
        const meetingDate = new Date(meeting.date);
        document.getElementById('modalDate').textContent = `${formatDate(meetingDate)} ${formatTime(meetingDate)}`;
        document.getElementById('modalEventNo').textContent = meeting.event_no;
        document.getElementById('modalStatus').textContent = meeting.status;
        document.getElementById('modalLocation').textContent = meeting.location;
        document.getElementById('modalCourse').textContent = meeting.course;
        document.getElementById('modalDescription').textContent = meeting.description;
        
        // 특별 이벤트 설명
        const specialEventContainer = document.getElementById('specialEventContainer');
        if (meeting.special_event_description) {
            specialEventContainer.style.display = 'block';
            document.getElementById('modalSpecialEvent').textContent = meeting.special_event_description;
        } else {
            specialEventContainer.style.display = 'none';
        }
        
        // 결과 링크
        const resultLinkContainer = document.getElementById('resultLinkContainer');
        if (meeting.result_link) {
            resultLinkContainer.style.display = 'block';
            document.getElementById('modalResultLink').href = meeting.result_link;
        } else {
            resultLinkContainer.style.display = 'none';
        }
        
        // 지도 링크
        const mapContainer = document.getElementById('mapContainer');
        if (meeting.map_url) {
            mapContainer.style.display = 'block';
            document.getElementById('modalMapLink').addEventListener('click', function() {
                window.open(meeting.map_url, '_blank');
            });
        } else {
            mapContainer.style.display = 'none';
        }
        
        // 모달 열기
        const modal = document.getElementById('eventModal');
        modal.style.display = 'flex';
        
        // 닫기 버튼에 이벤트 리스너 추가
        document.querySelector('#eventModal .close').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // 모달 바깥 클릭시 닫기
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // 날짜 포맷팅 함수 (YYYY-MM-DD -> YYYY년 MM월 DD일)
    function formatDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        return `${year}년 ${month}월 ${day}일`;
    }

    // 시간 포맷팅 함수 (24시간 -> 오전/오후 12시간)
    function formatTime(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        const ampm = hours >= 12 ? '오후' : '오전';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        
        return `${ampm} ${displayHours}:${displayMinutes}`;
    }
    
    // 월 약어 반환 함수 (0-11 -> MAR, APR, ...)
    function getMonthAbbr(monthIndex) {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return months[monthIndex];
    }
});