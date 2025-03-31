
# 📌 JSON 데이터 구조 및 파일 간 연계 안내

이 문서는 웹 개발자가 JSON 데이터를 활용할 때 이해할 수 있도록 데이터 구조 및 파일 간의 연계성을 정리한 문서입니다.

---

## 🔗 JSON 파일 간 연계 구조

아래 구조는 각 JSON 파일이 서로 어떻게 연결되어 있는지 나타냅니다.

```
members.json
     │
     │──[회원 정보 (id)]──┐
     │                     │
meetings.json              │
     │                     │
     │──[모임 정보 (id)]──┼─── scores.json
     │                     │       │
     │                     │       └── (회원별 모임 성적)
     │                     │
     │                     └── attendance.json
     │                             │
     │                             └── (회원별 연도별 참석이력)
     │
     └── awards_xxxx.json
             │
             └── (각 모임별 수상자 내역)
```

---

## 📋 JSON 파일별 상세 설명

### 1️⃣ members.json (회원 정보)
- **주요 키**: `id`
- **구성**:
  - `id`: 회원 고유번호
  - `name`: 이름
  - `generation`: 기수
  - `gender`: 성별
  - `phone`: 연락처

### 2️⃣ meetings.json (모임 정보)
- **주요 키**: `id` (모임 ID)
- **구성**:
  - `date`: 모임 날짜
  - `name`: 모임 이름
  - `location`: 장소
  - `course`: 사용한 코스
  - `participants`: 참가 회원의 ID 목록

### 3️⃣ scores.json (개인 성적)
- **연결 키**: `member_id`, `meeting_id`
- **구성**:
  - `member_id`: 회원 ID
  - `meeting_id`: 모임 ID
  - `gross_score`: 성적 (총 타수)

### 4️⃣ attendance_detail.json (연도별 세부 참석 내역)
- **연결 키**: `member_id`, `meeting_id`
- **구성**:
  - `member_id`: 회원 ID
  - `attendance`: 연도별 참석 내역
    - `year`: 연도
    - `meetings`: 참석한 모임 ID 목록
    - `attendance_count`: 해당 연도 참석 횟수
  - `total_attendance`: 전체 참석 횟수

### 5️⃣ awards_xxxx.json (모임별 수상 내역)
- **연결 키**: 파일명(모임 ID), 수상자 이름, 기수
- **구성**:
  - `meeting_id`: 모임 ID
  - `meeting_date`: 모임 날짜
  - `awards`: 수상자 정보
    - 항목별 수상자 이름, 기수, 기록

---

## 💡 활용 시나리오 예시
특정 회원의 참석 횟수, 성적, 수상 내역 등을 확인할 때 다음과 같은 절차를 수행할 수 있습니다.

1. **회원 ID 확인** (`members.json`)
2. **참석 여부 조회** (`attendance_detail.json`)
3. **성적 조회** (`scores.json`)
4. **수상 내역 확인** (`awards_xxxx.json`)

위의 절차를 통해 회원별 상세한 활동 내역을 효율적으로 관리할 수 있습니다.
