/**
 * 햄버거 메뉴 디버깅 스크립트
 * 모바일 메뉴 작동 오류 진단용 - 모니터링 전용
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('햄버거 디버깅 스크립트가 로드되었습니다.');
    
    // 햄버거 메뉴 요소 가져오기
    const hamburger = document.querySelector('.hamburger-menu');
    const mainMenu = document.querySelector('.main-menu');
    
    // 요소가 존재하는지 확인
    console.log('햄버거 메뉴 요소 존재 여부:', hamburger !== null);
    console.log('메인 메뉴 요소 존재 여부:', mainMenu !== null);
    
    if (hamburger && mainMenu) {
        // 스타일 확인
        const hamburgerStyle = window.getComputedStyle(hamburger);
        console.log('햄버거 메뉴 display 스타일:', hamburgerStyle.display);
        console.log('햄버거 메뉴 visibility 스타일:', hamburgerStyle.visibility);
        
        const mainMenuStyle = window.getComputedStyle(mainMenu);
        console.log('메인 메뉴 display 스타일:', mainMenuStyle.display);
        
        // 창 크기 확인
        console.log('현재 창 너비:', window.innerWidth);
        console.log('모바일 뷰포트 상태:', window.innerWidth <= 768);
        console.log('모바일 미디어 쿼리 적용 여부:', window.matchMedia('(max-width: 768px)').matches);
        
        // 상태 변경 모니터링
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    const isHamburgerActive = hamburger.classList.contains('active');
                    const isMenuActive = mainMenu.classList.contains('active');
                    console.log('햄버거 메뉴 활성화 상태 변경:', isHamburgerActive);
                    console.log('메인 메뉴 활성화 상태 변경:', isMenuActive);
                }
            });
        });
        
        // 관찰 시작
        observer.observe(hamburger, { attributes: true });
        observer.observe(mainMenu, { attributes: true });
    }
    
    // 수동 테스트용 함수만 유지
    window.toggleHamburger = function() {
        if (hamburger && mainMenu) {
            hamburger.classList.toggle('active');
            mainMenu.classList.toggle('active');
            console.log('toggleHamburger() 함수로 수동 전환됨');
        }
    };
    
    console.log('햄버거 메뉴 디버깅을 완료했습니다. 개발자 도구에서 window.toggleHamburger()를 호출하여 수동으로 테스트할 수 있습니다.');
});