document.addEventListener('DOMContentLoaded', function() {
    // 현재 년도 설정
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // 데이터 로딩
    loadAllData();

    // 연도 버튼 이벤트 리스너 추가
    const yearButtons = document.querySelectorAll('.year-btn');
    yearButtons.forEach(button => {
        button.addEventListener('click', function() {
            const year = this.getAttribute('data-year');
            
            // 버튼 활성화 상태 변경
            yearButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 연도에 맞는 월 네비게이션 표시
            document.querySelectorAll('.month-navigation').forEach(nav => {
                nav.style.display = 'none';
            });
            document.getElementById(`month-nav-${year}`).style.display = 'flex';
            
            // 선택된 연도의 첫 번째 월 데이터 로드
            const firstMonthBtn = document.querySelector(`#month-nav-${year} .month-btn`);
            if (firstMonthBtn) {
                firstMonthBtn.click();
            } else {
                document.getElementById('yearly-awards-container').innerHTML = 
                    '<div class="no-data-message">해당 연도의 데이터가 없습니다.</div>';
            }
        });
    });

    // 초기 데이터 로드 (2024년 기본 선택)
    document.querySelector('.year-btn[data-year="2024"]').click();
});

// 모든 데이터 로드 함수
async function loadAllData() {
    try {
        // 1. 최근 4개월 수상내역 로드
        await loadRecentAwards();
        
        // 2. 연도별 월 네비게이션 설정
        await setupMonthNavigation();
        
        // 3. 수상 통계 로드
        await loadAwardsStatistics();
        
    } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
    }
}

// 최근 4개월 수상내역 로드 (3→4개월로 변경, 최신순 정렬)
async function loadRecentAwards() {
    try {
        // 최근 4개월: 2024년 8, 9, 10, 11월 (최신순으로 정렬)
        const recentMonths = [
            { year: 2024, month: 11 },
            { year: 2024, month: 10 },
            { year: 2024, month: 9 },
            { year: 2024, month: 8 }
        ];
        
        const recentAwardsContainer = document.getElementById('recent-awards-container');
        recentAwardsContainer.innerHTML = ''; // 로딩 스피너 제거
        
        // 각 월별 어워드 데이터 로드 및 카드 생성
        for (const { year, month } of recentMonths) {
            try {
                // 각 월별 파일명 형식은 awards_YYMM.json (예: awards_2409.json)
                const yearSuffix = year.toString().slice(2); // 2024 -> 24
                const monthStr = month.toString().padStart(2, '0'); // 9 -> 09
                const fileId = `${yearSuffix}${monthStr}`;
                
                // 어워드 데이터 로드
                const awardData = await fetchAwardsData(year, month);
                
                if (awardData) {
                    const card = createAwardCard(awardData, month);
                    recentAwardsContainer.appendChild(card);
                }
            } catch (error) {
                console.warn(`${year}년 ${month}월 데이터 로드 실패:`, error);
            }
        }
        
        // 데이터가 없을 경우 메시지 표시
        if (recentAwardsContainer.children.length === 0) {
            recentAwardsContainer.innerHTML = '<div class="no-data-message">최근 수상내역이 없습니다.</div>';
        }
    } catch (error) {
        console.error('최근 수상내역 로드 중 오류 발생:', error);
        document.getElementById('recent-awards-container').innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}

// 수상내역 카드 생성 함수
function createAwardCard(awardData, month, isDetailed = false) {
    const card = document.createElement('div');
    card.className = isDetailed ? 'award-card award-card-detailed' : 'award-card';
    
    // 카드 배경 이미지 설정
    const backgroundImage = `url('./assets/img/awards/${month}m.jpg')`;
    
    // 날짜 추출
    const meetingDate = new Date(awardData.meeting_date);
    const year = meetingDate.getFullYear();
    
    // 우승자와 메달리스트 정보 추출
    const champion = awardData.awards["  신폐리오"] ? awardData.awards["  신폐리오"].name : '미정';
    const championGeneration = awardData.awards["  신폐리오"] ? awardData.awards["  신폐리오"].generation : '';
    
    const medalist = awardData.awards["  메달리스트 남"] ? awardData.awards["  메달리스트 남"].name : '미정';
    const medalistGeneration = awardData.awards["  메달리스트 남"] ? awardData.awards["  메달리스트 남"].generation : '';
    
    // 카드 HTML 구성
    card.innerHTML = `
        <div class="award-card-bg" style="background-image: ${backgroundImage}">
            <div class="award-card-month">${year}년 ${month}월</div>
            <div class="award-card-basic-info">
                <h3 class="award-name">${awardData.meeting_name || month + '월 정기모임'}</h3>
                <p class="award-winners">신페리오 우승 : ${championGeneration}회 ${champion}</p>
                <p class="award-winners">메달리스트 : ${medalistGeneration}회 ${medalist}</p>
            </div>
            <div class="award-card-details">
                <h3 class="details-title">수상 내역</h3>
                <div class="award-categories">
                    ${createAwardCategoriesHTML(awardData.awards)}
                </div>
                <p class="award-location-details">
                    <i class="fas fa-map-marker-alt"></i> ${awardData.meeting?.location || '장소 정보'}
                </p>
                <p class="award-participants">
                    <i class="fas fa-users"></i> 참가인원: ${awardData.participants_count || '정보 없음'}명
                </p>
            </div>
        </div>
    `;
    
    // 카드 클릭 이벤트 (상세 모드가 아닐 경우에만)
    if (!isDetailed) {
        card.addEventListener('click', function() {
            // 해당 연도/월 탭으로 이동하고 해당 월 데이터 표시
            const year = new Date(awardData.meeting_date).getFullYear();
            
            // 연도 버튼 클릭
            document.querySelector(`.year-btn[data-year="${year}"]`).click();
            
            // 월 버튼 클릭
            setTimeout(() => {
                document.querySelector(`#month-nav-${year} .month-btn[data-month="${month}"]`).click();
                
                // 스크롤 이동
                document.querySelector('.yearly-awards-section').scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });
    }
    
    return card;
}

// 수상 카테고리 HTML 생성 - 최적화 버전
function createAwardCategoriesHTML(awards) {
    let html = '';
    let count = 0;
    const maxItems = 10; // 최대 표시 항목 수 증가 (기존 7개에서 10개로)
    
    // 수상 항목 배열 생성 (null 값 필터링)
    const awardItems = [
        { key: "  신폐리오", label: "신페리오 우승" },
        { key: "  메달리스트 남", label: "메달리스트 (남)" },
        { key: "  메달리스트 여", label: "메달리스트 (여)" },
        { key: "  롱기스트 남", label: "롱기스트 (남)" },
        { key: "  롱기스트 여", label: "롱기스트 (여)" },
        { key: "니어리스트 남", label: "니어리스트 (남)" },
        { key: "니어리스트", label: "니어리스트 (여)" },
        { key: "다파상", label: "다파상" },
        { key: "다보기상", label: "다보기상" },
        { key: "양파상", label: "양파상" }
    ];
    
    // 유효한 항목만 HTML 생성
    for (const item of awardItems) {
        if (awards[item.key] && awards[item.key].name) {
            if (count < maxItems) {
                html += `
                    <div class="award-category">
                        <div class="award-info">
                            <p class="award-category-compact">${item.label} : ${awards[item.key].generation}회 ${awards[item.key].name} ${awards[item.key].record || ''}</p>
                        </div>
                    </div>
                `;
                count++;
            }
        }
    }
    
    return html;
}

// 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}년 ${month}월 ${day}일`;
}

// 연도별 월 네비게이션 설정 - 수정 버전
async function setupMonthNavigation() {
    try {
        // 2024년 월 버튼에 이벤트 리스너 추가
        const monthButtons2024 = document.querySelectorAll('#month-nav-2024 .month-btn');
        monthButtons2024.forEach(button => {
            button.addEventListener('click', async function() {
                const month = this.getAttribute('data-month');
                
                // 버튼 활성화 상태 변경
                monthButtons2024.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // 선택된 연도의 모든 월 수상내역 로드
                await loadMonthlyAwards(2024, month);
            });
        });
        
        // 2023년과 2022년 월 네비게이션 동적 생성
        await setupYearNavigation(2023);
        await setupYearNavigation(2022);
        
        // 초기 월 선택 (2024년 3월)
        document.querySelector('#month-nav-2024 .month-btn[data-month="3"]').click();
    } catch (error) {
        console.error('월 네비게이션 설정 중 오류 발생:', error);
    }
}

// 특정 연도의 월 네비게이션 설정
async function setupYearNavigation(year) {
    try {
        // 해당 연도의 모든 모임 정보 로드
        const meetings = await fetchYearMeetings(year);
        
        if (meetings && meetings.length > 0) {
            // 해당 연도의 월 목록 추출 (중복 제거 및 정렬)
            const months = [...new Set(meetings.map(meeting => {
                const date = new Date(meeting.date);
                return date.getMonth() + 1; // JavaScript의 month는 0부터 시작하므로 1 추가
            }))].sort((a, b) => a - b);
            
            // 월 네비게이션 생성
            const monthNav = document.getElementById(`month-nav-${year}`);
            monthNav.innerHTML = ''; // 기존 내용 제거
            
            months.forEach(month => {
                const button = document.createElement('button');
                button.classList.add('month-btn');
                button.setAttribute('data-month', month);
                button.textContent = `${month}월`;
                
                button.addEventListener('click', async function() {
                    // 버튼 활성화 상태 변경
                    monthNav.querySelectorAll('.month-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // 선택된 월의 수상내역 로드
                    await loadMonthlyAwards(year, month);
                });
                
                monthNav.appendChild(button);
            });
        } else {
            // 해당 연도의 데이터가 없을 경우
            document.getElementById(`month-nav-${year}`).innerHTML = 
                '<div class="no-data-message">해당 연도의 모임 데이터가 없습니다.</div>';
        }
    } catch (error) {
        console.error(`${year}년 네비게이션 설정 중 오류 발생:`, error);
        document.getElementById(`month-nav-${year}`).innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}

// 특정 월의 수상내역 로드 - 수정 버전
async function loadMonthlyAwards(year, month) {
    try {
        const yearlyAwardsContainer = document.getElementById('yearly-awards-container');
        yearlyAwardsContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
        
        // 3월부터 11월까지의 모든 월 표시 (7월 제외)
        const monthsToShow = [3, 4, 5, 6, 8, 9, 10, 11]; // 7월 제외
        yearlyAwardsContainer.innerHTML = '';
        
        // 각 월별로 카드 생성
        for (const currentMonth of monthsToShow) {
            try {
                const monthData = await fetchAwardsData(year, currentMonth);
                if (monthData) {
                    const card = createAwardCard(monthData, currentMonth);
                    yearlyAwardsContainer.appendChild(card);
                }
            } catch (error) {
                // 조용히 에러 무시 - 데이터가 없는 월은 건너뜀
                console.warn(`${year}년 ${currentMonth}월 데이터 로드 실패:`, error);
            }
        }
        
        // 데이터가 없을 경우 메시지 표시
        if (yearlyAwardsContainer.children.length === 0) {
            yearlyAwardsContainer.innerHTML = 
                `<div class="no-data-message">${year}년 수상내역이 없습니다.</div>`;
        }
    } catch (error) {
        console.error(`${year}년 ${month}월 수상내역 로드 중 오류 발생:`, error);
        document.getElementById('yearly-awards-container').innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}

// 특정 연도/월의 어워드 데이터 가져오기 (에러 처리 개선)
async function fetchAwardsData(year, month) {
    try {
        // 연도와 월로 파일명 생성 (예: 2409, 2410, 2411)
        const yearSuffix = year.toString().slice(2); // 2024 -> 24
        const monthStr = month.toString().padStart(2, '0'); // 9 -> 09
        const fileId = `${yearSuffix}${monthStr}`;
        
        // awards_xxxx.json 파일 로드 시도
        const response = await fetch(`./data/awards_${fileId}.json`);
        
        if (!response.ok) {
            // 404 에러는 조용히 null 반환
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP 오류: ${response.status}`);
        }
        
        const awardData = await response.json();
        
        // 모임 정보 추가
        if (!awardData.meeting) {
            awardData.meeting = {
                id: awardData.meeting_id,
                name: awardData.meeting_name || `${month}월 정기모임`,
                date: awardData.meeting_date,
                location: '장소 정보'  // 기본값
            };
        }
        
        return awardData;
    } catch (error) {
        // 404 에러는 이미 처리했으므로 여기서 다시 로그 남기지 않음
        if (!error.message.includes('404')) {
            console.error(`${year}년 ${month}월 어워드 데이터 로드 중 오류 발생:`, error);
        }
        return null;
    }
}

// 특정 연도의 모든 모임 정보 가져오기
async function fetchYearMeetings(year) {
    try {
        const response = await fetch('./data/meetings.json');
        const meetings = await response.json();
        
        // 해당 연도의 모임만 필터링
        return meetings.filter(meeting => {
            const meetingDate = new Date(meeting.date);
            return meetingDate.getFullYear() === parseInt(year);
        });
    } catch (error) {
        console.error(`${year}년 모임 정보 로드 중 오류 발생:`, error);
        return [];
    }
}

// 연도별 통계 탭 이벤트 리스너
function setupStatsYearTabs() {
    const statsYearTabs = document.querySelectorAll('.stats-year-tab');
    
    statsYearTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 탭 활성화 상태 변경
            statsYearTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 선택된 연도의 통계 표시
            const year = this.getAttribute('data-year');
            
            // 모든 통계 컨테이너 숨기기
            document.querySelectorAll('.stats-container').forEach(container => {
                container.style.display = 'none';
            });
            
            // 선택된 연도의 통계 표시
            const statsContainer = document.getElementById(`stats-${year}`);
            
            if (statsContainer) {
                statsContainer.style.display = 'grid';
                
                // 해당 연도 통계가 아직 로드되지 않았으면 컨테이너 생성 및 데이터 로드
                if (statsContainer.children.length === 0) {
                    createYearStatsContainer(year);
                    loadYearStatistics(year);
                }
            }
        });
    });
}

// 연도별 통계 컨테이너 생성
function createYearStatsContainer(year) {
    const statsContainer = document.getElementById(`stats-${year}`);
    
    if (!statsContainer) return;
    
    // 컨테이너 내용 설정
    statsContainer.innerHTML = `
        <div class="stats-card">
            <h3><i class="fas fa-trophy"></i> 베스트 스코어 TOP 10</h3>
            <div class="stats-content" id="best-score-stats-${year}">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
        
        <div class="stats-card">
            <h3><i class="fas fa-chart-line"></i> 평균 베스트 스코어 TOP 10</h3>
            <div class="stats-content" id="avg-best-score-stats-${year}">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
        
        <div class="stats-card">
            <h3><i class="fas fa-users"></i> 참석 순위 TOP 10</h3>
            <div class="stats-content" id="attendance-stats-${year}">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;
}

// 수상 통계 로드 함수 (수정됨)
async function loadAwardsStatistics() {
    try {
        // 이벤트 리스너 설정
        setupStatsYearTabs();
        
        // 기본 선택 연도(2024) 통계 로드
        await loadYearStatistics('2024');
        
    } catch (error) {
        console.error('수상 통계 로드 중 오류 발생:', error);
    }
}

// 특정 연도의 통계 로드
async function loadYearStatistics(year) {
    try {
        // 모든 필요한 데이터 로드
        const [members, meetings, scores, attendance] = await Promise.all([
            fetch('./data/members.json').then(res => res.json()),
            fetch('./data/meetings.json').then(res => res.json()),
            fetch('./data/scores.json').then(res => res.json()),
            fetch('./data/attendance_detail.json').then(res => res.json())
        ]);
        
        // 연도 필터링 (all인 경우 모든 데이터)
        const filteredScores = year === 'all' ? scores : filterDataByYear(scores, year);
        const filteredAttendance = year === 'all' ? attendance : filterAttendanceByYear(attendance, meetings, year);
        
        // 1. 베스트 스코어 TOP 10
        loadBestScoreStats(members, filteredScores, year);
        
        // 2. 평균 베스트 스코어 TOP 10
        loadAvgBestScoreStats(members, filteredScores, year);
        
        // 3. 참석 순위 TOP 10
        loadAttendanceStats(members, filteredAttendance, year);
        
    } catch (error) {
        console.error(`${year}년 통계 로드 중 오류 발생:`, error);
        document.getElementById(`best-score-stats-${year}`).innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
        document.getElementById(`avg-best-score-stats-${year}`).innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
        document.getElementById(`attendance-stats-${year}`).innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}

// 연도별 데이터 필터링 함수
function filterDataByYear(data, year) {
    return data.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === parseInt(year);
    });
}

// 참석 데이터를 연도별로 필터링 (수정됨)
function filterAttendanceByYear(attendance, meetings, year) {
    // 해당 연도의 meeting_id 목록 추출
    const yearMeetingIds = meetings
        .filter(meeting => {
            const meetingDate = new Date(meeting.date);
            return meetingDate.getFullYear() === parseInt(year);
        })
        .map(meeting => meeting.id);
    
    // 데이터 구조 확인 및 안전하게 처리
    return attendance.map(item => {
        // 각 회원의 해당 연도 참석 횟수 계산
        // attendance_details 속성이 있는지 확인
        let yearAttendance = 0;
        
        if (item.attendance_details && Array.isArray(item.attendance_details)) {
            // attendance_details 배열이 있는 경우
            yearAttendance = item.attendance_details
                .filter(detail => yearMeetingIds.includes(detail.meeting_id))
                .length;
        } else if (item.meetings && Array.isArray(item.meetings)) {
            // meetings 배열이 있는 경우 (대체 속성명)
            yearAttendance = item.meetings
                .filter(meetingId => yearMeetingIds.includes(meetingId))
                .length;
        } else {
            // 대안 구조: total_attendance 속성만 있는 경우
            // 연도별 필터링 없이 전체 참석 횟수 사용
            yearAttendance = item.total_attendance || 0;
        }
        
        return {
            member_id: item.member_id,
            total_attendance: yearAttendance
        };
    }).filter(item => item.total_attendance > 0); // 참석 기록이 있는 회원만 포함
}

// 베스트 스코어 TOP 10 통계 로드 (수정됨)
function loadBestScoreStats(members, scores, year) {
    try {
        const bestScoreContainer = document.getElementById(`best-score-stats-${year}`);
        bestScoreContainer.innerHTML = '';
        
        // 회원별 최저 스코어 계산
        const memberBestScores = {};
        
        scores.forEach(score => {
            const memberId = score.member_id;
            const grossScore = score.gross_score;
            
            if (!memberBestScores[memberId] || grossScore < memberBestScores[memberId]) {
                memberBestScores[memberId] = grossScore;
            }
        });
        
        // 회원 정보와 결합하여 TOP 10 추출
        const bestScoreRanking = Object.entries(memberBestScores)
            .map(([memberId, score]) => {
                const member = members.find(m => m.id === memberId);
                return {
                    id: memberId,
                    name: member ? member.name : '알 수 없음',
                    generation: member ? member.generation : '알 수 없음',
                    score: score
                };
            })
            .sort((a, b) => a.score - b.score)
            .slice(0, 10);
        
        // 랭킹 표시
        if (bestScoreRanking.length > 0) {
            const rankingList = document.createElement('ul');
            rankingList.className = 'ranking-list';
            
            bestScoreRanking.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'ranking-item';
                
                let rankingHTML = '';
                if (index === 0) {
                    rankingHTML = '<span class="ranking-position top1">1</span>';
                } else if (index === 1) {
                    rankingHTML = '<span class="ranking-position top2">2</span>';
                } else if (index === 2) {
                    rankingHTML = '<span class="ranking-position top3">3</span>';
                } else {
                    rankingHTML = `<span class="ranking-position">${index + 1}</span>`;
                }
                
                listItem.innerHTML = `
                    ${rankingHTML}
                    <span class="ranking-name">${item.name} (${item.generation}기)</span>
                    <span class="ranking-score">${item.score}타</span>
                `;
                
                rankingList.appendChild(listItem);
            });
            
            bestScoreContainer.appendChild(rankingList);
        } else {
            bestScoreContainer.innerHTML = '<div class="no-data-message">해당 연도의 데이터가 없습니다.</div>';
        }
    } catch (error) {
        console.error(`${year}년 베스트 스코어 통계 로드 중 오류 발생:`, error);
        document.getElementById(`best-score-stats-${year}`).innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}

// 평균 베스트 스코어 TOP 10 통계 로드 (수정됨)
function loadAvgBestScoreStats(members, scores, year) {
    try {
        const avgBestScoreContainer = document.getElementById(`avg-best-score-stats-${year}`);
        avgBestScoreContainer.innerHTML = '';
        
        // 회원별 모든 스코어 수집
        const memberScores = {};
        
        scores.forEach(score => {
            const memberId = score.member_id;
            const grossScore = score.gross_score;
            
            if (!memberScores[memberId]) {
                memberScores[memberId] = [];
            }
            
            memberScores[memberId].push(grossScore);
        });
        
        // 회원별 평균 스코어 계산
        const memberAvgScores = {};
        
        for (const [memberId, scoresList] of Object.entries(memberScores)) {
            // 최소 2회 이상 참가한 회원만 포함 (연도별로 기준 완화)
            if (scoresList.length >= 2) {
                // 평균 계산
                const average = scoresList.reduce((sum, score) => sum + score, 0) / scoresList.length;
                memberAvgScores[memberId] = average;
            }
        }
        
        // 회원 정보와 결합하여 TOP 10 추출
        const avgScoreRanking = Object.entries(memberAvgScores)
            .map(([memberId, avgScore]) => {
                const member = members.find(m => m.id === memberId);
                return {
                    id: memberId,
                    name: member ? member.name : '알 수 없음',
                    generation: member ? member.generation : '알 수 없음',
                    avgScore: avgScore,
                    count: memberScores[memberId].length
                };
            })
            .sort((a, b) => a.avgScore - b.avgScore)
            .slice(0, 10);
        
        // 랭킹 표시
        if (avgScoreRanking.length > 0) {
            const rankingList = document.createElement('ul');
            rankingList.className = 'ranking-list';
            
            avgScoreRanking.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'ranking-item';
                
                let rankingHTML = '';
                if (index === 0) {
                    rankingHTML = '<span class="ranking-position top1">1</span>';
                } else if (index === 1) {
                    rankingHTML = '<span class="ranking-position top2">2</span>';
                } else if (index === 2) {
                    rankingHTML = '<span class="ranking-position top3">3</span>';
                } else {
                    rankingHTML = `<span class="ranking-position">${index + 1}</span>`;
                }
                
                listItem.innerHTML = `
                    ${rankingHTML}
                    <span class="ranking-name">${item.name} (${item.generation}기)</span>
                    <span class="ranking-score">${item.avgScore.toFixed(1)}타 (${item.count}회)</span>
                `;
                
                rankingList.appendChild(listItem);
            });
            
            avgBestScoreContainer.appendChild(rankingList);
        } else {
            avgBestScoreContainer.innerHTML = '<div class="no-data-message">해당 연도의 데이터가 없습니다.</div>';
        }
    } catch (error) {
        console.error(`${year}년 평균 베스트 스코어 통계 로드 중 오류 발생:`, error);
        document.getElementById(`avg-best-score-stats-${year}`).innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}

// 참석 순위 TOP 10 통계 로드 (수정됨)
function loadAttendanceStats(members, attendance, year) {
    try {
        const attendanceContainer = document.getElementById(`attendance-stats-${year}`);
        attendanceContainer.innerHTML = '';
        
        // 회원별 총 참석 횟수로 정렬
        const attendanceRanking = attendance
            .map(item => {
                const member = members.find(m => m.id === item.member_id);
                return {
                    id: item.member_id,
                    name: member ? member.name : '알 수 없음',
                    generation: member ? member.generation : '알 수 없음',
                    count: item.total_attendance
                };
            })
            .sort((a, b) => b.count - a.count) // 내림차순 정렬
            .slice(0, 10);
        
        // 랭킹 표시
        if (attendanceRanking.length > 0) {
            const rankingList = document.createElement('ul');
            rankingList.className = 'ranking-list';
            
            attendanceRanking.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'ranking-item';
                
                let rankingHTML = '';
                if (index === 0) {
                    rankingHTML = '<span class="ranking-position top1">1</span>';
                } else if (index === 1) {
                    rankingHTML = '<span class="ranking-position top2">2</span>';
                } else if (index === 2) {
                    rankingHTML = '<span class="ranking-position top3">3</span>';
                } else {
                    rankingHTML = `<span class="ranking-position">${index + 1}</span>`;
                }
                
                listItem.innerHTML = `
                    ${rankingHTML}
                    <span class="ranking-name">${item.name} (${item.generation}기)</span>
                    <span class="ranking-score">${item.count}회</span>
                `;
                
                rankingList.appendChild(listItem);
            });
            
            attendanceContainer.appendChild(rankingList);
        } else {
            attendanceContainer.innerHTML = '<div class="no-data-message">해당 연도의 데이터가 없습니다.</div>';
        }
    } catch (error) {
        console.error(`${year}년 참석 순위 통계 로드 중 오류 발생:`, error);
        document.getElementById(`attendance-stats-${year}`).innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}