/**
 * 청구회 골프모임 인증 관리 스크립트
 * 로그인, 로그아웃, 접근 제어 기능을 담당
 */

// 현재 사용자 정보를 전역적으로 관리하는 객체
const authManager = {
    // 현재 로그인된 사용자 정보
    currentUser: null,
    
    // 초기화 함수 - 페이지 로드시 호출
    init() {
        // LocalStorage에서 저장된 사용자 정보 불러오기
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateUI();
            } catch (e) {
                console.error('로그인 정보 파싱 실패:', e);
                localStorage.removeItem('currentUser');
            }
        }
        
        // 로그인 모달 설정
        this.setupLoginModal();
        
        // 로그인/로그아웃 버튼 이벤트 설정
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // 로그인 폼 제출 이벤트 설정
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // 페이지 접근 제어
        this.enforceAccessControl();
    },
    
    // 로그인 모달 설정
    setupLoginModal() {
        const modal = document.getElementById('login-modal');
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    },
    
    // 로그인 모달 표시
    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (!modal) return;
        
        modal.style.display = 'block';
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.focus();
        }
    },
    
    // 로그인 처리
    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // members.json에서 사용자 정보 확인
        this.fetchMembersData()
            .then(members => {
                // 이름과 전화번호 뒷 4자리로 사용자 찾기
                const user = members.find(member => {
                    // 사용자 이름 확인
                    const nameMatch = member.name === username;
                    
                    // 전화번호 뒷 4자리 확인
                    let phoneLast4 = '';
                    if (member.phone) {
                        phoneLast4 = member.phone.replace(/[^0-9]/g, '').slice(-4);
                    }
                    
                    return nameMatch && phoneLast4 === password;
                });
                
                if (user) {
                    // 로그인 성공
                    this.loginSuccess(user);
                } else {
                    // 로그인 실패
                    alert('이름 또는 전화번호 뒷 4자리가 일치하지 않습니다.');
                }
            })
            .catch(error => {
                console.error('회원 데이터 로드 실패:', error);
                
                // 개발용: 임시 로그인 처리
                this.loginWithDummyData(username, password);
            });
    },
    
    // 회원 데이터 가져오기
    fetchMembersData() {
        return fetch('data/members.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP 오류: ${response.status}`);
                }
                return response.json();
            });
    },
    
    // 임시 데이터로 로그인 (개발용)
    loginWithDummyData(username, password) {
        // 개발용 더미 사용자 데이터
        const dummyUsers = [
            { 
                id: 1, 
                name: '이연섭',
                generation: 11,
                gender: '남성',
                phone: '010-4479-4720',
                role: 'member'
            },
            { 
                id: 2, 
                name: '허수창',
                generation: 14,
                gender: '남성',
                phone: '010-5261-7396',
                role: 'member'
            },
            { 
                id: 3, 
                name: '이남구',
                generation: 15,
                gender: '남성',
                phone: '010-4226-6282',
                role: 'member'
            },
            { 
                id: 4, 
                name: '박상규',
                generation: 16,
                gender: '남성',
                phone: '010-0000-0000',
                role: 'member'
            },
            { 
                id: 99, 
                name: '관리자',
                generation: 0,
                gender: '남성',
                phone: '010-1234-5678',
                role: 'admin'
            }
        ];
        
        // 이름과 전화번호 뒤 4자리로 사용자 찾기
        const user = dummyUsers.find(user => {
            // 사용자 이름 확인
            const nameMatch = user.name === username;
            
            // 전화번호 뒷 4자리 확인
            let phoneLast4 = '';
            if (user.phone) {
                phoneLast4 = user.phone.replace(/[^0-9]/g, '').slice(-4);
            }
            
            return nameMatch && phoneLast4 === password;
        });
        
        if (user) {
            // 로그인 성공
            this.loginSuccess(user);
        } else {
            // 로그인 실패
            alert('이름 또는 전화번호 뒷 4자리가 일치하지 않습니다.');
        }
    },
    
    // 로그인 성공 처리
    loginSuccess(user) {
        // 비밀번호 정보는 저장하지 않음
        this.currentUser = {
            id: user.id,
            name: user.name,
            generation: user.generation || '',
            gender: user.gender || '',
            phone: user.phone || '',
            role: user.role || 'member'
        };
        
        // LocalStorage에 로그인 정보 저장
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // UI 업데이트
        this.updateUI();
        
        // 모달 닫기
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // 로그인 폼 초기화
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.reset();
        }
        
        // 성공 메시지
        alert(`${this.currentUser.name}님, 환영합니다!`);
    },
    
    // 로그아웃 처리
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        
        // 현재 페이지가 접근 제한된 페이지라면 홈으로 리다이렉트
        if (this.isRestrictedPage()) {
            window.location.href = 'index.html';
        }
    },
    
    // UI 업데이트 (로그인/로그아웃 버튼 표시 상태 변경)
    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userProfileArea = document.getElementById('user-profile-area');
        
        if (this.currentUser) {
            // 로그인 상태일 때
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
                logoutBtn.textContent = `로그아웃 (${this.currentUser.name})`;
            }
            
            // 사용자 프로필 영역 업데이트
            if (userProfileArea) {
                userProfileArea.style.display = 'block';
                // userProfileArea 내용을 필요에 따라 업데이트
            }
            
            // 관리자 메뉴 표시 여부
            const adminMenuItems = document.querySelectorAll('.admin-only');
            if (this.currentUser.role === 'admin') {
                adminMenuItems.forEach(item => item.style.display = 'block');
            } else {
                adminMenuItems.forEach(item => item.style.display = 'none');
            }
        } else {
            // 로그아웃 상태일 때
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userProfileArea) userProfileArea.style.display = 'none';
            
            // 관리자 메뉴 숨기기
            document.querySelectorAll('.admin-only').forEach(item => {
                item.style.display = 'none';
            });
        }
    },
    
    // 현재 페이지가 로그인이 필요한 페이지인지 확인
    isRestrictedPage() {
        const restrictedPages = ['mypage.html', 'admin.html'];
        const currentPage = window.location.pathname.split('/').pop();
        return restrictedPages.includes(currentPage);
    },
    
    // 페이지 접근 제어
    enforceAccessControl() {
        if (this.isRestrictedPage()) {
            // 로그인되지 않은 경우
            if (!this.currentUser) {
                alert('로그인이 필요한 페이지입니다.');
                window.location.href = 'index.html';
                return;
            }
            
            // 관리자 페이지에 일반 사용자가 접근하는 경우
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage === 'admin.html' && this.currentUser.role !== 'admin') {
                alert('관리자만 접근할 수 있는 페이지입니다.');
                window.location.href = 'index.html';
                return;
            }
        }
    },
    
    // 현재 사용자가 관리자인지 확인
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    },
    
    // 현재 사용자가 로그인되어 있는지 확인
    isLoggedIn() {
        return this.currentUser !== null;
    },
    
    // 현재 사용자 정보 가져오기
    getCurrentUser() {
        return this.currentUser;
    }
};

// 페이지 로드시 인증 관리자 초기화
document.addEventListener('DOMContentLoaded', () => {
    authManager.init();
});