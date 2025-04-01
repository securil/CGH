/**
 * 청구회 골프모임 메인 스크립트
 * 데이터 로드 및 UI 이벤트 처리
 */

// 메인 애플리케이션 객체
const App = {
    // 초기화 함수
    init() {
        // 햄버거 메뉴 이벤트 설정
        this.setupMobileMenu();
        
        // 현재 페이지 확인
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // 페이지에 따라 다른 초기화 함수 호출
        switch (currentPage) {
            case 'index.html':
                this.initHomePage();
                break;
            case 'schedule.html':
                this.initSchedulePage();
                break;
            case 'awards.html':
                this.initAwardsPage();
                break;
            case 'mypage.html':
                this.initMyPage();
                break;
            case 'admin.html':
                this.initAdminPage();
                break;
        }
        
        // 현재 메뉴 활성화
        this.highlightCurrentMenu(currentPage);
        
        // 현재 연도 자동 업데이트
        this.updateCurrentYear();
    },
    
    // 현재 연도 업데이트
    updateCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    },
    
    // 모바일 햄버거 메뉴 설정
    setupMobileMenu() {
        console.log('모바일 메뉴 초기화 중...');
        
        const hamburger = document.querySelector('.hamburger-menu');
        const mainMenu = document.querySelector('.main-menu');
        
        if (hamburger && mainMenu) {
            console.log('햄버거 메뉴 요소 발견, 이벤트 리스너 설정 중...');
            
            // 기존 이벤트 리스너 제거
            if (this.toggleMenu) {
                hamburger.removeEventListener('click', this.toggleMenu);
            }
            
            // 이벤트 핸들러 함수 - 화살표 함수로 변경하여 this 바인딩 문제 해결
            this.toggleMenu = (e) => {
                e.stopPropagation(); // 이벤트 전파 방지
                console.log('햄버거 메뉴 클릭됨');
                
                // 상태 변경
                const isActive = hamburger.classList.contains('active');
                
                // 활성화 상태 토글
                if (isActive) {
                    hamburger.classList.remove('active');
                    mainMenu.classList.remove('active');
                } else {
                    hamburger.classList.add('active');
                    mainMenu.classList.add('active');
                }
                
                // 햄버거 메뉴 아이콘 애니메이션
                const bars = hamburger.querySelectorAll('.bar');
                if (!isActive) { // 활성화될 때
                    bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                    bars[1].style.opacity = '0';
                    bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
                } else { // 비활성화될 때
                    bars[0].style.transform = 'none';
                    bars[1].style.opacity = '1';
                    bars[2].style.transform = 'none';
                }
            };
            
            // 이벤트 리스너 등록
            hamburger.addEventListener('click', this.toggleMenu);
            
            // 메뉴 항목 클릭시 메뉴 닫기
            mainMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    mainMenu.classList.remove('active');
                    
                    // 햄버거 메뉴 아이콘 초기화
                    const bars = hamburger.querySelectorAll('.bar');
                    bars[0].style.transform = 'none';
                    bars[1].style.opacity = '1';
                    bars[2].style.transform = 'none';
                });
            });
            
            // 문서 클릭시 메뉴 닫기
            document.addEventListener('click', (e) => {
                if (hamburger.classList.contains('active') && 
                    !hamburger.contains(e.target) && 
                    !mainMenu.contains(e.target)) {
                    hamburger.classList.remove('active');
                    mainMenu.classList.remove('active');
                    
                    // 햄버거 메뉴 아이콘 초기화
                    const bars = hamburger.querySelectorAll('.bar');
                    bars[0].style.transform = 'none';
                    bars[1].style.opacity = '1';
                    bars[2].style.transform = 'none';
                }
            });
            
            console.log('햄버거 메뉴 초기화 완료');
        } else {
            console.error('햄버거 메뉴 요소를 찾을 수 없음');
        }
    },
    
    // 현재 메뉴 강조 표시
    highlightCurrentMenu(currentPage) {
        const menuLinks = document.querySelectorAll('.main-menu a');
        
        menuLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    },
    
    // 홈페이지 초기화
    initHomePage() {
        // 다가오는 모임 데이터는 HTML에 직접 작성되어 있으므로 로드하지 않음
        // this.loadUpcomingEvents();
        
        // 최근 수상 내역 로드
        this.loadRecentAwards();
    },
    
    // 모임 일정 페이지 초기화
    initSchedulePage() {
        this.loadAllEvents();
    },
    
    // 수상 내역 페이지 초기화
    initAwardsPage() {
        this.loadAllAwards();
    },
    
    // 내 페이지 초기화
    initMyPage() {
        this.loadUserInfo();
    },
    
    // 관리자 페이지 초기화
    initAdminPage() {
        this.loadAdminDashboard();
    },
    
          // 모든 모임 일정 로드 (schedule.html 페이지에서 사용)
    loadAllEvents() {
        // schedule.html 구현 시 작성
    },
    
    // 모든 수상 내역 로드 (awards.html 페이지에서 사용)
    loadAllAwards() {
        // awards.html 구현 시 작성
    },
    
    // 사용자 정보 로드 (mypage.html 페이지에서 사용)
    loadUserInfo() {
        // mypage.html 구현 시 작성
    },
    
    // 관리자 대시보드 로드 (admin.html 페이지에서 사용)
    loadAdminDashboard() {
        // admin.html 구현 시 작성
    },
    
    // JSON 데이터 가져오기
    fetchData(filename) {
        return fetch(`data/${filename}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP 오류: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(`${filename} 데이터 가져오기 실패:`, error);
                // 개발 목적으로 더미 데이터 반환 (실제 환경에서는 제거)
                if (filename === 'meetings.json') {
                    return this.getDummyMeetings();
                } else if (filename === 'award_result.json') {
                    return this.getDummyAwards();
                } else if (filename === 'members.json') {
                    return this.getDummyMembers();
                }
                return [];
            });
    },
    
    // 날짜 형식 변환
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        return new Date(dateString).toLocaleDateString('ko-KR', options);
    },
    
    // 개발용 더미 모임 데이터
    getDummyMeetings() {
        return [
            {
                id: 1,
                title: '4월 정기 라운딩',
                date: '2025-04-15',
                location: '서울 컨트리클럽',
                description: '4월 정기 모임입니다. 봄 시즌을 맞아 첫 라운딩을 진행합니다.'
            },
            {
                id: 2,
                title: '5월 챔피언십 대회',
                date: '2025-05-20',
                location: '레이크사이드 CC',
                description: '연례 챔피언십 대회입니다. 우승자에게는 트로피와 상품이 제공됩니다.'
            },
            {
                id: 3,
                title: '여름 특별 라운딩',
                date: '2025-06-10',
                location: '해슬리 나인브릿지',
                description: '여름 특별 이벤트로 회원 가족과 함께하는 라운딩입니다.'
            }
        ];
    },
    
    // 개발용 더미 수상 내역 데이터
    getDummyAwards() {
        return [
            {
                id: 1,
                title: '3월 MVP',
                date: '2025-03-15',
                location: '서울 컨트리클럽',
                winnerId: 'user1',
                score: 72
            },
            {
                id: 2,
                title: '2월 챔피언',
                date: '2025-02-20',
                location: '레이크사이드 CC',
                winnerId: 'user2',
                score: 75
            },
            {
                id: 3,
                title: '1월 베스트 플레이어',
                date: '2025-01-10',
                location: '해슬리 나인브릿지',
                winnerId: 'user1',
                score: 78
            }
        ];
    },
    
    // 개발용 더미 회원 데이터
    getDummyMembers() {
        return [
            {
                id: 'user1',
                name: '홍길동',
                email: 'hong@example.com',
                handicap: 12
            },
            {
                id: 'user2',
                name: '김철수',
                email: 'kim@example.com',
                handicap: 15
            },
            {
                id: 'admin',
                name: '관리자',
                email: 'admin@example.com',
                handicap: 8
            }
        ];
    }
};

// 페이지 로드시 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('페이지 로드됨, 앱 초기화 중...');
    App.init();
});