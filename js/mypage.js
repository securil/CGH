/**
 * 청구회 내 페이지 스크립트
 * 회원 관련 정보를 로드하고 표시하는 기능 제공
 */

// 내 페이지 관리자 객체
const MyPageManager = {
    // 사용자 데이터
    userData: null,
    
    // 참여 이벤트 데이터
    userEvents: [],
    
    // 스코어 데이터
    userScores: [],
    
    // 수상 내역 데이터
    userAwards: [],
    
    // 초기화
    init() {
        // 로그인 상태 확인
        if (!authManager.isLoggedIn()) {
            // 로그인되지 않은 경우 처리는 auth.js에서 담당
            return;
        }
        
        // 사용자 정보 가져오기
        this.userData = this.getUserData(authManager.currentUser.id);
        
        // 탭 전환 이벤트 설정
        this.setupTabEvents();
        
        // 프로필 수정 모달 설정
        this.setupProfileModal();
        
        // 프로필 정보 표시
        this.renderProfileInfo();
        
        // 데이터 로드
        this.loadUserData();
    },
    
    // 탭 전환 이벤트 설정
    setupTabEvents() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 활성화된 탭 변경
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // 탭 콘텐츠 변경
                const tabId = button.dataset.tab;
                this.switchTab(tabId);
            });
        });
    },
    
    // 프로필 수정 모달 설정
    setupProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        const closeBtn = modal.querySelector('.close');
        const editBtn = document.getElementById('edit-profile-btn');
        const form = document.getElementById('edit-profile-form');
        
        // 모달 열기 버튼
        editBtn.addEventListener('click', () => {
            // 폼에 현재 사용자 정보 채우기
            document.getElementById('edit-name').value = this.userData.name;
            document.getElementById('edit-email').value = this.userData.email;
            document.getElementById('edit-handicap').value = this.userData.handicap;
            
            modal.style.display = 'block';
        });
        
        // 모달 닫기
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // 폼 제출 이벤트
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileUpdate();
        });
    },
    
    // 프로필 업데이트 처리
    handleProfileUpdate() {
        // 입력값 가져오기
        const name = document.getElementById('edit-name').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const handicap = document.getElementById('edit-handicap').value;
        
        // 유효성 검사
        if (!name || !email) {
            alert('모든 필드를 입력해주세요.');
            return;
        }
        
        // 사용자 정보 업데이트
        this.userData.name = name;
        this.userData.email = email;
        this.userData.handicap = parseFloat(handicap);
        
        // 프로필 정보 다시 렌더링
        this.renderProfileInfo();
        
        // 모달 닫기
        document.getElementById('edit-profile-modal').style.display = 'none';
        
        // 성공 메시지
        alert('프로필이 업데이트되었습니다.');
        
        // 참고: 실제 환경에서는 서버에 업데이트 요청을 보내야 함
    },
    
    // 탭 전환
    switchTab(tabId) {
        // 모든 탭 콘텐츠 숨기기
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // 선택한 탭 콘텐츠 표시
        document.getElementById(`${tabId}-tab`).classList.add('active');
    },
    
    // 프로필 정보 렌더링
    renderProfileInfo() {
        // 기본 정보 설정
        document.getElementById('profile-avatar-placeholder').textContent = this.userData.name.charAt(0);
        document.getElementById('profile-name').textContent = this.userData.name;
        document.getElementById('profile-email').textContent = this.userData.email;
        document.getElementById('profile-handicap').textContent = this.userData.handicap;
        document.getElementById('profile-join-date').textContent = this.formatDate(this.userData.joinDate);
    },
    
    // 사용자 데이터 로드
    loadUserData() {
        // 모든 데이터 로드 (events, scores, awards)
        Promise.all([
            this.fetchUserEvents(),
            this.fetchUserScores(),
            this.fetchUserAwards()
        ])
            .then(([events, scores, awards]) => {
                this.userEvents = events;
                this.userScores = scores;
                this.userAwards = awards;
                
                // 통계 업데이트
                this.updateStatistics();
                
                // 각 탭 데이터 렌더링
                this.renderScheduleTab();
                this.renderScoresTab();
                this.renderAwardsTab();
            })
            .catch(error => {
                console.error('사용자 데이터 로드 실패:', error);
                
                // 개발용 더미 데이터 사용
                this.userEvents = this.getDummyEvents();
                this.userScores = this.getDummyScores();
                this.userAwards = this.getDummyAwards();
                
                // 통계 업데이트
                this.updateStatistics();
                
                // 각 탭 데이터 렌더링
                this.renderScheduleTab();
                this.renderScoresTab();
                this.renderAwardsTab();
            });
    },
    
    // 사용자 이벤트 데이터 가져오기
    fetchUserEvents() {
        // 실제로는 서버에서 사용자 ID를 기반으로 데이터를 가져옴
        // 개발용 더미 데이터 반환
        return Promise.resolve(this.getDummyEvents());
    },
    
    // 사용자 스코어 데이터 가져오기
    fetchUserScores() {
        // 실제로는 서버에서 사용자 ID를 기반으로 데이터를 가져옴
        // 개발용 더미 데이터 반환
        return Promise.resolve(this.getDummyScores());
    },
    
    // 사용자 수상 내역 데이터 가져오기
    fetchUserAwards() {
        // 실제로는 서버에서 사용자 ID를 기반으로 데이터를 가져옴
        // 개발용 더미 데이터 반환
        return Promise.resolve(this.getDummyAwards());
    },
    
    // 통계 업데이트
    updateStatistics() {
        // 참여 모임 수
        document.getElementById('stat-events').textContent = this.userEvents.length;
        
        // 수상 내역 수
        document.getElementById('stat-awards').textContent = this.userAwards.length;
        
        // 평균 스코어
        if (this.userScores.length > 0) {
            const totalScore = this.userScores.reduce((sum, score) => sum + score.score, 0);
            const avgScore = Math.round(totalScore / this.userScores.length * 10) / 10;
            document.getElementById('stat-avg-score').textContent = avgScore;
        } else {
            document.getElementById('stat-avg-score').textContent = '-';
        }
    },
    
    // 일정 탭 렌더링
    renderScheduleTab() {
        // 다가오는 모임
        this.renderUpcomingEvents();
        
        // 참여 신청 중인 모임
        this.renderPendingEvents();
        
        // 참여 내역
        this.renderEventHistory();
    },
    
    // 다가오는 모임 렌더링
    renderUpcomingEvents() {
        const container = document.getElementById('upcoming-events');
        
        // 현재 날짜 이후의 이벤트 중 참가 확정된 것만 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingEvents = this.userEvents
            .filter(event => 
                new Date(event.date) >= today && 
                event.status === 'confirmed'
            )
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3); // 최대 3개만 표시
            
        if (upcomingEvents.length === 0) {
            container.innerHTML = '<p class="no-data">다가오는 모임이 없습니다.</p>';
            return;
        }
        
        // HTML 생성
        const html = upcomingEvents.map(event => `
            <div class="event-item">
                <div class="event-item-title">${event.title}</div>
                <div class="event-item-date">${this.formatDate(event.date)}</div>
                <div class="event-item-footer">
                    <span class="event-status status-registered">참가 확정</span>
                    <button class="btn btn-sm">상세보기</button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    },
    
    // 참여 신청 중인 모임 렌더링
    renderPendingEvents() {
        const container = document.getElementById('pending-events');
        
        // 현재 날짜 이후의 이벤트 중 신청 중인 것만 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const pendingEvents = this.userEvents
            .filter(event => 
                new Date(event.date) >= today && 
                event.status === 'pending'
            )
            .sort((a, b) => new Date(a.date) - new Date(b.date));
            
        if (pendingEvents.length === 0) {
            container.innerHTML = '<p class="no-data">신청 중인 모임이 없습니다.</p>';
            return;
        }
        
        // HTML 생성
        const html = pendingEvents.map(event => `
            <div class="event-item">
                <div class="event-item-title">${event.title}</div>
                <div class="event-item-date">${this.formatDate(event.date)}</div>
                <div class="event-item-footer">
                    <span class="event-status status-pending">승인 대기</span>
                    <button class="btn btn-sm">취소하기</button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    },
    
    // 참여 내역 렌더링
    renderEventHistory() {
        const container = document.getElementById('event-history-list');
        const noEventsEl = document.getElementById('no-events');
        
        // 과거 이벤트 필터링 (현재 날짜 이전)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const pastEvents = this.userEvents
            .filter(event => new Date(event.date) < today)
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순
            
        if (pastEvents.length === 0) {
            container.innerHTML = '';
            noEventsEl.style.display = 'block';
            return;
        }
        
        noEventsEl.style.display = 'none';
        
        // HTML 생성
        const html = pastEvents.map(event => {
            // 결과에 따른 클래스 및 텍스트
            let resultClass = '';
            let resultText = '참가';
            
            if (event.result) {
                if (event.result.includes('우승')) {
                    resultClass = 'result-win';
                    resultText = event.result;
                } else if (event.result.includes('준우승')) {
                    resultClass = 'result-win';
                    resultText = event.result;
                } else {
                    resultClass = 'result-participated';
                    resultText = event.result;
                }
            }
            
            return `
                <tr>
                    <td>${this.formatDate(event.date)}</td>
                    <td>${event.title}</td>
                    <td>${event.location}</td>
                    <td class="${resultClass}">${resultText}</td>
                </tr>
            `;
        }).join('');
        
        container.innerHTML = html;
    },
    
    // 스코어 탭 렌더링
    renderScoresTab() {
        // 스코어 차트 렌더링
        this.renderScoreChart();
        
        // 스코어 내역 렌더링
        this.renderScoreHistory();
    },
    
    // 스코어 차트 렌더링
    renderScoreChart() {
        const container = document.getElementById('score-chart');
        
        // 실제로는 차트 라이브러리를 사용하여 차트 생성
        // 여기서는 간단한 텍스트로 대체
        
        if (this.userScores.length < 2) {
            container.innerHTML = '<p class="no-data">스코어 데이터가 충분하지 않습니다.</p>';
            return;
        }
        
        // 스코어 데이터 정렬 (날짜순)
        const sortedScores = [...this.userScores].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        // 간단한 차트 표현
        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p>스코어 차트는 실제 배포 시 차트 라이브러리를 사용하여 구현됩니다.</p>
                <p>최근 스코어: ${sortedScores[sortedScores.length - 1].score}</p>
                <p>최고 스코어: ${Math.min(...sortedScores.map(s => s.score))}</p>
            </div>
        `;
    },
    
    // 스코어 내역 렌더링
    renderScoreHistory() {
        const container = document.getElementById('score-history-list');
        const noScoresEl = document.getElementById('no-scores');
        
        if (this.userScores.length === 0) {
            container.innerHTML = '';
            noScoresEl.style.display = 'block';
            return;
        }
        
        noScoresEl.style.display = 'none';
        
        // 스코어 정렬 (최신순)
        const sortedScores = [...this.userScores].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        // HTML 생성
        const html = sortedScores.map(score => `
            <tr>
                <td>${this.formatDate(score.date)}</td>
                <td>${score.eventTitle}</td>
                <td>${score.location}</td>
                <td>${score.score}</td>
            </tr>
        `).join('');
        
        container.innerHTML = html;
    },
    
    // 수상 내역 탭 렌더링
    renderAwardsTab() {
        // 수상 현황 렌더링
        this.renderAwardsBadges();
        
        // 수상 내역 렌더링
        this.renderAwardsHistory();
    },
    
    // 수상 현황 렌더링
    renderAwardsBadges() {
        const container = document.getElementById('awards-badges');
        
        if (this.userAwards.length === 0) {
            container.innerHTML = '<p class="no-data">수상 내역이 없습니다.</p>';
            return;
        }
        
        // 상 종류별 카운트
        const awardCounts = {
            champion: 0,
            runnerup: 0,
            longest: 0,
            nearest: 0,
            mvp: 0
        };
        
        // 수상 내역 집계
        this.userAwards.forEach(award => {
            if (awardCounts.hasOwnProperty(award.type)) {
                awardCounts[award.type]++;
            }
        });
        
        // HTML 생성
        const html = `
            <div class="award-badge">
                <div class="badge-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="badge-count">${awardCounts.champion}</div>
                <div class="badge-label">우승</div>
            </div>
            <div class="award-badge">
                <div class="badge-icon">
                    <i class="fas fa-medal"></i>
                </div>
                <div class="badge-count">${awardCounts.runnerup}</div>
                <div class="badge-label">준우승</div>
            </div>
            <div class="award-badge">
                <div class="badge-icon">
                    <i class="fas fa-ruler-horizontal"></i>
                </div>
                <div class="badge-count">${awardCounts.longest}</div>
                <div class="badge-label">롱기스트</div>
            </div>
            <div class="award-badge">
                <div class="badge-icon">
                    <i class="fas fa-bullseye"></i>
                </div>
                <div class="badge-count">${awardCounts.nearest}</div>
                <div class="badge-label">니어리스트</div>
            </div>
            <div class="award-badge">
                <div class="badge-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="badge-count">${awardCounts.mvp}</div>
                <div class="badge-label">MVP</div>
            </div>
        `;
        
        container.innerHTML = html;
    },
    
    // 수상 내역 렌더링
    renderAwardsHistory() {
        const container = document.getElementById('user-awards');
        const noAwardsEl = document.getElementById('no-awards');
        
        if (this.userAwards.length === 0) {
            container.innerHTML = '';
            noAwardsEl.style.display = 'block';
            return;
        }
        
        noAwardsEl.style.display = 'none';
        
        // 수상 내역 정렬 (최신순)
        const sortedAwards = [...this.userAwards].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        // HTML 생성
        const html = sortedAwards.map(award => {
            // 상 종류에 따른 리본 아이콘 및 클래스
            const ribbonClass = `ribbon-${award.type}`;
            let ribbonIcon = '1';
            
            if (award.type === 'champion') {
                ribbonIcon = '1';
            } else if (award.type === 'runnerup') {
                ribbonIcon = '2';
            } else if (award.type === 'longest') {
                ribbonIcon = 'L';
            } else if (award.type === 'nearest') {
                ribbonIcon = 'N';
            } else if (award.type === 'mvp') {
                ribbonIcon = 'M';
            }
            
            return `
                <div class="awards-card">
                    <div class="award-ribbon ${ribbonClass}">${ribbonIcon}</div>
                    <div class="award-header">
                        <h3 class="award-title">${award.title}</h3>
                        <div class="award-date">
                            <i class="fas fa-calendar-alt"></i> ${this.formatDate(award.date)}
                        </div>
                        <div class="award-location">
                            <i class="fas fa-map-marker-alt"></i> ${award.location}
                        </div>
                    </div>
                    <div class="award-body">
                        <div class="award-winner-info">
                            <div class="award-type">
                                ${this.getAwardTypeName(award.type)}
                            </div>
                            ${award.score ? `<div class="award-winner-score">스코어: ${award.score}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    },
    
    // 사용자 데이터 가져오기 (ID로 검색)
    getUserData(userId) {
        // 실제로는 서버에서 사용자 데이터를 가져옴
        // 개발용 더미 데이터
        const dummyUsers = [
            {
                id: 'user1',
                name: '홍길동',
                email: 'hong@example.com',
                handicap: 12,
                joinDate: '2020-05-15'
            },
            {
                id: 'user2',
                name: '김철수',
                email: 'kim@example.com',
                handicap: 15,
                joinDate: '2021-03-10'
            },
            {
                id: 'admin',
                name: '관리자',
                email: 'admin@example.com',
                handicap: 8,
                joinDate: '2019-01-01'
            }
        ];
        
        return dummyUsers.find(user => user.id === userId) || dummyUsers[0];
    },
    
    // 날짜 포맷
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ko-KR', options);
    },
    
    // 상 종류 이름 변환
    getAwardTypeName(type) {
        switch (type) {
            case 'champion':
                return '우승';
            case 'runnerup':
                return '준우승';
            case 'longest':
                return '롱기스트';
            case 'nearest':
                return '니어리스트';
            case 'mvp':
                return 'MVP';
            default:
                return type;
        }
    },
    
    // 개발용 더미 이벤트 데이터
    getDummyEvents() {
        return [
            {
                id: 1,
                title: '3월 정기대회',
                date: '2025-03-15',
                location: '서울 컨트리클럽',
                status: 'completed',
                result: '우승'
            },
            {
                id: 2,
                title: '4월 정기 라운딩',
                date: '2025-04-15',
                location: '서울 컨트리클럽',
                status: 'confirmed'
            },
            {
                id: 3,
                title: '5월 챔피언십 대회',
                date: '2025-05-20',
                location: '레이크사이드 CC',
                status: 'pending'
            },
            {
                id: 4,
                title: '2월 챔피언십',
                date: '2025-02-20',
                location: '레이크사이드 CC',
                status: 'completed',
                result: '준우승'
            },
            {
                id: 5,
                title: '1월 신년 대회',
                date: '2025-01-10',
                location: '해슬리 나인브릿지',
                status: 'completed',
                result: '참가'
            }
        ];
    },
    
    // 개발용 더미 스코어 데이터
    getDummyScores() {
        return [
            {
                eventId: 1,
                eventTitle: '3월 정기대회',
                date: '2025-03-15',
                location: '서울 컨트리클럽',
                score: 72
            },
            {
                eventId: 4,
                eventTitle: '2월 챔피언십',
                date: '2025-02-20',
                location: '레이크사이드 CC',
                score: 76
            },
            {
                eventId: 5,
                eventTitle: '1월 신년 대회',
                date: '2025-01-10',
                location: '해슬리 나인브릿지',
                score: 78
            },
            {
                eventId: 6,
                eventTitle: '12월 송년 대회',
                date: '2024-12-20',
                location: '남서울 CC',
                score: 75
            },
            {
                eventId: 7,
                eventTitle: '11월 정기대회',
                date: '2024-11-15',
                location: '파인밸리 CC',
                score: 73
            }
        ];
    },
    
    // 개발용 더미 수상 내역 데이터
    getDummyAwards() {
        return [
            {
                id: 1,
                title: '3월 정기대회',
                date: '2025-03-15',
                location: '서울 컨트리클럽',
                type: 'champion',
                score: 72
            },
            {
                id: 2,
                title: '2월 챔피언십',
                date: '2025-02-20',
                location: '레이크사이드 CC',
                type: 'runnerup',
                score: 76
            },
            {
                id: 3,
                title: '1월 신년 대회',
                date: '2025-01-10',
                location: '해슬리 나인브릿지',
                type: 'longest'
            },
            {
                id: 4,
                title: '12월 송년 대회',
                date: '2024-12-20',
                location: '남서울 CC',
                type: 'nearest'
            },
            {
                id: 5,
                title: '11월 정기대회',
                date: '2024-11-15',
                location: '파인밸리 CC',
                type: 'mvp'
            }
        ];
    }
};

// 페이지 로드시 내 페이지 관리자 초기화
document.addEventListener('DOMContentLoaded', () => {
    MyPageManager.init();
});Statistics();
                
                // 각 탭 데이터 렌더링
                this.renderScheduleTab();
                this.renderScoresTab();
                this.renderAwardsTab();
            })
            .catch(error => {
                console.error('사용자 데이터 로드 실패:', error);
                
                // 개발용 더미 데이터 사용
                this.userEvents = this.getDummyEvents();
                this.userScores = this.getDummyScores();
                this.userAwards = this.getDummyAwards();
                
                // 통계 업데이트
                this.update