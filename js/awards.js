/**
 * awards.js - 청구회 수상내역 페이지 스크립트
 * 수상내역 및 통계 데이터를 동적으로 로드하고 화면에 표시합니다.
 */

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
            
            // 선택된 연도의 수상내역 로드
            loadYearlyAwards(year);
        });
    });

    // 통계 필터 이벤트 리스너
    document.getElementById('stats-year').addEventListener('change', updateStatistics);
    
    document.querySelectorAll('input[name="gender-filter"]').forEach(radio => {
        radio.addEventListener('change', updateStatistics);
    });

    // 초기 데이터 로드 (2024년 기본 선택)
    document.querySelector('.year-btn[data-year="2024"]').click();
});

/**
 * 모든 데이터를 로드하는 함수
 * 최근 수상내역, 연도별 월 내비게이션, 수상 통계를 순차적으로 로드
 */
async function loadAllData() {
    try {
        // 1. 최근 수상카드 로드 (11, 10, 9월만)
        await loadRecentAwards();
        
        // 2. 연도별 수상내역 로드 (2024년 기본)
        await loadYearlyAwards('2024');
        
        // 3. 수상 통계 로드
        await loadStatistics();
        
    } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
    }
}

/**
 * 최근 수상카드 로드 (11, 10, 9월만 표시)
 * 3열 그리드 레이아웃으로 표시
 */
async function loadRecentAwards() {
    try {
        // 최근 3개월: 2024년 11, 10, 9월 (최신순으로 정렬)
        const recentMonths = [
            { year: 2024, month: 11 },
            { year: 2024, month: 10 },
            { year: 2024, month: 9 }
        ];
        
        const recentAwardsContainer = document.getElementById('recent-awards-container');
        recentAwardsContainer.innerHTML = ''; // 로딩 스피너 제거
        
        // 각 월별 어워드 데이터 로드 및 카드 생성
        for (const { year, month } of recentMonths) {
            try {
                // 각 월별 파일명 형식은 awards_YYMM.json (예: awards_2411.json)
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

/**
 * 특정 연도의 수상내역 로드
 * @param {number} year - 연도
 */
async function loadYearlyAwards(year) {
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
        console.error(`${year}년 수상내역 로드 중 오류 발생:`, error);
        document.getElementById('yearly-awards-container').innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}

/**
 * 수상내역 카드 생성 함수
 * @param {Object} awardData - 수상내역 데이터
 * @param {number} month - 월
 * @param {boolean} isDetailed - 상세 모드 여부
 * @returns {HTMLElement} - 생성된 카드 요소
 */
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
    
    // 회의 이름 설정 (월 기반으로 조정)
    let meetingName = awardData.meeting_name;
    if (!meetingName) {
        if (month === 3) {
            meetingName = "2024년 개회식";
        } else if (month === 4) {
            meetingName = "2024년 4월 모임";
        } else if (month === 5) {
            meetingName = "2024년 청구회장배 골프대회";
        } else {
            meetingName = `2024년 ${month}월 모임`;
        }
    }

    // 카드 HTML 구성
    card.innerHTML = `
        <div class="award-card-bg" style="background-image: ${backgroundImage}">
            <div class="award-card-month month-${month}">${year}<br>${month}월</div>
            <div class="award-card-basic-info">
                <h3 class="award-name">${meetingName}</h3>
                <p class="award-winners">신페리오 우승 : ${championGeneration}회 ${champion}</p>
                <p class="award-winners">메달리스트 : ${medalistGeneration}회 ${medalist}</p>
            </div>
            <div class="award-card-details">
                <h3 class="details-title">수상 내역</h3>
                <div class="award-categories">
                    ${createAwardCategoriesHTML(awardData.awards)}
                </div>
                <p class="award-location-details">
                    <i class="fas fa-map-marker-alt"></i> 이천 뉴스프링빌CC
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
            
            // 스크롤 이동
            document.querySelector('.yearly-awards-section').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    return card;
}

/**
 * 수상 카테고리 HTML 생성
 * @param {Object} awards - 수상 정보 객체
 * @returns {string} - 생성된 HTML 문자열
 */
function createAwardCategoriesHTML(awards) {
    let html = '';
    let count = 0;
    const maxItems = 10; // 최대 표시 항목 수
    
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

/**
 * 특정 연도/월의 어워드 데이터 가져오기
 * @param {number} year - 연도
 * @param {number} month - 월
 * @returns {Object|null} - 어워드 데이터 객체 또는 null
 */
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
                location: '이천 뉴스프링빌CC'  // 모든 장소 통일
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

/**
 * 특정 연도의 모든 모임 정보 가져오기
 * @param {number} year - 연도
 * @returns {Array} - 모임 정보 배열
 */
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

/**
 * 통계 데이터 로드 및 표시
 */
async function loadStatistics() {
    try {
        // 필터 초기값으로 통계 로드
        await updateStatistics();
    } catch (error) {
        console.error('통계 데이터 로드 중 오류 발생:', error);
    }
}

/**
 * 통계 데이터 업데이트 (필터링 적용)
 */
async function updateStatistics() {
    // 현재 선택된 필터 값 가져오기
    const selectedYear = document.getElementById('stats-year').value;
    const selectedGender = document.querySelector('input[name="gender-filter"]:checked').value;
    
    // 로딩 표시
    document.getElementById('best-score-stats').innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    document.getElementById('avg-best-score-stats').innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    document.getElementById('attendance-stats').innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    
    try {
        // 모든 필요한 데이터 로드
        const [members, meetings, scores, attendance] = await Promise.all([
            fetch('./data/members.json').then(res => res.json()),
            fetch('./data/meetings.json').then(res => res.json()),
            fetch('./data/scores.json').then(res => res.json()),
            fetch('./data/attendance_detail.json').then(res => res.json())
        ]);
        
        // 필터링된 데이터 생성
        const filteredMembers = filterMembersByGender(members, selectedGender);
        const filteredMemberIds = filteredMembers.map(member => member.id);
        
        const yearMeetings = filterMeetingsByYear(meetings, selectedYear);
        const yearMeetingIds = yearMeetings.map(meeting => meeting.id);
        
        const filteredScores = scores.filter(score => 
            filteredMemberIds.includes(score.member_id) && 
            yearMeetingIds.includes(score.meeting_id)
        );
        
        // 1. 베스트 스코어 TOP 10 로드
        loadBestScoreStats(filteredMembers, filteredScores, selectedGender);
        
        // 2. 평균 베스트 스코어 TOP 10 로드
        loadAvgScoreStats(filteredMembers, filteredScores, selectedGender);
        
        // 3. 참석 순위 TOP 10 로드
        loadAttendanceStats(filteredMembers, attendance, yearMeetingIds, selectedYear, selectedGender);
        
    } catch (error) {
        console.error('통계 업데이트 중 오류 발생:', error);
        displayErrorMessages(selectedGender);
    }
}

/**
 * 성별에 따라 회원 필터링
 * @param {Array} members - 전체 회원 목록
 * @param {string} gender - 선택된 성별 (all, male, female)
 * @returns {Array} - 필터링된 회원 목록
 */
function filterMembersByGender(members, gender) {
    if (gender === 'all') {
        return members;
    }
    
    const genderText = gender === 'male' ? '남성' : '여성';
    return members.filter(member => member.gender === genderText);
}

/**
 * 연도에 따라 모임 필터링
 * @param {Array} meetings - 전체 모임 목록
 * @param {string} year - 선택된 연도
 * @returns {Array} - 필터링된 모임 목록
 */
function filterMeetingsByYear(meetings, year) {
    return meetings.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return meetingDate.getFullYear() === parseInt(year);
    });
}

/**
 * 베스트 스코어 통계 로드 및 표시
 * @param {Array} members - 필터링된 회원 목록
 * @param {Array} scores - 필터링된 스코어 목록
 * @param {string} gender - 선택된 성별
 */
function loadBestScoreStats(members, scores, gender) {
    try {
        const bestScoreContainer = document.getElementById('best-score-stats');
        bestScoreContainer.innerHTML = '';
        
        // 카드 타이틀 업데이트
        updateCardTitle('best-score-card', gender);
        
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
                const member = members.find(m => m.id === memberId || m.id.toString() === memberId.toString());
                return {
                    id: memberId,
                    name: member ? member.name : '알 수 없음',
                    generation: member ? member.generation : '',
                    score: score
                };
            })
            .filter(item => item.name !== '알 수 없음')
            .sort((a, b) => a.score - b.score)
            .slice(0, 10);
        
        // 랭킹 표시
        if (bestScoreRanking.length > 0) {
            const rankingList = createRankingList(bestScoreRanking, (item) => 
                `${item.score}타`
            );
            bestScoreContainer.appendChild(rankingList);
        } else {
            showNoDataMessage(bestScoreContainer, gender);
        }
    } catch (error) {
        console.error('베스트 스코어 통계 로드 중 오류 발생:', error);
        document.getElementById('best-score-stats').innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}


/**
 * 평균 스코어 통계 로드 및 표시
 * @param {Array} members - 필터링된 회원 목록
 * @param {Array} scores - 필터링된 스코어 목록
 * @param {string} gender - 선택된 성별
 */
function loadAvgScoreStats(members, scores, gender) {
    try {
        const avgScoreContainer = document.getElementById('avg-best-score-stats');
        avgScoreContainer.innerHTML = '';
        
        // 카드 타이틀 업데이트
        updateCardTitle('avg-best-score-card', gender);
        
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
        
        // 회원별 평균 스코어 계산 (참가 회원 모두 포함)
        const memberAvgScores = {};
        
        for (const [memberId, scoresList] of Object.entries(memberScores)) {
            if (scoresList.length > 0) {
                // 평균 계산 (소수점 이하 버림)
                const average = Math.floor(
                    scoresList.reduce((sum, score) => sum + score, 0) / scoresList.length
                );
                memberAvgScores[memberId] = average;
            }
        }
        
        // 회원 정보와 결합하여 TOP 10 추출
        const avgScoreRanking = Object.entries(memberAvgScores)
            .map(([memberId, avgScore]) => {
                const member = members.find(m => m.id === memberId || m.id.toString() === memberId.toString());
                return {
                    id: memberId,
                    name: member ? member.name : '알 수 없음',
                    generation: member ? member.generation : '',
                    avgScore: avgScore,
                    count: memberScores[memberId].length
                };
            })
            .filter(item => item.name !== '알 수 없음')
            .sort((a, b) => a.avgScore - b.avgScore)
            .slice(0, 10);
        
        // 랭킹 표시
        if (avgScoreRanking.length > 0) {
            const rankingList = createRankingList(avgScoreRanking, (item) => 
                `${item.avgScore}타 (${item.count}회)`
            );
            avgScoreContainer.appendChild(rankingList);
        } else {
            showNoDataMessage(avgScoreContainer, gender);
        }
    } catch (error) {
        console.error('평균 스코어 통계 로드 중 오류 발생:', error);
        document.getElementById('avg-best-score-stats').innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}

/**
 * 참석 순위 통계 로드 및 표시
 * @param {Array} members - 필터링된 회원 목록
 * @param {Array} attendance - 참석 데이터
 * @param {Array} yearMeetingIds - 해당 연도의 모임 ID 목록
 * @param {string} year - 선택된 연도
 * @param {string} gender - 선택된 성별
 */
function loadAttendanceStats(members, attendance, yearMeetingIds, year, gender) {
    try {
        const attendanceContainer = document.getElementById('attendance-stats');
        attendanceContainer.innerHTML = '';
        
        // 카드 타이틀 업데이트
        updateCardTitle('attendance-card', gender);
        
        // 회원별 해당 연도 참석 횟수 계산
        const memberAttendance = [];
        
        for (const attendanceItem of attendance) {
            const memberId = attendanceItem.member_id;
            // 필터링된 회원만 포함
            const member = members.find(m => m.id === memberId || m.id.toString() === memberId.toString());
            if (!member) continue;
            
            // 해당 연도의 참석 기록 찾기
            let yearAttendanceCount = 0;
            
            // attendance 구조 확인
            if (attendanceItem.attendance && Array.isArray(attendanceItem.attendance)) {
                // 연도별 참석 내역이 있는 경우
                const yearData = attendanceItem.attendance.find(item => item.year === parseInt(year));
                if (yearData) {
                    yearAttendanceCount = yearData.attendance_count || 0;
                }
            } else if (attendanceItem.total_attendance) {
                // 데이터 구조가 다른 경우 (모든 연도 통합)
                yearAttendanceCount = attendanceItem.total_attendance;
            }
            
            if (yearAttendanceCount > 0) {
                memberAttendance.push({
                    id: memberId,
                    name: member.name,
                    generation: member.generation,
                    count: yearAttendanceCount
                });
            }
        }
        
        // 참석 횟수로 정렬
        const attendanceRanking = memberAttendance
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        // 랭킹 표시
        if (attendanceRanking.length > 0) {
            const rankingList = createRankingList(attendanceRanking, (item) => 
                `${item.count}회`
            );
            attendanceContainer.appendChild(rankingList);
        } else {
            showNoDataMessage(attendanceContainer, gender);
        }
    } catch (error) {
        console.error('참석 순위 통계 로드 중 오류 발생:', error);
        document.getElementById('attendance-stats').innerHTML = 
            '<div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}

/**
 * 랭킹 리스트 생성 함수
 * @param {Array} items - 랭킹 아이템 배열
 * @param {Function} scoreFormatter - 점수 포맷팅 함수
 * @returns {HTMLElement} - 생성된 랭킹 리스트 요소
 */
function createRankingList(items, scoreFormatter) {
    const rankingList = document.createElement('ul');
    rankingList.className = 'ranking-list';
    
    items.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'ranking-item';
        
        // 순위 표시 스타일
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
        
        // 회원 이름과 기수 표시
        let nameText = '';
        if (item.generation) {
            nameText = `${item.generation}회 ${item.name}`;
        } else {
            nameText = item.name;
        }
        
        // 스코어 포맷팅
        const scoreText = scoreFormatter(item);
        
        listItem.innerHTML = `
            ${rankingHTML}
            <span class="ranking-name">${nameText}</span>
            <span class="ranking-score">${scoreText}</span>
        `;
        
        rankingList.appendChild(listItem);
    });
    
    return rankingList;
}

/**
 * 카드 타이틀 업데이트 (성별 필터 반영)
 * @param {string} cardId - 카드 요소 ID
 * @param {string} gender - 선택된 성별
 */
function updateCardTitle(cardId, gender) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    const titleEl = card.querySelector('h3');
    if (!titleEl) return;
    
    const originalTitle = titleEl.textContent.split('TOP')[0].trim();
    const genderText = getGenderText(gender);
    
    if (gender === 'all') {
        titleEl.innerHTML = `<i class="${titleEl.querySelector('i').className}"></i> ${originalTitle} TOP 10`;
    } else {
        titleEl.innerHTML = `<i class="${titleEl.querySelector('i').className}"></i> ${originalTitle} (${genderText}) TOP 10`;
    }
}

/**
 * 성별 텍스트 변환
 * @param {string} gender - 성별 코드 (all, male, female)
 * @returns {string} - 한글 성별 표현
 */
function getGenderText(gender) {
    switch (gender) {
        case 'male': return '남성';
        case 'female': return '여성';
        default: return '';
    }
}

/**
 * 데이터 없음 메시지 표시
 * @param {HTMLElement} container - 메시지를 표시할 컨테이너
 * @param {string} gender - 선택된 성별
 */
function showNoDataMessage(container, gender) {
    const genderText = getGenderText(gender);
    let message = '표시할 데이터가 없습니다.';
    
    if (gender !== 'all') {
        message = `표시할 ${genderText} 데이터가 없습니다.`;
    }
    
    container.innerHTML = `<div class="no-data-message">${message}</div>`;
}

/**
 * 에러 메시지 표시
 * @param {string} gender - 선택된 성별
 */
function displayErrorMessages(gender) {
    const message = '데이터를 불러오는 중 오류가 발생했습니다.';
    
    document.getElementById('best-score-stats').innerHTML = 
        `<div class="error-message">${message}</div>`;
    document.getElementById('avg-best-score-stats').innerHTML = 
        `<div class="error-message">${message}</div>`;
    document.getElementById('attendance-stats').innerHTML = 
        `<div class="error-message">${message}</div>`;
}